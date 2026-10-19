-- StreetCraft Migration: Brief 5 - Webhook Failure Persistence, Semantic Classification & Idempotency
-- Timestamp: 20261019070000

-- 1. Add failure classification and entity deduplication columns to provider_events
ALTER TABLE public.provider_events 
  ADD COLUMN IF NOT EXISTS error_code text,
  ADD COLUMN IF NOT EXISTS needs_review boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS entity_id text;

-- 2. Add unique index on (provider, event_type, entity_id) for signed entity deduplication
-- This ensures that replaying a signed payload with an alternate provider_event_id is an idempotent no-op.
CREATE UNIQUE INDEX IF NOT EXISTS provider_events_provider_event_type_entity_id_idx 
  ON public.provider_events (provider, event_type, entity_id) 
  WHERE entity_id IS NOT NULL;

-- 3. Dedicated view for operational inspection of rows needing manual review
CREATE OR REPLACE VIEW public.provider_events_needs_review AS
  SELECT 
    id,
    provider,
    provider_event_id,
    event_type,
    entity_id,
    status,
    attempt_count,
    error_code,
    error_message,
    needs_review,
    received_at,
    processed_at,
    created_at
  FROM public.provider_events
  WHERE needs_review = true OR status = 'NEEDS_REVIEW'
  ORDER BY received_at DESC;

