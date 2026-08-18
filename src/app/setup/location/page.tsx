import type { Metadata } from 'next';
import { getSetupContext } from '../../../lib/server/setup/getSetupContext';
import { LocationDomainView } from './LocationDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '02 Location — Setup Storefront',
  description: 'Physical location and neighborhood context.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SetupLocationPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;

  const context = await getSetupContext(candidateBizId);

  return <LocationDomainView context={context} />;
}
