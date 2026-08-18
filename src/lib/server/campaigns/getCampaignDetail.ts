import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { getAccessibleBusinesses } from '../business/getAccessibleBusinesses';
import { createClient } from '../../supabase/server';
import { CampaignType, CampaignObjective, CampaignStatus, StructuredOffer, StructuredSchedule } from '../../../types/campaign';

export interface CampaignDetailOutput {
  channel: string;
  content: Record<string, unknown>;
  status: string;
}

export interface CampaignDetailItem {
  id: string;
  businessId: string;
  type: CampaignType;
  objective: CampaignObjective;
  status: CampaignStatus;
  createdAt: string;
  offer: StructuredOffer;
  schedule: StructuredSchedule;
  performanceNotes: string;
  audience: string;
  generationRevision: number;
}

export interface CampaignDetailViewModel {
  campaign: CampaignDetailItem;
  outputs: {
    googleBusiness: CampaignDetailOutput | null;
    instagram: CampaignDetailOutput | null;
    whatsapp: CampaignDetailOutput | null;
    poster: CampaignDetailOutput | null;
  };
  isComplete: boolean;
}

export async function getCampaignDetail(campaignId: string): Promise<CampaignDetailViewModel | null> {
  const claims = await requireAuthenticatedClaims('/user/campaigns');

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId)) {
    return null; // Malformed ID -> 404
  }

  const supabase = await createClient();

  // 1. Fetch campaign and its outputs
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      id,
      business_id,
      type,
      objective,
      audience,
      status,
      created_at,
      offer,
      schedule,
      performance_notes,
      generation_revision,
      campaign_outputs (
        channel,
        content,
        status
      )
    `)
    .eq('id', campaignId)
    .single();

  if (error || !data) {
    return null; // Not found -> 404
  }

  // 2. Strict authorization via business_members (no fallback!)
  const accessibleBusinesses = await getAccessibleBusinesses(claims.userId);
  const isAuthorized = accessibleBusinesses.some(b => b.id === data.business_id);

  if (!isAuthorized) {
    return null; // Exists but unauthorized -> 404 (do not leak existence with 403)
  }

  // 3. Map to typed view model
  const campaign: CampaignDetailItem = {
    id: data.id,
    businessId: data.business_id,
    type: data.type as CampaignType,
    objective: data.objective as CampaignObjective,
    status: data.status as CampaignStatus,
    createdAt: data.created_at,
    offer: data.offer as StructuredOffer,
    schedule: data.schedule as StructuredSchedule,
    performanceNotes: data.performance_notes || '',
    audience: data.audience || '',
    generationRevision: typeof data.generation_revision === 'number' ? data.generation_revision : 0,
  };

  const rawOutputs = Array.isArray(data.campaign_outputs) ? data.campaign_outputs : [];

  const googleBusiness = rawOutputs.find(o => o.channel === 'GOOGLE_BUSINESS') as CampaignDetailOutput | undefined;
  const instagram = rawOutputs.find(o => o.channel === 'INSTAGRAM') as CampaignDetailOutput | undefined;
  const whatsapp = rawOutputs.find(o => o.channel === 'WHATSAPP') as CampaignDetailOutput | undefined;
  const poster = rawOutputs.find(o => o.channel === 'IN_STORE_POSTER') as CampaignDetailOutput | undefined;

  const outputs = {
    googleBusiness: googleBusiness || null,
    instagram: instagram || null,
    whatsapp: whatsapp || null,
    poster: poster || null,
  };

  // 4 outputs -> complete, 3 -> incomplete historical state
  const isComplete = !!(outputs.googleBusiness && outputs.instagram && outputs.whatsapp && outputs.poster);

  return {
    campaign,
    outputs,
    isComplete,
  };
}
