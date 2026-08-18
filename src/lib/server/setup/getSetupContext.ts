import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { getBusinessProfile, BusinessProfile } from '../business/getBusinessProfile';
import { AccessibleBusiness } from '../business/getAccessibleBusinesses';
import { deriveSetupProgress, SetupProgressSummary } from './deriveSetupProgress';

export interface SetupContext {
  userId: string;
  business: AccessibleBusiness | null;
  profile: BusinessProfile | null;
  progress: SetupProgressSummary;
}

export async function getSetupContext(candidateBizId?: string): Promise<SetupContext> {
  const claims = await requireAuthenticatedClaims('/setup');
  
  if (!candidateBizId) {
    const progress = deriveSetupProgress(null);
    return {
      userId: claims.userId,
      business: null,
      profile: null,
      progress,
    };
  }

  const business = await resolveAuthorizedBusiness(claims.userId, candidateBizId);
  if (!business) {
    const progress = deriveSetupProgress(null);
    return {
      userId: claims.userId,
      business: null,
      profile: null,
      progress,
    };
  }

  const profile = await getBusinessProfile(business.id);
  const progress = deriveSetupProgress(profile);

  return {
    userId: claims.userId,
    business,
    profile,
    progress,
  };
}
