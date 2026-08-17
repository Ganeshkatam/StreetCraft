-- ============================================================================
-- STREETCRAFT SECURITY DEFINER AUDIT & FINAL DATABASE HARDENING
-- 1. Remove businesses.category default (zero fabricated business assumptions)
-- 2. Remove legacy CAMPAIGN_PACK_GENERATION constraint and default
-- 3. Correct plans.channels array to include IN_STORE_POSTER
-- 4. Drop orphaned/legacy functions (reserve_and_create_campaign, claim_founder_slot, check_account_limit)
-- 5. Audit all active SECURITY DEFINER functions with explicit SET search_path = public
-- 6. Lock down least-privilege EXECUTE grants
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. REMOVE BUSINESS CATEGORY DEFAULT
-- ----------------------------------------------------------------------------
ALTER TABLE public.businesses ALTER COLUMN category DROP DEFAULT;

-- ----------------------------------------------------------------------------
-- 2. REMOVE LEGACY EVENT TYPE FROM usage_events
-- ----------------------------------------------------------------------------
ALTER TABLE public.usage_events ALTER COLUMN event_type SET DEFAULT 'CAMPAIGN_GENERATION';
ALTER TABLE public.usage_events DROP CONSTRAINT IF EXISTS usage_events_event_type_check;
UPDATE public.usage_events SET event_type = 'CAMPAIGN_GENERATION' WHERE event_type = 'CAMPAIGN_PACK_GENERATION';
ALTER TABLE public.usage_events ADD CONSTRAINT usage_events_event_type_check 
  CHECK (event_type IN ('CAMPAIGN_GENERATION', 'MANUAL_ADJUSTMENT', 'SUBSCRIPTION_RESET'));

-- ----------------------------------------------------------------------------
-- 3. CORRECT PLANS.CHANNELS ARRAY TO INCLUDE ALL OUTPUTS
-- ----------------------------------------------------------------------------
ALTER TABLE public.plans 
  ALTER COLUMN channels SET DEFAULT '{GOOGLE_BUSINESS,INSTAGRAM,WHATSAPP,IN_STORE_POSTER}'::text[];

UPDATE public.plans 
SET channels = '{GOOGLE_BUSINESS,INSTAGRAM,WHATSAPP,IN_STORE_POSTER}'::text[]
WHERE id IN ('PRO', 'GROWTH', 'FOUNDER');

UPDATE public.plans 
SET channels = '{GOOGLE_BUSINESS,INSTAGRAM,WHATSAPP,IN_STORE_POSTER}'::text[]
WHERE id = 'FREE';

-- ----------------------------------------------------------------------------
-- 4. DROP ORPHANED & LEGACY PROCEDURES
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.reserve_and_create_campaign(UUID, TEXT, TEXT, TEXT, JSONB, JSONB);
DROP FUNCTION IF EXISTS public.claim_founder_slot(UUID, TEXT);
DROP FUNCTION IF EXISTS public.check_account_limit(UUID);
DROP FUNCTION IF EXISTS public.claim_anonymous_campaign(UUID, UUID);

-- ----------------------------------------------------------------------------
-- 5. AUDIT ALL ACTIVE SECURITY DEFINER FUNCTIONS WITH EXPLICIT SEARCH_PATH
-- ----------------------------------------------------------------------------

