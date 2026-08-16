-- StreetCraft Realtime Core SaaS Schema, Atomic RPCs, and Reference Tables
-- Migration: 20260816000001_streetcraft_realtime_saas.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Reference Table: Plans
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_pack_limit INTEGER NOT NULL,
  price_inr INTEGER NOT NULL,
  channels TEXT[] NOT NULL DEFAULT '{"GOOGLE_BUSINESS","INSTAGRAM","WHATSAPP"}',
  features TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Reference Table: Festival Calendar (Regional & National Local Moments)
CREATE TABLE IF NOT EXISTS public.festival_calendar (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'National',
  starts_at DATE NOT NULL,
  ends_at DATE NOT NULL,
  marketing_relevance TEXT NOT NULL DEFAULT 'General Celebrations',
  suggested_offer TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Businesses (Extended with timezone)
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Artisanal Cafe & Bakery',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure timezone column exists if businesses table was created in previous migration
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'businesses' AND column_name = 'timezone') THEN
    ALTER TABLE public.businesses ADD COLUMN timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata';
  END IF;
END $$;

-- 4. Business Members
CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

-- 5. Business Profiles (Persistent Business Memory)
CREATE TABLE IF NOT EXISTS public.business_profiles (
  business_id UUID PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Artisanal Cafe & Bakery',
  neighborhood TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  landmarks TEXT DEFAULT '',
  target_customer TEXT DEFAULT '',
  style_voice TEXT DEFAULT 'Warm, contemporary, artisanal yet unpretentious',
  signature_items TEXT DEFAULT '',
  primary_goal TEXT DEFAULT 'Increase foot traffic during slow weekday afternoon hours (3 PM - 6 PM)',
  peak_hours TEXT DEFAULT '8:00 AM - 11:30 AM & 6:30 PM - 10:00 PM',
  slow_hours TEXT DEFAULT '2:30 PM - 5:30 PM (Weekdays)',
  default_offer TEXT DEFAULT '',
  avg_ticket_inr INTEGER DEFAULT 350,
  target_monthly_customers INTEGER DEFAULT 30,
  phone_whatsapp TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  provider TEXT NOT NULL DEFAULT 'RAZORPAY',
  provider_subscription_id TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIALING')),
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id)
);

-- 7. Usage Periods (Monthly Cycle)
CREATE TABLE IF NOT EXISTS public.usage_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'FREE',
  pack_limit INTEGER NOT NULL DEFAULT 5,
  packs_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_packs_used_non_negative CHECK (packs_used >= 0)
);

-- 8. Append-Only Usage Events
CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID,
  event_type TEXT NOT NULL DEFAULT 'CAMPAIGN_PACK_GENERATION' CHECK (event_type IN ('CAMPAIGN_PACK_GENERATION', 'MANUAL_ADJUSTMENT', 'SUBSCRIPTION_RESET')),
  units INTEGER NOT NULL DEFAULT 1,
  campaign_id UUID,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Campaigns (Explicit State Machine)
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  claim_token UUID DEFAULT NULL,
  type TEXT NOT NULL CHECK (type IN ('WEEKDAY_BOOST', 'WEEKEND_MAGNET', 'MENU_LAUNCH', 'FESTIVAL_SPECIAL', 'REVIEW_SPOTLIGHT', 'WIN_BACK_REGULARS')),
  objective TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT '',
  offer JSONB NOT NULL DEFAULT '{}'::jsonb,
  schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('draft', 'generating', 'ready', 'failed', 'published', 'completed', 'archived')),
  error_message TEXT DEFAULT NULL,
  performance_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure claim_token and error_message columns exist if campaigns existed
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'claim_token') THEN
    ALTER TABLE public.campaigns ADD COLUMN claim_token UUID DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'error_message') THEN
    ALTER TABLE public.campaigns ADD COLUMN error_message TEXT DEFAULT NULL;
  END IF;
END $$;

-- 10. Normalized Channel Outputs (Realtime Channel Progress)
CREATE TABLE IF NOT EXISTS public.campaign_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'ready', 'failed')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  validation_status TEXT NOT NULL DEFAULT 'VALID' CHECK (validation_status IN ('VALID', 'WARNING', 'REPAIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, channel)
);

-- Ensure status column exists in campaign_outputs
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'campaign_outputs' AND column_name = 'status') THEN
    ALTER TABLE public.campaign_outputs ADD COLUMN status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('pending', 'generating', 'ready', 'failed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'campaign_outputs' AND column_name = 'updated_at') THEN
    ALTER TABLE public.campaign_outputs ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_claim_token ON public.campaigns(claim_token);
CREATE INDEX IF NOT EXISTS idx_campaign_outputs_channel ON public.campaign_outputs(campaign_id, channel);
CREATE INDEX IF NOT EXISTS idx_festival_calendar_dates ON public.festival_calendar(starts_at, ends_at);

-- Row Level Security (RLS)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festival_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_outputs ENABLE ROW LEVEL SECURITY;

-- Plans & Festivals: Publicly readable by all users
DROP POLICY IF EXISTS "Public can view active plans" ON public.plans;
CREATE POLICY "Public can view active plans" ON public.plans FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public can view festival calendar" ON public.festival_calendar;
CREATE POLICY "Public can view festival calendar" ON public.festival_calendar FOR SELECT USING (true);

-- Subscriptions RLS
DROP POLICY IF EXISTS "Members can view subscription" ON public.subscriptions;
CREATE POLICY "Members can view subscription" ON public.subscriptions FOR SELECT
  USING (public.is_business_member(business_id));

-- Anonymous campaign access for Free Tool (Option B)
DROP POLICY IF EXISTS "Anonymous users can create claimable campaigns" ON public.campaigns;
CREATE POLICY "Anonymous users can create claimable campaigns" ON public.campaigns FOR INSERT
  WITH CHECK (business_id IS NULL AND claim_token IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view claimable campaign by token" ON public.campaigns;
CREATE POLICY "Anyone can view claimable campaign by token" ON public.campaigns FOR SELECT
  USING (claim_token IS NOT NULL OR (business_id IS NOT NULL AND public.is_business_member(business_id)));

DROP POLICY IF EXISTS "Anyone can view claimable campaign outputs" ON public.campaign_outputs;
CREATE POLICY "Anyone can view claimable campaign outputs" ON public.campaign_outputs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE public.campaigns.id = public.campaign_outputs.campaign_id
        AND (public.campaigns.claim_token IS NOT NULL OR public.is_business_member(public.campaigns.business_id))
    )
  );

