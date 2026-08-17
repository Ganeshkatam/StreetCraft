import type { Metadata } from 'next';
import { PricingView } from './PricingView';

export const metadata: Metadata = {
  title: 'Pricing & Plans — StreetCraft Rates for Physical Stores',
  description:
    'Straightforward subscription plans for physical stores and cafes. No commission fees on orders, full margin retention. Starter, Pro, Growth, and Founder lifetime allocation.',
  openGraph: {
    title: 'StreetCraft Pricing & Rates',
    description:
      'Scale your store marketing with high-street unit economics. Monthly, quarterly, and annual plans.',
  },
};

export default function PricingPage() {
  return <PricingView />;
}
