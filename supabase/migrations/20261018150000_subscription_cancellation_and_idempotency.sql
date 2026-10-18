-- Migration: 20261018150000_subscription_cancellation_and_idempotency.sql
-- Description:
-- 1. Add cancellation_reason to public.subscriptions
-- 2. Add generation_request_id and unique index to public.campaigns
-- 3. Replace request_subscription_cancellation with targeted parameters (p_subscription_id, p_reason)
-- 4. Replace save_campaign_atomically with idempotency parameter (p_generation_request_id)

-- 1. Subscriptions cancellation tracking
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- 2. Campaigns idempotency key tracking
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS generation_request_id UUID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_generation_request_id 
ON public.campaigns (generation_request_id) 
WHERE generation_request_id IS NOT NULL;

-- 3. Targeted subscription cancellation RPC
DROP FUNCTION IF EXISTS public.request_subscription_cancellation();

CREATE OR REPLACE FUNCTION public.request_subscription_cancellation(
  p_subscription_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
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

  IF p_subscription_id IS NOT NULL THEN
    SELECT id, plan_id, current_period_end
    INTO v_sub_id, v_plan_id, v_period_end
    FROM public.subscriptions
    WHERE id = p_subscription_id
      AND user_id = v_user_id
      AND status IN ('ACTIVE', 'TRIALING')
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'NO_ACTIVE_SUBSCRIPTION: Specified subscription not found or not active.' USING ERRCODE = 'P0001';
    END IF;
  ELSE
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
  END IF;

  UPDATE public.subscriptions
  SET 
    cancel_at_period_end = true,
    cancellation_reason = COALESCE(NULLIF(trim(p_reason), ''), cancellation_reason),
    updated_at = NOW()
  WHERE id = v_sub_id;

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
    'Subscription cancellation requested.' || 
    CASE WHEN p_reason IS NOT NULL AND length(trim(p_reason)) > 0 THEN ' Reason: ' || trim(p_reason) || '.' ELSE '' END ||
    ' Active access retained until ' || v_period_end::text || '.'
  FROM public.business_members bm
  WHERE bm.user_id = v_user_id AND bm.role = 'owner';

  RETURN jsonb_build_object(
    'success', true,
    'subscription_id', v_sub_id,
    'plan_id', v_plan_id,
    'cancel_at_period_end', true,
    'cancellation_reason', trim(p_reason),
    'current_period_end', v_period_end::text
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_subscription_cancellation(UUID, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.request_subscription_cancellation(UUID, TEXT) FROM PUBLIC, anon;

-- 4. Idempotent campaign persistence RPC
DROP FUNCTION IF EXISTS public.save_campaign_atomically(uuid, text, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb);

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
  p_generation_request_id uuid DEFAULT NULL
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

  -- 4a. Check for idempotent replay before verifying payload or consuming quota
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

  -- 4b. Validate 4-channel completeness
  IF p_google_content IS NULL OR p_google_content = '{}'::jsonb OR
     p_instagram_content IS NULL OR p_instagram_content = '{}'::jsonb OR
     p_whatsapp_content IS NULL OR p_whatsapp_content = '{}'::jsonb OR
     p_poster_content IS NULL OR p_poster_content = '{}'::jsonb THEN
    RAISE EXCEPTION 'INCOMPLETE_CAMPAIGN_PACK: All four channel payloads are required.' USING ERRCODE = 'P0001';
  END IF;

  -- 4c. Verify quota availability
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

  -- 4d. Deduct quota atomically
  UPDATE public.usage_periods
  SET campaigns_used = campaigns_used + 1
  WHERE id = v_usage_period_id;
  
  v_campaigns_used := v_campaigns_used + 1;

  -- 4e. Insert campaign record with generation_request_id idempotency anchor
  INSERT INTO public.campaigns (
    business_id,
    type,
    objective,
    audience,
    offer,
    schedule,
    status,
    generation_request_id
  ) VALUES (
    p_business_id,
    p_campaign_type,
    p_objective,
    COALESCE(p_audience, ''),
    COALESCE(p_offer, '{}'::jsonb),
    COALESCE(p_schedule, '{}'::jsonb),
    'READY',
    p_generation_request_id
  ) RETURNING id INTO v_campaign_id;

  -- 4f. Insert 4-channel content outputs
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

  -- 4g. Audit event
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
    'campaign_limit', v_campaign_limit,
    'idempotent_replay', false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_campaign_atomically(uuid, text, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.save_campaign_atomically(uuid, text, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, uuid) FROM PUBLIC, anon;
