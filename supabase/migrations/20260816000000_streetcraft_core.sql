-- StreetCraft Core Database Schema & Multi-Tenant RLS Policies
-- Migration: 20260816000000_streetcraft_core.sql

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Businesses
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Artisanal Cafe & Bakery',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Business Members (Roles: owner, admin, member)
CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

-- 3. Business Profiles (Persistent Business Memory)
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

-- 4. Periodic Usage Periods (Monthly Cycle)
CREATE TABLE IF NOT EXISTS public.usage_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO', 'GROWTH')),
  pack_limit INTEGER NOT NULL DEFAULT 5,
  packs_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_packs_used_non_negative CHECK (packs_used >= 0)
);

-- 5. Append-Only Usage Ledger (Audit Trail)
CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'CAMPAIGN_PACK_GENERATION' CHECK (event_type IN ('CAMPAIGN_PACK_GENERATION', 'MANUAL_ADJUSTMENT', 'SUBSCRIPTION_RESET')),
  units INTEGER NOT NULL DEFAULT 1,
  campaign_id UUID,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('WEEKDAY_BOOST', 'WEEKEND_MAGNET', 'MENU_LAUNCH', 'FESTIVAL_SPECIAL', 'REVIEW_SPOTLIGHT', 'WIN_BACK_REGULARS')),
  objective TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT '',
  offer JSONB NOT NULL DEFAULT '{}'::jsonb,
  schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'COMPLETED', 'ARCHIVED')),
  performance_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Normalized Channel Outputs (One row per channel)
CREATE TABLE IF NOT EXISTS public.campaign_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER')),
  content JSONB NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  validation_status TEXT NOT NULL DEFAULT 'VALID' CHECK (validation_status IN ('VALID', 'WARNING', 'REPAIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, channel)
);

-- Indexes for optimal querying
CREATE INDEX IF NOT EXISTS idx_business_members_user ON public.business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_business_members_biz ON public.business_members(business_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_biz ON public.campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_campaign_outputs_camp ON public.campaign_outputs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_usage_periods_biz ON public.usage_periods(business_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_usage_events_biz ON public.usage_events(business_id, created_at);

-- Row Level Security (RLS)
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_outputs ENABLE ROW LEVEL SECURITY;

-- Helper security function to verify membership
CREATE OR REPLACE FUNCTION public.is_business_member(target_biz_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = target_biz_id
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-provisioning trigger for new businesses
CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Create initial business profile
  INSERT INTO public.business_profiles (business_id, name, category)
  VALUES (NEW.id, NEW.name, NEW.category)
  ON CONFLICT (business_id) DO NOTHING;

  -- 2. Create initial usage period (current month, FREE plan with 5 packs)
  INSERT INTO public.usage_periods (
    business_id,
    period_start,
    period_end,
    plan,
    pack_limit,
    packs_used
  )
  VALUES (
    NEW.id,
    date_trunc('month', CURRENT_DATE)::date,
    (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::date,
    'FREE',
    5,
    0
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_business_created ON public.businesses;
CREATE TRIGGER on_business_created
  AFTER INSERT ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_business();

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.business_profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_campaign_updated ON public.campaigns;
CREATE TRIGGER on_campaign_updated
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies

-- 1. Businesses
CREATE POLICY "Authenticated users can create businesses"
  ON public.businesses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Members can view their business"
  ON public.businesses FOR SELECT
  TO authenticated
  USING (public.is_business_member(id));

CREATE POLICY "Owners and admins can update their business"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_id = public.businesses.id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- 2. Business Members
CREATE POLICY "Users can add self as owner on creation"
  ON public.business_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can view co-members"
  ON public.business_members FOR SELECT
  TO authenticated
  USING (public.is_business_member(business_id));

CREATE POLICY "Owners can manage members"
  ON public.business_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_id = public.business_members.business_id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- 3. Business Profiles
CREATE POLICY "Members can view profile"
  ON public.business_profiles FOR SELECT
  TO authenticated
  USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert profile"
  ON public.business_profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update profile"
  ON public.business_profiles FOR UPDATE
  TO authenticated
  USING (public.is_business_member(business_id));

-- 4. Usage Periods
CREATE POLICY "Members can view usage periods"
  ON public.usage_periods FOR SELECT
  TO authenticated
  USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert initial usage period"
  ON public.usage_periods FOR INSERT
  TO authenticated
  WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update usage periods"
  ON public.usage_periods FOR UPDATE
  TO authenticated
  USING (public.is_business_member(business_id));

-- 5. Usage Events
CREATE POLICY "Members can view usage audit events"
  ON public.usage_events FOR SELECT
  TO authenticated
  USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert usage audit events"
  ON public.usage_events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_business_member(business_id) AND auth.uid() = user_id);

-- 6. Campaigns
CREATE POLICY "Members can view campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert campaigns"
  ON public.campaigns FOR INSERT
  TO authenticated
  WITH CHECK (public.is_business_member(business_id));

CREATE POLICY "Members can update campaigns"
  ON public.campaigns FOR UPDATE
  TO authenticated
  USING (public.is_business_member(business_id));

CREATE POLICY "Members can delete campaigns"
  ON public.campaigns FOR DELETE
  TO authenticated
  USING (public.is_business_member(business_id));

-- 7. Campaign Outputs
CREATE POLICY "Members can view campaign outputs"
  ON public.campaign_outputs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE public.campaigns.id = public.campaign_outputs.campaign_id
        AND public.is_business_member(public.campaigns.business_id)
    )
  );

CREATE POLICY "Members can insert campaign outputs"
  ON public.campaign_outputs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE public.campaigns.id = public.campaign_outputs.campaign_id
        AND public.is_business_member(public.campaigns.business_id)
    )
  );

CREATE POLICY "Members can update campaign outputs"
  ON public.campaign_outputs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE public.campaigns.id = public.campaign_outputs.campaign_id
        AND public.is_business_member(public.campaigns.business_id)
    )
  );
