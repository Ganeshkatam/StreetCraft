-- ============================================================================
-- STREETCRAFT DATABASE HARDENING & TERMINOLOGY HARMONIZATION
-- 1. Rename remaining legacy 'pack' columns to 'campaign'
-- 2. Enforce partial unique index: at most one ACTIVE subscription per user
-- 3. Update all RPC functions to use authoritative schema
-- ============================================================================

-- 1. COLUMN RENAMES (With IF EXISTS checks for idempotency)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'plans' AND column_name = 'monthly_pack_limit'
  ) THEN
    ALTER TABLE public.plans RENAME COLUMN monthly_pack_limit TO monthly_campaign_limit;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'usage_periods' AND column_name = 'pack_limit'
  ) THEN
    ALTER TABLE public.usage_periods RENAME COLUMN pack_limit TO campaign_limit;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'usage_periods' AND column_name = 'packs_used'
  ) THEN
    ALTER TABLE public.usage_periods RENAME COLUMN packs_used TO campaigns_used;
  END IF;
END $$;

-- 2. UPDATE EVENT TYPE CHECK CONSTRAINT ON usage_events
ALTER TABLE public.usage_events DROP CONSTRAINT IF EXISTS usage_events_event_type_check;
UPDATE public.usage_events SET event_type = 'CAMPAIGN_GENERATION' WHERE event_type = 'CAMPAIGN_PACK_GENERATION';
ALTER TABLE public.usage_events ADD CONSTRAINT usage_events_event_type_check 
  CHECK (event_type IN ('CAMPAIGN_GENERATION', 'MANUAL_ADJUSTMENT', 'SUBSCRIPTION_RESET'));

-- 3. ADD BILLING CYCLE & ENFORCE AT MOST ONE ACTIVE SUBSCRIPTION PER USER
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS billing_cycle TEXT NOT NULL DEFAULT 'monthly' 
CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual'));

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_active_per_user
ON public.subscriptions (user_id)
WHERE status = 'ACTIVE';

