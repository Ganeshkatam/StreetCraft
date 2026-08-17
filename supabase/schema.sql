-- ============================================================================
-- STREETCRAFT CANONICAL PRODUCTION DATABASE SCHEMA
-- Generated from Live Supabase Database (Project: iodwiyfjwzdvqtrczttb)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABLES & CONSTRAINTS
-- ============================================================================

-- 1.1 Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata'
);

-- 1.2 Business Members Table (Multi-tenant ownership and roles)
CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text])),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT business_members_business_id_user_id_key UNIQUE (business_id, user_id)
);

-- 1.3 Business Profiles Table (Store parameters and physical context)
CREATE TABLE IF NOT EXISTS public.business_profiles (
  business_id UUID PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  neighborhood TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  landmarks TEXT DEFAULT '',
  target_customer TEXT DEFAULT '',
  style_voice TEXT DEFAULT '',
  signature_items TEXT DEFAULT '',
  primary_goal TEXT DEFAULT '',
  peak_hours TEXT DEFAULT '',
  slow_hours TEXT DEFAULT '',
  default_offer TEXT DEFAULT '',
  avg_ticket_inr INTEGER,
  target_monthly_customers INTEGER,
  phone_whatsapp TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.4 User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  notification_preferences JSONB NOT NULL DEFAULT '{"email": true, "whatsapp": false, "weekly_digest": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.5 Plans Table (Commercial subscription definitions)
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_campaign_limit INTEGER NOT NULL,
  monthly_inr INTEGER NOT NULL,
  channels TEXT[] NOT NULL DEFAULT '{GOOGLE_BUSINESS,INSTAGRAM,WHATSAPP,IN_STORE_POSTER}'::text[],
  features TEXT[] NOT NULL DEFAULT '{}'::text[],
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  business_limit INTEGER NOT NULL DEFAULT 2,
  annual_price_inr INTEGER NOT NULL DEFAULT 0,
  quarterly_price_inr INTEGER NOT NULL DEFAULT 0
);

-- 1.6 Subscriptions Table (Commercial ledger and payments)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  provider TEXT NOT NULL DEFAULT 'RAZORPAY',
  provider_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status = ANY (ARRAY['ACTIVE'::text, 'PAST_DUE'::text, 'CANCELLED'::text, 'TRIALING'::text])),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle = ANY (ARRAY['monthly'::text, 'quarterly'::text, 'annual'::text])),
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.7 Founder Allocation & Claims Tables
CREATE TABLE IF NOT EXISTS public.founder_allocation (
  id INTEGER PRIMARY KEY,
  total_slots INTEGER NOT NULL DEFAULT 100 CHECK (total_slots > 0),
  claimed_slots INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.founder_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  billing_cycle TEXT NOT NULL CHECK (lower(billing_cycle) = ANY (ARRAY['quarterly'::text, 'annual'::text]))
);

-- 1.8 Usage Periods Table (Monthly campaign allowances)
CREATE TABLE IF NOT EXISTS public.usage_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'FREE' CHECK (plan = ANY (ARRAY['FREE'::text, 'PRO'::text, 'GROWTH'::text, 'FOUNDER'::text])),
  campaign_limit INTEGER NOT NULL DEFAULT 3 CHECK (campaign_limit >= 0),
  campaigns_used INTEGER NOT NULL DEFAULT 0 CHECK (campaigns_used >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.9 Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type = ANY (ARRAY['WEEKDAY_BOOST'::text, 'WEEKEND_MAGNET'::text, 'MENU_LAUNCH'::text, 'FESTIVAL_SPECIAL'::text, 'REVIEW_SPOTLIGHT'::text, 'WIN_BACK_REGULARS'::text])),
  objective TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT '',
  offer JSONB NOT NULL DEFAULT '{}'::jsonb,
  schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status = ANY (ARRAY['DRAFT'::text, 'GENERATING'::text, 'READY'::text, 'PUBLISHED'::text, 'COMPLETED'::text, 'ARCHIVED'::text])),
  performance_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  claim_token UUID,
  error_message TEXT
);

