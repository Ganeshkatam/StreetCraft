-- ============================================================================
-- STREETCRAFT BETA 01 COMMERCIAL & SECURITY FREEZE MIGRATION
-- 1. Remove direct client INSERT on businesses (enforce create_business_atomically)
-- 2. Remove direct client INSERT/UPDATE/DELETE on usage_periods and usage_events
-- 3. Remove reset_test_user_state test function from production
-- 4. Consolidate payment RPC to single canonical confirm_payment_and_activate_subscription
-- 5. Add payment idempotency unique index on subscriptions
-- 6. Canonicalize save_campaign_atomically and clean return JSON contract
-- 7. Rename usage_periods constraint to check_campaigns_used_non_negative
-- 8. Enforce least-privilege table and RPC permissions
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. REMOVE DIRECT BUSINESS INSERT (Enforce RPC Authority)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "businesses_insert" ON public.businesses;
DROP POLICY IF EXISTS "businesses_update" ON public.businesses;
DROP POLICY IF EXISTS "businesses_select" ON public.businesses;

-- Only SELECT is permitted directly; creation/updates are routed via RPC
CREATE POLICY "businesses_select" ON public.businesses 
  FOR SELECT TO authenticated 
  USING (public.is_business_member(id, auth.uid()));

CREATE POLICY "businesses_update" ON public.businesses 
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.business_members bm 
      WHERE bm.business_id = businesses.id AND bm.user_id = auth.uid() AND bm.role IN ('owner', 'admin')
    )
  );

REVOKE INSERT, DELETE ON public.businesses FROM authenticated, anon, public;

-- ----------------------------------------------------------------------------
-- 2. REMOVE DIRECT USAGE & AUDIT LEDGER MUTATIONS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "usage_periods_insert" ON public.usage_periods;
DROP POLICY IF EXISTS "usage_periods_update" ON public.usage_periods;
DROP POLICY IF EXISTS "usage_periods_select" ON public.usage_periods;
DROP POLICY IF EXISTS "usage_events_insert" ON public.usage_events;
DROP POLICY IF EXISTS "usage_events_select" ON public.usage_events;

-- Clients can only read usage state; mutations strictly happen via SECURITY DEFINER RPCs
CREATE POLICY "usage_periods_select" ON public.usage_periods 
  FOR SELECT TO authenticated 
  USING (public.is_business_member(business_id, auth.uid()));

CREATE POLICY "usage_events_select" ON public.usage_events 
  FOR SELECT TO authenticated 
  USING (public.is_business_member(business_id, auth.uid()));

REVOKE INSERT, UPDATE, DELETE ON public.usage_periods FROM authenticated, anon, public;
REVOKE INSERT, UPDATE, DELETE ON public.usage_events FROM authenticated, anon, public;

-- ----------------------------------------------------------------------------
-- 3. RENAME USAGE CONSTRAINT
-- ----------------------------------------------------------------------------
ALTER TABLE public.usage_periods DROP CONSTRAINT IF EXISTS check_packs_used_non_negative;
ALTER TABLE public.usage_periods DROP CONSTRAINT IF EXISTS check_campaigns_used_non_negative;
ALTER TABLE public.usage_periods ADD CONSTRAINT check_campaigns_used_non_negative CHECK (campaigns_used >= 0);

-- ----------------------------------------------------------------------------
-- 4. DROP TEST & DUPLICATE FUNCTIONS
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.reset_test_user_state();
DROP FUNCTION IF EXISTS public.confirm_gateway_payment_atomically(TEXT, TEXT, TEXT, TEXT, TEXT);

