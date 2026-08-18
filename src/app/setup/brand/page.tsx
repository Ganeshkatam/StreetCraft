import type { Metadata } from 'next';
import { getSetupContext } from '../../../lib/server/setup/getSetupContext';
import { BrandDomainView } from './BrandDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '06 Brand — Setup Storefront',
  description: 'Brand tone and messaging personality.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SetupBrandPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;

  const context = await getSetupContext(candidateBizId);

  return <BrandDomainView context={context} />;
}