-- 1.10 Campaign Outputs Table (Coordinated 4-channel proofs)
CREATE TABLE IF NOT EXISTS public.campaign_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel = ANY (ARRAY['GOOGLE_BUSINESS'::text, 'INSTAGRAM'::text, 'WHATSAPP'::text, 'IN_STORE_POSTER'::text])),
  content JSONB NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  validation_status TEXT NOT NULL DEFAULT 'VALID' CHECK (validation_status = ANY (ARRAY['VALID'::text, 'WARNING'::text, 'REPAIRED'::text])),
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status = ANY (ARRAY['pending'::text, 'generating'::text, 'ready'::text, 'failed'::text])),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT campaign_outputs_campaign_id_channel_key UNIQUE (campaign_id, channel)
);

-- 1.11 Usage Events Table (Audit Ledger)
CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'CAMPAIGN_GENERATION' CHECK (event_type = ANY (ARRAY['CAMPAIGN_GENERATION'::text, 'MANUAL_ADJUSTMENT'::text, 'SUBSCRIPTION_RESET'::text])),
  units INTEGER NOT NULL DEFAULT 1,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.12 Festival Calendar Table (Regional opportunities radar)
CREATE TABLE IF NOT EXISTS public.festival_calendar (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  name TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'National',
  starts_at DATE NOT NULL,
  ends_at DATE NOT NULL,
  marketing_relevance TEXT NOT NULL DEFAULT 'General Celebrations',
  suggested_offer TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_business_members_biz ON public.business_members USING btree (business_id);
CREATE INDEX IF NOT EXISTS idx_business_members_user_biz ON public.business_members USING btree (user_id, business_id);
CREATE INDEX IF NOT EXISTS idx_campaign_outputs_campaign ON public.campaign_outputs USING btree (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_business_created ON public.campaigns USING btree (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_claim_token ON public.campaigns USING btree (claim_token);
CREATE INDEX IF NOT EXISTS idx_festival_calendar_dates ON public.festival_calendar USING btree (starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions USING btree (user_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_active_per_user ON public.subscriptions USING btree (user_id) WHERE (status = 'ACTIVE'::text);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_provider_payment_id_unique ON public.subscriptions USING btree (provider, provider_subscription_id) WHERE (provider_subscription_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_usage_events_biz ON public.usage_events USING btree (business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_periods_biz ON public.usage_periods USING btree (business_id, period_start, period_end);
CREATE UNIQUE INDEX IF NOT EXISTS unique_business_period ON public.usage_periods USING btree (business_id, period_start);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_allocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festival_calendar ENABLE ROW LEVEL SECURITY;

-- Helper Membership Function (Required for RLS)
CREATE OR REPLACE FUNCTION public.is_business_member(target_biz_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = target_biz_id
      AND user_id = check_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_business_member(target_biz_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_business_member(target_biz_id, auth.uid());
$$;

-- 3.1 Businesses Policies
CREATE POLICY "businesses_select" ON public.businesses
  FOR SELECT TO authenticated
  USING (is_business_member(id, auth.uid()));

CREATE POLICY "businesses_update" ON public.businesses
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.business_members bm
    WHERE bm.business_id = businesses.id AND bm.user_id = auth.uid() AND bm.role = ANY (ARRAY['owner'::text, 'admin'::text])
  ));

-- 3.2 Business Members Policies
CREATE POLICY "business_members_select" ON public.business_members
  FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR is_business_member(business_id, auth.uid()));

CREATE POLICY "business_members_insert" ON public.business_members
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.business_members bm
    WHERE bm.business_id = business_members.business_id AND bm.user_id = auth.uid() AND bm.role = ANY (ARRAY['owner'::text, 'admin'::text])
  ));

CREATE POLICY "business_members_update" ON public.business_members
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.business_members bm
    WHERE bm.business_id = business_members.business_id AND bm.user_id = auth.uid() AND bm.role = ANY (ARRAY['owner'::text, 'admin'::text])
  ));

CREATE POLICY "business_members_delete" ON public.business_members
  FOR DELETE TO authenticated
  USING ((user_id = auth.uid()) OR (EXISTS (
    SELECT 1 FROM public.business_members bm
    WHERE bm.business_id = business_members.business_id AND bm.user_id = auth.uid() AND bm.role = 'owner'::text
  )));

-- 3.3 Business Profiles Policies
CREATE POLICY "business_profiles_select" ON public.business_profiles
  FOR SELECT TO authenticated
  USING (is_business_member(business_id, auth.uid()));

CREATE POLICY "business_profiles_insert" ON public.business_profiles
  FOR INSERT TO authenticated
  WITH CHECK (is_business_member(business_id, auth.uid()));

CREATE POLICY "business_profiles_update" ON public.business_profiles
  FOR UPDATE TO authenticated
  USING (is_business_member(business_id, auth.uid()))
  WITH CHECK (is_business_member(business_id, auth.uid()));

-- 3.4 Profiles Policies
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND (
      (auth.jwt()->>'email_confirmed_at') IS NOT NULL
      OR (auth.jwt()->>'confirmed_at') IS NOT NULL
    )
  );

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3.5 Plans Policies
CREATE POLICY "plans_select" ON public.plans
  FOR SELECT TO public
  USING (active = true);

-- 3.6 Subscriptions Policies
CREATE POLICY "subscriptions_select" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3.7 Founder Policies
CREATE POLICY "founder_allocation_select" ON public.founder_allocation
  FOR SELECT TO public
  USING (true);

CREATE POLICY "founder_claims_select" ON public.founder_claims
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3.8 Usage Periods Policies
CREATE POLICY "usage_periods_select" ON public.usage_periods
  FOR SELECT TO authenticated
  USING (is_business_member(business_id, auth.uid()));

-- 3.9 Usage Events Policies
CREATE POLICY "usage_events_select" ON public.usage_events
  FOR SELECT TO authenticated
  USING (is_business_member(business_id, auth.uid()));

-- 3.10 Campaigns Policies
CREATE POLICY "campaigns_select" ON public.campaigns
  FOR SELECT TO public
  USING ((claim_token IS NOT NULL) OR ((business_id IS NOT NULL) AND (auth.uid() IS NOT NULL) AND is_business_member(business_id, auth.uid())));

CREATE POLICY "campaigns_insert" ON public.campaigns
  FOR INSERT TO public
  WITH CHECK ((business_id IS NULL) AND (claim_token IS NOT NULL));

CREATE POLICY "campaigns_update" ON public.campaigns
  FOR UPDATE TO authenticated
  USING ((business_id IS NOT NULL) AND is_business_member(business_id, auth.uid()));

CREATE POLICY "campaigns_delete" ON public.campaigns
  FOR DELETE TO authenticated
  USING ((business_id IS NOT NULL) AND is_business_member(business_id, auth.uid()));

-- 3.11 Campaign Outputs Policies
CREATE POLICY "campaign_outputs_select" ON public.campaign_outputs
  FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_outputs.campaign_id AND ((c.claim_token IS NOT NULL) OR ((c.business_id IS NOT NULL) AND (auth.uid() IS NOT NULL) AND is_business_member(c.business_id, auth.uid())))
  ));

