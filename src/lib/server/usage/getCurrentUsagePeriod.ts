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

export function getTodayIST(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

export async function getCurrentUsagePeriod(businessId: string): Promise<UsagePeriod | null> {
  const supabase = await createClient();
  const today = getTodayIST();

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
    const { data: ensuredPeriod, error: ensureErr } = await supabase
      .rpc('ensure_my_usage_period', { p_business_id: businessId });

    if (!ensureErr && ensuredPeriod) {
      return ensuredPeriod as UsagePeriod;
    }

    return null;
  }

  return data as UsagePeriod;
}
