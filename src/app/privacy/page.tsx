import type { Metadata } from 'next';
import { PrivacyPage } from './PrivacyPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — StreetCraft',
  description:
    'StreetCraft data privacy policy, security standards, and zero-data-brokering pledge for physical storefront operators.',
  openGraph: {
    title: 'Privacy Policy — StreetCraft',
    description: 'Zero data brokering and multi-tenant security standards for physical storefronts.',
  },
};

export default function Page() {
  return <PrivacyPage />;
}