DROP POLICY IF EXISTS "Anonymous users can insert claimable campaign outputs" ON public.campaign_outputs;
CREATE POLICY "Anonymous users can insert claimable campaign outputs" ON public.campaign_outputs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE public.campaigns.id = public.campaign_outputs.campaign_id
        AND (public.campaigns.claim_token IS NOT NULL OR public.is_business_member(public.campaigns.business_id))
    )
  );

-- ATOMIC CONCURRENCY-SAFE POSTGRESQL RPC FUNCTIONS

-- 1. Reserve Quota and Initialize Campaign atomically
CREATE OR REPLACE FUNCTION public.reserve_and_create_campaign(
  p_business_id UUID,
  p_type TEXT,
  p_objective TEXT,
  p_audience TEXT,
  p_offer JSONB,
  p_schedule JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_usage_period RECORD;
  v_campaign_id UUID;
BEGIN
  v_user_id := auth.uid();

  -- Verify membership
  IF NOT public.is_business_member(p_business_id) THEN
    RAISE EXCEPTION 'Unauthorized: Caller is not an authorized member of this business.';
  END IF;

  -- Lock usage period row for update to eliminate race conditions
  SELECT * INTO v_usage_period
  FROM public.usage_periods
  WHERE business_id = p_business_id
    AND period_start <= CURRENT_DATE
    AND period_end >= CURRENT_DATE
  FOR UPDATE;

  -- If no usage period row exists, create current month default
  IF NOT FOUND THEN
    INSERT INTO public.usage_periods (
      business_id,
      period_start,
      period_end,
      plan,
      pack_limit,
      packs_used
    )
    VALUES (
      p_business_id,
      date_trunc('month', CURRENT_DATE)::date,
      (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::date,
      'FREE',
      5,
      0
    )
    RETURNING * INTO v_usage_period;
  END IF;

  -- Verify quota available
  IF v_usage_period.packs_used >= v_usage_period.pack_limit THEN
    RAISE EXCEPTION 'Quota Exceeded: You have used % of % available packs for this billing cycle.',
      v_usage_period.packs_used, v_usage_period.pack_limit;
  END IF;

  -- Increment usage atomically
  UPDATE public.usage_periods
  SET packs_used = packs_used + 1
  WHERE id = v_usage_period.id;

  -- Create Campaign in 'generating' state
  INSERT INTO public.campaigns (
    business_id,
    type,
    objective,
    audience,
    offer,
    schedule,
    status
  )
  VALUES (
    p_business_id,
    p_type,
    p_objective,
    p_audience,
    p_offer,
    p_schedule,
    'generating'
  )
  RETURNING id INTO v_campaign_id;

  -- Record audit event
  INSERT INTO public.usage_events (
    business_id,
    user_id,
    event_type,
    units,
    campaign_id,
    description
  )
  VALUES (
    p_business_id,
    v_user_id,
    'CAMPAIGN_PACK_GENERATION',
    1,
    v_campaign_id,
    COALESCE(p_offer->>'title', 'Campaign Pack Generation')
  );

  RETURN jsonb_build_object(
    'success', true,
    'campaign_id', v_campaign_id,
    'packs_used', v_usage_period.packs_used + 1,
    'pack_limit', v_usage_period.pack_limit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Claim Anonymous Free Tool Campaign upon user signup (Option B)
CREATE OR REPLACE FUNCTION public.claim_anonymous_campaign(
  p_claim_token UUID,
  p_business_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_campaign RECORD;
BEGIN
  IF NOT public.is_business_member(p_business_id) THEN
    RAISE EXCEPTION 'Unauthorized: Caller is not a member of target business.';
  END IF;

  SELECT * INTO v_campaign
  FROM public.campaigns
  WHERE claim_token = p_claim_token
    AND business_id IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campaign not found or already claimed.';
  END IF;

  UPDATE public.campaigns
  SET business_id = p_business_id,
      claim_token = NULL,
      status = 'published',
      updated_at = now()
  WHERE id = v_campaign.id;

  RETURN jsonb_build_object(
    'success', true,
    'campaign_id', v_campaign.id,
    'business_id', p_business_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
