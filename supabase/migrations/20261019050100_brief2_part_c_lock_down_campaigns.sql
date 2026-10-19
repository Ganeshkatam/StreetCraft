-- Migration: 20261019050100_brief2_part_c_lock_down_campaigns.sql
-- Brief 2 Part C (Lock-down): Revoke anon SELECT/INSERT, drop public policies,
-- recreate authenticated policies, and delete pre-deploy unclaimed rows (business_id IS NULL).
-- NOTE: Apply only AFTER Part A has been applied and the new server action/cookie flow has been verified.

-- 1. Delete legacy unclaimed campaigns and outputs (strictly business_id IS NULL)
DELETE FROM public.campaign_outputs
WHERE campaign_id IN (
  SELECT id FROM public.campaigns WHERE business_id IS NULL
);

DELETE FROM public.campaigns
WHERE business_id IS NULL;

-- 2. Revoke SELECT and INSERT on campaigns and campaign_outputs from anon
REVOKE SELECT, INSERT ON public.campaigns FROM anon;
REVOKE SELECT, INSERT ON public.campaign_outputs FROM anon;

-- 3. Drop permissive public policies
DROP POLICY IF EXISTS campaigns_insert ON public.campaigns;
DROP POLICY IF EXISTS campaigns_select ON public.campaigns;
DROP POLICY IF EXISTS campaign_outputs_insert ON public.campaign_outputs;
DROP POLICY IF EXISTS campaign_outputs_select ON public.campaign_outputs;

-- 4. Recreate SELECT policies for role authenticated only (strictly scoped to user memberships)
CREATE POLICY campaigns_select ON public.campaigns
  FOR SELECT TO authenticated
  USING (business_id IS NOT NULL AND public.is_business_member(business_id, auth.uid()));

CREATE POLICY campaign_outputs_select ON public.campaign_outputs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_outputs.campaign_id
        AND c.business_id IS NOT NULL
        AND public.is_business_member(c.business_id, auth.uid())
    )
  );
