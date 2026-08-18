import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CampaignVaultView } from '../../../campaigns/CampaignVaultView';
import { getCampaignVault } from '../../../../../lib/server/campaigns/getCampaignVault';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Campaign Vault — StreetCraft Workspace',
  description: 'Manage and review your saved marketing campaigns, platform outputs, and walk-in notes.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StoreCampaignVaultPage({ params, searchParams }: PageProps) {
  const { businessId } = await params;
  const resolvedSearchParams = await searchParams;

  const cursorCreatedAt = typeof resolvedSearchParams.cursorCreatedAt === 'string' ? resolvedSearchParams.cursorCreatedAt : undefined;
  const cursorId = typeof resolvedSearchParams.cursorId === 'string' ? resolvedSearchParams.cursorId : undefined;
  const viewMode = resolvedSearchParams.view === 'archived' ? 'archived' : 'active';

  let cursor;
  if (cursorCreatedAt && cursorId) {
    cursor = { createdAt: cursorCreatedAt, id: cursorId };
  }

  const vaultData = await getCampaignVault(businessId, cursor, viewMode);

  if (!vaultData) {
    notFound();
  }

  return <CampaignVaultView vaultData={vaultData} />;
}
