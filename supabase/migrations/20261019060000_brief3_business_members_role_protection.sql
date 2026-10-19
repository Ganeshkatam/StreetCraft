-- ==============================================================================
-- Brief 3: Business Members Role Escalation and Ownership Protection
-- Migration: 20261019060000_brief3_business_members_role_protection.sql
--
-- Protects against member role escalation and safeguards store ownership:
-- 1. Tightens RLS policies on public.business_members:
--    - Admin cannot update their own role or the owner's role.
--    - Admin cannot insert an owner or admin row (can only insert member).
--    - Owner can insert admin or member rows, and update non-owner roles.
--    - Member cannot insert or update any row.
-- 2. Implements last-owner guard trigger:
--    - Prevents deleting or demoting the last owner of a business.
--    - Skips guard when the parent business is being deleted so cascade works.
--    - Compares user_id <> OLD.user_id.
-- 3. Implements transfer_business_ownership RPC:
--    - Enforces target user's business_limit before promoting to owner.
--    - Promotes target user to owner before stepping down caller.
--    - Synchronizes store entitlements for both users directly.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Replace INSERT and UPDATE RLS policies on public.business_members
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS business_members_insert ON public.business_members;
DROP POLICY IF EXISTS business_members_update ON public.business_members;

CREATE POLICY business_members_insert ON public.business_members
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_members m
      WHERE m.business_id = business_members.business_id
        AND m.user_id = auth.uid()
        AND (
          (m.role = 'owner' AND business_members.role IN ('member', 'admin'))
          OR (m.role = 'admin' AND business_members.role = 'member')
        )
    )
  );

CREATE POLICY business_members_update ON public.business_members
  FOR UPDATE TO authenticated
  USING (
    role <> 'owner'
    AND EXISTS (
      SELECT 1 FROM public.business_members m
      WHERE m.business_id = business_members.business_id
        AND m.user_id = auth.uid()
        AND m.role = 'owner'
    )
  )
  WITH CHECK (role IN ('member', 'admin'));

-- ------------------------------------------------------------------------------
-- 2. Last-Owner Guard Trigger (BEFORE UPDATE OR DELETE, FOR EACH ROW)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.guard_last_business_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_other_owners int;
BEGIN
  -- Only enforce when deleting an owner or changing role away from owner
  IF (OLD.role = 'owner') AND (TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.role <> 'owner')) THEN
    -- Skip the check when the parent business no longer exists (cascading delete from businesses)
    IF NOT EXISTS (SELECT 1 FROM public.businesses WHERE id = OLD.business_id) THEN
      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      ELSE
        RETURN NEW;
      END IF;
    END IF;

    -- Count other remaining owners for this business using user_id
    SELECT count(*) INTO v_other_owners
    FROM public.business_members
    WHERE business_id = OLD.business_id
      AND role = 'owner'
      AND user_id <> OLD.user_id;

    IF v_other_owners = 0 THEN
      RAISE EXCEPTION 'LAST_OWNER: Cannot delete or demote the last owner of a business'
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_last_business_owner() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guard_last_business_owner() TO service_role;

DROP TRIGGER IF EXISTS trg_guard_last_business_owner ON public.business_members;
CREATE TRIGGER trg_guard_last_business_owner
  BEFORE UPDATE OR DELETE ON public.business_members
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_last_business_owner();

-- ------------------------------------------------------------------------------
-- 3. Atomic Ownership Transfer RPC (transfer_business_ownership)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.transfer_business_ownership(
  p_business_id uuid,
  p_new_owner uuid,
  p_retain_ownership boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid;
  v_target_plan text;
  v_business_limit int;
  v_monthly_campaign_limit int;
  v_owned_count int;
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED: You must be authenticated to transfer business ownership.'
      USING ERRCODE = '42501';
  END IF;

  -- Caller must be an existing owner of the business
  IF NOT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = p_business_id
      AND user_id = v_caller_id
      AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Caller must be an owner of this business to transfer ownership.'
      USING ERRCODE = '42501';
  END IF;

  -- Target user must be an existing member of the business
  IF NOT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = p_business_id
      AND user_id = p_new_owner
  ) THEN
    RAISE EXCEPTION 'NOT_FOUND: Target user must be an existing member of this business.'
      USING ERRCODE = 'P0002';
  END IF;

  -- Verify target user's business_limit before transfer (unless target is already owner of this business)
  IF NOT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = p_business_id
      AND user_id = p_new_owner
      AND role = 'owner'
  ) THEN
    SELECT s.plan_id, p.business_limit, p.monthly_campaign_limit
    INTO v_target_plan, v_business_limit, v_monthly_campaign_limit
    FROM public.subscriptions s
    JOIN public.plans p ON p.id = s.plan_id
    WHERE s.user_id = p_new_owner AND s.status IN ('ACTIVE', 'TRIALING')
      AND s.current_period_end >= v_today
    ORDER BY p.monthly_campaign_limit DESC, s.created_at DESC
    LIMIT 1;

    IF v_target_plan IS NULL THEN
      v_target_plan := 'FREE';
      SELECT business_limit, monthly_campaign_limit
      INTO v_business_limit, v_monthly_campaign_limit
      FROM public.plans WHERE id = 'FREE';
      v_business_limit := COALESCE(v_business_limit, 2);
      v_monthly_campaign_limit := COALESCE(v_monthly_campaign_limit, 3);
    END IF;

    SELECT COUNT(*) INTO v_owned_count
    FROM public.business_members
    WHERE user_id = p_new_owner AND role = 'owner';

    IF v_owned_count >= v_business_limit THEN
      RAISE EXCEPTION 'BUSINESS_LIMIT_REACHED: Target user plan (%) allows up to % businesses. Target user currently owns %.',
        v_target_plan, v_business_limit, v_owned_count
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  -- Promote target user to owner
  UPDATE public.business_members
  SET role = 'owner'
  WHERE business_id = p_business_id
    AND user_id = p_new_owner;

  -- Demote previous owner to admin if step down requested
  IF NOT p_retain_ownership AND v_caller_id <> p_new_owner THEN
    UPDATE public.business_members
    SET role = 'admin'
    WHERE business_id = p_business_id
      AND user_id = v_caller_id;
  END IF;

  -- Synchronize store entitlements for both users directly
  PERFORM public.sync_store_entitlements(v_caller_id);
  IF v_caller_id <> p_new_owner THEN
    PERFORM public.sync_store_entitlements(p_new_owner);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'business_id', p_business_id,
    'new_owner', p_new_owner,
    'caller_role', CASE WHEN p_retain_ownership OR v_caller_id = p_new_owner THEN 'owner' ELSE 'admin' END
  );
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_business_ownership(uuid, uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transfer_business_ownership(uuid, uuid, boolean) TO authenticated, service_role;
