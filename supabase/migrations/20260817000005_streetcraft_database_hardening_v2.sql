-- ============================================================================
-- STREETCRAFT DATABASE HARDENING V2
-- Comprehensive Production Security, Least-Privilege Grants & Schema Invariants
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CLEAN UP BUSINESS PROFILE DEFAULTS (Zero Fabricated Information)
-- ----------------------------------------------------------------------------
ALTER TABLE public.business_profiles ALTER COLUMN category DROP DEFAULT;
ALTER TABLE public.business_profiles ALTER COLUMN style_voice SET DEFAULT '';
ALTER TABLE public.business_profiles ALTER COLUMN primary_goal SET DEFAULT '';
ALTER TABLE public.business_profiles ALTER COLUMN peak_hours SET DEFAULT '';
ALTER TABLE public.business_profiles ALTER COLUMN slow_hours SET DEFAULT '';
ALTER TABLE public.business_profiles ALTER COLUMN default_offer SET DEFAULT '';
ALTER TABLE public.business_profiles ALTER COLUMN avg_ticket_inr DROP DEFAULT;
ALTER TABLE public.business_profiles ALTER COLUMN avg_ticket_inr SET DEFAULT NULL;
ALTER TABLE public.business_profiles ALTER COLUMN target_monthly_customers DROP DEFAULT;
ALTER TABLE public.business_profiles ALTER COLUMN target_monthly_customers SET DEFAULT NULL;

-- ----------------------------------------------------------------------------
-- 2. DROP REDUNDANT INDEXES
-- ----------------------------------------------------------------------------
DROP INDEX IF EXISTS public.idx_campaign_outputs_camp;
DROP INDEX IF EXISTS public.idx_campaign_outputs_channel;
DROP INDEX IF EXISTS public.idx_campaigns_biz;
DROP INDEX IF EXISTS public.idx_business_members_user;
DROP INDEX IF EXISTS public.idx_usage_periods_biz_start;

-- ----------------------------------------------------------------------------
-- 3. AUDIT & RE-ESTABLISH ALL SECURITY DEFINER HELPER FUNCTIONS WITH SEARCH_PATH
-- ----------------------------------------------------------------------------
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
-- 4. CONSOLIDATE RLS POLICIES (Single Canonical Policy Per Operation)
-- ----------------------------------------------------------------------------

-- A. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- B. SUBSCRIPTIONS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;

CREATE POLICY "subscriptions_select" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- C. BUSINESSES
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view their business" ON public.businesses;
DROP POLICY IF EXISTS "Owners and admins can update their business" ON public.businesses;
DROP POLICY IF EXISTS "businesses_select" ON public.businesses;
DROP POLICY IF EXISTS "businesses_update" ON public.businesses;
DROP POLICY IF EXISTS "businesses_insert" ON public.businesses;

CREATE POLICY "businesses_select" ON public.businesses FOR SELECT TO authenticated USING (public.is_business_member(id, auth.uid()));
CREATE POLICY "businesses_update" ON public.businesses FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.business_members bm 
    WHERE bm.business_id = businesses.id AND bm.user_id = auth.uid() AND bm.role IN ('owner', 'admin')
  )
);
CREATE POLICY "businesses_insert" ON public.businesses FOR INSERT TO authenticated WITH CHECK (true);

-- D. BUSINESS MEMBERS
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners can manage own memberships" ON public.business_members;
DROP POLICY IF EXISTS "Users can view own business memberships" ON public.business_members;
DROP POLICY IF EXISTS "business_members_select" ON public.business_members;
DROP POLICY IF EXISTS "business_members_insert" ON public.business_members;
DROP POLICY IF EXISTS "business_members_update" ON public.business_members;
DROP POLICY IF EXISTS "business_members_delete" ON public.business_members;

CREATE POLICY "business_members_select" ON public.business_members FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR public.is_business_member(business_id, auth.uid())
);
CREATE POLICY "business_members_insert" ON public.business_members FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.business_members bm 
    WHERE bm.business_id = business_members.business_id AND bm.user_id = auth.uid() AND bm.role = 'owner'
  )
);
CREATE POLICY "business_members_update" ON public.business_members FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.business_members bm 
    WHERE bm.business_id = business_members.business_id AND bm.user_id = auth.uid() AND bm.role = 'owner'
  )
);
CREATE POLICY "business_members_delete" ON public.business_members FOR DELETE TO authenticated USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.business_members bm 
    WHERE bm.business_id = business_members.business_id AND bm.user_id = auth.uid() AND bm.role = 'owner'
  )
);

