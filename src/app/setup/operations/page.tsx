import type { Metadata } from 'next';
import { getSetupContext } from '../../../lib/server/setup/getSetupContext';
import { OperationsDomainView } from './OperationsDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '07 Operations — Setup Storefront',
  description: 'Operating rhythm and peak/slow hours.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SetupOperationsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;

  const context = await getSetupContext(candidateBizId);

  return <OperationsDomainView context={context} />;
}
