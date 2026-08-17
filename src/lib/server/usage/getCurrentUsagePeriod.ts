import { createClient } from '../../supabase/server';

export interface UsagePeriod {
  id: string;
  business_id: string;
  period_start: string;
  period_end: string;
  plan: string;
  campaign_limit: number;
  campaigns_used: number;
}

export async function getCurrentUsagePeriod(businessId: string): Promise<UsagePeriod | null> {
  const supabase = await createClient();
  const today = new Date().toISOString();

  const { data, error } = await supabase
    .from('usage_periods')
    .select('*')
    .eq('business_id', businessId)
    .lte('period_start', today)
    .gte('period_end', today)
    .order('period_start', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null; // Return null instead of fabricating FREE plan state, per user constraints.
  }

  return data as UsagePeriod;
}