-- E. BUSINESS PROFILES
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can insert profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Members can update profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Members can view profile" ON public.business_profiles;
DROP POLICY IF EXISTS "business_profiles_select" ON public.business_profiles;
DROP POLICY IF EXISTS "business_profiles_insert" ON public.business_profiles;
DROP POLICY IF EXISTS "business_profiles_update" ON public.business_profiles;

CREATE POLICY "business_profiles_select" ON public.business_profiles FOR SELECT TO authenticated USING (public.is_business_member(business_id, auth.uid()));
CREATE POLICY "business_profiles_insert" ON public.business_profiles FOR INSERT TO authenticated WITH CHECK (public.is_business_member(business_id, auth.uid()));
CREATE POLICY "business_profiles_update" ON public.business_profiles FOR UPDATE TO authenticated USING (public.is_business_member(business_id, auth.uid())) WITH CHECK (public.is_business_member(business_id, auth.uid()));

-- F. CAMPAIGNS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view claimable campaign by token" ON public.campaigns;
DROP POLICY IF EXISTS "Members can delete campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Members can insert campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Members can update campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Members can view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_insert" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_select" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_update" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_delete" ON public.campaigns;

CREATE POLICY "campaigns_select" ON public.campaigns FOR SELECT TO public USING (
  (claim_token IS NOT NULL) OR (business_id IS NOT NULL AND auth.uid() IS NOT NULL AND public.is_business_member(business_id, auth.uid()))
);
CREATE POLICY "campaigns_insert" ON public.campaigns FOR INSERT TO public WITH CHECK (
  (business_id IS NULL AND claim_token IS NOT NULL) OR (business_id IS NOT NULL AND auth.uid() IS NOT NULL AND public.is_business_member(business_id, auth.uid()))
);
CREATE POLICY "campaigns_update" ON public.campaigns FOR UPDATE TO authenticated USING (
  business_id IS NOT NULL AND public.is_business_member(business_id, auth.uid())
);
CREATE POLICY "campaigns_delete" ON public.campaigns FOR DELETE TO authenticated USING (
  business_id IS NOT NULL AND public.is_business_member(business_id, auth.uid())
);

-- G. CAMPAIGN OUTPUTS
ALTER TABLE public.campaign_outputs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view claimable campaign outputs" ON public.campaign_outputs;
DROP POLICY IF EXISTS "Members can insert campaign outputs" ON public.campaign_outputs;
DROP POLICY IF EXISTS "Members can update campaign outputs" ON public.campaign_outputs;
DROP POLICY IF EXISTS "Members can view campaign outputs" ON public.campaign_outputs;
DROP POLICY IF EXISTS "campaign_outputs_insert" ON public.campaign_outputs;
DROP POLICY IF EXISTS "campaign_outputs_select" ON public.campaign_outputs;
DROP POLICY IF EXISTS "campaign_outputs_update" ON public.campaign_outputs;
DROP POLICY IF EXISTS "campaign_outputs_delete" ON public.campaign_outputs;

CREATE POLICY "campaign_outputs_select" ON public.campaign_outputs FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_outputs.campaign_id 
      AND (c.claim_token IS NOT NULL OR (c.business_id IS NOT NULL AND auth.uid() IS NOT NULL AND public.is_business_member(c.business_id, auth.uid())))
  )
);
CREATE POLICY "campaign_outputs_insert" ON public.campaign_outputs FOR INSERT TO public WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_outputs.campaign_id 
      AND (c.claim_token IS NOT NULL OR (c.business_id IS NOT NULL AND auth.uid() IS NOT NULL AND public.is_business_member(c.business_id, auth.uid())))
  )
);
CREATE POLICY "campaign_outputs_update" ON public.campaign_outputs FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_outputs.campaign_id 
      AND c.business_id IS NOT NULL 
      AND public.is_business_member(c.business_id, auth.uid())
  )
);
CREATE POLICY "campaign_outputs_delete" ON public.campaign_outputs FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_outputs.campaign_id 
      AND c.business_id IS NOT NULL 
      AND public.is_business_member(c.business_id, auth.uid())
  )
);

