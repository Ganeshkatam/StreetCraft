import type { Metadata } from 'next';
import { CampaignVaultView } from './CampaignVaultView';
import { getCampaignVault } from '../../../lib/server/campaigns/getCampaignVault';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Campaign Vault — StreetCraft Workspace',
  description: 'Manage and review your saved marketing campaigns, platform outputs, and walk-in notes.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CampaignVaultPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const requestedBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;
  const cursorCreatedAt = typeof resolvedParams.cursorCreatedAt === 'string' ? resolvedParams.cursorCreatedAt : undefined;
  const cursorId = typeof resolvedParams.cursorId === 'string' ? resolvedParams.cursorId : undefined;
  const viewMode = resolvedParams.view === 'archived' ? 'archived' : 'active';

  let cursor;
  if (cursorCreatedAt && cursorId) {
    cursor = { createdAt: cursorCreatedAt, id: cursorId };
  }

  const vaultData = await getCampaignVault(requestedBizId, cursor, viewMode);

  if (!vaultData) {
    redirect('/setup');
  }

  return <CampaignVaultView vaultData={vaultData} />;
}
