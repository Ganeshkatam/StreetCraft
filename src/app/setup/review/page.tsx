import type { Metadata } from 'next';
import { getSetupContext } from '../../../lib/server/setup/getSetupContext';
import { ReviewDomainView } from './ReviewDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '09 Review & Launch — Setup Storefront',
  description: 'Review storefront configuration and enter workspace.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SetupReviewPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;

  const context = await getSetupContext(candidateBizId);

  return <ReviewDomainView context={context} />;
}
