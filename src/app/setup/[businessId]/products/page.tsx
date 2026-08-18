import type { Metadata } from 'next';
import { getSetupContext } from '../../../../lib/server/setup/getSetupContext';
import { ProductsDomainView } from './ProductsDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '03 Products — Setup Storefront',
  description: 'Highlight your signature products and hero items.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function SetupProductsPage({ params }: PageProps) {
  const { businessId } = await params;
  const context = await getSetupContext(businessId);

  return <ProductsDomainView context={context} />;
}
