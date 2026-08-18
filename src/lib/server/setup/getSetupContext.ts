import { notFound } from 'next/navigation';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { getBusinessProfile, BusinessProfile } from '../business/getBusinessProfile';
import { AccessibleBusiness } from '../business/getAccessibleBusinesses';
import { deriveSetupProgress, SetupProgressSummary } from '../../domain/setup/deriveSetupProgress';

export interface SetupContext {
  userId: string;
  business: AccessibleBusiness;
  profile: BusinessProfile | null;
  progress: SetupProgressSummary;
}

export async function getSetupContext(businessId: string): Promise<SetupContext> {
  const claims = await requireAuthenticatedClaims('/setup');

  if (!businessId || typeof businessId !== 'string') {
    notFound();
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(businessId)) {
    notFound();
  }

  const business = await resolveAuthorizedBusiness(claims.userId, businessId);
  if (!business) {
    notFound();
  }

  const profile = await getBusinessProfile(business.id);
  const progress = deriveSetupProgress(profile, business.id);

  return {
    userId: claims.userId,
    business,
    profile,
    progress,
  };
}
