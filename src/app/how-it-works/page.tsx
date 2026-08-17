import type { Metadata } from 'next';
import { HowItWorksView } from './HowItWorksView';

export const metadata: Metadata = {
  title: 'How It Works — The StreetCraft Methodology',
  description:
    'From store opportunity to coordinated foot traffic. Learn how StreetCraft turns physical store triggers into coordinated Google, Instagram, WhatsApp, and counter campaigns.',
  openGraph: {
    title: 'How It Works — StreetCraft Storefront Pipeline',
    description:
      'Transform slow hours, weekend rushes, and seasonal items into multi-touchpoint walk-in campaigns.',
  },
};

export default function HowItWorksPage() {
  return <HowItWorksView />;
}