CREATE POLICY "campaign_outputs_insert" ON public.campaign_outputs
  FOR INSERT TO public
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_outputs.campaign_id AND c.business_id IS NULL AND c.claim_token IS NOT NULL
  ));

CREATE POLICY "campaign_outputs_update" ON public.campaign_outputs
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_outputs.campaign_id AND c.business_id IS NOT NULL AND is_business_member(c.business_id, auth.uid())
  ));

CREATE POLICY "campaign_outputs_delete" ON public.campaign_outputs
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_outputs.campaign_id AND c.business_id IS NOT NULL AND is_business_member(c.business_id, auth.uid())
  ));

-- 3.12 Festival Calendar Policies
CREATE POLICY "festival_calendar_select" ON public.festival_calendar
  FOR SELECT TO public
  USING (true);

-- ============================================================================
-- 4. TRIGGERS & PROCEDURES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_business_name_and_category()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.businesses
  SET name = NEW.name, category = NEW.category
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Strict verification check: Only create a public profile if the user is confirmed/verified
  IF (NEW.email_confirmed_at IS NOT NULL OR NEW.confirmed_at IS NOT NULL) THEN
    INSERT INTO public.profiles (id, full_name, phone)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

-- Trigger Attachments
DROP TRIGGER IF EXISTS on_profile_updated ON public.business_profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_sync_business_name_and_category ON public.business_profiles;
CREATE TRIGGER trg_sync_business_name_and_category
  AFTER UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_business_name_and_category();

