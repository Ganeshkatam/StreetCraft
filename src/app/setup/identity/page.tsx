import type { Metadata } from 'next';
import { getSetupContext } from '../../../lib/server/setup/getSetupContext';
import { IdentityDomainView } from './IdentityDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '01 Identity — Setup Storefront',
  description: 'Define your store name and category.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SetupIdentityPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;
  const claimToken = typeof resolvedParams.claim === 'string' ? resolvedParams.claim : undefined;

  const context = await getSetupContext(candidateBizId);

  return <IdentityDomainView context={context} claimToken={claimToken} />;
}
