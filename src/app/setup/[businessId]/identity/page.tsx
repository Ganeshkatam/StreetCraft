import type { Metadata } from 'next';
import { getSetupContext } from '../../../../lib/server/setup/getSetupContext';
import { IdentityDomainView } from './IdentityDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '01 Identity — Setup Storefront',
  description: 'Define your storefront name and category.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function SetupIdentityPage({ params }: PageProps) {
  const { businessId } = await params;
  const context = await getSetupContext(businessId);

  return <IdentityDomainView context={context} />;
}
