import type { Metadata } from 'next';
import { getSetupContext } from '../../../../lib/server/setup/getSetupContext';
import { ReviewDomainView } from './ReviewDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '09 Review & Launch — Setup Storefront',
  description: 'Review and launch your storefront setup.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function SetupReviewPage({ params }: PageProps) {
  const { businessId } = await params;
  const context = await getSetupContext(businessId);

  return <ReviewDomainView context={context} />;
}
