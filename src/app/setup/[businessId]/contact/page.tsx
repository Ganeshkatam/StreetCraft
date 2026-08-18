import type { Metadata } from 'next';
import { getSetupContext } from '../../../../lib/server/setup/getSetupContext';
import { ContactDomainView } from './ContactDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '08 Contact — Setup Storefront',
  description: 'Add your customer care number or WhatsApp order line.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function SetupContactPage({ params }: PageProps) {
  const { businessId } = await params;
  const context = await getSetupContext(businessId);

  return <ContactDomainView context={context} />;
}
