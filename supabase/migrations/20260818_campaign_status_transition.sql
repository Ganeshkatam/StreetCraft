-- Migration: 20260818_campaign_status_transition
-- Description: Transactional RPC for campaign status lifecycle transitions.

CREATE TYPE campaign_status_transition_result AS (
  campaign_id uuid,
  previous_status text,
  current_status text,
  updated_at timestamptz
);

-- We use SECURITY INVOKER because we want RLS to naturally defend
-- the table access, although this function implements its own strict
-- transactional checks for the transition logic.
CREATE OR REPLACE FUNCTION transition_campaign_status(
  p_campaign_id uuid,
  p_requested_status text
)
RETURNS campaign_status_transition_result
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_campaign_biz_id uuid;
  v_member_role text;
  v_current_status text;
  v_new_updated_at timestamptz;
  v_result campaign_status_transition_result;
BEGIN
  -- 1. Locate campaign and check ownership/role
  SELECT business_id INTO v_campaign_biz_id
  FROM campaigns
  WHERE id = p_campaign_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campaign not found' USING ERRCODE = 'P0002';
  END IF;

  -- 2. Verify caller role (Must be 'owner' or 'admin')
  SELECT role INTO v_member_role
  FROM business_members
  WHERE business_id = v_campaign_biz_id
    AND user_id = auth.uid();

  IF NOT FOUND OR v_member_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'UNAUTHORIZED_OPERATOR' USING ERRCODE = 'P0001';
  END IF;

  -- 3. Lock the row and read current status
  SELECT status INTO v_current_status
  FROM campaigns
  WHERE id = p_campaign_id
  FOR UPDATE;

  -- 4. Validate No-op
  IF v_current_status = p_requested_status THEN
    RAISE EXCEPTION 'ILLEGAL_STATE_TRANSITION' USING ERRCODE = 'P0001', MESSAGE = 'Cannot transition to the same state';
  END IF;

  -- 5. Validate Transition Logic
  -- Legacy transitions exist internally but are not allowed for operator RPC.
  -- Operators can only traverse the forward graph.
  IF v_current_status = 'ready' THEN
    IF p_requested_status NOT IN ('published', 'archived') THEN
      RAISE EXCEPTION 'ILLEGAL_STATE_TRANSITION' USING ERRCODE = 'P0001', MESSAGE = 'Invalid transition from ready';
    END IF;
  ELSIF v_current_status = 'published' THEN
    IF p_requested_status NOT IN ('completed', 'archived') THEN
      RAISE EXCEPTION 'ILLEGAL_STATE_TRANSITION' USING ERRCODE = 'P0001', MESSAGE = 'Invalid transition from published';
    END IF;
  ELSIF v_current_status = 'completed' THEN
    IF p_requested_status NOT IN ('archived') THEN
      RAISE EXCEPTION 'ILLEGAL_STATE_TRANSITION' USING ERRCODE = 'P0001', MESSAGE = 'Invalid transition from completed';
    END IF;
  ELSE
    -- If current status is archived, draft, generating, or failed, 
    -- operators cannot manually transition it via this RPC.
    RAISE EXCEPTION 'ILLEGAL_STATE_TRANSITION' USING ERRCODE = 'P0001', MESSAGE = 'Invalid or terminal current state for operator transition';
  END IF;

  -- 6. Perform the mutation
  v_new_updated_at := NOW();

  UPDATE campaigns
  SET 
    status = p_requested_status,
    updated_at = v_new_updated_at
  WHERE id = p_campaign_id;

  -- 7. Construct and return result
  v_result.campaign_id := p_campaign_id;
  v_result.previous_status := v_current_status;
  v_result.current_status := p_requested_status;
  v_result.updated_at := v_new_updated_at;

  RETURN v_result;
END;
$$;

-- Restrict execution to authenticated users only
REVOKE ALL ON FUNCTION transition_campaign_status(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION transition_campaign_status(uuid, text) TO authenticated;
