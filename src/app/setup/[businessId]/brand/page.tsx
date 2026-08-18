import type { Metadata } from 'next';
import { getSetupContext } from '../../../../lib/server/setup/getSetupContext';
import { BrandDomainView } from './BrandDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '06 Brand — Setup Storefront',
  description: 'Choose your shop personality and brand voice.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function SetupBrandPage({ params }: PageProps) {
  const { businessId } = await params;
  const context = await getSetupContext(businessId);

  return <BrandDomainView context={context} />;
}
