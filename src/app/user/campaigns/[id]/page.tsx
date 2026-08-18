import { redirect, notFound } from 'next/navigation';
import { getCampaignDetail } from '../../../../lib/server/campaigns/getCampaignDetail';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPageResolver({ params }: PageProps) {
  const resolvedParams = await params;
  const detailData = await getCampaignDetail(resolvedParams.id);

  if (!detailData) {
    notFound();
  }

  redirect(
    `/user/business/${encodeURIComponent(detailData.campaign.businessId)}/campaigns/${encodeURIComponent(detailData.campaign.id)}`
  );
}
