import type { Metadata } from 'next';
import { getSetupContext } from '../../../../lib/server/setup/getSetupContext';
import { OfferDomainView } from './OfferDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '05 Offer — Setup Storefront',
  description: 'Specify your core promotion and commercial target.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function SetupOfferPage({ params }: PageProps) {
  const { businessId } = await params;
  const context = await getSetupContext(businessId);

  return <OfferDomainView context={context} />;
}