-- H. USAGE PERIODS
ALTER TABLE public.usage_periods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can insert usage period" ON public.usage_periods;
DROP POLICY IF EXISTS "Members can update usage periods" ON public.usage_periods;
DROP POLICY IF EXISTS "Members can view usage periods" ON public.usage_periods;
DROP POLICY IF EXISTS "usage_periods_select" ON public.usage_periods;
DROP POLICY IF EXISTS "usage_periods_insert" ON public.usage_periods;
DROP POLICY IF EXISTS "usage_periods_update" ON public.usage_periods;

CREATE POLICY "usage_periods_select" ON public.usage_periods FOR SELECT TO authenticated USING (public.is_business_member(business_id, auth.uid()));
CREATE POLICY "usage_periods_insert" ON public.usage_periods FOR INSERT TO authenticated WITH CHECK (public.is_business_member(business_id, auth.uid()));
CREATE POLICY "usage_periods_update" ON public.usage_periods FOR UPDATE TO authenticated USING (public.is_business_member(business_id, auth.uid()));

-- I. USAGE EVENTS
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can insert usage audit events" ON public.usage_events;
DROP POLICY IF EXISTS "Members can view usage audit events" ON public.usage_events;
DROP POLICY IF EXISTS "usage_events_select" ON public.usage_events;
DROP POLICY IF EXISTS "usage_events_insert" ON public.usage_events;

CREATE POLICY "usage_events_select" ON public.usage_events FOR SELECT TO authenticated USING (public.is_business_member(business_id, auth.uid()));
CREATE POLICY "usage_events_insert" ON public.usage_events FOR INSERT TO authenticated WITH CHECK (public.is_business_member(business_id, auth.uid()));

-- J. FOUNDER CLAIMS (LOCKED STRICTLY BEHIND AUTH & RPC)
ALTER TABLE public.founder_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access to founder_claims" ON public.founder_claims;
DROP POLICY IF EXISTS "founder_claims_insert" ON public.founder_claims;
DROP POLICY IF EXISTS "founder_claims_select" ON public.founder_claims;

CREATE POLICY "founder_claims_select" ON public.founder_claims FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- K. REFERENCE TABLES (READ-ONLY PUBLIC ACCESS)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active plans" ON public.plans;
DROP POLICY IF EXISTS "plans_select" ON public.plans;
CREATE POLICY "plans_select" ON public.plans FOR SELECT TO public USING (active = true);

ALTER TABLE public.founder_allocation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to founder_allocation" ON public.founder_allocation;
DROP POLICY IF EXISTS "founder_allocation_select" ON public.founder_allocation;
CREATE POLICY "founder_allocation_select" ON public.founder_allocation FOR SELECT TO public USING (true);

ALTER TABLE public.festival_calendar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view festival calendar" ON public.festival_calendar;
DROP POLICY IF EXISTS "festival_calendar_select" ON public.festival_calendar;
CREATE POLICY "festival_calendar_select" ON public.festival_calendar FOR SELECT TO public USING (true);

-- ----------------------------------------------------------------------------
-- 5. LEAST-PRIVILEGE TABLE GRANTS (REVOKE EXCESS ANONYMOUS ACCESS)
-- ----------------------------------------------------------------------------

-- Revoke all table permissions from public & anon
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, public;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, public;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant SELECT on public read-only tables to anon & authenticated
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT SELECT ON public.festival_calendar TO anon, authenticated;
GRANT SELECT ON public.founder_allocation TO anon, authenticated;
GRANT SELECT, INSERT ON public.campaigns TO anon;
GRANT SELECT, INSERT ON public.campaign_outputs TO anon;

-- Grant operational CRUD on application tables to authenticated (guarded by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_outputs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usage_periods TO authenticated;
GRANT SELECT, INSERT ON public.usage_events TO authenticated;
GRANT SELECT ON public.founder_claims TO authenticated;

-- ----------------------------------------------------------------------------
-- 6. AUDIT & GRANT EXECUTE ON ALL SECURITY DEFINER RPCs
-- ----------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.is_business_member(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_business_member(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_business_atomically(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_campaign_pack_atomically(UUID, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB, JSONB, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_founder_tier(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_user_subscription() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_anonymous_campaign(TEXT, UUID) TO authenticated;
