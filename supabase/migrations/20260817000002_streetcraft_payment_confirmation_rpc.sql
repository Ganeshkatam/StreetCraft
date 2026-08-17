-- StreetCraft Verified Payment Confirmation & Subscription Activation Migration
-- Migration: 20260817000002_streetcraft_payment_confirmation_rpc.sql

-- 1. Create Payment Confirmation RPC (Called upon verified gateway webhook/signature confirmation)
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

  -- Validate plan existence
  IF NOT EXISTS (SELECT 1 FROM public.plans WHERE id = v_normalized_plan) THEN
    RAISE EXCEPTION 'INVALID_PLAN: Plan % does not exist.', v_normalized_plan;
  END IF;

  -- Validate cycle
  IF v_normalized_cycle NOT IN ('monthly', 'quarterly', 'annual') THEN
    RAISE EXCEPTION 'INVALID_CYCLE: Billing cycle must be monthly, quarterly, or annual.';
  END IF;

  -- Fetch plan parameters
  SELECT monthly_pack_limit, business_limit 
  INTO v_plan_limit, v_biz_limit
  FROM public.plans 
  WHERE id = v_normalized_plan;

  -- Compute period duration
  v_period_interval := CASE 
    WHEN v_normalized_cycle = 'monthly' THEN interval '1 month'
    WHEN v_normalized_cycle = 'quarterly' THEN interval '3 months'
    ELSE interval '1 year'
  END;

  v_period_end := (CURRENT_DATE + v_period_interval)::date;

  -- If Founder plan, handle allocation checks & claims
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

  -- Upsert Subscription Record
  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    provider,
    provider_subscription_id,
    status,
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
    CURRENT_DATE,
    v_period_end,
    NOW(),
    NOW()
  );

  -- Update active usage period quota for all stores owned by this user
  UPDATE public.usage_periods
  SET 
    plan = v_normalized_plan,
    pack_limit = v_plan_limit
  WHERE business_id IN (
    SELECT business_id FROM public.business_members 
    WHERE user_id = v_user_id AND role = 'owner'
  )
  AND period_end >= CURRENT_DATE;

  -- Record billing audit event
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
    0,
    format('Activated %s plan (%s) via %s. Reference: %s', v_normalized_plan, v_normalized_cycle, p_payment_provider, p_payment_id)
  FROM public.business_members bm
  WHERE bm.user_id = v_user_id AND bm.role = 'owner'
  LIMIT 1;

  RETURN jsonb_build_object(
    'success', true,
    'plan', v_normalized_plan,
    'billing_cycle', v_normalized_cycle,
    'status', 'ACTIVE',
    'business_limit', v_biz_limit,
    'monthly_campaign_limit', v_plan_limit,
    'current_period_end', v_period_end
  );
END;
$$;

-- 2. Add Recommended Performance Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_business_created ON public.campaigns(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_outputs_campaign ON public.campaign_outputs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_business_members_user_biz ON public.business_members(user_id, business_id);
CREATE INDEX IF NOT EXISTS idx_usage_periods_biz_start ON public.usage_periods(business_id, period_start);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);
