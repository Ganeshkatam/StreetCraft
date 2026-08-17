import { createClient } from '../../supabase/server';

export interface CampaignOutput {
  id: string;
  channel: string;
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
  validation_status: string;
  status: string;
}

export interface Campaign {
  id: string;
  type: string;
  objective: string;
  audience: string;
  status: string;
  created_at: string;
  outputs: CampaignOutput[];
}

export async function getRecentCampaigns(businessId: string): Promise<Campaign[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      id,
      type,
      objective,
      audience,
      status,
      created_at,
      campaign_outputs (
        id,
        channel,
        content,
        metadata,
        validation_status,
        status
      )
    `)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !data) {
    return [];
  }

  return data.map(c => ({
    ...c,
    outputs: (c.campaign_outputs as unknown as CampaignOutput[]) || []
  })) as Campaign[];
}
