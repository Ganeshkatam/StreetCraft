import type { Metadata } from 'next';
import { requireAuthenticatedClaims } from '../../lib/server/auth/requireAuthenticatedClaims';
import { SetupLayoutShell } from './components/SetupLayoutShell';
import { SetupIdentityView } from './SetupIdentityView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Store Identity & Location — StreetCraft Onboarding',
  description: 'Initialize your store identity, neighborhood, and physical concept.',
};

export default async function SetupPage(props: {
  searchParams?: Promise<{ claim?: string }>;
}) {
  await requireAuthenticatedClaims('/setup');
  const searchParams = await props.searchParams;
  const claimToken = searchParams?.claim;

  return (
    <SetupLayoutShell currentStep={1}>
      <SetupIdentityView claimToken={claimToken} />
    </SetupLayoutShell>
  );
}
