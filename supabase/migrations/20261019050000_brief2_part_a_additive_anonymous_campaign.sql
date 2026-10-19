-- Migration: 20261019050000_brief2_part_a_additive_anonymous_campaign.sql
-- Brief 2 Part A (Additive): DB-generated claim token, claim expiration,
-- create_anonymous_campaign RPC (service_role only), rate limit table & function,
-- claim_anonymous_campaign expiration guard, and daily reaper cron job.
-- NOTE: Does NOT drop policies or revoke anon access yet, ensuring no disruption
-- to live users while new server actions and cookie flow are deployed.

-- 1. Allow business_id to be NULL for anonymous campaigns
ALTER TABLE public.campaigns 
  ALTER COLUMN business_id DROP NOT NULL;

-- 2. Add claim_expires_at column to campaigns if not present
ALTER TABLE public.campaigns 
  ADD COLUMN IF NOT EXISTS claim_expires_at timestamptz DEFAULT (now() + interval '7 days');

-- 3. Add check constraint on claim_token length (null or at least 32 characters)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_claim_token_length'
      AND conrelid = 'public.campaigns'::regclass
  ) THEN
    ALTER TABLE public.campaigns
      ADD CONSTRAINT check_claim_token_length
      CHECK (claim_token IS NULL OR length(claim_token::text) >= 32);
  END IF;
END $$;

-- 3. Rate limiting table for IP / action throttling
CREATE TABLE IF NOT EXISTS public.request_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ident_action_created 
  ON public.request_rate_limits (identifier, action, created_at);

ALTER TABLE public.request_rate_limits ENABLE ROW LEVEL SECURITY;
-- No RLS policies defined: denies all direct access by anon and authenticated.

