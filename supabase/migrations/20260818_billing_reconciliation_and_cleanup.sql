-- Migration: 20260818_billing_reconciliation_and_cleanup
-- Description: Drops obsolete cancel_user_subscription, creates dedicated reconcile_provider_event RPC, and adds SUBSCRIPTION_ENTITLEMENT_ENDED audit event.

-- 1. Drop obsolete legacy cancellation RPC
DROP FUNCTION IF EXISTS public.cancel_user_subscription();
DROP FUNCTION IF EXISTS public.cancel_user_subscription(uuid);

-- 2. Add SUBSCRIPTION_ENTITLEMENT_ENDED to usage_events constraint
ALTER TABLE public.usage_events DROP CONSTRAINT IF EXISTS usage_events_event_type_check;
ALTER TABLE public.usage_events ADD CONSTRAINT usage_events_event_type_check 
  CHECK (event_type = ANY (ARRAY[
    'CAMPAIGN_GENERATION'::text, 
    'CAMPAIGN_REGENERATION'::text, 
    'MANUAL_ADJUSTMENT'::text, 
    'SUBSCRIPTION_RESET'::text,
    'SUBSCRIPTION_CANCEL_REQUESTED'::text,
    'SUBSCRIPTION_CANCELLED'::text,
    'SUBSCRIPTION_ENTITLEMENT_ENDED'::text
  ]));

