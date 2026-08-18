import type { Metadata } from 'next';
import { getSetupContext } from '../../../lib/server/setup/getSetupContext';
import { ContactDomainView } from './ContactDomainView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '08 Contact — Setup Storefront',
  description: 'Phone and WhatsApp ordering channels.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SetupContactPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;

  const context = await getSetupContext(candidateBizId);

  return <ContactDomainView context={context} />;
}
