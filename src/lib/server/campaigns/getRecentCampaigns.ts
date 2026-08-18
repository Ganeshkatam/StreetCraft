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
  offer?: Record<string, unknown>;
  schedule?: Record<string, unknown>;
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
      offer,
      schedule,
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
    .limit(10);

  if (error || !data) {
    return [];
  }

  return data.map((c) => ({
    id: c.id,
    type: c.type,
    objective: c.objective,
    audience: c.audience,
    status: c.status,
    created_at: c.created_at,
    offer: c.offer as Record<string, unknown> | undefined,
    schedule: c.schedule as Record<string, unknown> | undefined,
    outputs: (c.campaign_outputs || []) as CampaignOutput[],
  }));
}