-- 4. RE-DEFINE ATOMIC CAMPAIGN PERSISTENCE RPC
CREATE OR REPLACE FUNCTION public.save_campaign_pack_atomically(
  p_business_id UUID,
  p_campaign_type TEXT,
  p_objective TEXT,
  p_audience TEXT,
  p_offer JSONB,
  p_schedule JSONB,
  p_google_content JSONB,
  p_instagram_content JSONB,
  p_whatsapp_content JSONB,
  p_poster_content JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated.';
  END IF;

  -- Verify membership
  IF NOT public.is_business_member(p_business_id, v_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: User is not a member of this business.';
  END IF;

  -- Lock and fetch current usage period
  SELECT id, campaigns_used, campaign_limit INTO v_usage_period_id, v_campaigns_used, v_campaign_limit
  FROM public.usage_periods
  WHERE business_id = p_business_id
    AND period_start <= CURRENT_DATE
    AND period_end >= CURRENT_DATE
  FOR UPDATE;

  IF v_usage_period_id IS NULL THEN
    INSERT INTO public.usage_periods (
      business_id,
      period_start,
      period_end,
      plan,
      campaign_limit,
      campaigns_used
    ) VALUES (
      p_business_id,
      date_trunc('month', CURRENT_DATE)::date,
      (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::date,
      'FREE',
      3,
      1
    ) RETURNING id, campaigns_used, campaign_limit INTO v_usage_period_id, v_campaigns_used, v_campaign_limit;
  ELSE
    IF v_campaigns_used >= v_campaign_limit THEN
      RAISE EXCEPTION 'Usage quota reached: % of % campaigns used this cycle.', v_campaigns_used, v_campaign_limit;
    END IF;

    UPDATE public.usage_periods
    SET campaigns_used = campaigns_used + 1
    WHERE id = v_usage_period_id;
    
    v_campaigns_used := v_campaigns_used + 1;
  END IF;

  -- Insert Campaign
  INSERT INTO public.campaigns (
    business_id,
    type,
    objective,
    audience,
    offer,
    schedule,
    status
  ) VALUES (
    p_business_id,
    p_campaign_type,
    p_objective,
    COALESCE(p_audience, ''),
    COALESCE(p_offer, '{}'::jsonb),
    COALESCE(p_schedule, '{}'::jsonb),
    'READY'
  ) RETURNING id INTO v_campaign_id;

  -- Insert 4 Coordinated Outputs
  IF p_google_content IS NOT NULL AND p_google_content != '{}'::jsonb THEN
    INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
    VALUES (v_campaign_id, 'GOOGLE_BUSINESS', p_google_content, 'VALID')
    ON CONFLICT (campaign_id, channel) DO UPDATE SET content = EXCLUDED.content;
  END IF;

  IF p_instagram_content IS NOT NULL AND p_instagram_content != '{}'::jsonb THEN
    INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
    VALUES (v_campaign_id, 'INSTAGRAM', p_instagram_content, 'VALID')
    ON CONFLICT (campaign_id, channel) DO UPDATE SET content = EXCLUDED.content;
  END IF;

  IF p_whatsapp_content IS NOT NULL AND p_whatsapp_content != '{}'::jsonb THEN
    INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
    VALUES (v_campaign_id, 'WHATSAPP', p_whatsapp_content, 'VALID')
    ON CONFLICT (campaign_id, channel) DO UPDATE SET content = EXCLUDED.content;
  END IF;

  IF p_poster_content IS NOT NULL AND p_poster_content != '{}'::jsonb THEN
    INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
    VALUES (v_campaign_id, 'IN_STORE_POSTER', p_poster_content, 'VALID')
    ON CONFLICT (campaign_id, channel) DO UPDATE SET content = EXCLUDED.content;
  END IF;

  -- Append to Usage Ledger Audit Trail
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
    'packs_used', v_campaigns_used,
    'pack_limit', v_campaign_limit
  );
END;
$$;

-- 5. RE-DEFINE ATOMIC BUSINESS CREATION RPC
CREATE OR REPLACE FUNCTION public.create_business_atomically(
  p_name TEXT,
  p_category TEXT,
  p_neighborhood TEXT,
  p_city TEXT,
  p_phone TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_business_id UUID;
  v_current_plan TEXT;
  v_business_limit INT;
  v_monthly_campaign_limit INT;
  v_owned_count INT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated.';
  END IF;

  -- Resolve active subscription plan & limits
  SELECT s.plan_id, p.business_limit, p.monthly_campaign_limit 
  INTO v_current_plan, v_business_limit, v_monthly_campaign_limit
  FROM public.subscriptions s
  JOIN public.plans p ON p.id = s.plan_id
  WHERE s.user_id = v_user_id AND s.status IN ('ACTIVE', 'TRIALING')
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF v_current_plan IS NULL THEN
    v_current_plan := 'FREE';
    SELECT business_limit, monthly_campaign_limit 
    INTO v_business_limit, v_monthly_campaign_limit
    FROM public.plans WHERE id = 'FREE';
    v_business_limit := COALESCE(v_business_limit, 2);
    v_monthly_campaign_limit := COALESCE(v_monthly_campaign_limit, 3);
  END IF;

  -- Check owned business count
  SELECT COUNT(*) INTO v_owned_count
  FROM public.business_members
  WHERE user_id = v_user_id AND role = 'owner';

  IF v_owned_count >= v_business_limit THEN
    RAISE EXCEPTION 'BUSINESS_LIMIT_REACHED: Your current plan (%) allows up to % businesses. You currently own %.', 
      v_current_plan, v_business_limit, v_owned_count;
  END IF;

  -- Insert business
  INSERT INTO public.businesses (name, category)
  VALUES (p_name, p_category)
  RETURNING id INTO v_business_id;

  -- Insert owner membership
  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (v_business_id, v_user_id, 'owner');

  -- Insert business profile
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

  -- Initialize usage period
  INSERT INTO public.usage_periods (
    business_id,
    period_start,
    period_end,
    plan,
    campaign_limit,
    campaigns_used
  ) VALUES (
    v_business_id,
    date_trunc('month', CURRENT_DATE)::date,
    (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::date,
    v_current_plan,
    v_monthly_campaign_limit,
    0
  );

  RETURN jsonb_build_object(
    'business_id', v_business_id,
    'role', 'owner',
    'plan', v_current_plan,
    'owned_businesses', v_owned_count + 1,
    'business_limit', v_business_limit
  );
END;
$$;

-- 6. RE-DEFINE PAYMENT CONFIRMATION RPC (confirm_payment_and_activate_subscription)
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
  v_active_sub_id UUID;
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
  SELECT monthly_campaign_limit, business_limit 
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

  -- Archive prior active subscriptions to preserve partial unique index
  UPDATE public.subscriptions
  SET status = 'CANCELLED', updated_at = now()
  WHERE user_id = v_user_id AND status = 'ACTIVE';

  -- Insert new active subscription
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
  ) RETURNING id INTO v_active_sub_id;

  -- Update active usage period quota for all stores owned by this user
  UPDATE public.usage_periods
  SET 
    plan = v_normalized_plan,
    campaign_limit = v_plan_limit
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
    1,
    'Subscription upgraded to ' || v_normalized_plan || ' (' || v_normalized_cycle || ' cycle).'
  FROM public.business_members bm
  WHERE bm.user_id = v_user_id AND bm.role = 'owner';

  RETURN jsonb_build_object(
    'success', true,
    'subscription_id', v_active_sub_id,
    'plan', v_normalized_plan,
    'billing_cycle', v_normalized_cycle,
    'status', 'ACTIVE',
    'business_limit', v_biz_limit,
    'monthly_campaign_limit', v_plan_limit,
    'current_period_end', v_period_end::text
  );
END;
$$;
