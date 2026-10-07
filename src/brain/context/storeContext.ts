import type { BusinessProfile } from '../../types/business';
import type { Campaign } from '../../types/campaign';
import type { ResolvedFestivalOpportunity } from '../../engine/briefing/opportunityEngine';

export interface BrainStoreContext {
  businessId: string;
  name: string;
  category: string;
  neighborhood: string;
  city: string;
  landmarks: string | null;
  signatureItems: string[];
  targetCustomer: string | null;
  defaultOffer: string | null;
  avgTicketInr: number | null;
  peakHours: string | null;
  slowHours: string | null;
  phoneWhatsapp: string | null;
  styleVoice: string | null;
  currentHour: number;
  currentDayOfWeek: number; // 0 = Sunday, 1 = Monday, ...
  isWeekend: boolean;
  recentCampaigns: Array<{
    id: string;
    type: string;
    status: string;
    createdAt: string;
    daysAgo: number;
  }>;
  upcomingFestivals: ResolvedFestivalOpportunity[];
  quota: {
    planTier: string;
    packsUsed: number;
    packLimit: number;
    packsRemaining: number;
  };
}

export function buildBrainStoreContext(
  profile: Partial<BusinessProfile> | null,
  recentCampaigns: Campaign[] = [],
  festivals: ResolvedFestivalOpportunity[] = [],
  quota = { planTier: 'FREE', packsUsed: 0, packLimit: 3, packsRemaining: 3 },
  referenceDate: Date = new Date()
): BrainStoreContext {
  const currentHour = referenceDate.getHours();
  const currentDayOfWeek = referenceDate.getDay();
  const isWeekend = currentDayOfWeek === 0 || currentDayOfWeek === 6;

  const nowMs = referenceDate.getTime();
  const mappedCampaigns = recentCampaigns.slice(0, 10).map((c) => {
    const createdMs = new Date(c.createdAt || (c as any).created_at || Date.now()).getTime();
    const daysAgo = Math.max(0, Math.floor((nowMs - createdMs) / (1000 * 60 * 60 * 24)));
    return {
      id: c.id,
      type: c.type || 'CUSTOM_OFFER',
      status: c.status || 'DRAFT',
      createdAt: c.createdAt || (c as any).created_at || new Date().toISOString(),
      daysAgo,
    };
  });

  const rawSignature = (profile as any)?.signature_items || (profile as any)?.signatureItems || '';
  const signatureItems = rawSignature
    ? rawSignature
        .split(/[,;\n]/)
        .map((s: string) => s.trim())
        .filter(Boolean)
    : [];

  return {
    businessId: (profile as any)?.business_id || (profile as any)?.businessId || '',
    name: profile?.name || 'My Storefront',
    category: profile?.category || 'RETAIL',
    neighborhood: profile?.neighborhood || '',
    city: profile?.city || '',
    landmarks: profile?.landmarks || null,
    signatureItems,
    targetCustomer: (profile as any)?.target_customer || (profile as any)?.targetCustomer || null,
    defaultOffer: (profile as any)?.default_offer || (profile as any)?.defaultOffer || null,
    avgTicketInr: (profile as any)?.avg_ticket_inr ?? (profile as any)?.avgTicketINR ?? null,
    peakHours: (profile as any)?.peak_hours || (profile as any)?.peakHours || null,
    slowHours: (profile as any)?.slow_hours || (profile as any)?.slowHours || null,
    phoneWhatsapp: (profile as any)?.phone_whatsapp || (profile as any)?.phoneWhatsApp || null,
    styleVoice: (profile as any)?.style_voice || (profile as any)?.styleVoice || null,
    currentHour,
    currentDayOfWeek,
    isWeekend,
    recentCampaigns: mappedCampaigns,
    upcomingFestivals: festivals,
    quota,
  };
}
