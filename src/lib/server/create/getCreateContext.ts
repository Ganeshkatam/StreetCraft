import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { AccessibleBusiness } from '../business/getAccessibleBusinesses';
import { getBusinessProfile, BusinessProfile } from '../business/getBusinessProfile';
import { getCurrentUsagePeriod, UsagePeriod } from '../usage/getCurrentUsagePeriod';
import { getFestivalMoments, FestivalMoment } from '../opportunities/getFestivalMoments';

export interface CreateContext {
  business: AccessibleBusiness;
  profile: BusinessProfile | null;
  usagePeriod: UsagePeriod | null;
  festivals: FestivalMoment[];
}

export async function getCreateContext(candidateBizId?: string): Promise<CreateContext | null> {
  const claims = await requireAuthenticatedClaims('/app/create');
  
  const business = await resolveAuthorizedBusiness(claims.userId, candidateBizId);
  if (!business) {
    return null;
  }

  // Parallelize reads for the authorized business
  const [profile, usagePeriod, festivals] = await Promise.all([
    getBusinessProfile(business.id),
    getCurrentUsagePeriod(business.id),
    getFestivalMoments()
  ]);

  return {
    business,
    profile,
    usagePeriod,
    festivals
  };
}
