import type { Metadata } from 'next';
import { getSetupContext } from '../../../lib/server/setup/getSetupContext';
import { ProductsDomainView } from './ProductsDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '03 Products — Setup Storefront',
  description: 'Signature products and bestsellers.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SetupProductsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;

  const context = await getSetupContext(candidateBizId);

  return <ProductsDomainView context={context} />;
}
