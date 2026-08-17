-- ============================================================================
-- STREETCRAFT BETA 01 STRUCTURAL INVARIANTS & LEAST-PRIVILEGE GRANT LOCKDOWN
-- 1. Fix business_members authorization hole (remove self-insert)
-- 2. Fix subscriptions.provider_subscription_id default to NULL
-- 3. Enforce plans.business_limit and annual_price_inr NOT NULL
-- 4. Enforce usage_periods range and date bounds
-- 5. Enforce founder_allocation counter bounds
-- 6. Enforce subscription commercial invariant (FOUNDER tier cycle constraint)
-- 7. Full least-privilege grant lockdown across commercial/reference tables
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FIX BUSINESS MEMBERS AUTHORIZATION HOLE
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "business_members_insert" ON public.business_members;
DROP POLICY IF EXISTS "business_members_update" ON public.business_members;
DROP POLICY IF EXISTS "business_members_delete" ON public.business_members;

-- Only existing owners and admins can invite or insert new members to a business
CREATE POLICY "business_members_insert" ON public.business_members 
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_members bm 
      WHERE bm.business_id = business_members.business_id 
        AND bm.user_id = auth.uid() 
        AND bm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "business_members_update" ON public.business_members 
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm 
      WHERE bm.business_id = business_members.business_id 
        AND bm.user_id = auth.uid() 
        AND bm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "business_members_delete" ON public.business_members 
  FOR DELETE TO authenticated 
  USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.business_members bm 
      WHERE bm.business_id = business_members.business_id 
        AND bm.user_id = auth.uid() 
        AND bm.role = 'owner'
    )
  );

-- ----------------------------------------------------------------------------
-- 2. FIX SUBSCRIPTIONS PAYMENT ID DEFAULT
-- ----------------------------------------------------------------------------
ALTER TABLE public.subscriptions ALTER COLUMN provider_subscription_id DROP DEFAULT;
ALTER TABLE public.subscriptions ALTER COLUMN provider_subscription_id SET DEFAULT NULL;
UPDATE public.subscriptions SET provider_subscription_id = NULL WHERE provider_subscription_id = '';

-- ----------------------------------------------------------------------------
-- 3. ENFORCE PLANS NOT NULL INVARIANTS
-- ----------------------------------------------------------------------------
UPDATE public.plans SET business_limit = 2 WHERE business_limit IS NULL;
ALTER TABLE public.plans ALTER COLUMN business_limit SET NOT NULL;
ALTER TABLE public.plans ALTER COLUMN business_limit SET DEFAULT 2;

UPDATE public.plans SET annual_price_inr = 0 WHERE annual_price_inr IS NULL;
ALTER TABLE public.plans ALTER COLUMN annual_price_inr SET NOT NULL;
ALTER TABLE public.plans ALTER COLUMN annual_price_inr SET DEFAULT 0;

-- ----------------------------------------------------------------------------
-- 4. ENFORCE USAGE_PERIODS RANGE CONSTRAINTS
-- ----------------------------------------------------------------------------
ALTER TABLE public.usage_periods DROP CONSTRAINT IF EXISTS usage_periods_campaign_limit_non_negative;
ALTER TABLE public.usage_periods ADD CONSTRAINT usage_periods_campaign_limit_non_negative 
  CHECK (campaign_limit >= 0);

ALTER TABLE public.usage_periods DROP CONSTRAINT IF EXISTS usage_periods_valid_date_range;
ALTER TABLE public.usage_periods ADD CONSTRAINT usage_periods_valid_date_range 
  CHECK (period_end >= period_start);

-- ----------------------------------------------------------------------------
-- 5. ENFORCE FOUNDER_ALLOCATION COUNTER INVARIANTS
-- ----------------------------------------------------------------------------
ALTER TABLE public.founder_allocation DROP CONSTRAINT IF EXISTS founder_allocation_total_positive;
ALTER TABLE public.founder_allocation ADD CONSTRAINT founder_allocation_total_positive 
  CHECK (total_slots > 0);

ALTER TABLE public.founder_allocation DROP CONSTRAINT IF EXISTS founder_allocation_claimed_valid_range;
ALTER TABLE public.founder_allocation ADD CONSTRAINT founder_allocation_claimed_valid_range 
  CHECK (claimed_slots >= 0 AND claimed_slots <= total_slots);

-- ----------------------------------------------------------------------------
-- 6. ENFORCE SUBSCRIPTION COMMERCIAL INVARIANT (FOUNDER CYCLE)
-- ----------------------------------------------------------------------------
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_founder_cycle_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_founder_cycle_check 
  CHECK (plan_id != 'FOUNDER' OR billing_cycle IN ('quarterly', 'annual'));

-- ----------------------------------------------------------------------------
-- 7. COMPLETE LEAST-PRIVILEGE TABLE GRANTS LOCKDOWN
-- ----------------------------------------------------------------------------

-- Revoke all mutations from public/anon/authenticated on commercial & reference tables
REVOKE INSERT, UPDATE, DELETE ON public.plans FROM authenticated, anon, public;
REVOKE INSERT, UPDATE, DELETE ON public.founder_allocation FROM authenticated, anon, public;
REVOKE INSERT, UPDATE, DELETE ON public.founder_claims FROM authenticated, anon, public;
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated, anon, public;
REVOKE INSERT, UPDATE, DELETE ON public.festival_calendar FROM authenticated, anon, public;
REVOKE INSERT, UPDATE, DELETE ON public.usage_periods FROM authenticated, anon, public;
REVOKE INSERT, UPDATE, DELETE ON public.usage_events FROM authenticated, anon, public;
REVOKE INSERT, DELETE ON public.businesses FROM authenticated, anon, public;

-- Grant strictly necessary read-only SELECT
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT SELECT ON public.founder_allocation TO anon, authenticated;
GRANT SELECT ON public.festival_calendar TO anon, authenticated;
GRANT SELECT ON public.founder_claims TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.usage_periods TO authenticated;
GRANT SELECT ON public.usage_events TO authenticated;
GRANT SELECT ON public.businesses TO authenticated;

-- User Profile Management (read & update own profile)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Business Profiles (read & update for authorized members)
GRANT SELECT, INSERT, UPDATE ON public.business_profiles TO authenticated;

-- Business Members (read & member management)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_members TO authenticated;

-- Campaigns & Proofs (read & claimable anonymous demo insert)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_outputs TO authenticated;
GRANT SELECT, INSERT ON public.campaigns TO anon;
GRANT SELECT, INSERT ON public.campaign_outputs TO anon;
