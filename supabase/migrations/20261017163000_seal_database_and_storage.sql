-- Migration: 20261017163000_seal_database_and_storage.sql
-- Description: Hardens database RPCs, secures storefront storage bucket, and prevents quota and membership probing.

-- 1. Helper function for store admin/owner role checks
CREATE OR REPLACE FUNCTION public.is_business_admin(target_biz_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = target_biz_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
$$;

-- 2. Harden is_business_member against user-probing while preserving existing RLS policies
-- Blocks probing from anon and authenticated callers while allowing internal/service-role callers
CREATE OR REPLACE FUNCTION public.is_business_member(target_biz_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = target_biz_id
      AND user_id = check_user_id
      AND (check_user_id = auth.uid() OR COALESCE(auth.role(), '') NOT IN ('anon', 'authenticated'))
  );
$$;

-- 3. Revoke public/client execution on vulnerable payment and cleanup functions
REVOKE EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_founder_tier(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_unconfirmed_users() FROM PUBLIC, anon, authenticated;

-- 4. Scope the storefronts bucket strictly to store folders with admin-only write permissions
DROP POLICY IF EXISTS "Allow authenticated upload on storefronts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update on storefronts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete on storefronts bucket" ON storage.objects;

CREATE POLICY "Store Admin Upload Storefront Asset"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'storefronts' AND
    (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' AND
    public.is_business_admin(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "Store Admin Update Storefront Asset"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'storefronts' AND
    (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' AND
    public.is_business_admin(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "Store Admin Delete Storefront Asset"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'storefronts' AND
    (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' AND
    public.is_business_admin(((storage.foldername(name))[1])::uuid)
  );

-- 5. Race-free claim_anonymous_campaign: atomic claim, owner/admin check, and quota consumption
CREATE OR REPLACE FUNCTION public.claim_anonymous_campaign(p_claim_token text, p_business_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_campaign_id UUID;
  v_usage_period_id UUID;
  v_campaigns_used INT;
  v_campaign_limit INT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Caller must be authenticated.' USING ERRCODE = 'P0001';
  END IF;

  -- 1. Check ownership or admin membership on the target business
  IF NOT public.is_business_admin(p_business_id) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: User must be an owner or admin of the business to claim campaigns.' USING ERRCODE = 'P0001';
  END IF;

  -- 2. Atomically claim the campaign (prevents double-claim race condition)
  UPDATE public.campaigns
  SET 
    business_id = p_business_id,
    claim_token = NULL,
    updated_at = NOW()
  WHERE claim_token = p_claim_token 
    AND business_id IS NULL
  RETURNING id INTO v_campaign_id;

  IF v_campaign_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 3. Check and lock usage quota for the target store
  SELECT id, campaigns_used, campaign_limit INTO v_usage_period_id, v_campaigns_used, v_campaign_limit
  FROM public.usage_periods
  WHERE business_id = p_business_id
    AND period_start <= CURRENT_DATE
    AND period_end >= CURRENT_DATE
  FOR UPDATE;

  IF v_usage_period_id IS NULL THEN
    RAISE EXCEPTION 'ENTITLEMENT_UNAVAILABLE: No active usage period found for this business.' USING ERRCODE = 'P0001';
  END IF;

  IF v_campaigns_used >= v_campaign_limit THEN
    RAISE EXCEPTION 'QUOTA_EXHAUSTED: Usage quota reached: % of % campaigns used this cycle.', v_campaigns_used, v_campaign_limit USING ERRCODE = 'P0001';
  END IF;

  -- 4. Deduct quota
  UPDATE public.usage_periods
  SET campaigns_used = campaigns_used + 1
  WHERE id = v_usage_period_id;

  -- 5. Record usage audit event
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
    'Claimed campaign from free tool.'
  );

  RETURN TRUE;
END;
$$;

-- 6. Cancel subscription at period end: retains paid status until current_period_end
CREATE OR REPLACE FUNCTION public.request_subscription_cancellation()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_sub_id UUID;
  v_plan_id TEXT;
  v_period_end DATE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Caller must be authenticated.' USING ERRCODE = 'P0001';
  END IF;

  SELECT id, plan_id, current_period_end
  INTO v_sub_id, v_plan_id, v_period_end
  FROM public.subscriptions
  WHERE user_id = v_user_id
    AND status IN ('ACTIVE', 'TRIALING')
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NO_ACTIVE_SUBSCRIPTION: You do not have an active paid subscription to cancel.' USING ERRCODE = 'P0001';
  END IF;

  -- Flag subscription to cancel at period end while preserving paid access
  UPDATE public.subscriptions
  SET 
    cancel_at_period_end = true,
    updated_at = NOW()
  WHERE id = v_sub_id;

  -- Record audit event across owner storefronts using schema-valid event_type
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
    'SUBSCRIPTION_CANCEL_REQUESTED',
    0,
    'Subscription cancellation requested. Active access retained until ' || v_period_end::text || '.'
  FROM public.business_members bm
  WHERE bm.user_id = v_user_id AND bm.role = 'owner';

  RETURN jsonb_build_object(
    'success', true,
    'subscription_id', v_sub_id,
    'plan_id', v_plan_id,
    'cancel_at_period_end', true,
    'current_period_end', v_period_end::text
  );
END;
$$;

-- 7. Revoke execution on future public functions by default
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;
