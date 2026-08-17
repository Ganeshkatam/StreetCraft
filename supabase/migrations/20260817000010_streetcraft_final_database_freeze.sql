-- ============================================================================
-- STREETCRAFT FINAL DATABASE HARDENING & FREEZE MIGRATION
-- 1. Explicit FK on usage_events.campaign_id -> campaigns(id) ON DELETE SET NULL
-- 2. Bidirectional sync trigger from business_profiles to businesses
-- 3. Restrict direct campaigns INSERT to anonymous claimable demo packs only
--    (forces all authenticated business campaigns through save_campaign_atomically)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXPLICIT USAGE_EVENTS CAMPAIGN FK CONSTRAINT
-- ----------------------------------------------------------------------------
ALTER TABLE public.usage_events DROP CONSTRAINT IF EXISTS usage_events_campaign_id_fkey;
ALTER TABLE public.usage_events 
  ADD CONSTRAINT usage_events_campaign_id_fkey 
  FOREIGN KEY (campaign_id) 
  REFERENCES public.campaigns(id) 
  ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 2. BUSINESS PROFILE -> BUSINESSES NAME & CATEGORY SYNC TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_business_name_and_category()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.businesses
  SET name = NEW.name, category = NEW.category
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_business_name_and_category ON public.business_profiles;
CREATE TRIGGER trg_sync_business_name_and_category
  AFTER UPDATE OF name, category ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_business_name_and_category();

-- ----------------------------------------------------------------------------
-- 3. CAMPAIGN DIRECT INSERT POLICY HARDENING
-- ----------------------------------------------------------------------------
-- Direct INSERT is strictly reserved for the anonymous Free Tool (business_id IS NULL).
-- All authenticated business campaigns must strictly be created via save_campaign_atomically().
DROP POLICY IF EXISTS "campaigns_insert" ON public.campaigns;
CREATE POLICY "campaigns_insert" ON public.campaigns
  FOR INSERT TO public
  WITH CHECK (business_id IS NULL AND claim_token IS NOT NULL);

DROP POLICY IF EXISTS "campaign_outputs_insert" ON public.campaign_outputs;
CREATE POLICY "campaign_outputs_insert" ON public.campaign_outputs
  FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_outputs.campaign_id
        AND c.business_id IS NULL
        AND c.claim_token IS NOT NULL
    )
  );
