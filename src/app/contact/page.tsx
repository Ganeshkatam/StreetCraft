import type { Metadata } from 'next';
import { ContactPage } from './ContactPage';

export const metadata: Metadata = {
  title: 'Contact Support & Inquiries — StreetCraft',
  description:
    'Have a question about your storefront, marketing campaigns, quotas, or partnership integrations? Send a note to the StreetCraft support desk.',
  openGraph: {
    title: 'Contact Support & Inquiries — StreetCraft',
    description:
      'Direct support desk for physical storefront operators. Questions about campaigns, billing, or platform integrations.',
  },
};

export default function Page() {
  return <ContactPage />;
}
