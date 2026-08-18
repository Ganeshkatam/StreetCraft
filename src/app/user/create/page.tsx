import type { Metadata } from 'next';
import { CreateCampaignView } from './CreateCampaignView';
import { getCreateContext } from '../../../lib/server/create/getCreateContext';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Campaign Composer — StreetCraft Workspace',
  description: 'Create multi-channel walk-in campaigns across Google, Instagram, WhatsApp, and in-store print.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CreateCampaignPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const requestedBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;

  const context = await getCreateContext(requestedBizId, resolvedParams);

  if (!context) {
    redirect('/setup');
  }

  return <CreateCampaignView context={context} />;
}