-- Atomic check and record rate limit helper
CREATE OR REPLACE FUNCTION public.check_and_record_rate_limit(
  p_identifier text,
  p_action text,
  p_hourly_limit int DEFAULT 5,
  p_daily_limit int DEFAULT 20
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hourly_count int;
  v_daily_count int;
BEGIN
  -- Count events in last 1 hour
  SELECT count(*) INTO v_hourly_count
  FROM public.request_rate_limits
  WHERE identifier = p_identifier
    AND action = p_action
    AND created_at >= (now() - interval '1 hour');

  IF v_hourly_count >= p_hourly_limit THEN
    RETURN FALSE;
  END IF;

  -- Count events in last 24 hours
  SELECT count(*) INTO v_daily_count
  FROM public.request_rate_limits
  WHERE identifier = p_identifier
    AND action = p_action
    AND created_at >= (now() - interval '24 hours');

  IF v_daily_count >= p_daily_limit THEN
    RETURN FALSE;
  END IF;

  -- Record request timestamp
  INSERT INTO public.request_rate_limits (identifier, action, created_at)
  VALUES (p_identifier, p_action, now());

  RETURN TRUE;
END;
$$;

REVOKE ALL ON public.request_rate_limits FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_and_record_rate_limit(text, text, int, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_record_rate_limit(text, text, int, int) TO service_role;

-- 4. create_anonymous_campaign RPC: definer, executable by service_role only.
-- Validates size limits (each channel payload under 20 KB, text fields length-capped),
-- generates cryptographically random 48-char token in DB, inserts campaign and outputs, returns id and token.
CREATE OR REPLACE FUNCTION public.create_anonymous_campaign(
  p_type text,
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
  v_campaign_id uuid;
  v_token uuid;
  v_expires_at timestamptz := now() + interval '7 days';
  v_max_bytes int := 20480; -- 20 KB
BEGIN
  -- Validate text fields length-capped
  IF p_type IS NULL OR length(trim(p_type)) = 0 OR length(p_type) > 50 THEN
    RAISE EXCEPTION 'INVALID_CAMPAIGN_TYPE: Campaign type must be between 1 and 50 characters.' USING ERRCODE = 'P0001';
  END IF;

  IF p_objective IS NULL OR length(trim(p_objective)) = 0 OR length(p_objective) > 100 THEN
    RAISE EXCEPTION 'INVALID_CAMPAIGN_OBJECTIVE: Campaign objective must be between 1 and 100 characters.' USING ERRCODE = 'P0001';
  END IF;

  IF p_audience IS NOT NULL AND length(p_audience) > 500 THEN
    RAISE EXCEPTION 'INVALID_AUDIENCE: Audience description exceeds 500 characters.' USING ERRCODE = 'P0001';
  END IF;

  -- Validate payload size limits (each channel payload under 20 KB)
  IF p_offer IS NOT NULL AND octet_length(p_offer::text) > v_max_bytes THEN
    RAISE EXCEPTION 'PAYLOAD_OVERSIZED: Offer payload exceeds 20 KB limit.' USING ERRCODE = 'P0001';
  END IF;

  IF p_schedule IS NOT NULL AND octet_length(p_schedule::text) > v_max_bytes THEN
    RAISE EXCEPTION 'PAYLOAD_OVERSIZED: Schedule payload exceeds 20 KB limit.' USING ERRCODE = 'P0001';
  END IF;

  IF p_google_content IS NULL OR octet_length(p_google_content::text) > v_max_bytes THEN
    RAISE EXCEPTION 'PAYLOAD_OVERSIZED: Google Business content missing or exceeds 20 KB limit.' USING ERRCODE = 'P0001';
  END IF;

  IF p_instagram_content IS NULL OR octet_length(p_instagram_content::text) > v_max_bytes THEN
    RAISE EXCEPTION 'PAYLOAD_OVERSIZED: Instagram content missing or exceeds 20 KB limit.' USING ERRCODE = 'P0001';
  END IF;

  IF p_whatsapp_content IS NULL OR octet_length(p_whatsapp_content::text) > v_max_bytes THEN
    RAISE EXCEPTION 'PAYLOAD_OVERSIZED: WhatsApp content missing or exceeds 20 KB limit.' USING ERRCODE = 'P0001';
  END IF;

  IF p_poster_content IS NULL OR octet_length(p_poster_content::text) > v_max_bytes THEN
    RAISE EXCEPTION 'PAYLOAD_OVERSIZED: Poster content missing or exceeds 20 KB limit.' USING ERRCODE = 'P0001';
  END IF;

  -- Generate 16-byte random token in database (using extensions schema for pgcrypto)
  v_token := encode(extensions.gen_random_bytes(16), 'hex')::uuid;

  -- Insert anonymous campaign
  INSERT INTO public.campaigns (
    business_id,
    type,
    objective,
    audience,
    offer,
    schedule,
    status,
    claim_token,
    claim_expires_at
  ) VALUES (
    NULL,
    trim(p_type),
    trim(p_objective),
    COALESCE(p_audience, ''),
    COALESCE(p_offer, '{}'::jsonb),
    COALESCE(p_schedule, '{}'::jsonb),
    'READY',
    v_token,
    v_expires_at
  ) RETURNING id INTO v_campaign_id;

  -- Insert 4 channel outputs
  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
  VALUES (v_campaign_id, 'GOOGLE_BUSINESS', p_google_content, 'VALID');

  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
  VALUES (v_campaign_id, 'INSTAGRAM', p_instagram_content, 'VALID');

  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
  VALUES (v_campaign_id, 'WHATSAPP', p_whatsapp_content, 'VALID');

  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status)
  VALUES (v_campaign_id, 'IN_STORE_POSTER', p_poster_content, 'VALID');

  RETURN jsonb_build_object(
    'campaign_id', v_campaign_id,
    'claim_token', v_token::text,
    'claim_expires_at', v_expires_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_anonymous_campaign(text, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_anonymous_campaign(text, text, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb) TO service_role;

-- 5. Update claim_anonymous_campaign to reject expired tokens
CREATE OR REPLACE FUNCTION public.claim_anonymous_campaign(
  p_claim_token text,
  p_business_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_campaign_id UUID;
  v_usage_period_id UUID;
  v_campaigns_used INT;
  v_campaign_limit INT;
  v_today DATE := (now() at time zone 'Asia/Kolkata')::date;
  v_claim_uuid UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Caller must be authenticated.' USING ERRCODE = 'P0001';
  END IF;

  -- 1. Check ownership or admin membership on the target business
  IF NOT public.is_business_admin(p_business_id) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: User must be an owner or admin of the business to claim campaigns.' USING ERRCODE = 'P0001';
  END IF;

  -- Safely validate UUID format of input token
  BEGIN
    v_claim_uuid := p_claim_token::uuid;
  EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
  END;

  -- 2. Atomically claim campaign (must match token, be unclaimed, and not expired)
  UPDATE public.campaigns
  SET 
    business_id = p_business_id,
    claim_token = NULL,
    updated_at = NOW()
  WHERE claim_token = v_claim_uuid
    AND business_id IS NULL
    AND (claim_expires_at IS NULL OR claim_expires_at >= NOW())
  RETURNING id INTO v_campaign_id;

  IF v_campaign_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Ensure active usage period exists before FOR UPDATE lookup
  PERFORM public.ensure_usage_period(p_business_id);

  -- 3. Check and lock usage quota for target store
  SELECT id, campaigns_used, campaign_limit INTO v_usage_period_id, v_campaigns_used, v_campaign_limit
  FROM public.usage_periods
  WHERE business_id = p_business_id
    AND period_start <= v_today
    AND period_end >= v_today
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

REVOKE ALL ON FUNCTION public.claim_anonymous_campaign(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_anonymous_campaign(text, uuid) TO authenticated, service_role;

-- 6. Daily reaper pg_cron job for expired unclaimed campaigns
CREATE OR REPLACE FUNCTION public.cleanup_expired_unclaimed_campaigns()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  WITH expired_campaigns AS (
    SELECT id
    FROM public.campaigns
    WHERE business_id IS NULL
      AND (claim_expires_at < now() OR (claim_expires_at IS NULL AND created_at < now() - interval '7 days'))
  ),
  deleted_outputs AS (
    DELETE FROM public.campaign_outputs
    WHERE campaign_id IN (SELECT id FROM expired_campaigns)
  ),
  deleted_campaigns AS (
    DELETE FROM public.campaigns
    WHERE id IN (SELECT id FROM expired_campaigns)
    RETURNING id
  )
  SELECT count(*) INTO v_count FROM deleted_campaigns;

  DELETE FROM public.request_rate_limits WHERE created_at < now() - interval '48 hours';

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_expired_unclaimed_campaigns() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_unclaimed_campaigns() TO service_role;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup_expired_unclaimed_campaigns_daily') THEN
    PERFORM cron.unschedule('cleanup_expired_unclaimed_campaigns_daily');
  END IF;

  PERFORM cron.schedule(
    'cleanup_expired_unclaimed_campaigns_daily',
    '0 2 * * *',
    'SELECT public.cleanup_expired_unclaimed_campaigns();'
  );
END $$;
