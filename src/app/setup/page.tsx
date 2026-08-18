import { redirect } from 'next/navigation';
import { requireAuthenticatedClaims } from '../../lib/server/auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../../lib/server/business/resolveAuthorizedBusiness';
import { getAccessibleBusinesses } from '../../lib/server/business/getAccessibleBusinesses';
import { getBusinessProfile } from '../../lib/server/business/getBusinessProfile';
import { deriveSetupProgress } from '../../lib/domain/setup/deriveSetupProgress';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SetupResolverPage({ searchParams }: PageProps) {
  const claims = await requireAuthenticatedClaims('/setup');
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;
  const claimToken = typeof resolvedParams.claim === 'string' ? resolvedParams.claim : undefined;
  const isNew = resolvedParams.new === 'true';

  // If user explicitly requested to add/create a new storefront, send to /new/store
  if (isNew) {
    const targetUrl = claimToken ? `/new/store?claim=${encodeURIComponent(claimToken)}` : '/new/store';
    redirect(targetUrl);
  }

  let business = await resolveAuthorizedBusiness(claims.userId, candidateBizId);

  // If no business resolved yet, check accessible businesses
  if (!business) {
    const accessible = await getAccessibleBusinesses(claims.userId);
    if (accessible.length > 0) {
      business = accessible[0];
    }
  }

  // If user still has 0 businesses, send to /new/store creation
  if (!business) {
    const targetUrl = claimToken ? `/new/store?claim=${encodeURIComponent(claimToken)}` : '/new/store';
    redirect(targetUrl);
  }

  // Resolve business profile & compute derived progress
  const profile = await getBusinessProfile(business.id);
  const progress = deriveSetupProgress(profile, business.id);

  if (progress.requiredComplete) {
    const reviewUrl = `/setup/${encodeURIComponent(business.id)}/review`;
    redirect(reviewUrl);
  }

  const nextRoute = `/setup/${encodeURIComponent(business.id)}/${progress.nextIncompleteDomain}`;
  redirect(nextRoute);
}
