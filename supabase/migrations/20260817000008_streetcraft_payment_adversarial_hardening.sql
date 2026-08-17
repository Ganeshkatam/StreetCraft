-- ============================================================================
-- STREETCRAFT PAYMENT ADVERSARIAL HARDENING MIGRATION
-- Defense-in-depth payment verification, cross-account claim prevention,
-- cancelled-payment replay prevention, and Founder allocation integrity.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.confirm_payment_and_activate_subscription(
  p_payment_provider TEXT,
  p_payment_id TEXT,
  p_order_id TEXT,
  p_plan_id TEXT,
  p_billing_cycle TEXT
) RETURNS JSONB
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
  v_existing_sub RECORD;
  v_other_user_sub UUID;
  v_new_sub_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated.';
  END IF;

  IF p_payment_id IS NULL OR TRIM(p_payment_id) = '' THEN
    RAISE EXCEPTION 'INVALID_PAYMENT: Payment reference ID is required.';
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
    RAISE EXCEPTION 'PAYMENT_ALREADY_CLAIMED: This payment reference is already attached to another account.';
  END IF;

  -- 2. Check if this exact payment ID was already processed for THIS account
  SELECT id, status, plan_id, billing_cycle, current_period_end 
  INTO v_existing_sub
  FROM public.subscriptions
  WHERE provider = LOWER(TRIM(p_payment_provider))
    AND provider_subscription_id = TRIM(p_payment_id)
    AND user_id = v_user_id;

  IF v_existing_sub.id IS NOT NULL THEN
    IF v_existing_sub.status = 'CANCELLED' THEN
      RAISE EXCEPTION 'PAYMENT_ALREADY_EXPIRED: Payment reference belongs to a cancelled subscription and cannot be reused.';
    END IF;

    -- Return the existing active subscription without duplicating quotas or allocation
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
    RAISE EXCEPTION 'INVALID_PLAN: Plan % does not exist.', v_normalized_plan;
  END IF;

  -- 4. Validate cycle
  IF v_normalized_cycle NOT IN ('monthly', 'quarterly', 'annual') THEN
    RAISE EXCEPTION 'INVALID_CYCLE: Billing cycle must be monthly, quarterly, or annual.';
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
      RAISE EXCEPTION 'INVALID_FOUNDER_CYCLE: Founder tier requires quarterly or annual billing.';
    END IF;

    IF EXISTS (SELECT 1 FROM public.founder_claims WHERE user_id = v_user_id) THEN
      RAISE EXCEPTION 'FOUNDER_ALREADY_CLAIMED: One Founder claim per account.';
    END IF;

    -- Lock and increment allocation
    UPDATE public.founder_allocation
    SET claimed_slots = claimed_slots + 1
    WHERE id = 1 AND claimed_slots < total_slots;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'FOUNDER_SOLD_OUT: All Founder slots are fully allocated.';
    END IF;

    INSERT INTO public.founder_claims (user_id, billing_cycle)
    VALUES (v_user_id, v_normalized_cycle);
  END IF;

  -- 8. Archive prior active subscriptions to preserve unique active index
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
    campaign_limit = v_plan_limit
  WHERE business_id IN (
    SELECT business_id FROM public.business_members 
    WHERE user_id = v_user_id AND role = 'owner'
  )
  AND period_end >= CURRENT_DATE;

  -- 11. Record billing audit event
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
