-- StreetCraft Commercial Limits & Founder Claiming Migration
-- Migration: 20260817000001_streetcraft_commercial_limits_and_founder_rpc.sql

-- 1. Enforce Business Limits in create_business_atomically
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
  v_biz_limit INT := 2;
  v_current_biz_count INT := 0;
  v_plan_id TEXT := 'FREE';
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated.';
  END IF;

  -- Fetch user's active plan limit
  SELECT s.plan_id, p.business_limit, p.monthly_pack_limit 
  INTO v_plan_id, v_biz_limit, v_plan_limit
  FROM public.subscriptions s
  JOIN public.plans p ON p.id = s.plan_id
  WHERE s.user_id = v_user_id
    AND s.status IN ('ACTIVE', 'TRIALING')
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF v_biz_limit IS NULL THEN
    v_biz_limit := 2; -- Default Free tier limit
    v_plan_limit := 3;
    v_plan_id := 'FREE';
  END IF;

  -- Count current businesses owned
  SELECT count(*) INTO v_current_biz_count
  FROM public.business_members
  WHERE user_id = v_user_id AND role = 'owner';

  IF v_current_biz_count >= v_biz_limit THEN
    RAISE EXCEPTION 'BUSINESS_LIMIT_REACHED: Your current plan (%s) allows up to % businesses. You currently own %.', v_plan_id, v_biz_limit, v_current_biz_count;
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

  -- 4. Insert Usage Period for current cycle
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
    v_plan_id,
    v_plan_limit,
    0
  ) ON CONFLICT (business_id, period_start) DO NOTHING;

  RETURN jsonb_build_object(
    'business_id', v_business_id,
    'name', p_name,
    'role', 'owner',
    'plan', v_plan_id,
    'business_count', v_current_biz_count + 1,
    'business_limit', v_biz_limit
  );
END;
$$;

-- 2. Atomic Founder Claim RPC
CREATE OR REPLACE FUNCTION public.claim_founder_tier(p_billing_cycle TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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
  IF UPPER(p_billing_cycle) NOT IN ('QUARTERLY', 'ANNUAL') THEN
    RAISE EXCEPTION 'Invalid billing cycle: Founder tier requires QUARTERLY or ANNUAL billing.';
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
  VALUES (v_user_id, UPPER(p_billing_cycle));

  -- Insert/update subscription
  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    v_user_id,
    'FOUNDER',
    'ACTIVE',
    CURRENT_DATE,
    (CURRENT_DATE + CASE WHEN LOWER(p_billing_cycle) = 'quarterly' THEN interval '3 months' ELSE interval '1 year' END)::date
  );

  RETURN jsonb_build_object(
    'success', true,
    'claimed_slots', v_claimed_count + 1,
    'total_slots', v_total_slots,
    'plan', 'FOUNDER',
    'billing_cycle', UPPER(p_billing_cycle)
  );
END;
$$;
