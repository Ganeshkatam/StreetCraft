-- Migration: 20260818_billing_commercial_hardening
-- Description: Hardened commercial state, webhook idempotency lifecycle, unique subscription constraints, and idempotent cancel-at-period-end semantics.

-- 1. Add cancel_at_period_end flag to subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;

-- 2. Enforce single active/trialing subscription per user at the database level
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_active_per_user_idx
ON public.subscriptions (user_id)
WHERE status IN ('ACTIVE', 'TRIALING');

-- 3. Enforce unique provider subscription identity at the database level
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_provider_subscription_unique
ON public.subscriptions (provider, provider_subscription_id)
WHERE provider_subscription_id IS NOT NULL;

-- 4. Create provider_events table with explicit lifecycle states for idempotent webhook processing
CREATE TABLE IF NOT EXISTS public.provider_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'RECEIVED' CHECK (status = ANY (ARRAY['RECEIVED'::text, 'PROCESSING'::text, 'PROCESSED'::text, 'FAILED'::text])),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT provider_events_provider_event_id_key UNIQUE (provider, provider_event_id)
);

-- Deny browser/public access; only trusted service-role paths ingest webhooks
ALTER TABLE public.provider_events ENABLE ROW LEVEL SECURITY;

-- 5. Expand usage_events event_type constraint to allow subscription lifecycle audit events
ALTER TABLE public.usage_events DROP CONSTRAINT IF EXISTS usage_events_event_type_check;
ALTER TABLE public.usage_events ADD CONSTRAINT usage_events_event_type_check 
  CHECK (event_type = ANY (ARRAY[
    'CAMPAIGN_GENERATION'::text, 
    'CAMPAIGN_REGENERATION'::text, 
    'MANUAL_ADJUSTMENT'::text, 
    'SUBSCRIPTION_RESET'::text,
    'SUBSCRIPTION_CANCEL_REQUESTED'::text,
    'SUBSCRIPTION_CANCELLED'::text
  ]));

-- 6. Transactional RPC for requesting cancellation at period end with idempotent guard
CREATE OR REPLACE FUNCTION public.request_subscription_cancellation()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_sub_id uuid;
  v_plan_id text;
  v_period_end date;
  v_already_scheduled boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Caller must be authenticated.' USING ERRCODE = 'P0001';
  END IF;

  SELECT id, plan_id, current_period_end, cancel_at_period_end
  INTO v_sub_id, v_plan_id, v_period_end, v_already_scheduled
  FROM public.subscriptions
  WHERE user_id = v_user_id
    AND status IN ('ACTIVE', 'TRIALING')
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NO_ACTIVE_SUBSCRIPTION: You do not have an active paid subscription to cancel.' USING ERRCODE = 'P0001';
  END IF;

  -- Idempotency guard: If cancellation was already scheduled, return idempotent success without duplicate events
  IF v_already_scheduled = true THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_scheduled', true,
      'subscription_id', v_sub_id,
      'plan_id', v_plan_id,
      'cancel_at_period_end', true,
      'current_period_end', v_period_end::text
    );
  END IF;

  -- Mark subscription to cancel at period end; do not rewrite or delete active usage_periods
  UPDATE public.subscriptions
  SET 
    cancel_at_period_end = true,
    updated_at = NOW()
  WHERE id = v_sub_id;

  -- Record audit event in usage_events for all owner storefronts
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
    'Subscription scheduled for cancellation at period end (' || v_period_end::text || '). Entitlement remains active until then.'
  FROM public.business_members bm
  WHERE bm.user_id = v_user_id AND bm.role = 'owner';

  RETURN jsonb_build_object(
    'success', true,
    'already_scheduled', false,
    'subscription_id', v_sub_id,
    'plan_id', v_plan_id,
    'cancel_at_period_end', true,
    'current_period_end', v_period_end::text
  );
END;
$$;

REVOKE ALL ON FUNCTION public.request_subscription_cancellation() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_subscription_cancellation() TO authenticated;
