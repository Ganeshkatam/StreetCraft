-- StreetCraft V1 Database Hardening & Persistence Contract Migration
-- Migration: 20260817000000_streetcraft_v1_database_hardening.sql

-- 1. Correct Plans Quota Invariants
UPDATE public.plans
SET monthly_pack_limit = 3
WHERE id = 'FREE';

-- 2. Correct Campaigns Status Lifecycle Check Constraint
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_status_check 
  CHECK (status IN ('DRAFT', 'GENERATING', 'READY', 'PUBLISHED', 'COMPLETED', 'ARCHIVED'));

-- 3. Correct Usage Periods Defaults & Add Unique Constraint
ALTER TABLE public.usage_periods ALTER COLUMN pack_limit SET DEFAULT 3;
ALTER TABLE public.usage_periods DROP CONSTRAINT IF EXISTS unique_business_period;
ALTER TABLE public.usage_periods ADD CONSTRAINT unique_business_period UNIQUE (business_id, period_start);

-- 4. Clean up Duplicate Trigger & Provide Helper Overloads
DROP TRIGGER IF EXISTS tr_on_business_created ON public.businesses;
DROP TRIGGER IF EXISTS on_business_created ON public.businesses;
DROP FUNCTION IF EXISTS public.handle_new_business() CASCADE;

CREATE OR REPLACE FUNCTION public.is_business_member(target_biz_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
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
SECURITY DEFINER
STABLE
AS $$
  SELECT public.is_business_member(target_biz_id, auth.uid());
$$;

-- 5. Hardened Atomic Business Creation RPC
DROP FUNCTION IF EXISTS public.create_business_atomically(TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.save_campaign_pack_atomically(UUID, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB, JSONB, JSONB, JSONB);

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
  v_business_id UUID;
  v_user_id UUID;
  v_plan_limit INT := 3;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated.';
  END IF;

  -- 1. Insert Business
  INSERT INTO public.businesses (name, category)
  VALUES (p_name, COALESCE(NULLIF(p_category, ''), 'Artisanal Cafe & Bakery'))
  RETURNING id INTO v_business_id;

  -- 2. Insert Membership (Owner)
  INSERT INTO public.business_members (business_id, user_id, role)
  VALUES (v_business_id, v_user_id, 'owner');

  -- 3. Insert Business Profile (Store Preferences)
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
    COALESCE(NULLIF(p_category, ''), 'Artisanal Cafe & Bakery'),
    COALESCE(p_neighborhood, ''),
    COALESCE(p_city, ''),
    COALESCE(p_phone, '')
  );

  -- 4. Insert Free Usage Period
  INSERT INTO public.usage_periods (
    business_id,
    period_start,
    period_end,
    plan,
    pack_limit,
    packs_used
  ) VALUES (
    v_business_id,
    date_trunc('month', CURRENT_DATE)::date,
    (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::date,
    'FREE',
    v_plan_limit,
    0
  ) ON CONFLICT (business_id, period_start) DO NOTHING;

  RETURN jsonb_build_object(
    'business_id', v_business_id,
    'name', p_name,
    'role', 'owner'
  );
END;
$$;

-- 6. Atomic Campaign Pack Persistence RPC (Campaign + 4 Formats + Usage Consumption)
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
  v_packs_used INT;
  v_pack_limit INT;
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
  SELECT id, packs_used, pack_limit INTO v_usage_period_id, v_packs_used, v_pack_limit
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
      pack_limit,
      packs_used
    ) VALUES (
      p_business_id,
      date_trunc('month', CURRENT_DATE)::date,
      (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::date,
      'FREE',
      3,
      1
    ) RETURNING id, packs_used, pack_limit INTO v_usage_period_id, v_packs_used, v_pack_limit;
  ELSE
    IF v_packs_used >= v_pack_limit THEN
      RAISE EXCEPTION 'Usage quota reached: % of % packs used this cycle.', v_packs_used, v_pack_limit;
    END IF;

    UPDATE public.usage_periods
    SET packs_used = packs_used + 1
    WHERE id = v_usage_period_id;
    
    v_packs_used := v_packs_used + 1;
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

  -- Insert 4 Formats
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
    'packs_used', v_packs_used,
    'pack_limit', v_pack_limit
  );
END;
$$;

-- 7. Fix RLS Policies & Lock Down Public Writes
-- Business Members Owner Policy
DROP POLICY IF EXISTS "business_members_owner_all" ON public.business_members;
CREATE POLICY "business_members_owner_all" ON public.business_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  );

-- Lock down Founder Claims
DROP POLICY IF EXISTS "founder_claims_public_all" ON public.founder_claims;
DROP POLICY IF EXISTS "founder_claims_all_public" ON public.founder_claims;
DROP POLICY IF EXISTS "founder_claims_authenticated_select" ON public.founder_claims;
DROP POLICY IF EXISTS "founder_claims_authenticated_insert" ON public.founder_claims;

CREATE POLICY "founder_claims_select" ON public.founder_claims
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "founder_claims_insert" ON public.founder_claims
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Lock down Campaigns & Outputs write to Authenticated Members
DROP POLICY IF EXISTS "campaigns_insert" ON public.campaigns;
CREATE POLICY "campaigns_insert" ON public.campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_business_member(business_id, auth.uid()));

DROP POLICY IF EXISTS "campaign_outputs_insert" ON public.campaign_outputs;
CREATE POLICY "campaign_outputs_insert" ON public.campaign_outputs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_outputs.campaign_id
        AND public.is_business_member(c.business_id, auth.uid())
    )
  );
