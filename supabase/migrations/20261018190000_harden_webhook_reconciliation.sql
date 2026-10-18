-- Migration: 20261018190000_harden_webhook_reconciliation.sql
-- Description:
-- 1. Helper function public.get_plan_expected_amount_paise for authoritative plan price lookup in SQL
-- 2. Hardens confirm_payment_and_activate_subscription to enforce billable tiers and validate amount when provided
-- 3. Hardens reconcile_provider_event to enforce strict order metadata, reject conflicting payment notes,
--    enforce INR currency, verify captured status, enforce price matching against plan quote, and downgrade
--    expired subscriptions to Free tier entitlements on provider cancellation
-- 4. Hardens save_campaign_atomically to safely handle concurrent replayed generation_request_id without burning quota
-- 5. Restricts EXECUTE permissions to service_role on privileged RPCs

-- 1. Deterministic Plan Price Lookup Function
CREATE OR REPLACE FUNCTION public.get_plan_expected_amount_paise(
  p_plan_id text,
  p_billing_cycle text
)
RETURNS bigint
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_plan text := UPPER(TRIM(COALESCE(p_plan_id, '')));
  v_cycle text := LOWER(TRIM(COALESCE(p_billing_cycle, '')));
BEGIN
  IF v_plan = 'PRO' THEN
    IF v_cycle = 'monthly' THEN RETURN 39900;
    ELSIF v_cycle = 'quarterly' THEN RETURN 109900;
    ELSIF v_cycle = 'annual' THEN RETURN 399000;
    END IF;
  ELSIF v_plan = 'GROWTH' THEN
    IF v_cycle = 'monthly' THEN RETURN 79900;
    ELSIF v_cycle = 'quarterly' THEN RETURN 219900;
    ELSIF v_cycle = 'annual' THEN RETURN 799000;
    END IF;
  ELSIF v_plan = 'FOUNDER' THEN
    IF v_cycle = 'quarterly' THEN RETURN 83700;
    ELSIF v_cycle = 'annual' THEN RETURN 279000;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

