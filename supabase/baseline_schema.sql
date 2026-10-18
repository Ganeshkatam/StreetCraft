-- ============================================================================
-- StreetCraft Database: Baseline Schema Export (Public & Storage)
-- Captured: 2026-10-19 (Step 0 Baseline before Brief 1)
-- Project: iodwiyfjwzdvqtrczttb
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. BASE TABLES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT ''::text,
  avatar_url text DEFAULT ''::text,
  phone text DEFAULT ''::text,
  notification_preferences jsonb NOT NULL DEFAULT '{"email": true, "whatsapp": false, "weekly_digest": true}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  timezone text NOT NULL DEFAULT 'Asia/Kolkata'::text
);

CREATE TABLE IF NOT EXISTS public.business_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'owner'::text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT business_members_business_id_user_id_key UNIQUE (business_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.business_profiles (
  business_id uuid PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  neighborhood text NOT NULL DEFAULT ''::text,
  city text NOT NULL DEFAULT ''::text,
  landmarks text DEFAULT ''::text,
  target_customer text DEFAULT ''::text,
  style_voice text DEFAULT ''::text,
  signature_items text DEFAULT ''::text,
  primary_goal text DEFAULT ''::text,
  peak_hours text DEFAULT ''::text,
  slow_hours text DEFAULT ''::text,
  default_offer text DEFAULT ''::text,
  avg_ticket_inr integer,
  target_monthly_customers integer,
  phone_whatsapp text DEFAULT ''::text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  logo_url text
);

CREATE TABLE IF NOT EXISTS public.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  monthly_campaign_limit integer NOT NULL,
  monthly_inr integer NOT NULL,
  channels text[] NOT NULL DEFAULT '{GOOGLE_BUSINESS,INSTAGRAM,WHATSAPP,IN_STORE_POSTER}'::text[],
  features text[] NOT NULL DEFAULT '{}'::text[],
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  business_limit integer NOT NULL DEFAULT 2,
  annual_price_inr integer NOT NULL DEFAULT 0,
  quarterly_price_inr integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.plans(id),
  provider text NOT NULL DEFAULT 'RAZORPAY'::text,
  provider_subscription_id text,
  status text NOT NULL DEFAULT 'ACTIVE'::text,
  billing_cycle text NOT NULL DEFAULT 'monthly'::text,
  current_period_start date NOT NULL,
  current_period_end date NOT NULL,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  cancellation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.usage_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  plan text NOT NULL DEFAULT 'FREE'::text,
  campaign_limit integer NOT NULL DEFAULT 3,
  campaigns_used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_business_period UNIQUE (business_id, period_start)
);

CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  type text NOT NULL,
  objective text NOT NULL,
  audience text NOT NULL DEFAULT ''::text,
  offer jsonb NOT NULL DEFAULT '{}'::jsonb,
  schedule jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'DRAFT'::text,
  performance_notes text DEFAULT ''::text,
  claim_token uuid,
  error_message text,
  generation_revision integer NOT NULL DEFAULT 0,
  generation_request_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.campaign_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  channel text NOT NULL,
  content jsonb NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  validation_status text NOT NULL DEFAULT 'VALID'::text,
  status text NOT NULL DEFAULT 'ready'::text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campaign_outputs_campaign_id_channel_key UNIQUE (campaign_id, channel)
);

CREATE TABLE IF NOT EXISTS public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL DEFAULT 'CAMPAIGN_GENERATION'::text,
  units integer NOT NULL DEFAULT 1,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  description text DEFAULT ''::text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.provider_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'RECEIVED'::text,
  attempt_count integer NOT NULL DEFAULT 0,
  received_at timestamptz NOT NULL DEFAULT now(),
  error_message text,
  CONSTRAINT provider_events_provider_event_id_key UNIQUE (provider, provider_event_id)
);

