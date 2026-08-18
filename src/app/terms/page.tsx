import type { Metadata } from 'next';
import { TermsPage } from './TermsPage';

export const metadata: Metadata = {
  title: 'Terms of Service — StreetCraft',
  description:
    'Terms of service governing access, AI-assisted campaign generation, quotas, and commercial asset ownership for physical storefront operators.',
  openGraph: {
    title: 'Terms of Service — StreetCraft',
    description:
      'Commercial terms, operator responsibilities, and 100% campaign asset ownership rights for physical storefronts.',
  },
};

export default function Page() {
  return <TermsPage />;
}