-- 2. Enhanced confirm_payment_and_activate_subscription with billable plan enforcement
CREATE OR REPLACE FUNCTION public.confirm_payment_and_activate_subscription(
  p_payment_provider text,
  p_payment_id text,
  p_order_id text,
  p_plan_id text,
  p_billing_cycle text,
  p_user_id uuid DEFAULT NULL,
  p_amount_paise bigint DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_plan_limit INT;
  v_biz_limit INT;
  v_period_interval INTERVAL;
  v_period_end DATE;
  v_normalized_plan TEXT;
  v_normalized_cycle TEXT;
  v_expected_amount BIGINT;
  v_existing_sub RECORD;
  v_other_user_sub UUID;
  v_new_sub_id UUID;
BEGIN
  -- Determine effective user ID
  v_user_id := COALESCE(auth.uid(), p_user_id);
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated or user_id provided.' USING ERRCODE = 'P0001';
  END IF;

  -- Prevent authenticated callers from passing a different user's ID
  IF auth.uid() IS NOT NULL AND p_user_id IS NOT NULL AND auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'FORBIDDEN: Cannot activate subscription for another user.' USING ERRCODE = 'P0001';
  END IF;

  IF p_payment_id IS NULL OR TRIM(p_payment_id) = '' THEN
    RAISE EXCEPTION 'INVALID_PAYMENT: Payment reference ID is required.' USING ERRCODE = 'P0001';
  END IF;

  v_normalized_plan := UPPER(TRIM(p_plan_id));
  v_normalized_cycle := LOWER(TRIM(p_billing_cycle));

  -- Validate billable tier: FREE tier cannot be activated via payment confirmation
  IF v_normalized_plan NOT IN ('PRO', 'GROWTH', 'FOUNDER') THEN
    RAISE EXCEPTION 'INVALID_PLAN: Plan % is not a valid billable subscription tier.', v_normalized_plan USING ERRCODE = 'P0001';
  END IF;

  -- Validate billing cycle
  IF v_normalized_cycle NOT IN ('monthly', 'quarterly', 'annual') THEN
    RAISE EXCEPTION 'INVALID_CYCLE: Billing cycle must be monthly, quarterly, or annual.' USING ERRCODE = 'P0001';
  END IF;

  -- Validate plan price if amount was provided
  IF p_amount_paise IS NOT NULL THEN
    v_expected_amount := public.get_plan_expected_amount_paise(v_normalized_plan, v_normalized_cycle);
    IF v_expected_amount IS NULL OR p_amount_paise != v_expected_amount THEN
      RAISE EXCEPTION 'AMOUNT_MISMATCH: Provided payment amount % paise does not match required price % paise for plan % (%).',
        p_amount_paise, COALESCE(v_expected_amount, 0), v_normalized_plan, v_normalized_cycle USING ERRCODE = 'P0001';
    END IF;
  END IF;

  -- 1. Check if this payment ID was already used by a DIFFERENT account
  SELECT id INTO v_other_user_sub
  FROM public.subscriptions
  WHERE provider = LOWER(TRIM(p_payment_provider))
    AND provider_subscription_id = TRIM(p_payment_id)
    AND user_id != v_user_id
  LIMIT 1;

  IF v_other_user_sub IS NOT NULL THEN
    RAISE EXCEPTION 'PAYMENT_ALREADY_CLAIMED: This payment reference is already attached to another account.' USING ERRCODE = 'P0001';
  END IF;

  -- 2. Check if this exact payment ID was already processed for THIS account (idempotent replay)
  SELECT id, status, plan_id, billing_cycle, current_period_end 
  INTO v_existing_sub
  FROM public.subscriptions
  WHERE provider = LOWER(TRIM(p_payment_provider))
    AND provider_subscription_id = TRIM(p_payment_id)
    AND user_id = v_user_id;

  IF v_existing_sub.id IS NOT NULL THEN
    IF v_existing_sub.status = 'CANCELLED' THEN
      RAISE EXCEPTION 'PAYMENT_ALREADY_EXPIRED: Payment reference belongs to a cancelled subscription and cannot be reused.' USING ERRCODE = 'P0001';
    END IF;

    SELECT monthly_campaign_limit, business_limit 
    INTO v_plan_limit, v_biz_limit
    FROM public.plans WHERE id = v_existing_sub.plan_id;

    RETURN jsonb_build_object(
      'success', true,
      'idempotent_replay', true,
      'subscription_id', v_existing_sub.id,
      'plan', v_existing_sub.plan_id,
      'billing_cycle', v_existing_sub.billing_cycle,
      'status', v_existing_sub.status,
      'business_limit', v_biz_limit,
      'monthly_campaign_limit', v_plan_limit,
      'current_period_end', v_existing_sub.current_period_end::text
    );
  END IF;

  -- 3. Validate plan active in plans table
  IF NOT EXISTS (SELECT 1 FROM public.plans WHERE id = v_normalized_plan AND active = true) THEN
    RAISE EXCEPTION 'INVALID_PLAN: Plan % does not exist or is inactive.', v_normalized_plan USING ERRCODE = 'P0001';
  END IF;

  -- 4. Fetch plan parameters
  SELECT monthly_campaign_limit, business_limit 
  INTO v_plan_limit, v_biz_limit
  FROM public.plans 
  WHERE id = v_normalized_plan;

  -- 5. Compute period duration
  v_period_interval := CASE 
    WHEN v_normalized_cycle = 'monthly' THEN interval '1 month'
    WHEN v_normalized_cycle = 'quarterly' THEN interval '3 months'
    ELSE interval '1 year'
  END;

  v_period_end := (CURRENT_DATE + v_period_interval)::date;

  -- 6. Founder plan allocation & claims check
  IF v_normalized_plan = 'FOUNDER' THEN
    IF v_normalized_cycle NOT IN ('quarterly', 'annual') THEN
      RAISE EXCEPTION 'INVALID_FOUNDER_CYCLE: Founder tier requires quarterly or annual billing.' USING ERRCODE = 'P0001';
    END IF;

    IF EXISTS (SELECT 1 FROM public.founder_claims WHERE user_id = v_user_id) THEN
      RAISE EXCEPTION 'FOUNDER_ALREADY_CLAIMED: One Founder claim per account.' USING ERRCODE = 'P0001';
    END IF;

    UPDATE public.founder_allocation
    SET claimed_slots = claimed_slots + 1
    WHERE id = 1 AND claimed_slots < total_slots;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'FOUNDER_SOLD_OUT: All Founder slots are fully allocated.' USING ERRCODE = 'P0001';
    END IF;

    INSERT INTO public.founder_claims (user_id, billing_cycle)
    VALUES (v_user_id, v_normalized_cycle);
  END IF;

  -- 7. Cancel prior active subscriptions for this user
  UPDATE public.subscriptions
  SET status = 'CANCELLED', updated_at = now()
  WHERE user_id = v_user_id AND status = 'ACTIVE';

  -- 8. Insert new active subscription
  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    provider,
    provider_subscription_id,
    status,
    billing_cycle,
    current_period_start,
    current_period_end,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    v_normalized_plan,
    LOWER(TRIM(p_payment_provider)),
    TRIM(p_payment_id),
    'ACTIVE',
    v_normalized_cycle,
    CURRENT_DATE,
    v_period_end,
    NOW(),
    NOW()
  ) RETURNING id INTO v_new_sub_id;

  -- 9. Update active usage periods for businesses owned by this user
  UPDATE public.usage_periods
  SET 
    plan = v_normalized_plan,
    campaign_limit = v_plan_limit,
    updated_at = NOW()
  WHERE business_id IN (
    SELECT business_id FROM public.business_members 
    WHERE user_id = v_user_id AND role = 'owner'
  )
  AND period_end >= CURRENT_DATE;

  -- 10. Record audit event
  INSERT INTO public.usage_events (
    business_id,
    user_id,
    event_type,
    units,
    description
  ) 
  SELECT 
    bm.business_id,
    v_user_id,
    'SUBSCRIPTION_RESET',
    1,
    'Subscription activated on ' || v_normalized_plan || ' (' || v_normalized_cycle || ' cycle).'
  FROM public.business_members bm
  WHERE bm.user_id = v_user_id AND bm.role = 'owner';

  RETURN jsonb_build_object(
    'success', true,
    'subscription_id', v_new_sub_id,
    'plan', v_normalized_plan,
    'billing_cycle', v_normalized_cycle,
    'status', 'ACTIVE',
    'business_limit', v_biz_limit,
    'monthly_campaign_limit', v_plan_limit,
    'current_period_end', v_period_end::text
  );