-- ----------------------------------------------------------------------------
-- 5. PAYMENT IDEMPOTENCY INVARIANT & CANONICAL RPC
-- ----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_provider_payment_id_unique
ON public.subscriptions (provider, provider_subscription_id)
WHERE provider_subscription_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.confirm_payment_and_activate_subscription(
  p_payment_provider TEXT,
  p_payment_id TEXT,
  p_order_id TEXT,
  p_plan_id TEXT,
  p_billing_cycle TEXT
) RETURNS JSONB
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
  v_existing_sub_id UUID;
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

  -- 1. Idempotency Check: if this exact payment ID was already processed, return existing active subscription
  SELECT id INTO v_existing_sub_id
  FROM public.subscriptions
  WHERE provider = LOWER(TRIM(p_payment_provider))
    AND provider_subscription_id = TRIM(p_payment_id)
    AND user_id = v_user_id;

  IF v_existing_sub_id IS NOT NULL THEN
    SELECT monthly_campaign_limit, business_limit 
    INTO v_plan_limit, v_biz_limit
    FROM public.plans WHERE id = v_normalized_plan;

    RETURN jsonb_build_object(
      'success', true,
      'idempotent_replay', true,
      'subscription_id', v_existing_sub_id,
      'plan', v_normalized_plan,
      'billing_cycle', v_normalized_cycle,
      'status', 'ACTIVE',
      'business_limit', v_biz_limit,
      'monthly_campaign_limit', v_plan_limit
    );
  END IF;

  -- 2. Validate plan existence
  IF NOT EXISTS (SELECT 1 FROM public.plans WHERE id = v_normalized_plan AND active = true) THEN
    RAISE EXCEPTION 'INVALID_PLAN: Plan % does not exist.', v_normalized_plan;
  END IF;

  -- 3. Validate cycle
  IF v_normalized_cycle NOT IN ('monthly', 'quarterly', 'annual') THEN
    RAISE EXCEPTION 'INVALID_CYCLE: Billing cycle must be monthly, quarterly, or annual.';
  END IF;

  -- 4. Fetch plan parameters
  SELECT monthly_campaign_limit, business_limit 
  INTO v_plan_limit, v_biz_limit
  FROM public.plans 
  WHERE id = v_normalized_plan;

  -- 5. Compute period duration
  v_period_interval := CASE 
    WHEN v_normalized_cycle = 'monthly' THEN interval '1 month'
    WHEN v_normalized_cycle = 'quarterly' THEN interval '3 months'
    ELSE interval '1 year'
  END;

  v_period_end := (CURRENT_DATE + v_period_interval)::date;

  -- 6. Founder plan allocation & claims check
  IF v_normalized_plan = 'FOUNDER' THEN
    IF v_normalized_cycle NOT IN ('quarterly', 'annual') THEN
      RAISE EXCEPTION 'INVALID_FOUNDER_CYCLE: Founder tier requires quarterly or annual billing.';
    END IF;

    IF EXISTS (SELECT 1 FROM public.founder_claims WHERE user_id = v_user_id) THEN
      RAISE EXCEPTION 'FOUNDER_ALREADY_CLAIMED: One Founder claim per account.';
    END IF;

    -- Lock and increment allocation
    UPDATE public.founder_allocation
    SET claimed_slots = claimed_slots + 1
    WHERE id = 1 AND claimed_slots < total_slots;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'FOUNDER_SOLD_OUT: All Founder slots are fully allocated.';
    END IF;

    INSERT INTO public.founder_claims (user_id, billing_cycle)
    VALUES (v_user_id, v_normalized_cycle);
  END IF;

  -- 7. Archive prior active subscriptions to preserve unique active index
  UPDATE public.subscriptions
  SET status = 'CANCELLED', updated_at = now()
  WHERE user_id = v_user_id AND status = 'ACTIVE';

  -- 8. Insert new active subscription
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

  -- 9. Update active usage periods for businesses owned by this user
  UPDATE public.usage_periods
  SET 
    plan = v_normalized_plan,
    campaign_limit = v_plan_limit
  WHERE business_id IN (
    SELECT business_id FROM public.business_members 
    WHERE user_id = v_user_id AND role = 'owner'
  )
  AND period_end >= CURRENT_DATE;

  -- 10. Record billing audit event
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

-- ----------------------------------------------------------------------------
-- 6. CANONICAL save_campaign_atomically & CONTRACT CLEANUP
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.save_campaign_atomically(
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
    'campaign_limit', v_campaign_limit
  );
END;
$$;

-- Backward compatibility wrapper for save_campaign_pack_atomically
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

-- ----------------------------------------------------------------------------
-- 7. RE-APPLY LEAST PRIVILEGE EXECUTE GRANTS
-- ----------------------------------------------------------------------------
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM public, anon;

GRANT EXECUTE ON FUNCTION public.is_business_member(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_business_member(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_business_atomically(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_campaign_atomically(UUID, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB, JSONB, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_campaign_pack_atomically(UUID, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB, JSONB, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_founder_tier(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_payment_and_activate_subscription(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_user_subscription() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_anonymous_campaign(TEXT, UUID) TO authenticated;
