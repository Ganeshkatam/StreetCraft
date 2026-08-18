import type { Metadata } from 'next';
import { getSetupContext } from '../../../lib/server/setup/getSetupContext';
import { CustomersDomainView } from './CustomersDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '04 Customers — Setup Storefront',
  description: 'Target customer demographics and audience traits.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SetupCustomersPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;

  const context = await getSetupContext(candidateBizId);

  return <CustomersDomainView context={context} />;
}
