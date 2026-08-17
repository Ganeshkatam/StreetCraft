-- ============================================================================
-- STREETCRAFT DELETE BUSINESS RPC
-- Securely allows an authenticated business owner to delete a business and its associated context
-- ============================================================================

CREATE OR REPLACE FUNCTION public.delete_business_atomically(p_business_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_is_owner BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED: You must be authenticated to delete a business.';
  END IF;

  -- Verify caller is an owner of the business
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = p_business_id
      AND user_id = v_user_id
      AND role = 'owner'
  ) INTO v_is_owner;

  IF NOT v_is_owner THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Only the business owner can delete this business.';
  END IF;

  -- Delete the business (foreign key cascades will clean up members, profiles, periods, campaigns)
  DELETE FROM public.businesses WHERE id = p_business_id;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_business_id', p_business_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_business_atomically(UUID) TO authenticated;
