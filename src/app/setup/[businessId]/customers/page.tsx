import type { Metadata } from 'next';
import { getSetupContext } from '../../../../lib/server/setup/getSetupContext';
import { CustomersDomainView } from './CustomersDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '04 Customers — Setup Storefront',
  description: 'Define your target customer demographic and audience traits.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function SetupCustomersPage({ params }: PageProps) {
  const { businessId } = await params;
  const context = await getSetupContext(businessId);

  return <CustomersDomainView context={context} />;
}
