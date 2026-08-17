import type { Metadata } from 'next';
import { CreateCampaignView } from './CreateCampaignView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Campaign Composer — StreetCraft Workspace',
  description: 'Create multi-channel walk-in campaigns across Google, Instagram, WhatsApp, and in-store print.',
};

export default function CreateCampaignPage() {
  return <CreateCampaignView />;
}
