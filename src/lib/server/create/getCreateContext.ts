import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { getBusinessProfile } from '../business/getBusinessProfile';
import { getCurrentUsagePeriod } from '../usage/getCurrentUsagePeriod';
import { getFestivalMoments } from '../opportunities/getFestivalMoments';
import { CreateCampaignViewModel } from '../../domain/create/createTypes';
import { parseCreatePresetFromSearchParams } from '../../domain/create/createPreset';

export async function getCreateContext(
  candidateBizId?: string,
  searchParams?: Record<string, string | string[] | undefined>
): Promise<CreateCampaignViewModel | null> {
  const claims = await requireAuthenticatedClaims('/user/create');

  const business = await resolveAuthorizedBusiness(claims.userId, candidateBizId);
  if (!business) {
    return null;
  }

  // Parallelize reads for the authorized business
  const [profile, usagePeriod, festivals] = await Promise.all([
    getBusinessProfile(business.id),
    getCurrentUsagePeriod(business.id),
    getFestivalMoments(),
  ]);

  const preset = searchParams ? parseCreatePresetFromSearchParams(searchParams) : null;

  const campaignLimit = usagePeriod?.campaign_limit ?? 3;
  const campaignsUsed = usagePeriod?.campaigns_used ?? 0;
  const campaignsRemaining = Math.max(0, campaignLimit - campaignsUsed);
  const isQuotaExceeded = usagePeriod ? campaignsUsed >= campaignLimit : false;

  return {
    business: {
      id: business.id,
      name: business.name,
      category: business.category,
      neighborhood: profile?.neighborhood,
      city: profile?.city,
    },
    profile: profile
      ? {
          signatureItems: profile.signature_items || '',
          targetCustomer: profile.target_customer || '',
          defaultOffer: profile.default_offer || '',
          styleVoice: profile.style_voice || 'Warm & Welcoming',
          slowHours: profile.slow_hours || null,
          peakHours: profile.peak_hours || null,
          avgTicketInr: profile.avg_ticket_inr || null,
        }
      : null,
    entitlement: {
      available: Boolean(usagePeriod),
      campaignLimit,
      campaignsUsed,
      campaignsRemaining,
      isQuotaExceeded,
    },
    festivals,
    preset,
  };
}
