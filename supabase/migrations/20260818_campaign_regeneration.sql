-- Migration: 20260818_campaign_regeneration
-- Description: Transactional RPC for campaign output regeneration with optimistic concurrency and quota deduction.

-- 1. Add generation_revision to campaigns table for optimistic concurrency control
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS generation_revision INTEGER NOT NULL DEFAULT 0;

-- 2. Expand usage_events event_type constraint to allow CAMPAIGN_REGENERATION
ALTER TABLE public.usage_events DROP CONSTRAINT IF EXISTS usage_events_event_type_check;
ALTER TABLE public.usage_events ADD CONSTRAINT usage_events_event_type_check 
  CHECK (event_type = ANY (ARRAY['CAMPAIGN_GENERATION'::text, 'CAMPAIGN_REGENERATION'::text, 'MANUAL_ADJUSTMENT'::text, 'SUBSCRIPTION_RESET'::text]));

-- 3. Create the atomic regeneration RPC function
CREATE OR REPLACE FUNCTION public.replace_campaign_outputs_atomically(
  p_campaign_id uuid,
  p_expected_generation_revision int,
  p_google_content jsonb,
  p_instagram_content jsonb,
  p_whatsapp_content jsonb,
  p_poster_content jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_campaign_biz_id uuid;
  v_current_status text;
  v_current_revision int;
  v_usage_period_id uuid;
  v_campaigns_used int;
  v_campaign_limit int;
  v_user_id uuid;
  v_member_role text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Caller must be authenticated.' USING ERRCODE = 'P0001';
  END IF;

  IF p_campaign_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_CAMPAIGN: Campaign ID is required.' USING ERRCODE = 'P0001';
  END IF;

  -- 1. Validate complete pack of 4 outputs
  IF p_google_content IS NULL OR p_google_content = '{}'::jsonb OR
     p_instagram_content IS NULL OR p_instagram_content = '{}'::jsonb OR
     p_whatsapp_content IS NULL OR p_whatsapp_content = '{}'::jsonb OR
     p_poster_content IS NULL OR p_poster_content = '{}'::jsonb THEN
    RAISE EXCEPTION 'INCOMPLETE_CAMPAIGN_PACK: All four channel payloads are required.' USING ERRCODE = 'P0001';
  END IF;

  -- 2. Lock the campaign row
  SELECT business_id, status, generation_revision
  INTO v_campaign_biz_id, v_current_status, v_current_revision
  FROM public.campaigns
  WHERE id = p_campaign_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campaign not found' USING ERRCODE = 'P0002';
  END IF;

  -- 3. Verify caller membership & role (Must be owner or admin)
  SELECT role INTO v_member_role
  FROM public.business_members
  WHERE business_id = v_campaign_biz_id
    AND user_id = v_user_id;

  IF NOT FOUND OR v_member_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'UNAUTHORIZED_OPERATOR: User is not authorized to regenerate campaigns for this business.' USING ERRCODE = 'P0001';
  END IF;

  -- 4. Verify Status: ONLY 'READY' or 'FAILED' (case-insensitive check)
  IF UPPER(v_current_status) NOT IN ('READY', 'FAILED') THEN
    RAISE EXCEPTION 'ILLEGAL_STATE_TRANSITION: Cannot regenerate campaign with status %', v_current_status USING ERRCODE = 'P0001';
  END IF;

  -- 5. Verify Generation Revision (Optimistic Concurrency Protection)
  IF v_current_revision != p_expected_generation_revision THEN
    RAISE EXCEPTION 'REGENERATION_CONFLICT: Campaign was modified or regenerated concurrently.' USING ERRCODE = 'P0001';
  END IF;

  -- 6. Quota check & lock
  SELECT id, campaigns_used, campaign_limit
  INTO v_usage_period_id, v_campaigns_used, v_campaign_limit
  FROM public.usage_periods
  WHERE business_id = v_campaign_biz_id
    AND period_start <= CURRENT_DATE
    AND period_end >= CURRENT_DATE
  FOR UPDATE;

  IF v_usage_period_id IS NULL THEN
    RAISE EXCEPTION 'ENTITLEMENT_UNAVAILABLE: No active usage period found for this business.' USING ERRCODE = 'P0001';
  END IF;

  IF v_campaigns_used >= v_campaign_limit THEN
    RAISE EXCEPTION 'QUOTA_EXHAUSTED: Usage quota reached: % of % campaigns used this cycle.', v_campaigns_used, v_campaign_limit USING ERRCODE = 'P0001';
  END IF;

  -- 7. Deduct quota
  UPDATE public.usage_periods
  SET campaigns_used = campaigns_used + 1
  WHERE id = v_usage_period_id;

  v_campaigns_used := v_campaigns_used + 1;

  -- 8. Replace campaign outputs (DELETE + INSERT)
  DELETE FROM public.campaign_outputs WHERE campaign_id = p_campaign_id;

  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status, status)
  VALUES (p_campaign_id, 'GOOGLE_BUSINESS', p_google_content, 'VALID', 'ready');

  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status, status)
  VALUES (p_campaign_id, 'INSTAGRAM', p_instagram_content, 'VALID', 'ready');

  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status, status)
  VALUES (p_campaign_id, 'WHATSAPP', p_whatsapp_content, 'VALID', 'ready');

  INSERT INTO public.campaign_outputs (campaign_id, channel, content, validation_status, status)
  VALUES (p_campaign_id, 'IN_STORE_POSTER', p_poster_content, 'VALID', 'ready');

  -- 9. Increment generation_revision & update status and updated_at
  UPDATE public.campaigns
  SET
    status = 'READY',
    generation_revision = generation_revision + 1,
    updated_at = NOW()
  WHERE id = p_campaign_id;

  -- 10. Audit usage event
  INSERT INTO public.usage_events (
    business_id,
    user_id,
    event_type,
    units,
    campaign_id,
    description
  ) VALUES (
    v_campaign_biz_id,
    v_user_id,
    'CAMPAIGN_REGENERATION',
    1,
    p_campaign_id,
    'Regenerated campaign outputs.'
  );

  RETURN jsonb_build_object(
    'campaign_id', p_campaign_id,
    'status', 'READY',
    'generation_revision', v_current_revision + 1,
    'campaigns_used', v_campaigns_used,
    'campaign_limit', v_campaign_limit
  );
END;
$$;

-- Restrict execution to authenticated users only
REVOKE ALL ON FUNCTION public.replace_campaign_outputs_atomically(uuid, int, jsonb, jsonb, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_campaign_outputs_atomically(uuid, int, jsonb, jsonb, jsonb, jsonb) TO authenticated;
