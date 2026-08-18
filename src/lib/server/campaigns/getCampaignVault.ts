import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { createClient } from '../../supabase/server';
import { CampaignType, CampaignObjective, CampaignStatus, StructuredOffer, StructuredSchedule } from '../../../types/campaign';

export interface CampaignVaultItem {
  id: string;
  type: CampaignType;
  objective: CampaignObjective;
  status: CampaignStatus;
  createdAt: string;
  offer: StructuredOffer;
  schedule: StructuredSchedule;
  performanceNotes: string;
  presentChannels: string[];
  isComplete: boolean;
}

export interface CampaignVaultViewModel {
  business: { id: string; name: string };
  campaigns: CampaignVaultItem[];
  nextCursor: { createdAt: string; id: string } | null;
  viewMode: 'active' | 'archived';
}

export async function getCampaignVault(
  candidateBizId?: string,
  cursor?: { createdAt: string; id: string },
  viewMode: 'active' | 'archived' = 'active'
): Promise<CampaignVaultViewModel | null> {
  const claims = await requireAuthenticatedClaims('/app/campaigns');
  
  const business = await resolveAuthorizedBusiness(claims.userId, candidateBizId);
  if (!business) {
    return null;
  }

  const supabase = await createClient();

  const PAGE_SIZE = 25;

  let query = supabase
    .from('campaigns')
    .select(`
      id,
      type,
      objective,
      status,
      created_at,
      offer,
      schedule,
      performance_notes,
      campaign_outputs ( channel )
    `)
    .eq('business_id', business.id);

  // Server-side filtering: Active vs Archived
  if (viewMode === 'archived') {
    query = query.eq('status', 'archived');
  } else {
    query = query.neq('status', 'archived');
  }

  query = query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(PAGE_SIZE);

  if (cursor) {
    // Keyset pagination: (created_at, id) < (cursor.createdAt, cursor.id)
    query = query.or(`created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Failed to fetch campaign vault:', error);
    return {
      business: { id: business.id, name: business.name },
      campaigns: [],
      nextCursor: null,
      viewMode,
    };
  }

  const campaigns: CampaignVaultItem[] = data.map((row: any) => {
    const presentChannels = Array.isArray(row.campaign_outputs) 
      ? row.campaign_outputs.map((co: any) => co.channel) 
      : [];
    
    return {
      id: row.id,
      type: row.type as CampaignType,
      objective: row.objective as CampaignObjective,
      status: row.status as CampaignStatus,
      createdAt: row.created_at,
      offer: row.offer as StructuredOffer,
      schedule: row.schedule as StructuredSchedule,
      performanceNotes: row.performance_notes || '',
      presentChannels,
      isComplete: presentChannels.length >= 4,
    };
  });

  let nextCursor = null;
  if (campaigns.length === PAGE_SIZE) {
    const lastCampaign = campaigns[campaigns.length - 1];
    nextCursor = {
      createdAt: lastCampaign.createdAt,
      id: lastCampaign.id
    };
  }

  return {
    business: { id: business.id, name: business.name },
    campaigns,
    nextCursor,
    viewMode,
  };
}