-- 3. Dedicated Transactional Provider Webhook Reconciler RPC
CREATE OR REPLACE FUNCTION public.reconcile_provider_event(
  p_provider text,
  p_provider_event_id text,
  p_event_type text,
  p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
  v_sub_id text;
  v_plan_id text;
  v_period_start date;
  v_period_end date;
  v_existing_sub record;
  v_plan_record record;
BEGIN
  -- 1. Insert or check provider event for idempotency
  INSERT INTO public.provider_events (
    provider,
    provider_event_id,
    event_type,
    payload,
    status,
    attempt_count,
    received_at
  ) VALUES (
    LOWER(TRIM(p_provider)),
    TRIM(p_provider_event_id),
    TRIM(p_event_type),
    p_payload,
    'PROCESSING',
    1,
    now()
  )
  ON CONFLICT (provider, provider_event_id) DO NOTHING
  RETURNING id INTO v_event_id;

  -- If already processed or in-flight, return idempotent response
  IF v_event_id IS NULL THEN
    SELECT id, status, processed_at INTO v_event_id, v_plan_id, v_period_start
    FROM public.provider_events
    WHERE provider = LOWER(TRIM(p_provider)) AND provider_event_id = TRIM(p_provider_event_id);

    RETURN jsonb_build_object(
      'success', true,
      'idempotent_replay', true,
      'provider_event_id', p_provider_event_id,
      'status', v_plan_id
    );
  END IF;

  -- Extract subscription reference from payload
  v_sub_id := COALESCE(
    p_payload->'payload'->'subscription'->'entity'->>'id',
    p_payload->'subscription'->>'id',
    p_payload->>'subscription_id',
    p_payload->>'id'
  );

  -- Find matching subscription record if provider_subscription_id matches
  IF v_sub_id IS NOT NULL THEN
    SELECT * INTO v_existing_sub
    FROM public.subscriptions
    WHERE provider = LOWER(TRIM(p_provider))
      AND provider_subscription_id = v_sub_id
    LIMIT 1
    FOR UPDATE;
  END IF;

  -- 2. Process Event Type
  CASE p_event_type
    -- ACTIVATION / PAYMENT CHARGED
    WHEN 'subscription.activated', 'subscription.charged' THEN
      IF v_existing_sub.id IS NOT NULL THEN
        v_period_start := COALESCE(
          (TO_TIMESTAMP((p_payload->'payload'->'subscription'->'entity'->>'current_start')::bigint))::date,
          CURRENT_DATE
        );
        v_period_end := COALESCE(
          (TO_TIMESTAMP((p_payload->'payload'->'subscription'->'entity'->>'current_end')::bigint))::date,
          (CURRENT_DATE + interval '1 month')::date
        );

        UPDATE public.subscriptions
        SET 
          status = 'ACTIVE',
          cancel_at_period_end = false,
          current_period_start = v_period_start,
          current_period_end = v_period_end,
          updated_at = now()
        WHERE id = v_existing_sub.id;

        -- Ensure entitlement is updated for owned storefronts
        SELECT monthly_campaign_limit INTO v_plan_record
        FROM public.plans WHERE id = v_existing_sub.plan_id;

        UPDATE public.usage_periods
        SET 
          plan = v_existing_sub.plan_id,
          campaign_limit = COALESCE(v_plan_record.monthly_campaign_limit, campaign_limit)
        WHERE business_id IN (
          SELECT business_id FROM public.business_members 
          WHERE user_id = v_existing_sub.user_id AND role = 'owner'
        )
        AND period_end >= CURRENT_DATE;

        INSERT INTO public.usage_events (
          business_id, user_id, event_type, units, description
        )
        SELECT 
          bm.business_id, v_existing_sub.user_id, 'SUBSCRIPTION_RESET', 0,
          'Subscription confirmed active by provider (' || p_event_type || ').'
        FROM public.business_members bm
        WHERE bm.user_id = v_existing_sub.user_id AND bm.role = 'owner';
      END IF;

    -- PAYMENT HALTED / PAST DUE
    WHEN 'subscription.halted', 'subscription.pending' THEN
      IF v_existing_sub.id IS NOT NULL THEN
        UPDATE public.subscriptions
        SET status = 'PAST_DUE', updated_at = now()
        WHERE id = v_existing_sub.id;
      END IF;

    -- CANCELLATION CONFIRMED BY PROVIDER
    WHEN 'subscription.cancelled', 'subscription.completed' THEN
      IF v_existing_sub.id IS NOT NULL THEN
        IF v_existing_sub.current_period_end >= CURRENT_DATE THEN
          UPDATE public.subscriptions
          SET 
            cancel_at_period_end = true,
            updated_at = now()
          WHERE id = v_existing_sub.id;
        ELSE
          UPDATE public.subscriptions
          SET 
            status = 'CANCELLED',
            cancel_at_period_end = true,
            updated_at = now()
          WHERE id = v_existing_sub.id;

          INSERT INTO public.usage_events (
            business_id, user_id, event_type, units, description
          )
          SELECT 
            bm.business_id, v_existing_sub.user_id, 'SUBSCRIPTION_ENTITLEMENT_ENDED', 0,
            'Paid billing cycle concluded. Reverted to standard Free tier entitlements.'
          FROM public.business_members bm
          WHERE bm.user_id = v_existing_sub.user_id AND bm.role = 'owner';
        END IF;
      END IF;

    ELSE
      NULL;
  END CASE;

  -- 3. Mark provider event PROCESSED
  UPDATE public.provider_events
  SET 
    status = 'PROCESSED',
    processed_at = now()
  WHERE id = v_event_id;

  RETURN jsonb_build_object(
    'success', true,
    'event_id', v_event_id,
    'status', 'PROCESSED',
    'event_type', p_event_type
  );
EXCEPTION WHEN OTHERS THEN
  IF v_event_id IS NOT NULL THEN
    UPDATE public.provider_events
    SET 
      status = 'FAILED',
      error_message = SQLERRM,
      processed_at = now()
    WHERE id = v_event_id;
  END IF;
  RAISE;
END;
$$;

-- Restrict execution to service_role only (webhooks ingestion backend)
REVOKE ALL ON FUNCTION public.reconcile_provider_event(text, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reconcile_provider_event(text, text, text, jsonb) FROM authenticated;
REVOKE ALL ON FUNCTION public.reconcile_provider_event(text, text, text, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.reconcile_provider_event(text, text, text, jsonb) TO service_role;
