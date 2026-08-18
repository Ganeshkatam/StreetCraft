import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CampaignDetailView } from '../../../../campaigns/[id]/CampaignDetailView';
import { getCampaignDetail } from '../../../../../../lib/server/campaigns/getCampaignDetail';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Campaign Details & Channel Proofs — StreetCraft',
  description: 'View and export multi-channel campaign copy, Instagram frames, Google updates, and printable posters.',
};

interface PageProps {
  params: Promise<{ businessId: string; campaignId: string }>;
}

export default async function StoreCampaignDetailPage({ params }: PageProps) {
  const { businessId, campaignId } = await params;
  const detailData = await getCampaignDetail(campaignId);

  // Authorize that campaign belongs specifically to this businessId
  if (!detailData || detailData.campaign.businessId !== businessId) {
    notFound();
  }

  return <CampaignDetailView detailData={detailData} />;
}
