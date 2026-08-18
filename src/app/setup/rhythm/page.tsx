import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuthenticatedClaims } from '../../../lib/server/auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../../../lib/server/business/resolveAuthorizedBusiness';
import { getBusinessProfile } from '../../../lib/server/business/getBusinessProfile';
import { SetupLayoutShell } from '../components/SetupLayoutShell';
import { SetupRhythmView } from './SetupRhythmView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Operating Rhythm & Offers — StreetCraft Onboarding',
  description: 'Configure your operating rhythm, quiet hours, signature items, and promotional offers.',
};

export default async function SetupRhythmPage(props: {
  searchParams?: Promise<{ biz?: string; claim?: string }>;
}) {
  const claims = await requireAuthenticatedClaims('/setup/rhythm');
  const searchParams = await props.searchParams;
  const candidateBizId = searchParams?.biz;
  const claimToken = searchParams?.claim;

  // Strict tenant authorization resolution: Never trust ?biz without verification
  const business = await resolveAuthorizedBusiness(claims.userId, candidateBizId);
  if (!business) {
    redirect('/setup');
  }

  const profile = await getBusinessProfile(business.id);

  return (
    <SetupLayoutShell currentStep={2}>
      <SetupRhythmView
        business={business}
        profile={profile}
        claimToken={claimToken}
      />
    </SetupLayoutShell>
  );
}