-- A. is_business_member (2 overloads)
CREATE OR REPLACE FUNCTION public.is_business_member(target_biz_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = target_biz_id
      AND user_id = check_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_business_member(target_biz_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_business_member(target_biz_id, auth.uid());
$$;

-- B. create_business_atomically
CREATE OR REPLACE FUNCTION public.create_business_atomically(
  p_name TEXT,
  p_category TEXT,
  p_neighborhood TEXT,
  p_city TEXT,
  p_phone TEXT
) RETURNS JSONB
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

  -- Insert business (requiring explicit category)
  INSERT INTO public.businesses (name, category)
  VALUES (p_name, p_category)
  RETURNING id INTO v_business_id;

  -- Insert owner membership
  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (v_business_id, v_user_id, 'owner');

  -- Insert business profile (without cafe assumptions)
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

-- C. save_campaign_pack_atomically
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
SET search_path = public
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

-- D. claim_founder_tier
CREATE OR REPLACE FUNCTION public.claim_founder_tier(p_billing_cycle TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_claimed_count INT;
  v_total_slots INT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated.';
  END IF;

  -- Validate cycle
  IF LOWER(p_billing_cycle) NOT IN ('quarterly', 'annual') THEN
    RAISE EXCEPTION 'Invalid billing cycle: Founder tier requires quarterly or annual billing.';
  END IF;

  -- Validate 1 claim per account
  IF EXISTS (SELECT 1 FROM public.founder_claims WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'FOUNDER_ALREADY_CLAIMED: One Founder claim per account.';
  END IF;

  -- Lock and check allocation
  SELECT total_slots, claimed_slots INTO v_total_slots, v_claimed_count
  FROM public.founder_allocation
  WHERE id = 1
  FOR UPDATE;

  IF v_claimed_count >= v_total_slots THEN
    RAISE EXCEPTION 'FOUNDER_SOLD_OUT: All 100 Founder slots have been claimed.';
  END IF;

  -- Increment allocation atomically
  UPDATE public.founder_allocation
  SET claimed_slots = claimed_slots + 1
  WHERE id = 1;

  -- Insert claim record
  INSERT INTO public.founder_claims (user_id, billing_cycle)
  VALUES (v_user_id, LOWER(p_billing_cycle));

  -- Archive prior active subscriptions to preserve partial unique index
  UPDATE public.subscriptions
  SET status = 'CANCELLED', updated_at = now()
  WHERE user_id = v_user_id AND status = 'ACTIVE';

  -- Insert new active subscription
  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    status,
    billing_cycle,
    provider,
    current_period_start,
    current_period_end
  ) VALUES (
    v_user_id,
    'FOUNDER',
    'ACTIVE',
    LOWER(p_billing_cycle),
    'FOUNDER_OFFER',
    CURRENT_DATE,
    (CURRENT_DATE + CASE WHEN LOWER(p_billing_cycle) = 'quarterly' THEN interval '3 months' ELSE interval '1 year' END)::date
  );

  RETURN jsonb_build_object(
    'success', true,
    'claimed_slots', v_claimed_count + 1,
    'total_slots', v_total_slots,
    'plan', 'FOUNDER',
    'billing_cycle', LOWER(p_billing_cycle)
  );
END;
$$;

-- E. cancel_user_subscription
CREATE OR REPLACE FUNCTION public.cancel_user_subscription()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.subscriptions
  SET status = 'CANCELLED', updated_at = NOW()
  WHERE user_id = v_user_id AND status = 'ACTIVE';

  RETURN jsonb_build_object('success', true, 'status', 'CANCELLED');
END;
$$;

-- F. claim_anonymous_campaign
CREATE OR REPLACE FUNCTION public.claim_anonymous_campaign(
  p_claim_token TEXT,
  p_business_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_campaign_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated.';
  END IF;

  IF NOT public.is_business_member(p_business_id, v_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: User is not a member of this business.';
  END IF;

  SELECT id INTO v_campaign_id
  FROM public.campaigns
  WHERE claim_token = p_claim_token AND business_id IS NULL;

  IF v_campaign_id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.campaigns
  SET 
    business_id = p_business_id,
    claim_token = NULL,
    updated_at = now()
  WHERE id = v_campaign_id;

  RETURN TRUE;
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. LEAST-PRIVILEGE FUNCTION EXECUTE GRANTS
-- ----------------------------------------------------------------------------
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM public, anon;

GRANT EXECUTE ON FUNCTION public.is_business_member(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_business_member(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_business_atomically(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_campaign_pack_atomically(UUID, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB, JSONB, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_founder_tier(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_user_subscription() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_anonymous_campaign(TEXT, UUID) TO authenticated;