-- 4. Restructure reconcile_provider_event: outer insert, inner processing with exception handling
CREATE OR REPLACE FUNCTION public.reconcile_provider_event(
  p_provider text,
  p_provider_event_id text,
  p_event_type text,
  p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_event_id uuid;
  v_entity_id text;
  v_sub_id text;
  v_payment_id text;
  v_order_id text;
  v_payment_entity jsonb;
  v_order_entity jsonb;
  v_payment_notes jsonb;
  v_order_notes jsonb;
  v_user_id uuid;
  v_plan_id text;
  v_cycle text;
  v_currency text;
  v_payment_status text;
  v_payment_captured boolean;
  v_order_status text;
  v_payment_amount bigint;
  v_order_amount bigint;
  v_expected_amount bigint;
  v_period_start date;
  v_period_end date;
  v_existing_sub record;
  v_confirm_res jsonb;
  v_existing_event record;
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  
  -- Exception handling variables
  v_err_sqlstate text;
  v_err_message text;
  v_semantic_code text;
  v_is_needs_review boolean := false;
  v_is_retryable boolean := false;
BEGIN
  -- Extract authoritative entity identifier from signed payload
  v_entity_id := COALESCE(
    p_payload->'payload'->'payment'->'entity'->>'id',
    p_payload->'payment'->>'id',
    p_payload->'payload'->'order'->'entity'->>'id',
    p_payload->'order'->>'id',
    p_payload->'payload'->'subscription'->'entity'->>'id',
    p_payload->'subscription'->>'id',
    p_payload->>'subscription_id'
  );

  -- Check for existing event by entity_id or provider_event_id
  IF v_entity_id IS NOT NULL AND TRIM(v_entity_id) != '' THEN
    SELECT * INTO v_existing_event
    FROM public.provider_events
    WHERE provider = LOWER(TRIM(p_provider))
      AND event_type = TRIM(p_event_type)
      AND entity_id = TRIM(v_entity_id)
    LIMIT 1;
  END IF;

  IF v_existing_event.id IS NULL THEN
    SELECT * INTO v_existing_event
    FROM public.provider_events
    WHERE provider = LOWER(TRIM(p_provider))
      AND provider_event_id = TRIM(p_provider_event_id)
    LIMIT 1;
  END IF;

  -- Handle existing record status
  IF v_existing_event.id IS NOT NULL THEN
    IF v_existing_event.status = 'PROCESSED' THEN
      RETURN jsonb_build_object(
        'success', true,
        'idempotent_replay', true,
        'event_id', v_existing_event.id,
        'status', 'PROCESSED'
      );
    ELSIF v_existing_event.status = 'PROCESSING' THEN
      RETURN jsonb_build_object(
        'success', true,
        'in_flight', true,
        'event_id', v_existing_event.id,
        'status', 'PROCESSING'
      );
    ELSIF v_existing_event.status = 'NEEDS_REVIEW' THEN
      RETURN jsonb_build_object(
        'success', false,
        'status', 'NEEDS_REVIEW',
        'error_code', v_existing_event.error_code,
        'retryable', false
      );
    ELSE
      -- Previously FAILED: allow retry
      UPDATE public.provider_events
      SET 
        status = 'PROCESSING',
        attempt_count = attempt_count + 1,
        error_code = NULL,
        error_message = NULL,
        received_at = now()
      WHERE id = v_existing_event.id;
      v_event_id := v_existing_event.id;
    END IF;
  ELSE
    -- Outer scope: Insert record in PROCESSING state
    INSERT INTO public.provider_events (
      provider,
      provider_event_id,
      event_type,
      entity_id,
      payload,
      status,
      attempt_count,
      received_at
    ) VALUES (
      LOWER(TRIM(p_provider)),
      TRIM(p_provider_event_id),
      TRIM(p_event_type),
      NULLIF(TRIM(v_entity_id), ''),
      p_payload,
      'PROCESSING',
      1,
      now()
    )
    ON CONFLICT (provider, provider_event_id) DO NOTHING
    RETURNING id INTO v_event_id;

    -- If concurrent insert won race on provider_event_id
    IF v_event_id IS NULL THEN
      SELECT * INTO v_existing_event
      FROM public.provider_events
      WHERE provider = LOWER(TRIM(p_provider))
        AND provider_event_id = TRIM(p_provider_event_id);
      
      IF v_existing_event.status = 'PROCESSED' THEN
        RETURN jsonb_build_object('success', true, 'idempotent_replay', true, 'status', 'PROCESSED');
      ELSIF v_existing_event.status = 'PROCESSING' THEN
        RETURN jsonb_build_object('success', true, 'in_flight', true, 'status', 'PROCESSING');
      ELSE
        v_event_id := v_existing_event.id;
      END IF;
    END IF;
  END IF;

  -- Inner processing block: any raised exception rolls back inner work without rolling back provider_events row
  BEGIN
    v_sub_id := COALESCE(
      p_payload->'payload'->'subscription'->'entity'->>'id',
      p_payload->'subscription'->>'id',
      p_payload->>'subscription_id',
      p_payload->>'id'
    );

    IF v_sub_id IS NOT NULL THEN
      SELECT * INTO v_existing_sub
      FROM public.subscriptions
      WHERE provider = LOWER(TRIM(p_provider))
        AND provider_subscription_id = v_sub_id
      LIMIT 1
      FOR UPDATE;
    END IF;

    CASE p_event_type
      WHEN 'payment.captured', 'order.paid' THEN
        v_payment_entity := COALESCE(
          p_payload->'payload'->'payment'->'entity',
          p_payload->'payment'
        );
        v_order_entity := COALESCE(
          p_payload->'payload'->'order'->'entity',
          p_payload->'order'
        );

        IF v_payment_entity IS NULL OR v_payment_entity = 'null'::jsonb THEN
          RAISE EXCEPTION 'SECURITY_VIOLATION: Webhook payload missing mandatory payment entity.' USING ERRCODE = 'P0001';
        END IF;

        IF v_order_entity IS NULL OR v_order_entity = 'null'::jsonb THEN
          RAISE EXCEPTION 'SECURITY_VIOLATION: Webhook payload missing mandatory order entity.' USING ERRCODE = 'P0001';
        END IF;

        v_payment_id := v_payment_entity->>'id';
        IF v_payment_id IS NULL OR TRIM(v_payment_id) = '' THEN
          RAISE EXCEPTION 'SECURITY_VIOLATION: Missing payment ID in payment entity.' USING ERRCODE = 'P0001';
        END IF;

        v_order_id := v_payment_entity->>'order_id';
        IF v_order_id IS NULL OR TRIM(v_order_id) = '' THEN
          RAISE EXCEPTION 'SECURITY_VIOLATION: Missing order reference on payment entity.' USING ERRCODE = 'P0001';
        END IF;

        IF v_order_entity->>'id' IS NULL OR TRIM(v_order_entity->>'id') = '' THEN
          RAISE EXCEPTION 'SECURITY_VIOLATION: Missing order ID in order entity.' USING ERRCODE = 'P0001';
        END IF;

        IF v_order_id != v_order_entity->>'id' THEN
          RAISE EXCEPTION 'SECURITY_VIOLATION: Payment order_id % does not match order id %.', v_order_id, v_order_entity->>'id' USING ERRCODE = 'P0001';
        END IF;

        v_payment_status := LOWER(TRIM(COALESCE(v_payment_entity->>'status', '')));
        v_payment_captured := COALESCE((v_payment_entity->>'captured')::boolean, false);
        IF v_payment_status != 'captured' AND NOT v_payment_captured THEN
          RAISE EXCEPTION 'PAYMENT_NOT_CAPTURED: Payment is in status %, not captured.', v_payment_status USING ERRCODE = 'P0001';
        END IF;

        IF p_event_type = 'order.paid' THEN
          v_order_status := LOWER(TRIM(COALESCE(v_order_entity->>'status', '')));
          IF v_order_status != 'paid' THEN
            RAISE EXCEPTION 'ORDER_NOT_PAID: Order is in status %, not paid.', v_order_status USING ERRCODE = 'P0001';
          END IF;
        END IF;

        v_currency := v_payment_entity->>'currency';
        IF v_currency IS NULL OR UPPER(TRIM(v_currency)) != 'INR' THEN
          RAISE EXCEPTION 'INVALID_CURRENCY: Payment currency must be INR (received %).', v_currency USING ERRCODE = 'P0001';
        END IF;

        v_currency := v_order_entity->>'currency';
        IF v_currency IS NULL OR UPPER(TRIM(v_currency)) != 'INR' THEN
          RAISE EXCEPTION 'INVALID_CURRENCY: Order currency must be INR (received %).', v_currency USING ERRCODE = 'P0001';
        END IF;

        v_order_notes := v_order_entity->'notes';
        IF v_order_notes IS NULL OR v_order_notes = 'null'::jsonb THEN
          RAISE EXCEPTION 'SECURITY_VIOLATION: Order entity is missing authoritative order notes.' USING ERRCODE = 'P0001';
        END IF;

        -- Application check: reject foreign app orders, accept missing app for legacy orders
        IF v_order_notes ? 'app' AND v_order_notes->>'app' IS NOT NULL AND TRIM(v_order_notes->>'app') != '' THEN
          IF LOWER(TRIM(v_order_notes->>'app')) != 'streetcraft' THEN
            RAISE EXCEPTION 'APP_MISMATCH: Order originated from unexpected application %.', v_order_notes->>'app' USING ERRCODE = 'P0001';
          END IF;
        END IF;

        IF v_order_notes->>'userId' IS NULL OR TRIM(v_order_notes->>'userId') = '' THEN
          RAISE EXCEPTION 'SECURITY_VIOLATION: Order entity is missing authoritative userId in order notes.' USING ERRCODE = 'P0001';
        END IF;
        IF v_order_notes->>'planId' IS NULL OR TRIM(v_order_notes->>'planId') = '' THEN
          RAISE EXCEPTION 'SECURITY_VIOLATION: Order entity is missing authoritative planId in order notes.' USING ERRCODE = 'P0001';
        END IF;
        IF v_order_notes->>'billingCycle' IS NULL OR TRIM(v_order_notes->>'billingCycle') = '' THEN
          RAISE EXCEPTION 'SECURITY_VIOLATION: Order entity is missing authoritative billingCycle in order notes.' USING ERRCODE = 'P0001';
        END IF;

        v_user_id := (v_order_notes->>'userId')::uuid;
        v_plan_id := UPPER(TRIM(v_order_notes->>'planId'));
        v_cycle := LOWER(TRIM(v_order_notes->>'billingCycle'));

        v_payment_notes := v_payment_entity->'notes';
        IF v_payment_notes IS NOT NULL AND v_payment_notes != 'null'::jsonb THEN
          IF v_payment_notes->>'userId' IS NOT NULL AND (v_payment_notes->>'userId')::uuid != v_user_id THEN
            RAISE EXCEPTION 'SECURITY_VIOLATION: Payment notes indicate conflicting user account.' USING ERRCODE = 'P0001';
          END IF;
          IF v_payment_notes->>'planId' IS NOT NULL AND UPPER(TRIM(v_payment_notes->>'planId')) != v_plan_id THEN
            RAISE EXCEPTION 'SECURITY_VIOLATION: Payment notes indicate conflicting plan.' USING ERRCODE = 'P0001';
          END IF;
          IF v_payment_notes->>'billingCycle' IS NOT NULL AND LOWER(TRIM(v_payment_notes->>'billingCycle')) != v_cycle THEN
            RAISE EXCEPTION 'SECURITY_VIOLATION: Payment notes indicate conflicting billing cycle.' USING ERRCODE = 'P0001';
          END IF;
        END IF;

        v_expected_amount := public.get_plan_expected_amount_paise(v_plan_id, v_cycle);
        IF v_expected_amount IS NULL THEN
          RAISE EXCEPTION 'INVALID_PLAN_OR_CYCLE: Unrecognized plan % or billing cycle %.', v_plan_id, v_cycle USING ERRCODE = 'P0001';
        END IF;

        IF v_payment_entity->>'amount' IS NULL THEN
          RAISE EXCEPTION 'SECURITY_VIOLATION: Missing payment amount in payment entity.' USING ERRCODE = 'P0001';
        END IF;
        v_payment_amount := (v_payment_entity->>'amount')::bigint;
        IF v_payment_amount != v_expected_amount THEN
          RAISE EXCEPTION 'AMOUNT_MISMATCH: Payment amount % paise does not match expected % paise for plan % (%).',
            v_payment_amount, v_expected_amount, v_plan_id, v_cycle USING ERRCODE = 'P0001';
        END IF;

        IF v_order_entity->>'amount' IS NULL THEN
          RAISE EXCEPTION 'SECURITY_VIOLATION: Missing order amount in order entity.' USING ERRCODE = 'P0001';
        END IF;
        v_order_amount := (v_order_entity->>'amount')::bigint;
        IF v_order_amount != v_expected_amount THEN
          RAISE EXCEPTION 'AMOUNT_MISMATCH: Order amount % paise does not match expected % paise for plan % (%).',
            v_order_amount, v_expected_amount, v_plan_id, v_cycle USING ERRCODE = 'P0001';
        END IF;

        -- Authoritative fulfillment
        v_confirm_res := public.confirm_payment_and_activate_subscription(
          p_payment_provider := p_provider,
          p_payment_id := v_payment_id,
          p_order_id := v_order_id,
          p_plan_id := v_plan_id,
          p_billing_cycle := v_cycle,
          p_user_id := v_user_id,
          p_amount_paise := v_expected_amount
        );

      WHEN 'subscription.activated', 'subscription.charged' THEN
        IF v_existing_sub.id IS NOT NULL THEN
          v_period_start := COALESCE(
            (TO_TIMESTAMP((p_payload->'payload'->'subscription'->'entity'->>'current_start')::bigint))::date,
            v_today
          );
          v_period_end := COALESCE(
            (TO_TIMESTAMP((p_payload->'payload'->'subscription'->'entity'->>'current_end')::bigint))::date,
            (v_today + interval '1 month')::date
          );

          UPDATE public.subscriptions
          SET 
            status = 'ACTIVE',
            cancel_at_period_end = false,
            current_period_start = v_period_start,
            current_period_end = v_period_end,
            updated_at = now()
          WHERE id = v_existing_sub.id;

          PERFORM public.sync_store_entitlements(v_existing_sub.user_id);

          INSERT INTO public.usage_events (
            business_id, user_id, event_type, units, description
          )
          SELECT 
            bm.business_id, v_existing_sub.user_id, 'SUBSCRIPTION_RESET', 0,
            'Subscription confirmed active by provider (' || p_event_type || ').'
          FROM public.business_members bm
          WHERE bm.user_id = v_existing_sub.user_id AND bm.role = 'owner';
        END IF;

      WHEN 'subscription.halted', 'subscription.pending' THEN
        IF v_existing_sub.id IS NOT NULL THEN
          UPDATE public.subscriptions
          SET status = 'PAST_DUE', updated_at = now()
          WHERE id = v_existing_sub.id;
        END IF;

      WHEN 'subscription.cancelled', 'subscription.completed' THEN
        IF v_existing_sub.id IS NOT NULL THEN
          IF v_existing_sub.current_period_end >= v_today THEN
            UPDATE public.subscriptions
            SET 
              cancel_at_period_end = true,
              updated_at = now()
            WHERE id = v_existing_sub.id;
          ELSE
            UPDATE public.subscriptions
            SET 
              status = 'CANCELLED',
              cancel_at_period_end = true,
              updated_at = now()
            WHERE id = v_existing_sub.id;

            PERFORM public.sync_store_entitlements(v_existing_sub.user_id);

            INSERT INTO public.usage_events (
              business_id, user_id, event_type, units, description
            )
            SELECT 
              bm.business_id, v_existing_sub.user_id, 'SUBSCRIPTION_ENTITLEMENT_ENDED', 0,
              'Paid billing cycle concluded. Entitlements synchronized.'
            FROM public.business_members bm
            WHERE bm.user_id = v_existing_sub.user_id AND bm.role = 'owner';
          END IF;
        END IF;

      ELSE
        NULL;
    END CASE;

    -- Inner block succeeded: mark PROCESSED
    UPDATE public.provider_events
    SET 
      status = 'PROCESSED',
      error_code = NULL,
      error_message = NULL,
      processed_at = now()
    WHERE id = v_event_id;

    RETURN jsonb_build_object(
      'success', true,
      'event_id', v_event_id,
      'status', 'PROCESSED',
      'event_type', p_event_type
    );

  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS
      v_err_sqlstate = RETURNED_SQLSTATE,
      v_err_message = MESSAGE_TEXT;

    -- Classify semantic failure and determine if manual review is required
    IF v_err_message LIKE 'FOUNDER_SOLD_OUT%' THEN
      v_semantic_code := 'FOUNDER_SOLD_OUT';
      v_is_needs_review := true;
    ELSIF v_err_message LIKE 'FOUNDER_ALREADY_CLAIMED%' THEN
      v_semantic_code := 'FOUNDER_ALREADY_CLAIMED';
      v_is_needs_review := true;
    ELSIF v_err_message LIKE 'PAYMENT_ALREADY_CLAIMED%' THEN
      v_semantic_code := 'PAYMENT_ALREADY_CLAIMED';
      v_is_needs_review := true;
    ELSIF v_err_message LIKE 'AMOUNT_MISMATCH%' THEN
      v_semantic_code := 'AMOUNT_MISMATCH';
      v_is_needs_review := true;
    ELSIF v_err_message LIKE 'INVALID_PLAN_OR_CYCLE%' OR v_err_message LIKE 'INVALID_FOUNDER_CYCLE%' OR v_err_message LIKE 'INVALID_PLAN%' OR v_err_message LIKE 'INVALID_CYCLE%' THEN
      v_semantic_code := 'INVALID_PLAN_OR_CYCLE';
      v_is_needs_review := true;
    ELSIF v_err_message LIKE 'APP_MISMATCH%' THEN
      v_semantic_code := 'APP_MISMATCH';
      v_is_needs_review := false;
    ELSE
      v_semantic_code := COALESCE(NULLIF(split_part(v_err_message, ':', 1), ''), 'RECONCILIATION_FAILED');
      v_is_needs_review := false;
    END IF;

    -- Retryable strictly for transient concurrency/locking exceptions:
    -- 40001 (serialization_failure), 40P01 (deadlock_detected), 55P03 (lock_not_available)
    v_is_retryable := (v_err_sqlstate IN ('40001', '40P01', '55P03'));

    -- Persist failure without re-raising so the event row remains committed
    UPDATE public.provider_events
    SET 
      status = CASE WHEN v_is_needs_review THEN 'NEEDS_REVIEW' ELSE 'FAILED' END,
      needs_review = v_is_needs_review,
      error_code = v_semantic_code,
      error_message = v_err_message,
      processed_at = now()
    WHERE id = v_event_id;

    RETURN jsonb_build_object(
      'success', false,
      'status', CASE WHEN v_is_needs_review THEN 'NEEDS_REVIEW' ELSE 'FAILED' END,
      'error_code', v_semantic_code,
      'retryable', v_is_retryable
    );
  END;
END;
$function$;

-- 5. Revoke permissions from public/anon/authenticated and grant strictly to service_role
REVOKE ALL ON FUNCTION public.reconcile_provider_event(text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_provider_event(text, text, text, jsonb) TO service_role;

REVOKE ALL ON TABLE public.provider_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.provider_events TO service_role;

REVOKE ALL ON TABLE public.provider_events_needs_review FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.provider_events_needs_review TO service_role;
