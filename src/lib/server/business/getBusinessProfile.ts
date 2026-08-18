import { createClient } from '../../supabase/server';

export interface BusinessProfile {
  business_id: string;
  name: string;
  category: string;
  neighborhood: string;
  city: string;
  landmarks: string;
  target_customer: string;
  style_voice: string;
  signature_items: string;
  primary_goal: string;
  peak_hours: string;
  slow_hours: string;
  default_offer: string;
  avg_ticket_inr: number | null;
  target_monthly_customers: number | null;
  phone_whatsapp: string;
  logo_url?: string | null;
}

export async function getBusinessProfile(businessId: string): Promise<BusinessProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('business_id', businessId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as BusinessProfile;
}
