import type { Metadata } from 'next';
import { getSetupContext } from '../../../../lib/server/setup/getSetupContext';
import { OperationsDomainView } from './OperationsDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '07 Operations — Setup Storefront',
  description: 'Specify peak hours and opportunity windows.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function SetupOperationsPage({ params }: PageProps) {
  const { businessId } = await params;
  const context = await getSetupContext(businessId);

  return <OperationsDomainView context={context} />;
}
