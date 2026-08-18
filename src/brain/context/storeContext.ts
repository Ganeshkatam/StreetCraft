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
    const createdMs = new Date(c.createdAt || Date.now()).getTime();
    const daysAgo = Math.max(0, Math.floor((nowMs - createdMs) / (1000 * 60 * 60 * 24)));
    return {
      id: c.id,
      type: c.type || 'CUSTOM_OFFER',
      status: c.status || 'DRAFT',
      createdAt: c.createdAt || new Date().toISOString(),
      daysAgo,
    };
  });

  const signatureItems = profile?.signatureItems
    ? profile.signatureItems
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    businessId: profile?.businessId || '',
    name: profile?.name || 'My Storefront',
    category: profile?.category || 'RETAIL',
    neighborhood: profile?.neighborhood || '',
    city: profile?.city || '',
    landmarks: profile?.landmarks || null,
    signatureItems,
    targetCustomer: profile?.targetCustomer || null,
    defaultOffer: profile?.defaultOffer || null,
    avgTicketInr: profile?.avgTicketINR || null,
    peakHours: profile?.peakHours || null,
    slowHours: profile?.slowHours || null,
    phoneWhatsapp: profile?.phoneWhatsApp || null,
    styleVoice: profile?.styleVoice || null,
    currentHour,
    currentDayOfWeek,
    isWeekend,
    recentCampaigns: mappedCampaigns,
    upcomingFestivals: festivals,
    quota,
  };
}
