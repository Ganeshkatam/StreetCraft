import type { Metadata } from 'next';
import { FreeToolView } from './FreeToolView';

export const metadata: Metadata = {
  title: 'Free Store Campaign Generator — StreetCraft',
  description:
    'Generate coordinated marketing campaigns for your physical shop or cafe. Live proofs across Google Search & Maps, Instagram Reels & Stories, WhatsApp VIP Broadcasts, and printable counter cards.',
  openGraph: {
    title: 'Free Campaign Generator — Instant Multi-Touchpoint Proofs',
    description:
      'No signup required. Test StreetCraft with your store parameters.',
  },
};

export default function FreeToolPage() {
  return <FreeToolView />;
}