CREATE TABLE IF NOT EXISTS public.festival_calendar (
  id text PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  name text NOT NULL,
  region text NOT NULL DEFAULT 'National'::text,
  starts_at date NOT NULL,
  ends_at date NOT NULL,
  marketing_relevance text NOT NULL DEFAULT 'General Celebrations'::text,
  suggested_offer text DEFAULT ''::text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.founder_allocation (
  id integer PRIMARY KEY,
  total_slots integer NOT NULL DEFAULT 100,
  claimed_slots integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.founder_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  billing_cycle text NOT NULL,
  CONSTRAINT founder_claims_user_id_key UNIQUE (user_id)
);

-- ----------------------------------------------------------------------------
-- 2. INDEXES
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_business_members_biz ON public.business_members USING btree (business_id);
CREATE INDEX IF NOT EXISTS idx_business_members_user_biz ON public.business_members USING btree (user_id, business_id);
CREATE INDEX IF NOT EXISTS idx_campaign_outputs_campaign ON public.campaign_outputs USING btree (campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_business_created ON public.campaigns USING btree (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_claim_token ON public.campaigns USING btree (claim_token);
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_generation_request_id ON public.campaigns USING btree (generation_request_id) WHERE (generation_request_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_festival_calendar_dates ON public.festival_calendar USING btree (starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions USING btree (plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions USING btree (user_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_active_per_user_idx ON public.subscriptions USING btree (user_id) WHERE (status = ANY (ARRAY['ACTIVE'::text, 'TRIALING'::text]));
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_provider_subscription_unique ON public.subscriptions USING btree (provider, provider_subscription_id) WHERE (provider_subscription_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_usage_events_biz ON public.usage_events USING btree (business_id, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_events_campaign_id ON public.usage_events USING btree (campaign_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON public.usage_events USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_usage_periods_biz ON public.usage_periods USING btree (business_id, period_start, period_end);

-- ----------------------------------------------------------------------------
-- 3. FUNCTIONS & STORED PROCEDURES
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
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

CREATE OR REPLACE FUNCTION public.sync_business_name_and_category()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.businesses
  SET name = NEW.name, category = NEW.category
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_unconfirmed_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  DELETE FROM auth.users
  WHERE email_confirmed_at IS NULL
    AND confirmed_at IS NULL
    AND created_at < (NOW() - INTERVAL '1 hour');
END;
$$;

CREATE OR REPLACE FUNCTION public.get_plan_expected_amount_paise(p_plan_id text, p_billing_cycle text)
RETURNS bigint
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_plan text := UPPER(TRIM(COALESCE(p_plan_id, '')));
  v_cycle text := LOWER(TRIM(COALESCE(p_billing_cycle, '')));
BEGIN
  IF v_plan = 'PRO' THEN
    IF v_cycle = 'monthly' THEN RETURN 39900;
    ELSIF v_cycle = 'quarterly' THEN RETURN 109900;
    ELSIF v_cycle = 'annual' THEN RETURN 399000;
    END IF;
  ELSIF v_plan = 'GROWTH' THEN
    IF v_cycle = 'monthly' THEN RETURN 79900;
    ELSIF v_cycle = 'quarterly' THEN RETURN 219900;
    ELSIF v_cycle = 'annual' THEN RETURN 799000;
    END IF;
  ELSIF v_plan = 'FOUNDER' THEN
    IF v_cycle = 'quarterly' THEN RETURN 83700;
    ELSIF v_cycle = 'annual' THEN RETURN 279000;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.is_business_member(target_biz_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = target_biz_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.create_business_atomically(
  p_name text,
  p_category text,
  p_neighborhood text,
  p_city text,
  p_phone text DEFAULT ''::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    INSERT INTO public.profiles (id, email, full_name)
    SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
    FROM auth.users
    WHERE id = v_user_id
    ON CONFLICT (id) DO NOTHING;
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
    business_id, name, category, neighborhood, city, phone_whatsapp
  ) VALUES (
    v_business_id, p_name, p_category, p_neighborhood, p_city, p_phone
  );

  INSERT INTO public.usage_periods (
    business_id, period_start, period_end, plan, campaign_limit, campaigns_used
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
    'name', p_name,
    'category', p_category,
    'neighborhood', p_neighborhood,
    'city', p_city,
    'phone_whatsapp', p_phone,
    'plan', v_current_plan,
    'role', 'owner',
    'created_at', CURRENT_TIMESTAMP
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_business_atomically(p_business_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.claim_founder_tier(p_billing_cycle text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    user_id, plan_id, status, billing_cycle, provider, current_period_start, current_period_end
  ) VALUES (
    v_user_id, 'FOUNDER', 'ACTIVE', LOWER(p_billing_cycle), 'FOUNDER_OFFER',
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

CREATE OR REPLACE FUNCTION public.confirm_payment_and_activate_subscription(
  p_payment_provider text,
  p_payment_id text,
  p_order_id text,
  p_plan_id text,
  p_billing_cycle text,
  p_user_id uuid,
  p_amount_paise bigint
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_plan_limit INT;
  v_biz_limit INT;
  v_period_interval INTERVAL;
  v_period_end DATE;
  v_normalized_plan TEXT;
  v_normalized_cycle TEXT;
  v_expected_amount BIGINT;
  v_existing_sub RECORD;
  v_other_user_sub UUID;
  v_new_sub_id UUID;
BEGIN
  v_user_id := COALESCE(auth.uid(), p_user_id);
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be authenticated or user_id provided.' USING ERRCODE = 'P0001';
  END IF;

  IF auth.uid() IS NOT NULL AND p_user_id IS NOT NULL AND auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'FORBIDDEN: Cannot activate subscription for another user.' USING ERRCODE = 'P0001';
  END IF;

  IF p_payment_id IS NULL OR TRIM(p_payment_id) = '' THEN
    RAISE EXCEPTION 'INVALID_PAYMENT: Payment reference ID is required.' USING ERRCODE = 'P0001';
  END IF;

  v_normalized_plan := UPPER(TRIM(COALESCE(p_plan_id, '')));
  v_normalized_cycle := LOWER(TRIM(COALESCE(p_billing_cycle, '')));

  IF v_normalized_plan NOT IN ('PRO', 'GROWTH', 'FOUNDER') THEN
    RAISE EXCEPTION 'INVALID_PLAN: Plan % is not a valid billable subscription tier.', v_normalized_plan USING ERRCODE = 'P0001';
  END IF;

  IF v_normalized_cycle NOT IN ('monthly', 'quarterly', 'annual') THEN
    RAISE EXCEPTION 'INVALID_CYCLE: Billing cycle must be monthly, quarterly, or annual.' USING ERRCODE = 'P0001';
  END IF;

  IF p_amount_paise IS NULL OR p_amount_paise <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT: Payment amount in paise is mandatory and must be positive.' USING ERRCODE = 'P0001';
  END IF;

  v_expected_amount := public.get_plan_expected_amount_paise(v_normalized_plan, v_normalized_cycle);
  IF v_expected_amount IS NULL OR p_amount_paise != v_expected_amount THEN
    RAISE EXCEPTION 'AMOUNT_MISMATCH: Provided payment amount % paise does not match required price % paise for plan % (%).',
      p_amount_paise, COALESCE(v_expected_amount, 0), v_normalized_plan, v_normalized_cycle USING ERRCODE = 'P0001';
  END IF;

  SELECT id INTO v_other_user_sub
  FROM public.subscriptions
  WHERE provider = LOWER(TRIM(p_payment_provider))
    AND provider_subscription_id = TRIM(p_payment_id)
    AND user_id != v_user_id
  LIMIT 1;

  IF v_other_user_sub IS NOT NULL THEN
    RAISE EXCEPTION 'PAYMENT_ALREADY_CLAIMED: This payment reference is already attached to another account.' USING ERRCODE = 'P0001';
  END IF;

  SELECT id, status, plan_id, billing_cycle, current_period_end 
  INTO v_existing_sub
  FROM public.subscriptions
  WHERE provider = LOWER(TRIM(p_payment_provider))
    AND provider_subscription_id = TRIM(p_payment_id)
    AND user_id = v_user_id;

  IF v_existing_sub.id IS NOT NULL THEN
    IF v_existing_sub.status = 'CANCELLED' THEN
      RAISE EXCEPTION 'PAYMENT_ALREADY_EXPIRED: Payment reference belongs to a cancelled subscription and cannot be reused.' USING ERRCODE = 'P0001';
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
    IF EXISTS (SELECT 1 FROM public.founder_claims WHERE user_id = v_user_id) THEN
      RAISE EXCEPTION 'FOUNDER_ALREADY_CLAIMED: One Founder claim per account.' USING ERRCODE = 'P0001';
    END IF;

    UPDATE public.founder_allocation
    SET claimed_slots = claimed_slots + 1
    WHERE id = 1 AND claimed_slots < total_slots;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'FOUNDER_SOLD_OUT: All Founder slots are fully allocated.' USING ERRCODE = 'P0001';
    END IF;

    INSERT INTO public.founder_claims (user_id, billing_cycle)
    VALUES (v_user_id, v_normalized_cycle);
  END IF;

  UPDATE public.subscriptions
  SET status = 'CANCELLED', updated_at = now()
  WHERE user_id = v_user_id AND status = 'ACTIVE';

  INSERT INTO public.subscriptions (
    user_id, plan_id, provider, provider_subscription_id, status, billing_cycle,
    current_period_start, current_period_end, created_at, updated_at
  ) VALUES (
    v_user_id, v_normalized_plan, LOWER(TRIM(p_payment_provider)), TRIM(p_payment_id),
    'ACTIVE', v_normalized_cycle, CURRENT_DATE, v_period_end, NOW(), NOW()
  ) RETURNING id INTO v_new_sub_id;

  UPDATE public.usage_periods
  SET 
    plan = v_normalized_plan,
    campaign_limit = v_plan_limit,
    updated_at = NOW()
  WHERE business_id IN (
    SELECT business_id FROM public.business_members 
    WHERE user_id = v_user_id AND role = 'owner'
  )
  AND period_end >= CURRENT_DATE;

  INSERT INTO public.usage_events (
    business_id, user_id, event_type, units, description
  ) 
  SELECT 
    bm.business_id, v_user_id, 'SUBSCRIPTION_RESET', 1,
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

  IF NOT public.is_business_admin(p_business_id) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: User must be an owner or admin of the business to claim campaigns.' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.campaigns
  SET 
    business_id = p_business_id,
    claim_token = NULL,
    updated_at = NOW()
  WHERE claim_token::text = p_claim_token 
    AND business_id IS NULL
  RETURNING id INTO v_campaign_id;

  IF v_campaign_id IS NULL THEN
    RETURN FALSE;
  END IF;

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

  UPDATE public.usage_periods
  SET campaigns_used = campaigns_used + 1
  WHERE id = v_usage_period_id;

  INSERT INTO public.usage_events (
    business_id, user_id, event_type, units, campaign_id, description
  ) VALUES (
    p_business_id, v_user_id, 'CAMPAIGN_GENERATION', 1, v_campaign_id, 'Claimed campaign from free tool.'
  );

  RETURN TRUE;
END;
$$;

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
  p_poster_content jsonb,
  p_generation_request_id uuid DEFAULT NULL::uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    RAISE EXCEPTION 'UNAUTHORIZED: Caller must be authenticated.' USING ERRCODE = 'P0001';
  END IF;

  IF p_business_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_BUSINESS: Cannot create a campaign without a valid business. Please select or create a business first.' USING ERRCODE = 'P0001';
  END IF;

  IF NOT public.is_business_member(p_business_id, v_user_id) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: User is not a member of this business.' USING ERRCODE = 'P0001';
  END IF;

  IF p_generation_request_id IS NOT NULL THEN
    SELECT id INTO v_campaign_id
    FROM public.campaigns
    WHERE generation_request_id = p_generation_request_id
      AND business_id = p_business_id;

    IF v_campaign_id IS NOT NULL THEN
      SELECT campaigns_used, campaign_limit INTO v_campaigns_used, v_campaign_limit
      FROM public.usage_periods
      WHERE business_id = p_business_id
        AND period_start <= CURRENT_DATE
        AND period_end >= CURRENT_DATE;

      RETURN jsonb_build_object(
        'campaign_id', v_campaign_id,
        'status', 'READY',
        'campaigns_used', COALESCE(v_campaigns_used, 0),
        'campaign_limit', COALESCE(v_campaign_limit, 3),
        'idempotent_replay', true
      );
    END IF;
  END IF;

  IF p_google_content IS NULL OR p_google_content = '{}'::jsonb OR
     p_instagram_content IS NULL OR p_instagram_content = '{}'::jsonb OR
     p_whatsapp_content IS NULL OR p_whatsapp_content = '{}'::jsonb OR
     p_poster_content IS NULL OR p_poster_content = '{}'::jsonb THEN
    RAISE EXCEPTION 'INCOMPLETE_CAMPAIGN_PACK: All four channel payloads are required.' USING ERRCODE = 'P0001';
  END IF;

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

  UPDATE public.usage_periods
  SET campaigns_used = campaigns_used + 1
  WHERE id = v_usage_period_id;
  
  v_campaigns_used := v_campaigns_used + 1;

  BEGIN
    INSERT INTO public.campaigns (
      business_id, type, objective, audience, offer, schedule, status, generation_request_id
    ) VALUES (
      p_business_id, p_campaign_type, p_objective, COALESCE(p_audience, ''),
      COALESCE(p_offer, '{}'::jsonb), COALESCE(p_schedule, '{}'::jsonb), 'READY', p_generation_request_id
    ) RETURNING id INTO v_campaign_id;
  EXCEPTION WHEN unique_violation THEN
    IF p_generation_request_id IS NOT NULL THEN
      UPDATE public.usage_periods
      SET campaigns_used = campaigns_used - 1
      WHERE id = v_usage_period_id;

      SELECT id INTO v_campaign_id
      FROM public.campaigns
      WHERE generation_request_id = p_generation_request_id;

      RETURN jsonb_build_object(
        'campaign_id', v_campaign_id,
        'status', 'READY',
        'campaigns_used', v_campaigns_used - 1,
        'campaign_limit', v_campaign_limit,
        'idempotent_replay', true
      );
    ELSE
      RAISE;
    END IF;
  END;

  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
  VALUES (v_campaign_id, 'GOOGLE_BUSINESS', p_google_content, 'VALID')
  ON CONFLICT (campaign_id, channel) DO UPDATE SET content = EXCLUDED.content;

  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
  VALUES (v_campaign_id, 'INSTAGRAM', p_instagram_content, 'VALID')
  ON CONFLICT (campaign_id, channel) DO UPDATE SET content = EXCLUDED.content;

  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
  VALUES (v_campaign_id, 'WHATSAPP', p_whatsapp_content, 'VALID')
  ON CONFLICT (campaign_id, channel) DO UPDATE SET content = EXCLUDED.content;

  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
  VALUES (v_campaign_id, 'IN_STORE_POSTER', p_poster_content, 'VALID')
  ON CONFLICT (campaign_id, channel) DO UPDATE SET content = EXCLUDED.content;

  INSERT INTO public.usage_events (
    business_id, user_id, event_type, units, campaign_id, description
  ) VALUES (
    p_business_id, v_user_id, 'CAMPAIGN_GENERATION', 1, v_campaign_id, 'Generated and saved complete storefront campaign.'
  );

  RETURN jsonb_build_object(
    'campaign_id', v_campaign_id,
    'status', 'READY',
    'campaigns_used', v_campaigns_used,
    'campaign_limit', v_campaign_limit,
    'idempotent_replay', false
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. TRIGGERS
-- ----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS on_profile_updated ON public.business_profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_sync_business_name_and_category ON public.business_profiles;
CREATE TRIGGER trg_sync_business_name_and_category
  AFTER UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_business_name_and_category();

DROP TRIGGER IF EXISTS on_campaign_updated ON public.campaigns;
CREATE TRIGGER on_campaign_updated
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festival_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_allocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_periods ENABLE ROW LEVEL SECURITY;

-- business_members
DROP POLICY IF EXISTS business_members_select ON public.business_members;
CREATE POLICY business_members_select ON public.business_members FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR is_business_member(business_id, auth.uid()));

DROP POLICY IF EXISTS business_members_insert ON public.business_members;
CREATE POLICY business_members_insert ON public.business_members FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.business_members bm WHERE bm.business_id = business_members.business_id AND bm.user_id = auth.uid() AND bm.role IN ('owner', 'admin')));

DROP POLICY IF EXISTS business_members_update ON public.business_members;
CREATE POLICY business_members_update ON public.business_members FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.business_members bm WHERE bm.business_id = business_members.business_id AND bm.user_id = auth.uid() AND bm.role IN ('owner', 'admin')));

DROP POLICY IF EXISTS business_members_delete ON public.business_members;
CREATE POLICY business_members_delete ON public.business_members FOR DELETE TO authenticated
  USING ((user_id = auth.uid()) OR (EXISTS (SELECT 1 FROM public.business_members bm WHERE bm.business_id = business_members.business_id AND bm.user_id = auth.uid() AND bm.role = 'owner')));

-- business_profiles
DROP POLICY IF EXISTS business_profiles_select ON public.business_profiles;
CREATE POLICY business_profiles_select ON public.business_profiles FOR SELECT TO authenticated
  USING (is_business_member(business_id, auth.uid()));

DROP POLICY IF EXISTS business_profiles_insert ON public.business_profiles;
CREATE POLICY business_profiles_insert ON public.business_profiles FOR INSERT TO authenticated
  WITH CHECK (is_business_member(business_id, auth.uid()));

DROP POLICY IF EXISTS business_profiles_update ON public.business_profiles;
CREATE POLICY business_profiles_update ON public.business_profiles FOR UPDATE TO authenticated
  USING (is_business_member(business_id, auth.uid()))
  WITH CHECK (is_business_member(business_id, auth.uid()));

-- businesses
DROP POLICY IF EXISTS businesses_select ON public.businesses;
CREATE POLICY businesses_select ON public.businesses FOR SELECT TO authenticated
  USING (is_business_member(id, auth.uid()));

DROP POLICY IF EXISTS businesses_update ON public.businesses;
CREATE POLICY businesses_update ON public.businesses FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.business_members bm WHERE bm.business_id = businesses.id AND bm.user_id = auth.uid() AND bm.role IN ('owner', 'admin')));

-- campaigns
DROP POLICY IF EXISTS campaigns_select ON public.campaigns;
CREATE POLICY campaigns_select ON public.campaigns FOR SELECT TO public
  USING ((claim_token IS NOT NULL) OR ((business_id IS NOT NULL) AND (auth.uid() IS NOT NULL) AND is_business_member(business_id, auth.uid())));

DROP POLICY IF EXISTS campaigns_insert ON public.campaigns;
CREATE POLICY campaigns_insert ON public.campaigns FOR INSERT TO public
  WITH CHECK ((business_id IS NULL) AND (claim_token IS NOT NULL));

DROP POLICY IF EXISTS campaigns_update ON public.campaigns;
CREATE POLICY campaigns_update ON public.campaigns FOR UPDATE TO authenticated
  USING ((business_id IS NOT NULL) AND is_business_member(business_id, auth.uid()));

DROP POLICY IF EXISTS campaigns_delete ON public.campaigns;
CREATE POLICY campaigns_delete ON public.campaigns FOR DELETE TO authenticated
  USING ((business_id IS NOT NULL) AND is_business_member(business_id, auth.uid()));

-- campaign_outputs
DROP POLICY IF EXISTS campaign_outputs_select ON public.campaign_outputs;
CREATE POLICY campaign_outputs_select ON public.campaign_outputs FOR SELECT TO public
  USING (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_outputs.campaign_id AND ((c.claim_token IS NOT NULL) OR ((c.business_id IS NOT NULL) AND (auth.uid() IS NOT NULL) AND is_business_member(c.business_id, auth.uid())))));

DROP POLICY IF EXISTS campaign_outputs_insert ON public.campaign_outputs;
CREATE POLICY campaign_outputs_insert ON public.campaign_outputs FOR INSERT TO public
  WITH CHECK (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_outputs.campaign_id AND (c.business_id IS NULL) AND (c.claim_token IS NOT NULL)));

DROP POLICY IF EXISTS campaign_outputs_update ON public.campaign_outputs;
CREATE POLICY campaign_outputs_update ON public.campaign_outputs FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_outputs.campaign_id AND c.business_id IS NOT NULL AND is_business_member(c.business_id, auth.uid())));

DROP POLICY IF EXISTS campaign_outputs_delete ON public.campaign_outputs;
CREATE POLICY campaign_outputs_delete ON public.campaign_outputs FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_outputs.campaign_id AND c.business_id IS NOT NULL AND is_business_member(c.business_id, auth.uid())));

-- festival_calendar, founder_allocation, founder_claims, plans
DROP POLICY IF EXISTS festival_calendar_select ON public.festival_calendar;
CREATE POLICY festival_calendar_select ON public.festival_calendar FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS founder_allocation_select ON public.founder_allocation;
CREATE POLICY founder_allocation_select ON public.founder_allocation FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS founder_claims_select ON public.founder_claims;
CREATE POLICY founder_claims_select ON public.founder_claims FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS plans_select ON public.plans;
CREATE POLICY plans_select ON public.plans FOR SELECT TO public USING (active = true);

-- profiles
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- provider_events
DROP POLICY IF EXISTS "Deny client access to provider events" ON public.provider_events;
CREATE POLICY "Deny client access to provider events" ON public.provider_events FOR ALL TO anon, authenticated USING (false);

-- subscriptions, usage_events, usage_periods
DROP POLICY IF EXISTS subscriptions_select ON public.subscriptions;
CREATE POLICY subscriptions_select ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS usage_events_select ON public.usage_events;
CREATE POLICY usage_events_select ON public.usage_events FOR SELECT TO authenticated USING (is_business_member(business_id, auth.uid()));

DROP POLICY IF EXISTS usage_periods_select ON public.usage_periods;
CREATE POLICY usage_periods_select ON public.usage_periods FOR SELECT TO authenticated USING (is_business_member(business_id, auth.uid()));

-- storage.objects policies
DROP POLICY IF EXISTS "Allow authenticated delete on storefronts bucket" ON storage.objects;
CREATE POLICY "Allow authenticated delete on storefronts bucket" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'storefronts' AND (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' AND public.is_business_admin(((storage.foldername(name))[1])::uuid));

DROP POLICY IF EXISTS "Allow authenticated update on storefronts bucket" ON storage.objects;
CREATE POLICY "Allow authenticated update on storefronts bucket" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'storefronts' AND (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' AND public.is_business_admin(((storage.foldername(name))[1])::uuid))
  WITH CHECK (bucket_id = 'storefronts' AND (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' AND public.is_business_admin(((storage.foldername(name))[1])::uuid));

DROP POLICY IF EXISTS "Allow authenticated upload on storefronts bucket" ON storage.objects;
CREATE POLICY "Allow authenticated upload on storefronts bucket" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'storefronts' AND (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$' AND public.is_business_admin(((storage.foldername(name))[1])::uuid));

DROP POLICY IF EXISTS "Allow public read access on storefronts bucket" ON storage.objects;
CREATE POLICY "Allow public read access on storefronts bucket" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'storefronts');

-- ----------------------------------------------------------------------------
-- 6. PERMISSIONS & GRANTS
-- ----------------------------------------------------------------------------

REVOKE EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(text,text,text,text,text,uuid,bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_founder_tier(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_unconfirmed_users() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.process_expired_subscriptions() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reconcile_provider_event(text,text,text,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_provider_event(text,text,text,jsonb) TO service_role;

GRANT EXECUTE ON FUNCTION public.create_business_atomically(text,text,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_business_atomically(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_anonymous_campaign(text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_subscription_cancellation() TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_subscription_cancellation(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_campaign_atomically(uuid,text,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.save_campaign_atomically(uuid,text,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,uuid) FROM PUBLIC, anon;

-- Table permissions
REVOKE ALL ON public.subscriptions FROM anon, authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;

REVOKE ALL ON public.usage_periods FROM anon, authenticated;
GRANT SELECT ON public.usage_periods TO authenticated;

REVOKE ALL ON public.usage_events FROM anon, authenticated;
GRANT SELECT ON public.usage_events TO authenticated;

REVOKE ALL ON public.provider_events FROM anon, authenticated;

REVOKE INSERT, DELETE ON public.businesses FROM anon, authenticated;
GRANT SELECT, UPDATE ON public.businesses TO authenticated;