DROP TRIGGER IF EXISTS on_campaign_updated ON public.campaigns;
CREATE TRIGGER on_campaign_updated
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile only when verified:
-- 1. On signup insert (if pre-verified e.g. OAuth / auto-confirm)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- 2. On confirmation update (when user confirms their email)
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at, confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (
    (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
    OR (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  )
  EXECUTE FUNCTION public.handle_new_user_profile();

-- ============================================================================
-- 5. ATOMIC STORED PROCEDURES (RPCs)
-- ============================================================================

-- 5.1 Atomic Business Creation
CREATE OR REPLACE FUNCTION public.create_business_atomically(
  p_name text,
  p_category text,
  p_neighborhood text,
  p_city text,
  p_phone text
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
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated.';
  END IF;

  -- Ensure operator email is confirmed and profile exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'UNCONFIRMED_USER: Email confirmation is required before activating a store workspace.';
  END IF;

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

  SELECT COUNT(*) INTO v_owned_count
  FROM public.business_members
  WHERE user_id = v_user_id AND role = 'owner';

  IF v_owned_count >= v_business_limit THEN
    RAISE EXCEPTION 'BUSINESS_LIMIT_REACHED: Your current plan (%) allows up to % businesses. You currently own %.', 
      v_current_plan, v_business_limit, v_owned_count;
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

-- 5.2 Atomic Business Deletion
CREATE OR REPLACE FUNCTION public.delete_business_atomically(p_business_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_is_owner BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED: You must be authenticated to delete a business.';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = p_business_id
      AND user_id = v_user_id
      AND role = 'owner'
  ) INTO v_is_owner;

  IF NOT v_is_owner THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Only the business owner can delete this business.';
  END IF;

  DELETE FROM public.businesses WHERE id = p_business_id;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_business_id', p_business_id
  );
END;
$$;

-- 5.3 Atomic Campaign Generation & Quota Deduction
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

  IF p_business_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_BUSINESS: Cannot create a campaign without a valid business. Please select or create a business first.';
  END IF;

  IF NOT public.is_business_member(p_business_id, v_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: User is not a member of this business.';
  END IF;

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
    'campaign_limit', v_campaign_limit
  );
END;
$$;

-- 5.4 Backward Compatible Alias
CREATE OR REPLACE FUNCTION public.save_campaign_pack_atomically(
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
    p_poster_content
  );
END;
$$;

-- 5.5 Payment Confirmation & Subscription Activation
CREATE OR REPLACE FUNCTION public.confirm_payment_and_activate_subscription(
  p_payment_provider text,
  p_payment_id text,
  p_order_id text,
  p_plan_id text,
  p_billing_cycle text
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

  SELECT id INTO v_other_user_sub
  FROM public.subscriptions
  WHERE provider = LOWER(TRIM(p_payment_provider))
    AND provider_subscription_id = TRIM(p_payment_id)
    AND user_id != v_user_id
  LIMIT 1;

  IF v_other_user_sub IS NOT NULL THEN
    RAISE EXCEPTION 'PAYMENT_ALREADY_CLAIMED: This payment reference is already attached to another account.';
  END IF;

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

  IF NOT EXISTS (SELECT 1 FROM public.plans WHERE id = v_normalized_plan AND active = true) THEN
    RAISE EXCEPTION 'INVALID_PLAN: Plan % does not exist.', v_normalized_plan;
  END IF;

  IF v_normalized_cycle NOT IN ('monthly', 'quarterly', 'annual') THEN
    RAISE EXCEPTION 'INVALID_CYCLE: Billing cycle must be monthly, quarterly, or annual.';
  END IF;

  SELECT monthly_campaign_limit, business_limit 
  INTO v_plan_limit, v_biz_limit
  FROM public.plans 
  WHERE id = v_normalized_plan;

  v_period_interval := CASE 
    WHEN v_normalized_cycle = 'monthly' THEN interval '1 month'
    WHEN v_normalized_cycle = 'quarterly' THEN interval '3 months'
    ELSE interval '1 year'
  END;

  v_period_end := (CURRENT_DATE + v_period_interval)::date;

  IF v_normalized_plan = 'FOUNDER' THEN
    IF v_normalized_cycle NOT IN ('quarterly', 'annual') THEN
      RAISE EXCEPTION 'INVALID_FOUNDER_CYCLE: Founder tier requires quarterly or annual billing.';
    END IF;

    IF EXISTS (SELECT 1 FROM public.founder_claims WHERE user_id = v_user_id) THEN
      RAISE EXCEPTION 'FOUNDER_ALREADY_CLAIMED: One Founder claim per account.';
    END IF;

    UPDATE public.founder_allocation
    SET claimed_slots = claimed_slots + 1
    WHERE id = 1 AND claimed_slots < total_slots;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'FOUNDER_SOLD_OUT: All Founder slots are fully allocated.';
    END IF;

    INSERT INTO public.founder_claims (user_id, billing_cycle)
    VALUES (v_user_id, v_normalized_cycle);
  END IF;

  UPDATE public.subscriptions
  SET status = 'CANCELLED', updated_at = now()
  WHERE user_id = v_user_id AND status = 'ACTIVE';

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

  UPDATE public.usage_periods
  SET 
    plan = v_normalized_plan,
    campaign_limit = v_plan_limit
  WHERE business_id IN (
    SELECT business_id FROM public.business_members 
    WHERE user_id = v_user_id AND role = 'owner'
  )
  AND period_end >= CURRENT_DATE;

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

-- 5.6 Founder Tier Free Claim RPC
CREATE OR REPLACE FUNCTION public.claim_founder_tier(p_billing_cycle text)
RETURNS jsonb
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

  IF LOWER(p_billing_cycle) NOT IN ('quarterly', 'annual') THEN
    RAISE EXCEPTION 'Invalid billing cycle: Founder tier requires quarterly or annual billing.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.founder_claims WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'FOUNDER_ALREADY_CLAIMED: One Founder claim per account.';
  END IF;

  SELECT total_slots, claimed_slots INTO v_total_slots, v_claimed_count
  FROM public.founder_allocation
  WHERE id = 1
  FOR UPDATE;

  IF v_claimed_count >= v_total_slots THEN
    RAISE EXCEPTION 'FOUNDER_SOLD_OUT: All 100 Founder slots have been claimed.';
  END IF;

  UPDATE public.founder_allocation
  SET claimed_slots = claimed_slots + 1
  WHERE id = 1;

  INSERT INTO public.founder_claims (user_id, billing_cycle)
  VALUES (v_user_id, LOWER(p_billing_cycle));

  UPDATE public.subscriptions
  SET status = 'CANCELLED', updated_at = now()
  WHERE user_id = v_user_id AND status = 'ACTIVE';

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

-- 5.7 Anonymous Campaign Claiming
CREATE OR REPLACE FUNCTION public.claim_anonymous_campaign(p_claim_token text, p_business_id uuid)
RETURNS boolean
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
  WHERE claim_token = p_claim_token::uuid AND business_id IS NULL;

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

-- 5.8 Subscription Cancellation
CREATE OR REPLACE FUNCTION public.cancel_user_subscription()
RETURNS jsonb
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

-- ============================================================================
-- 6. AUTOMATED MAINTENANCE CRON JOBS (pg_cron)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 6.1 Unconfirmed Users Purge Function
CREATE OR REPLACE FUNCTION public.cleanup_unconfirmed_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Automatically delete unconfirmed users who registered more than 1 hour ago
  DELETE FROM auth.users
  WHERE email_confirmed_at IS NULL
    AND confirmed_at IS NULL
    AND created_at < (NOW() - INTERVAL '1 hour');
END;
$$;

-- 6.2 Schedule cleanup to run every 10 minutes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup_unconfirmed_users_hourly') THEN
    PERFORM cron.unschedule('cleanup_unconfirmed_users_hourly');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END;
$$;

SELECT cron.schedule(
  'cleanup_unconfirmed_users_hourly',
  '*/10 * * * *',
  'SELECT public.cleanup_unconfirmed_users();'
);

-- ============================================================================
-- 7. ANNUAL FESTIVAL & REGIONAL MOMENTS SEED DATA
-- ============================================================================

INSERT INTO public.festival_calendar (id, name, region, starts_at, ends_at, marketing_relevance, suggested_offer)
VALUES
  -- JANUARY
  ('fest_newyear', 'New Year Kickoff & Fresh Start', 'National', '2026-01-01', '2026-01-04', 'Healthy resolutions, fresh smoothies & wholesome breakfast bowls', 'New Year detox combos & 15% fresh start breakfast offer'),
  ('fest_harvest', 'Pongal, Makar Sankranti & Lohri', 'National / Regional', '2026-01-13', '2026-01-16', 'Harvest celebration feasts, traditional sweets & warm winter treats', 'Special festive harvest thalis & warm jaggery dessert boxes'),
  ('fest_republic', 'Republic Day Long Weekend', 'National', '2026-01-24', '2026-01-27', 'National holiday long weekend family brunch & walk-ins', 'Tricolor specialty desserts & long-weekend breakfast combos'),

  -- FEBRUARY
  ('fest_valentines', 'Valentine''s Week & Couples Dining', 'National', '2026-02-07', '2026-02-15', 'Romantic dining, dessert duos & artisanal gift hampers', '2-course couple dinner pairings & handcrafted chocolate boxes'),
  ('fest_shivratri', 'Maha Shivratri Fasting Specials', 'National', '2026-02-24', '2026-02-26', 'Wholesome fasting menus, fruit bowls & sattvic delicacies', 'Special fasting thali & cold pressed beverage pairing'),

  -- MARCH
  ('fest_holi', 'Holi Festive Weekend & Gujiya Carnival', 'National', '2026-03-13', '2026-03-16', 'Organic thandai specials, colorful sweets & family celebrations', 'Artisanal thandai pitchers & curated Holi gujiya gift boxes'),
  ('fest_ugadi', 'Ugadi & Gudi Padwa (New Year)', 'South / Maharashtra', '2026-03-19', '2026-03-22', 'Traditional new year feast platters, mango specialties & sweets', 'Regional new year festive platter & family sweet box'),
  ('fest_eid_fitr', 'Eid-ul-Fitr Feasts', 'National', '2026-03-29', '2026-04-01', 'Festive feasting, biryani feasts & celebratory dessert drops', 'Grand Eid celebration platters & complimentary sheer khurma'),

  -- APRIL
  ('fest_easter', 'Easter & Spring Bakes Weekend', 'National', '2026-04-03', '2026-04-06', 'Hot cross buns, carrot cakes & spring brunch menus', 'Easter egg dessert basket & family brunch booking discount'),
  ('fest_baisakhi', 'Baisakhi, Vishu & Poila Boishakh', 'North / South / East', '2026-04-13', '2026-04-16', 'Regional harvest celebrations & traditional culinary specials', 'Festive thali combo & celebration sweet box'),
  ('fest_world_book', 'World Book & Art Day Local Evenings', 'National', '2026-04-22', '2026-04-24', 'Cozy reading evenings, study combos & creative coffee specials', 'Coffee + pastry book-lover combo with quiet corner seating'),

  -- MAY
  ('fest_mothers_day', 'Mother''s Day High Tea & Dining', 'National', '2026-05-08', '2026-05-11', 'Mother''s Day celebratory brunch, tea sets & salon packages', 'Complimentary dessert for moms & family high-tea reservation packages'),
  ('fest_summer_mango', 'Summer Mango Festival', 'National', '2026-05-15', '2026-05-31', 'Peak Alphonso pastry specials, mango smoothies & fruit coolers', 'Fresh mango dessert bowl & buy-2-get-1 mango coolers'),

  -- JUNE
  ('fest_fathers_day', 'Father''s Day Feast & Brew Specials', 'National', '2026-06-19', '2026-06-22', 'Father''s Day hearty grills, artisanal coffee flights & meals', 'Father-and-child brunch discount & specialty brew tastings'),
  ('fest_yoga_day', 'International Yoga & Wellness Week', 'National', '2026-06-19', '2026-06-25', 'Detox juices, protein bowls & wellness studio promotions', 'Green smoothie boost & healthy morning breakfast combos'),
  ('fest_monsoon', 'Monsoon Kickoff & Chai Pakoda Window', 'National', '2026-06-25', '2026-07-10', 'Rainy day comfort food, piping masala chai & crispy fritters', 'Monsoon chai-pakoda duo & rainy afternoon discount'),

  -- JULY
  ('fest_chocolate_day', 'World Chocolate Day Festival', 'National', '2026-07-06', '2026-07-09', 'Decadent single-origin desserts, truffle boxes & mocha pairings', 'Buy-1-get-1 dark chocolate pastry & artisan hot chocolate flight'),
  ('fest_guru_purnima', 'Guru Purnima Gratitude Feasts', 'National', '2026-07-18', '2026-07-20', 'Family gatherings, mentor tributes & traditional sweets', 'Family dinner platters & takeaway tribute sweet hampers'),

  -- AUGUST
  ('fest_independence', 'Independence Day Weekend', 'National', '2026-08-14', '2026-08-17', 'Long weekend dining & patriotic treats', 'Tricolor specialty desserts or 15% long-weekend brunch combos'),
  ('fest_raksha', 'Raksha Bandhan & Sibling Gifting', 'National', '2026-08-26', '2026-08-29', 'Sibling gifting, sweet boxes & celebratory meals', 'Curated sibling gift boxes & 2-for-1 treat specials'),
  ('fest_janmashtami', 'Janmashtami Sweet Drop', 'National', '2026-08-28', '2026-08-31', 'Festive dairy specialties, peda boxes & late night treats', 'Fresh makhan & peda festive hamper with evening tea'),

  -- SEPTEMBER
  ('fest_teachers_day', 'Teachers'' Day & Campus Specials', 'National', '2026-09-04', '2026-09-06', 'Student meetups, appreciation treats & afternoon snacks', '20% teacher discount & student group study bundles'),
  ('fest_onam', 'Onam Celebration & Grand Sadhya', 'Kerala / South', '2026-09-03', '2026-09-06', 'Sadhya feasts, harvest celebrations & family dining', 'Special Onam festive menu & celebratory beverage pairing'),
  ('fest_ganesh', 'Ganesh Chaturthi', 'Maharashtra / South / West', '2026-09-14', '2026-09-24', 'Festive family sweets, Modak specials & dining', 'Artisanal festive sweets box & family feast platters'),

  -- OCTOBER
  ('fest_coffee_day', 'International Coffee Day', 'National', '2026-09-30', '2026-10-02', 'Specialty single origin roasts, latte art & brewing classes', 'Free shot upgrade & buy-1-get-1 specialty espresso'),
  ('fest_navratri', 'Navratri & Durga Puja', 'National / Bengal / Gujarat', '2026-10-11', '2026-10-20', 'Festive feasting, fasting special menus & night treats', 'Special festive thalis & evening celebration combos'),
  ('fest_dussehra', 'Dussehra (Vijayadashami)', 'National', '2026-10-20', '2026-10-23', 'Celebratory family feasts, sweet boxes & new beginnings', 'Grand festive thali & auspicious sweet boxes'),
  ('fest_halloween', 'Halloween Spooky Treats & Autumn Window', 'National', '2026-10-29', '2026-11-01', 'Pumpkin spice season, spooky baked goods & costume discounts', 'Halloween themed bakes & pumpkin spice latte pairings'),

  -- NOVEMBER
  ('fest_diwali', 'Diwali Lights & New Year Gifting', 'National', '2026-11-08', '2026-11-13', 'Peak shopping, corporate gifting & family celebrations', 'Exclusive Diwali gift hampers & pre-booking discounts'),
  ('fest_bhai_dooj', 'Bhai Dooj Sibling Celebrations', 'National', '2026-11-13', '2026-11-15', 'Sibling lunches, post-Diwali dinners & festive treats', 'Sibling dining combo & mini sweet box takeaway'),
  ('fest_gurpurab', 'Guru Nanak Jayanti (Gurpurab)', 'National', '2026-11-23', '2026-11-25', 'Community gatherings, festive sweets & wholesome dining', 'Festive langar-inspired thali & karah prasad dessert special'),
  ('fest_black_friday', 'Black Friday & Small Business Weekend', 'National', '2026-11-26', '2026-11-30', 'Holiday shopping rush, gift card promotions & flash specials', 'Buy a Rs. 1000 store gift card, get Rs. 250 bonus voucher'),

  -- DECEMBER
  ('fest_winter_warmers', 'Winter Warmers & Hot Chocolate Fest', 'National', '2026-12-01', '2026-12-18', 'Warm comfort drinks, soups, spiced bakery goods & cozy evenings', 'Gourmet hot chocolate flight & soup-plus-sandwich meal'),
  ('fest_christmas', 'Christmas & Winter Carnival', 'National', '2026-12-20', '2026-12-26', 'Holiday cheer, hot chocolates, plum cakes & winter specials', 'Signature hot chocolate pairings & holiday bakes gift box'),
  ('fest_nye', 'New Year''s Eve & Countdown Brunch', 'National', '2026-12-30', '2027-01-02', 'Year-end celebrations & fresh January brunch', 'New Year brunch reservations & early-bird table booking')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  region = EXCLUDED.region,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  marketing_relevance = EXCLUDED.marketing_relevance,
  suggested_offer = EXCLUDED.suggested_offer;


