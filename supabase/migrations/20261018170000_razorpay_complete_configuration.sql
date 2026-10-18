-- Migration: 20261018170000_razorpay_complete_configuration.sql
-- Description:
-- 1. Updates confirm_payment_and_activate_subscription to support verified server-side calls with explicit p_user_id
-- 2. Updates reconcile_provider_event to handle payment.captured and order.paid events
-- 3. Grants execute on confirm_payment_and_activate_subscription to authenticated and service_role, blocks anon

CREATE OR REPLACE FUNCTION public.confirm_payment_and_activate_subscription(
  p_payment_provider text,
  p_payment_id text,
  p_order_id text,
  p_plan_id text,
  p_billing_cycle text,
  p_user_id uuid DEFAULT NULL
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

  -- 3. Validate plan existence
  IF NOT EXISTS (SELECT 1 FROM public.plans WHERE id = v_normalized_plan AND active = true) THEN
    RAISE EXCEPTION 'INVALID_PLAN: Plan % does not exist.', v_normalized_plan USING ERRCODE = 'P0001';
  END IF;

  -- 4. Validate billing cycle
  IF v_normalized_cycle NOT IN ('monthly', 'quarterly', 'annual') THEN
    RAISE EXCEPTION 'INVALID_CYCLE: Billing cycle must be monthly, quarterly, or annual.' USING ERRCODE = 'P0001';
  END IF;

  -- 5. Fetch plan parameters
  SELECT monthly_campaign_limit, business_limit 
  INTO v_plan_limit, v_biz_limit
  FROM public.plans 
  WHERE id = v_normalized_plan;

  -- 6. Compute period duration
  v_period_interval := CASE 
    WHEN v_normalized_cycle = 'monthly' THEN interval '1 month'
    WHEN v_normalized_cycle = 'quarterly' THEN interval '3 months'
    ELSE interval '1 year'
  END;

  v_period_end := (CURRENT_DATE + v_period_interval)::date;

  -- 7. Founder plan allocation & claims check
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

  -- 8. Cancel prior active subscriptions for this user
  UPDATE public.subscriptions
  SET status = 'CANCELLED', updated_at = now()
  WHERE user_id = v_user_id AND status = 'ACTIVE';

  -- 9. Insert new active subscription
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

  -- 10. Update active usage periods for businesses owned by this user
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

  -- 11. Record audit event
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

-- Keep 5-parameter legacy overload as a forwarding wrapper to preserve backward compatibility
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
    NULL::uuid
  );
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text) FROM anon, PUBLIC;


-- 2. Enhanced reconcile_provider_event to handle payment.captured and order.paid
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
  v_notes jsonb;
  v_user_id uuid;
  v_plan_id text;
  v_cycle text;
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

  -- Extract subscription reference from payload
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
    -- PAYMENT CAPTURED / ORDER PAID (One-Time Checkout / Direct Payment Flow)
    WHEN 'payment.captured', 'order.paid' THEN
      v_payment_id := COALESCE(
        p_payload->'payload'->'payment'->'entity'->>'id',
        p_payload->'payment'->>'id',
        p_payload->>'payment_id'
      );
      v_order_id := COALESCE(
        p_payload->'payload'->'payment'->'entity'->>'order_id',
        p_payload->'payload'->'order'->'entity'->>'id',
        p_payload->>'order_id'
      );
      v_notes := COALESCE(
        p_payload->'payload'->'payment'->'entity'->'notes',
        p_payload->'payload'->'order'->'entity'->'notes',
        p_payload->'notes'
      );

      IF v_notes IS NOT NULL AND v_notes->>'userId' IS NOT NULL AND v_notes->>'planId' IS NOT NULL THEN
        v_user_id := (v_notes->>'userId')::uuid;
        v_plan_id := UPPER(TRIM(v_notes->>'planId'));
        v_cycle := COALESCE(LOWER(TRIM(v_notes->>'billingCycle')), 'monthly');

        v_confirm_res := public.confirm_payment_and_activate_subscription(
          p_provider,
          COALESCE(v_payment_id, v_order_id, p_provider_event_id),
          v_order_id,
          v_plan_id,
          v_cycle,
          v_user_id
        );
      ELSIF v_existing_sub.id IS NOT NULL THEN
        UPDATE public.subscriptions
        SET status = 'ACTIVE', cancel_at_period_end = false, updated_at = now()
        WHERE id = v_existing_sub.id;
      END IF;

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
