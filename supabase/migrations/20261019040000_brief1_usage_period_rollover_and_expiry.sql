-- Migration: 20261019040000_brief1_usage_period_rollover_and_expiry.sql
-- Brief 1: Usage period rollover and subscription expiry
-- Deploy by 28 Oct 2026 to prevent campaign generation outage on 1 Nov 2026.

-- 1. Ensure unique constraint on usage_periods (business_id, period_start)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_business_period'
      AND conrelid = 'public.usage_periods'::regclass
  ) THEN
    ALTER TABLE public.usage_periods
      ADD CONSTRAINT unique_business_period UNIQUE (business_id, period_start);
  END IF;
END $$;

-- 2. resolve_store_entitlement(p_business_id): STABLE, definer, internal
-- Returns plan id and monthly campaign limit from the best active subscription
-- (status ACTIVE or TRIALING and current_period_end >= today) held by any owner of the store,
-- highest limit wins, otherwise the FREE row in plans.
CREATE OR REPLACE FUNCTION public.resolve_store_entitlement(p_business_id uuid)
RETURNS TABLE(plan_id text, monthly_campaign_limit int)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
BEGIN
  RETURN QUERY
  SELECT p.id AS plan_id, p.monthly_campaign_limit
  FROM public.business_members bm
  JOIN public.subscriptions s ON s.user_id = bm.user_id
  JOIN public.plans p ON p.id = s.plan_id
  WHERE bm.business_id = p_business_id
    AND bm.role = 'owner'
    AND s.status IN ('ACTIVE', 'TRIALING')
    AND s.current_period_end >= v_today
  ORDER BY p.monthly_campaign_limit DESC, s.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT p.id AS plan_id, COALESCE(p.monthly_campaign_limit, 3)
    FROM public.plans p
    WHERE p.id = 'FREE'
    LIMIT 1;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_store_entitlement(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_store_entitlement(uuid) TO service_role;

-- 3. ensure_usage_period(p_business_id): definer, idempotent, internal
-- If no usage_periods row covers today, insert one for the current calendar month (IST)
-- with plan and limit from resolve_store_entitlement and campaigns_used = 0.
-- Uses ON CONFLICT DO NOTHING and returns the row.
CREATE OR REPLACE FUNCTION public.ensure_usage_period(p_business_id uuid)
RETURNS public.usage_periods
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  v_row public.usage_periods;
  v_plan_id text;
  v_limit int;
  v_start date := date_trunc('month', (now() at time zone 'Asia/Kolkata')::date)::date;
  v_end date := (date_trunc('month', (now() at time zone 'Asia/Kolkata')::date) + interval '1 month - 1 day')::date;
BEGIN
  -- Check if active usage period covers today
  SELECT * INTO v_row
  FROM public.usage_periods
  WHERE business_id = p_business_id
    AND period_start <= v_today
    AND period_end >= v_today
  ORDER BY period_start DESC
  LIMIT 1;

  IF v_row.id IS NOT NULL THEN
    RETURN v_row;
  END IF;

  -- Resolve entitlement from highest-tier owner subscription or FREE
  SELECT ent.plan_id, ent.monthly_campaign_limit INTO v_plan_id, v_limit
  FROM public.resolve_store_entitlement(p_business_id) ent;

  -- Insert usage period for current calendar month (IST)
  INSERT INTO public.usage_periods (
    business_id,
    period_start,
    period_end,
    plan,
    campaign_limit,
    campaigns_used
  ) VALUES (
    p_business_id,
    v_start,
    v_end,
    COALESCE(v_plan_id, 'FREE'),
    COALESCE(v_limit, 3),
    0
  )
  ON CONFLICT (business_id, period_start) DO NOTHING
  RETURNING * INTO v_row;

  -- If conflict occurred (concurrent insert), fetch existing row
  IF v_row.id IS NULL THEN
    SELECT * INTO v_row
    FROM public.usage_periods
    WHERE business_id = p_business_id
      AND period_start <= v_today
      AND period_end >= v_today
    ORDER BY period_start DESC
    LIMIT 1;
  END IF;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_usage_period(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_usage_period(uuid) TO service_role;

-- 4. ensure_my_usage_period(p_business_id): wrapper granted to authenticated that checks is_business_member
CREATE OR REPLACE FUNCTION public.ensure_my_usage_period(p_business_id uuid)
RETURNS public.usage_periods
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_period public.usage_periods;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Caller must be authenticated.' USING ERRCODE = 'P0001';
  END IF;

  IF NOT public.is_business_member(p_business_id, v_user_id) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: User is not a member of this business.' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_period FROM public.ensure_usage_period(p_business_id);
  RETURN v_period;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_my_usage_period(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_my_usage_period(uuid) TO authenticated, service_role;

-- 5. sync_store_entitlements(p_user_id): shared helper that re-resolves entitlement
-- for every store the user owns and updates the current usage_periods row. Never writes FREE blindly.
CREATE OR REPLACE FUNCTION public.sync_store_entitlements(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  v_biz record;
  v_entitlement record;
  v_period public.usage_periods;
BEGIN
  FOR v_biz IN
    SELECT DISTINCT business_id
    FROM public.business_members
    WHERE user_id = p_user_id
      AND role = 'owner'
  LOOP
    -- Ensure period exists for current month
    v_period := public.ensure_usage_period(v_biz.business_id);

    -- Re-resolve best entitlement across all owners
    SELECT plan_id, monthly_campaign_limit INTO v_entitlement
    FROM public.resolve_store_entitlement(v_biz.business_id);

    -- Update active period for the store
    UPDATE public.usage_periods
    SET
      plan = v_entitlement.plan_id,
      campaign_limit = v_entitlement.monthly_campaign_limit,
      updated_at = now()
    WHERE business_id = v_biz.business_id
      AND period_start <= v_today
      AND period_end >= v_today;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_store_entitlements(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_store_entitlements(uuid) TO service_role;

-- 6. process_expired_subscriptions: expire every ACTIVE, TRIALING or PAST_DUE subscription
-- with current_period_end < today regardless of cancel_at_period_end, set status to CANCELLED,
-- then call sync_store_entitlements for its user. Keep the audit event.
CREATE OR REPLACE FUNCTION public.process_expired_subscriptions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  v_sub RECORD;
  v_processed_count INT := 0;
BEGIN
  -- Iterate through all subscriptions whose period has ended, regardless of cancel_at_period_end
  FOR v_sub IN
    SELECT id, user_id, plan_id, current_period_end
    FROM public.subscriptions
    WHERE status IN ('ACTIVE', 'TRIALING', 'PAST_DUE')
      AND current_period_end < v_today
    FOR UPDATE SKIP LOCKED
  LOOP
    -- 1. Mark subscription CANCELLED
    UPDATE public.subscriptions
    SET 
      status = 'CANCELLED',
      updated_at = NOW()
    WHERE id = v_sub.id;

    -- 2. Synchronize store entitlements (re-resolves best plan across owners)
    PERFORM public.sync_store_entitlements(v_sub.user_id);

    -- 3. Log audit event
    INSERT INTO public.usage_events (
      business_id,
      user_id,
      event_type,
      units,
      description
    )
    SELECT 
      bm.business_id,
      v_sub.user_id,
      'SUBSCRIPTION_ENTITLEMENT_ENDED',
      0,
      'Billing period concluded on ' || v_sub.current_period_end::text || '. Subscription expired.'
    FROM public.business_members bm
    WHERE bm.user_id = v_sub.user_id AND bm.role = 'owner';

    v_processed_count := v_processed_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'processed_count', v_processed_count,
    'executed_at', NOW()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.process_expired_subscriptions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_expired_subscriptions() TO service_role;

-- 7. Update confirm_payment_and_activate_subscription to call sync_store_entitlements
CREATE OR REPLACE FUNCTION public.confirm_payment_and_activate_subscription(
  p_payment_provider text,
  p_payment_id text,
  p_order_id text,
  p_plan_id text,
  p_billing_cycle text,
  p_user_id uuid,
  p_amount_paise bigint
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  v_today DATE := (now() at time zone 'Asia/Kolkata')::date;
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

  v_normalized_plan := UPPER(TRIM(COALESCE(p_plan_id, '')));
  v_normalized_cycle := LOWER(TRIM(COALESCE(p_billing_cycle, '')));

  -- Validate billable tier: FREE tier cannot be activated via payment confirmation
  IF v_normalized_plan NOT IN ('PRO', 'GROWTH', 'FOUNDER') THEN
    RAISE EXCEPTION 'INVALID_PLAN: Plan % is not a valid billable subscription tier.', v_normalized_plan USING ERRCODE = 'P0001';
  END IF;

  -- Validate billing cycle
  IF v_normalized_cycle NOT IN ('monthly', 'quarterly', 'annual') THEN
    RAISE EXCEPTION 'INVALID_CYCLE: Billing cycle must be monthly, quarterly, or annual.' USING ERRCODE = 'P0001';
  END IF;

  -- Mandatory Amount Validation: p_amount_paise must be non-null, positive, and match plan quote
  IF p_amount_paise IS NULL OR p_amount_paise <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT: Payment amount in paise is mandatory and must be positive.' USING ERRCODE = 'P0001';
  END IF;

  v_expected_amount := public.get_plan_expected_amount_paise(v_normalized_plan, v_normalized_cycle);
  IF v_expected_amount IS NULL OR p_amount_paise != v_expected_amount THEN
    RAISE EXCEPTION 'AMOUNT_MISMATCH: Provided payment amount % paise does not match required price % paise for plan % (%).',
      p_amount_paise, COALESCE(v_expected_amount, 0), v_normalized_plan, v_normalized_cycle USING ERRCODE = 'P0001';
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

  v_period_end := (v_today + v_period_interval)::date;

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
    v_today,
    v_period_end,
    NOW(),
    NOW()
  ) RETURNING id INTO v_new_sub_id;

  -- 9. Re-resolve and synchronize entitlements for all owned stores
  PERFORM public.sync_store_entitlements(v_user_id);

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

REVOKE ALL ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text, uuid, bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text, uuid, bigint) TO service_role;

-- 8. Update reconcile_provider_event to call sync_store_entitlements
CREATE OR REPLACE FUNCTION public.reconcile_provider_event(
  p_provider text,
  p_provider_event_id text,
  p_event_type text,
  p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  v_existing_event_status text;
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
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

  -- If conflict: handle idempotency and retry semantics
  IF v_event_id IS NULL THEN
    SELECT id, status INTO v_event_id, v_existing_event_status
    FROM public.provider_events
    WHERE provider = LOWER(TRIM(p_provider)) AND provider_event_id = TRIM(p_provider_event_id);

    IF v_existing_event_status = 'PROCESSED' THEN
      RETURN jsonb_build_object(
        'success', true,
        'idempotent_replay', true,
        'provider_event_id', p_provider_event_id,
        'status', 'PROCESSED'
      );
    ELSIF v_existing_event_status = 'PROCESSING' THEN
      RETURN jsonb_build_object(
        'success', true,
        'in_flight', true,
        'provider_event_id', p_provider_event_id,
        'status', 'PROCESSING'
      );
    ELSE
      -- Previously FAILED: allow retry by updating attempt_count and resetting to PROCESSING
      UPDATE public.provider_events
      SET 
        status = 'PROCESSING',
        attempt_count = attempt_count + 1,
        error_message = NULL,
        received_at = now()
      WHERE id = v_event_id;
    END IF;
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
    -- PAYMENT CAPTURED / ORDER PAID (Strict Fail-Closed Reconciliation Flow)
    WHEN 'payment.captured', 'order.paid' THEN
      v_payment_entity := COALESCE(
        p_payload->'payload'->'payment'->'entity',
        p_payload->'payment'
      );
      v_order_entity := COALESCE(
        p_payload->'payload'->'order'->'entity',
        p_payload->'order'
      );

      -- Both payment and order entities are strictly mandatory for purchase-activation events
      IF v_payment_entity IS NULL OR v_payment_entity = 'null'::jsonb THEN
        RAISE EXCEPTION 'SECURITY_VIOLATION: Webhook payload missing mandatory payment entity.' USING ERRCODE = 'P0001';
      END IF;

      IF v_order_entity IS NULL OR v_order_entity = 'null'::jsonb THEN
        RAISE EXCEPTION 'SECURITY_VIOLATION: Webhook payload missing mandatory order entity.' USING ERRCODE = 'P0001';
      END IF;

      -- Mandatory Payment Fields
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

      -- Payment Status: Must be captured
      v_payment_status := LOWER(TRIM(COALESCE(v_payment_entity->>'status', '')));
      v_payment_captured := COALESCE((v_payment_entity->>'captured')::boolean, false);
      IF v_payment_status != 'captured' AND NOT v_payment_captured THEN
        RAISE EXCEPTION 'PAYMENT_NOT_CAPTURED: Payment is in status %, not captured.', v_payment_status USING ERRCODE = 'P0001';
      END IF;

      -- Order Status: Must be paid on order.paid
      IF p_event_type = 'order.paid' THEN
        v_order_status := LOWER(TRIM(COALESCE(v_order_entity->>'status', '')));
        IF v_order_status != 'paid' THEN
          RAISE EXCEPTION 'ORDER_NOT_PAID: Order is in status %, not paid.', v_order_status USING ERRCODE = 'P0001';
        END IF;
      END IF;

      -- Currency: Both payment and order must be present and INR
      v_currency := v_payment_entity->>'currency';
      IF v_currency IS NULL OR UPPER(TRIM(v_currency)) != 'INR' THEN
        RAISE EXCEPTION 'INVALID_CURRENCY: Payment currency must be INR (received %).', v_currency USING ERRCODE = 'P0001';
      END IF;

      v_currency := v_order_entity->>'currency';
      IF v_currency IS NULL OR UPPER(TRIM(v_currency)) != 'INR' THEN
        RAISE EXCEPTION 'INVALID_CURRENCY: Order currency must be INR (received %).', v_currency USING ERRCODE = 'P0001';
      END IF;

      -- Authoritative Notes from Order Entity
      v_order_notes := v_order_entity->'notes';
      IF v_order_notes IS NULL OR v_order_notes = 'null'::jsonb THEN
        RAISE EXCEPTION 'SECURITY_VIOLATION: Order entity is missing authoritative order notes.' USING ERRCODE = 'P0001';
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

      -- Cross-check payment notes if present to prevent conflicting/tampered notes
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

      -- Validate Amount: Both payment and order amounts must be present, positive, and match plan quote
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

      -- Invoke privileged activation RPC with strict verified parameters including mandatory p_amount_paise
      v_confirm_res := public.confirm_payment_and_activate_subscription(
        p_payment_provider := p_provider,
        p_payment_id := v_payment_id,
        p_order_id := v_order_id,
        p_plan_id := v_plan_id,
        p_billing_cycle := v_cycle,
        p_user_id := v_user_id,
        p_amount_paise := v_expected_amount
      );

    -- SUBSCRIPTION ACTIVATION / PAYMENT CHARGED
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

        -- Re-resolve entitlements across all stores owned by this subscriber
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

          -- Re-resolve entitlements across stores owned by this subscriber (never write FREE blindly)
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

REVOKE ALL ON FUNCTION public.reconcile_provider_event(text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_provider_event(text, text, text, jsonb) TO service_role;

-- 9. Update create_business_atomically to call ensure_usage_period
CREATE OR REPLACE FUNCTION public.create_business_atomically(
  p_name text,
  p_category text,
  p_neighborhood text,
  p_city text,
  p_phone text DEFAULT ''::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_business_id UUID;
  v_current_plan TEXT;
  v_business_limit INT;
  v_monthly_campaign_limit INT;
  v_owned_count INT;
  v_period public.usage_periods;
  v_today DATE := (now() at time zone 'Asia/Kolkata')::date;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated.' USING ERRCODE = 'P0001';
  END IF;

  -- Ensure operator profile exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    INSERT INTO public.profiles (id, email, full_name)
    SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
    FROM auth.users
    WHERE id = v_user_id
    ON CONFLICT (id) DO NOTHING;
  END IF;

  SELECT s.plan_id, p.business_limit, p.monthly_campaign_limit 
  INTO v_current_plan, v_business_limit, v_monthly_campaign_limit
  FROM public.subscriptions s
  JOIN public.plans p ON p.id = s.plan_id
  WHERE s.user_id = v_user_id AND s.status IN ('ACTIVE', 'TRIALING')
    AND s.current_period_end >= v_today
  ORDER BY p.monthly_campaign_limit DESC, s.created_at DESC
  LIMIT 1;

  IF v_current_plan IS NULL THEN
    v_current_plan := 'FREE';
    SELECT business_limit, monthly_campaign_limit 
    INTO v_business_limit, v_monthly_campaign_limit
    FROM public.plans WHERE id = 'FREE';
    v_business_limit := COALESCE(v_business_limit, 2);
    v_monthly_campaign_limit := COALESCE(v_monthly_campaign_limit, 3);
  END IF;

  SELECT COUNT(*) INTO v_owned_count
  FROM public.business_members
  WHERE user_id = v_user_id AND role = 'owner';

  IF v_owned_count >= v_business_limit THEN
    RAISE EXCEPTION 'BUSINESS_LIMIT_REACHED: Your current plan (%) allows up to % businesses. You currently own %.', 
      v_current_plan, v_business_limit, v_owned_count USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.businesses (name, category)
  VALUES (p_name, p_category)
  RETURNING id INTO v_business_id;

  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (v_business_id, v_user_id, 'owner');

  INSERT INTO public.business_profiles (
    business_id,
    name,
    category,
    neighborhood,
    city,
    phone_whatsapp
  ) VALUES (
    v_business_id,
    p_name,
    p_category,
    p_neighborhood,
    p_city,
    p_phone
  );

  -- Replace inline insert with idempotent ensure_usage_period
  v_period := public.ensure_usage_period(v_business_id);

  RETURN jsonb_build_object(
    'business_id', v_business_id,
    'name', p_name,
    'category', p_category,
    'neighborhood', p_neighborhood,
    'city', p_city,
    'phone_whatsapp', p_phone,
    'plan', v_period.plan,
    'role', 'owner',
    'created_at', CURRENT_TIMESTAMP
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_business_atomically(text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_business_atomically(text, text, text, text, text) TO authenticated, service_role;

-- 10. Update save_campaign_atomically (11-arg and 10-arg) to call ensure_usage_period
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
  p_generation_request_id uuid DEFAULT NULL::uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_campaign_id UUID;
  v_usage_period_id UUID;
  v_campaigns_used INT;
  v_campaign_limit INT;
  v_user_id UUID;
  v_today DATE := (now() at time zone 'Asia/Kolkata')::date;
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

  -- Brief 1: Ensure active usage period exists for today before FOR UPDATE lookup
  PERFORM public.ensure_usage_period(p_business_id);

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
        AND period_start <= v_today
        AND period_end >= v_today;

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
    AND period_start <= v_today
    AND period_end >= v_today
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
    -- If another concurrent transaction inserted the same generation_request_id, rollback quota increment and return existing campaign
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
  p_poster_content jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.save_campaign_atomically(
    p_business_id,
    p_campaign_type,
    p_objective,
    p_audience,
    p_offer,
    p_schedule,
    p_google_content,
    p_instagram_content,
    p_whatsapp_content,
    p_poster_content,
    NULL::uuid
  );
END;
$$;

REVOKE ALL ON FUNCTION public.save_campaign_atomically(uuid, text, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_campaign_atomically(uuid, text, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.save_campaign_atomically(uuid, text, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_campaign_atomically(uuid, text, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb) TO authenticated, service_role;

-- 11. Update claim_anonymous_campaign to call ensure_usage_period
CREATE OR REPLACE FUNCTION public.claim_anonymous_campaign(
  p_claim_token text,
  p_business_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_campaign_id UUID;
  v_usage_period_id UUID;
  v_campaigns_used INT;
  v_campaign_limit INT;
  v_today DATE := (now() at time zone 'Asia/Kolkata')::date;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Caller must be authenticated.' USING ERRCODE = 'P0001';
  END IF;

  -- 1. Check ownership or admin membership on the target business
  IF NOT public.is_business_admin(p_business_id) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: User must be an owner or admin of the business to claim campaigns.' USING ERRCODE = 'P0001';
  END IF;

  -- 2. Atomically claim the campaign (prevents double-claim race condition)
  UPDATE public.campaigns
  SET 
    business_id = p_business_id,
    claim_token = NULL,
    updated_at = NOW()
  WHERE claim_token = p_claim_token 
    AND business_id IS NULL
  RETURNING id INTO v_campaign_id;

  IF v_campaign_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Brief 1: Ensure active usage period exists before FOR UPDATE lookup
  PERFORM public.ensure_usage_period(p_business_id);

  -- 3. Check and lock usage quota for the target store
  SELECT id, campaigns_used, campaign_limit INTO v_usage_period_id, v_campaigns_used, v_campaign_limit
  FROM public.usage_periods
  WHERE business_id = p_business_id
    AND period_start <= v_today
    AND period_end >= v_today
  FOR UPDATE;

  IF v_usage_period_id IS NULL THEN
    RAISE EXCEPTION 'ENTITLEMENT_UNAVAILABLE: No active usage period found for this business.' USING ERRCODE = 'P0001';
  END IF;

  IF v_campaigns_used >= v_campaign_limit THEN
    RAISE EXCEPTION 'QUOTA_EXHAUSTED: Usage quota reached: % of % campaigns used this cycle.', v_campaigns_used, v_campaign_limit USING ERRCODE = 'P0001';
  END IF;

  -- 4. Deduct quota
  UPDATE public.usage_periods
  SET campaigns_used = campaigns_used + 1
  WHERE id = v_usage_period_id;

  -- 5. Record usage audit event
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
    'Claimed campaign from free tool.'
  );

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_anonymous_campaign(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_anonymous_campaign(text, uuid) TO authenticated, service_role;

-- 12. Backfill: ensure_usage_period for all businesses without an active period covering today
DO $$
DECLARE
  v_biz RECORD;
BEGIN
  FOR v_biz IN
    SELECT b.id
    FROM public.businesses b
    WHERE NOT EXISTS (
      SELECT 1 FROM public.usage_periods up
      WHERE up.business_id = b.id
        AND up.period_start <= (now() at time zone 'Asia/Kolkata')::date
        AND up.period_end >= (now() at time zone 'Asia/Kolkata')::date
    )
  LOOP
    PERFORM public.ensure_usage_period(v_biz.id);
  END LOOP;
END $$;

-- 13. Schedule daily pg_cron job at 18:40 UTC (00:10 IST) to rollover usage periods
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'ensure_usage_periods_daily') THEN
    PERFORM cron.unschedule('ensure_usage_periods_daily');
  END IF;

  PERFORM cron.schedule(
    'ensure_usage_periods_daily',
    '40 18 * * *',
    $cron$
      SELECT public.ensure_usage_period(b.id)
      FROM public.businesses b
      WHERE NOT EXISTS (
        SELECT 1 FROM public.usage_periods up
        WHERE up.business_id = b.id
          AND up.period_start <= (now() at time zone 'Asia/Kolkata')::date
          AND up.period_end >= (now() at time zone 'Asia/Kolkata')::date
      );
    $cron$
  );
END $$;
