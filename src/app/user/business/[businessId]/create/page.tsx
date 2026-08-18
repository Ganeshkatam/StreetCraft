import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CreateCampaignView } from '../../../create/CreateCampaignView';
import { getCreateContext } from '../../../../../lib/server/create/getCreateContext';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Campaign Composer — StreetCraft Workspace',
  description: 'Create multi-channel walk-in campaigns across Google, Instagram, WhatsApp, and in-store print.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StoreCreateCampaignPage({ params, searchParams }: PageProps) {
  const { businessId } = await params;
  const resolvedSearchParams = await searchParams;

  const context = await getCreateContext(businessId, resolvedSearchParams);

  if (!context) {
    notFound();
  }

  return <CreateCampaignView context={context} />;
}