END;
$$;

-- 6-parameter backward compatibility wrapper forwarding to 7-parameter implementation
CREATE OR REPLACE FUNCTION public.confirm_payment_and_activate_subscription(
  p_payment_provider text,
  p_payment_id text,
  p_order_id text,
  p_plan_id text,
  p_billing_cycle text,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.confirm_payment_and_activate_subscription(
    p_payment_provider,
    p_payment_id,
    p_order_id,
    p_plan_id,
    p_billing_cycle,
    p_user_id,
    NULL::bigint
  );
$$;

-- 5-parameter legacy backward compatibility wrapper
CREATE OR REPLACE FUNCTION public.confirm_payment_and_activate_subscription(
  p_payment_provider text,
  p_payment_id text,
  p_order_id text,
  p_plan_id text,
  p_billing_cycle text
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.confirm_payment_and_activate_subscription(
    p_payment_provider,
    p_payment_id,
    p_order_id,
    p_plan_id,
    p_billing_cycle,
    NULL::uuid,
    NULL::bigint
  );
$$;

-- 3. Hardened reconcile_provider_event
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
AS $$
DECLARE
  v_event_id uuid;
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
  v_plan_record record;
  v_confirm_res jsonb;
BEGIN
  -- 1. Insert or check provider event for idempotency
  INSERT INTO public.provider_events (
    provider,
    provider_event_id,
    event_type,
    payload,
    status,
    attempt_count,
    received_at
  ) VALUES (
    LOWER(TRIM(p_provider)),
    TRIM(p_provider_event_id),
    TRIM(p_event_type),
    p_payload,
    'PROCESSING',
    1,
    now()
  )
  ON CONFLICT (provider, provider_event_id) DO NOTHING
  RETURNING id INTO v_event_id;

  -- If already processed or in-flight, return idempotent response
  IF v_event_id IS NULL THEN
    SELECT id, status, processed_at INTO v_event_id, v_plan_id, v_period_start
    FROM public.provider_events
    WHERE provider = LOWER(TRIM(p_provider)) AND provider_event_id = TRIM(p_provider_event_id);

    RETURN jsonb_build_object(
      'success', true,
      'idempotent_replay', true,
      'provider_event_id', p_provider_event_id,
      'status', v_plan_id
    );
  END IF;

  -- Extract subscription reference from payload if subscription event
  v_sub_id := COALESCE(
    p_payload->'payload'->'subscription'->'entity'->>'id',
    p_payload->'subscription'->>'id',
    p_payload->>'subscription_id',
    p_payload->>'id'
  );

  -- Find matching subscription record if provider_subscription_id matches
  IF v_sub_id IS NOT NULL THEN
    SELECT * INTO v_existing_sub
    FROM public.subscriptions
    WHERE provider = LOWER(TRIM(p_provider))
      AND provider_subscription_id = v_sub_id
    LIMIT 1
    FOR UPDATE;
  END IF;

  -- 2. Process Event Type
  CASE p_event_type
    -- PAYMENT CAPTURED / ORDER PAID (Strict Reconciliation Flow)
    WHEN 'payment.captured', 'order.paid' THEN
      v_payment_entity := COALESCE(
        p_payload->'payload'->'payment'->'entity',
        p_payload->'payment'
      );
      v_order_entity := COALESCE(
        p_payload->'payload'->'order'->'entity',
        p_payload->'order'
      );

      v_payment_id := COALESCE(
        v_payment_entity->>'id',
        p_payload->>'payment_id'
      );
      v_order_id := COALESCE(
        v_payment_entity->>'order_id',
        v_order_entity->>'id',
        p_payload->>'order_id'
      );

      v_payment_notes := v_payment_entity->'notes';
      v_order_notes := v_order_entity->'notes';

      -- Strict Authoritative Metadata Extraction
      IF v_order_entity IS NOT NULL AND v_order_notes IS NOT NULL THEN
        -- Order notes are authoritative
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

        -- Cross-check payment notes if present to prevent conflicting/tampered notes
        IF v_payment_notes IS NOT NULL THEN
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

      ELSIF v_payment_entity IS NOT NULL AND v_payment_notes IS NOT NULL THEN
        -- Fallback to payment entity notes only when order entity was omitted from webhook payload
        IF v_payment_notes->>'userId' IS NULL OR TRIM(v_payment_notes->>'userId') = '' THEN
          RAISE EXCEPTION 'SECURITY_VIOLATION: Missing authoritative userId in payment notes.' USING ERRCODE = 'P0001';
        END IF;
        IF v_payment_notes->>'planId' IS NULL OR TRIM(v_payment_notes->>'planId') = '' THEN
          RAISE EXCEPTION 'SECURITY_VIOLATION: Missing authoritative planId in payment notes.' USING ERRCODE = 'P0001';
        END IF;
        IF v_payment_notes->>'billingCycle' IS NULL OR TRIM(v_payment_notes->>'billingCycle') = '' THEN
          RAISE EXCEPTION 'SECURITY_VIOLATION: Missing authoritative billingCycle in payment notes. Cannot default to monthly.' USING ERRCODE = 'P0001';
        END IF;

        v_user_id := (v_payment_notes->>'userId')::uuid;
        v_plan_id := UPPER(TRIM(v_payment_notes->>'planId'));
        v_cycle := LOWER(TRIM(v_payment_notes->>'billingCycle'));

      ELSE
        RAISE EXCEPTION 'SECURITY_VIOLATION: Webhook event contains no order or payment notes.' USING ERRCODE = 'P0001';
      END IF;

      -- Validate Currency
      IF v_payment_entity IS NOT NULL THEN
        v_currency := v_payment_entity->>'currency';
        IF v_currency IS NULL OR UPPER(TRIM(v_currency)) != 'INR' THEN
          RAISE EXCEPTION 'INVALID_CURRENCY: Payment currency must be INR (received %).', v_currency USING ERRCODE = 'P0001';
        END IF;
      END IF;

      IF v_order_entity IS NOT NULL THEN
        v_currency := v_order_entity->>'currency';
        IF v_currency IS NULL OR UPPER(TRIM(v_currency)) != 'INR' THEN
          RAISE EXCEPTION 'INVALID_CURRENCY: Order currency must be INR (received %).', v_currency USING ERRCODE = 'P0001';
        END IF;
      END IF;

      -- Validate Payment Status
      IF v_payment_entity IS NOT NULL THEN
        v_payment_status := LOWER(TRIM(COALESCE(v_payment_entity->>'status', '')));
        v_payment_captured := COALESCE((v_payment_entity->>'captured')::boolean, false);
        IF v_payment_status != 'captured' AND NOT v_payment_captured THEN
          RAISE EXCEPTION 'PAYMENT_NOT_CAPTURED: Payment is in status %, not captured.', v_payment_status USING ERRCODE = 'P0001';
        END IF;
      END IF;

      IF p_event_type = 'order.paid' AND v_order_entity IS NOT NULL THEN
        v_order_status := LOWER(TRIM(COALESCE(v_order_entity->>'status', '')));
        IF v_order_status != 'paid' THEN
          RAISE EXCEPTION 'ORDER_NOT_PAID: Order is in status %, not paid.', v_order_status USING ERRCODE = 'P0001';
        END IF;
      END IF;

      -- Validate Amount against Plan Pricing Quote
      v_expected_amount := public.get_plan_expected_amount_paise(v_plan_id, v_cycle);
      IF v_expected_amount IS NULL THEN
        RAISE EXCEPTION 'INVALID_PLAN_OR_CYCLE: Unrecognized plan % or billing cycle %.', v_plan_id, v_cycle USING ERRCODE = 'P0001';
      END IF;

      IF v_payment_entity IS NOT NULL AND v_payment_entity->>'amount' IS NOT NULL THEN
        v_payment_amount := (v_payment_entity->>'amount')::bigint;
        IF v_payment_amount != v_expected_amount THEN
          RAISE EXCEPTION 'AMOUNT_MISMATCH: Payment amount % paise does not match expected % paise for plan % (%).',
            v_payment_amount, v_expected_amount, v_plan_id, v_cycle USING ERRCODE = 'P0001';
        END IF;
      END IF;

      IF v_order_entity IS NOT NULL AND v_order_entity->>'amount' IS NOT NULL THEN
        v_order_amount := (v_order_entity->>'amount')::bigint;
        IF v_order_amount != v_expected_amount THEN
          RAISE EXCEPTION 'AMOUNT_MISMATCH: Order amount % paise does not match expected % paise for plan % (%).',
            v_order_amount, v_expected_amount, v_plan_id, v_cycle USING ERRCODE = 'P0001';
        END IF;
      END IF;

      -- Invoke privileged activation RPC with strict verified parameters
      v_confirm_res := public.confirm_payment_and_activate_subscription(
        p_provider,
        COALESCE(v_payment_id, v_order_id, p_provider_event_id),
        v_order_id,
        v_plan_id,
        v_cycle,
        v_user_id,
        v_expected_amount
      );

    -- SUBSCRIPTION ACTIVATION / PAYMENT CHARGED
    WHEN 'subscription.activated', 'subscription.charged' THEN
      IF v_existing_sub.id IS NOT NULL THEN
        v_period_start := COALESCE(
          (TO_TIMESTAMP((p_payload->'payload'->'subscription'->'entity'->>'current_start')::bigint))::date,
          CURRENT_DATE
        );
        v_period_end := COALESCE(
          (TO_TIMESTAMP((p_payload->'payload'->'subscription'->'entity'->>'current_end')::bigint))::date,
          (CURRENT_DATE + interval '1 month')::date
        );

        UPDATE public.subscriptions
        SET 
          status = 'ACTIVE',
          cancel_at_period_end = false,
          current_period_start = v_period_start,
          current_period_end = v_period_end,
          updated_at = now()
        WHERE id = v_existing_sub.id;

        SELECT monthly_campaign_limit INTO v_plan_record
        FROM public.plans WHERE id = v_existing_sub.plan_id;

        UPDATE public.usage_periods
        SET 
          plan = v_existing_sub.plan_id,
          campaign_limit = COALESCE(v_plan_record.monthly_campaign_limit, campaign_limit),
          updated_at = now()
        WHERE business_id IN (
          SELECT business_id FROM public.business_members 
          WHERE user_id = v_existing_sub.user_id AND role = 'owner'
        )
        AND period_end >= CURRENT_DATE;

        INSERT INTO public.usage_events (
          business_id, user_id, event_type, units, description
        )
        SELECT 
          bm.business_id, v_existing_sub.user_id, 'SUBSCRIPTION_RESET', 0,
          'Subscription confirmed active by provider (' || p_event_type || ').'
        FROM public.business_members bm
        WHERE bm.user_id = v_existing_sub.user_id AND bm.role = 'owner';
      END IF;

    -- PAYMENT HALTED / PAST DUE
    WHEN 'subscription.halted', 'subscription.pending' THEN
      IF v_existing_sub.id IS NOT NULL THEN
        UPDATE public.subscriptions
        SET status = 'PAST_DUE', updated_at = now()
        WHERE id = v_existing_sub.id;
      END IF;

    -- CANCELLATION CONFIRMED BY PROVIDER
    WHEN 'subscription.cancelled', 'subscription.completed' THEN
      IF v_existing_sub.id IS NOT NULL THEN
        IF v_existing_sub.current_period_end >= CURRENT_DATE THEN
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

          -- Downgrade active usage periods to Free tier entitlements upon conclusion of paid cycle
          UPDATE public.usage_periods
          SET 
            plan = 'FREE',
            campaign_limit = 3,
            updated_at = now()
          WHERE business_id IN (
            SELECT business_id FROM public.business_members 
            WHERE user_id = v_existing_sub.user_id AND role = 'owner'
          )
          AND period_end >= CURRENT_DATE;

          INSERT INTO public.usage_events (
            business_id, user_id, event_type, units, description
          )
          SELECT 
            bm.business_id, v_existing_sub.user_id, 'SUBSCRIPTION_ENTITLEMENT_ENDED', 0,
            'Paid billing cycle concluded. Reverted to standard Free tier entitlements.'
          FROM public.business_members bm
          WHERE bm.user_id = v_existing_sub.user_id AND bm.role = 'owner';
        END IF;
      END IF;

    ELSE
      NULL;
  END CASE;

  -- 3. Mark provider event PROCESSED
  UPDATE public.provider_events
  SET 
    status = 'PROCESSED',
    processed_at = now()
  WHERE id = v_event_id;

  RETURN jsonb_build_object(
    'success', true,
    'event_id', v_event_id,
    'status', 'PROCESSED',
    'event_type', p_event_type
  );
EXCEPTION WHEN OTHERS THEN
  IF v_event_id IS NOT NULL THEN
    UPDATE public.provider_events
    SET 
      status = 'FAILED',
      error_message = SQLERRM,
      processed_at = now()
    WHERE id = v_event_id;
  END IF;
  RAISE;
END;
$$;

-- 4. Hardened save_campaign_atomically with resilient concurrent idempotency
CREATE OR REPLACE FUNCTION public.save_campaign_atomically(
  p_business_id uuid,
  p_campaign_type text,
  p_objective text,
  p_audience text,
  p_offer jsonb,
  p_schedule jsonb,
  p_google_content jsonb,
  p_instagram_content jsonb,
  p_whatsapp_content jsonb,
  p_poster_content jsonb,
  p_generation_request_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_campaign_id UUID;
  v_usage_period_id UUID;
  v_campaigns_used INT;
  v_campaign_limit INT;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Caller must be authenticated.' USING ERRCODE = 'P0001';
  END IF;

  IF p_business_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_BUSINESS: Cannot create a campaign without a valid business. Please select or create a business first.' USING ERRCODE = 'P0001';
  END IF;

  IF NOT public.is_business_member(p_business_id, v_user_id) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: User is not a member of this business.' USING ERRCODE = 'P0001';
  END IF;

  -- 4a. Check for idempotent replay before verifying payload or consuming quota
  IF p_generation_request_id IS NOT NULL THEN
    SELECT id INTO v_campaign_id
    FROM public.campaigns
    WHERE generation_request_id = p_generation_request_id
      AND business_id = p_business_id;

    IF v_campaign_id IS NOT NULL THEN
      SELECT campaigns_used, campaign_limit INTO v_campaigns_used, v_campaign_limit
      FROM public.usage_periods
      WHERE business_id = p_business_id
        AND period_start <= CURRENT_DATE
        AND period_end >= CURRENT_DATE;

      RETURN jsonb_build_object(
        'campaign_id', v_campaign_id,
        'status', 'READY',
        'campaigns_used', COALESCE(v_campaigns_used, 0),
        'campaign_limit', COALESCE(v_campaign_limit, 3),
        'idempotent_replay', true
      );
    END IF;
  END IF;

  -- 4b. Validate 4-channel completeness
  IF p_google_content IS NULL OR p_google_content = '{}'::jsonb OR
     p_instagram_content IS NULL OR p_instagram_content = '{}'::jsonb OR
     p_whatsapp_content IS NULL OR p_whatsapp_content = '{}'::jsonb OR
     p_poster_content IS NULL OR p_poster_content = '{}'::jsonb THEN
    RAISE EXCEPTION 'INCOMPLETE_CAMPAIGN_PACK: All four channel payloads are required.' USING ERRCODE = 'P0001';
  END IF;

  -- 4c. Verify quota availability with row-level lock
  SELECT id, campaigns_used, campaign_limit INTO v_usage_period_id, v_campaigns_used, v_campaign_limit
  FROM public.usage_periods
  WHERE business_id = p_business_id
    AND period_start <= CURRENT_DATE
    AND period_end >= CURRENT_DATE
  FOR UPDATE;

  IF v_usage_period_id IS NULL THEN
    RAISE EXCEPTION 'ENTITLEMENT_UNAVAILABLE: No active usage period found for this business.' USING ERRCODE = 'P0001';
  END IF;

  IF v_campaigns_used >= v_campaign_limit THEN
    RAISE EXCEPTION 'QUOTA_EXHAUSTED: Usage quota reached: % of % campaigns used this cycle.', v_campaigns_used, v_campaign_limit USING ERRCODE = 'P0001';
  END IF;

  -- 4d. Deduct quota atomically
  UPDATE public.usage_periods
  SET campaigns_used = campaigns_used + 1
  WHERE id = v_usage_period_id;
  
  v_campaigns_used := v_campaigns_used + 1;

  -- 4e. Insert campaign record with generation_request_id idempotency anchor
  BEGIN
    INSERT INTO public.campaigns (
      business_id,
      type,
      objective,
      audience,
      offer,
      schedule,
      status,
      generation_request_id
    ) VALUES (
      p_business_id,
      p_campaign_type,
      p_objective,
      COALESCE(p_audience, ''),
      COALESCE(p_offer, '{}'::jsonb),
      COALESCE(p_schedule, '{}'::jsonb),
      'READY',
      p_generation_request_id
    ) RETURNING id INTO v_campaign_id;
  EXCEPTION WHEN unique_violation THEN
    -- If another concurrent transaction inserted the same generation_request_id, rollback the quota increment and return existing campaign
    IF p_generation_request_id IS NOT NULL THEN
      UPDATE public.usage_periods
      SET campaigns_used = campaigns_used - 1
      WHERE id = v_usage_period_id;

      SELECT id INTO v_campaign_id
      FROM public.campaigns
      WHERE generation_request_id = p_generation_request_id;

      RETURN jsonb_build_object(
        'campaign_id', v_campaign_id,
        'status', 'READY',
        'campaigns_used', v_campaigns_used - 1,
        'campaign_limit', v_campaign_limit,
        'idempotent_replay', true
      );
    ELSE
      RAISE;
    END IF;
  END;

  -- 4f. Insert 4-channel content outputs
  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
  VALUES (v_campaign_id, 'GOOGLE_BUSINESS', p_google_content, 'VALID')
  ON CONFLICT (campaign_id, channel) DO UPDATE SET content = EXCLUDED.content;

  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
  VALUES (v_campaign_id, 'INSTAGRAM', p_instagram_content, 'VALID')
  ON CONFLICT (campaign_id, channel) DO UPDATE SET content = EXCLUDED.content;

  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
  VALUES (v_campaign_id, 'WHATSAPP', p_whatsapp_content, 'VALID')
  ON CONFLICT (campaign_id, channel) DO UPDATE SET content = EXCLUDED.content;

  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
  VALUES (v_campaign_id, 'IN_STORE_POSTER', p_poster_content, 'VALID')
  ON CONFLICT (campaign_id, channel) DO UPDATE SET content = EXCLUDED.content;

  -- 4g. Audit event
  INSERT INTO public.usage_events (
    business_id,
    user_id,
    event_type,
    units,
    campaign_id,
    description
  ) VALUES (
    p_business_id,
    v_user_id,
    'CAMPAIGN_GENERATION',
    1,
    v_campaign_id,
    'Generated and saved complete storefront campaign.'
  );

  RETURN jsonb_build_object(
    'campaign_id', v_campaign_id,
    'status', 'READY',
    'campaigns_used', v_campaigns_used,
    'campaign_limit', v_campaign_limit,
    'idempotent_replay', false
  );
END;
$$;

-- 5. Least-privilege permissions enforcement
REVOKE EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text, uuid, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text, uuid, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.reconcile_provider_event(text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_provider_event(text, text, text, jsonb) TO service_role;

GRANT EXECUTE ON FUNCTION public.save_campaign_atomically(uuid, text, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.save_campaign_atomically(uuid, text, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, uuid) FROM PUBLIC, anon;
