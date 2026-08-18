import { redirect } from 'next/navigation';
import { requireAuthenticatedClaims } from '../../lib/server/auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../../lib/server/business/resolveAuthorizedBusiness';
import { getAccessibleBusinesses } from '../../lib/server/business/getAccessibleBusinesses';
import { getBusinessProfile } from '../../lib/server/business/getBusinessProfile';
import { deriveSetupProgress } from '../../lib/server/setup/deriveSetupProgress';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SetupResolverPage({ searchParams }: PageProps) {
  const claims = await requireAuthenticatedClaims('/setup');
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;
  const claimToken = typeof resolvedParams.claim === 'string' ? resolvedParams.claim : undefined;

  let business = await resolveAuthorizedBusiness(claims.userId, candidateBizId);

  // If no business resolved yet, check if the user has any existing accessible storefronts
  if (!business) {
    const accessible = await getAccessibleBusinesses(claims.userId);
    if (accessible.length > 0) {
      business = accessible[0];
    }
  }

  // If user still has 0 businesses, send to step 01 Identity creation
  if (!business) {
    const targetUrl = claimToken ? `/setup/identity?claim=${encodeURIComponent(claimToken)}` : '/setup/identity';
    redirect(targetUrl);
  }

  // Resolve business profile & compute derived progress
  const profile = await getBusinessProfile(business.id);
  const progress = deriveSetupProgress(profile);

  // If all required domains (Identity, Location) are complete -> redirect to Step 09 Review & Launch
  if (progress.requiredComplete) {
    const reviewUrl = claimToken
      ? `/setup/review?biz=${encodeURIComponent(business.id)}&claim=${encodeURIComponent(claimToken)}`
      : `/setup/review?biz=${encodeURIComponent(business.id)}`;
    redirect(reviewUrl);
  }

  // Otherwise redirect to the first incomplete required or recommended domain
  const nextRoute = `/setup/${progress.nextIncompleteDomain}?biz=${encodeURIComponent(business.id)}`;
  const destinationUrl = claimToken ? `${nextRoute}&claim=${encodeURIComponent(claimToken)}` : nextRoute;
  redirect(destinationUrl);
}
