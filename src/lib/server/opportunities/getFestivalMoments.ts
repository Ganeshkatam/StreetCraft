import { createClient } from '../../supabase/server';

export interface FestivalMoment {
  id: string;
  name: string;
  region: string;
  starts_at: string;
  ends_at: string;
  marketing_relevance: string;
  suggested_offer: string | null;
}

export async function getFestivalMoments(): Promise<FestivalMoment[]> {
  const supabase = await createClient();
  const today = new Date().toISOString();

  // Get festivals happening now or in the near future (e.g., next 30 days)
  // For now, we'll just query festivals where ends_at >= today
  const { data, error } = await supabase
    .from('festival_calendar')
    .select('*')
    .gte('ends_at', today)
    .order('starts_at', { ascending: true })
    .limit(3);

  if (error || !data) {
    return [];
  }

  return data as FestivalMoment[];
}
