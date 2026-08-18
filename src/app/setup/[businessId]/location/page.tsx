import type { Metadata } from 'next';
import { getSetupContext } from '../../../../lib/server/setup/getSetupContext';
import { LocationDomainView } from './LocationDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '02 Location — Setup Storefront',
  description: 'Specify your physical neighborhood and city.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function SetupLocationPage({ params }: PageProps) {
  const { businessId } = await params;
  const context = await getSetupContext(businessId);

  return <LocationDomainView context={context} />;
}
