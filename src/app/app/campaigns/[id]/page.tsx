import type { Metadata } from 'next';
import { CampaignDetailView } from './CampaignDetailView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Campaign Details & Channel Proofs — StreetCraft',
  description: 'View and export multi-channel campaign copy, Instagram frames, Google updates, and printable posters.',
};

export default function CampaignDetailPage() {
  return <CampaignDetailView />;
}
