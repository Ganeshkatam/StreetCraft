import type { Metadata } from 'next';
import { getSetupContext } from '../../../lib/server/setup/getSetupContext';
import { OfferDomainView } from './OfferDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '05 Offer — Setup Storefront',
  description: 'Default promotional offers and ticket size.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SetupOfferPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;

  const context = await getSetupContext(candidateBizId);

  return <OfferDomainView context={context} />;
}
