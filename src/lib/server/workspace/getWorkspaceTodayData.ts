import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { AccessibleBusiness } from '../business/getAccessibleBusinesses';
import { getBusinessProfile, BusinessProfile } from '../business/getBusinessProfile';
import { getCurrentUsagePeriod, UsagePeriod } from '../usage/getCurrentUsagePeriod';
import { getRecentCampaigns, Campaign } from '../campaigns/getRecentCampaigns';
import { getFestivalMoments, FestivalMoment } from '../opportunities/getFestivalMoments';

export interface WorkspaceTodayViewModel {
  business: AccessibleBusiness;
  profile: BusinessProfile | null;
  usagePeriod: UsagePeriod | null;
  campaigns: Campaign[];
  festivals: FestivalMoment[];
}

export async function getWorkspaceTodayData(candidateBizId?: string): Promise<WorkspaceTodayViewModel | null> {
  const claims = await requireAuthenticatedClaims('/app/today');
  
  const business = await resolveAuthorizedBusiness(claims.userId, candidateBizId);
  if (!business) {
    // Zero accessible businesses -> Intentional onboarding empty state
    return null;
  }

  // Parallelize reads for the authorized business
  const [profile, usagePeriod, campaigns, festivals] = await Promise.all([
    getBusinessProfile(business.id),
    getCurrentUsagePeriod(business.id),
    getRecentCampaigns(business.id),
    getFestivalMoments()
  ]);

  return {
    business,
    profile,
    usagePeriod,
    campaigns,
    festivals
  };
}
