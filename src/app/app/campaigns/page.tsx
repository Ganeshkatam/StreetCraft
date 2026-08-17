import type { Metadata } from 'next';
import { CampaignVaultView } from './CampaignVaultView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Campaign Vault — StreetCraft Workspace',
  description: 'Manage and review your saved marketing campaigns, platform outputs, and walk-in notes.',
};

export default function CampaignVaultPage() {
  return <CampaignVaultView />;
}
