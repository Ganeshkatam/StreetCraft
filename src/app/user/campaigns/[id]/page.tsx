import type { Metadata } from 'next';
import { CampaignDetailView } from './CampaignDetailView';
import { getCampaignDetail } from '../../../../lib/server/campaigns/getCampaignDetail';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Campaign Details & Channel Proofs — StreetCraft',
  description: 'View and export multi-channel campaign copy, Instagram frames, Google updates, and printable posters.',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const detailData = await getCampaignDetail(resolvedParams.id);

  if (!detailData) {
    notFound();
  }

  return <CampaignDetailView detailData={detailData} />;
}
