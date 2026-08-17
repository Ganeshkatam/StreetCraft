-- 5.3 Atomic Campaign Generation & Quota Deduction
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
  p_poster_content jsonb
)
RETURNS jsonb
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
    RAISE EXCEPTION 'UNAUTHORIZED: Caller must be authenticated.';
  END IF;

  IF p_business_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_BUSINESS: Cannot create a campaign without a valid business. Please select or create a business first.';
  END IF;

  IF NOT public.is_business_member(p_business_id, v_user_id) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: User is not a member of this business.';
  END IF;

  IF p_google_content IS NULL OR p_google_content = '{}'::jsonb OR
     p_instagram_content IS NULL OR p_instagram_content = '{}'::jsonb OR
     p_whatsapp_content IS NULL OR p_whatsapp_content = '{}'::jsonb OR
     p_poster_content IS NULL OR p_poster_content = '{}'::jsonb THEN
    RAISE EXCEPTION 'INCOMPLETE_CAMPAIGN_PACK: All four channel payloads are required.';
  END IF;

  SELECT id, campaigns_used, campaign_limit INTO v_usage_period_id, v_campaigns_used, v_campaign_limit
  FROM public.usage_periods
  WHERE business_id = p_business_id
    AND period_start <= CURRENT_DATE
    AND period_end >= CURRENT_DATE
  FOR UPDATE;

  IF v_usage_period_id IS NULL THEN
    RAISE EXCEPTION 'ENTITLEMENT_UNAVAILABLE: No active usage period found for this business.';
  END IF;

  IF v_campaigns_used >= v_campaign_limit THEN
    RAISE EXCEPTION 'QUOTA_EXHAUSTED: Usage quota reached: % of % campaigns used this cycle.', v_campaigns_used, v_campaign_limit;
  END IF;

  UPDATE public.usage_periods
  SET campaigns_used = campaigns_used + 1
  WHERE id = v_usage_period_id;
  
  v_campaigns_used := v_campaigns_used + 1;

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
