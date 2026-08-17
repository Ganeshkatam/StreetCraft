import type { Metadata } from 'next';
import { ContactView } from './ContactView';

export const metadata: Metadata = {
  title: 'Contact Us — StreetCraft Founder Support',
  description:
    'Have a question about your physical store or StreetCraft? Get in touch with our founder team directly via email or WhatsApp.',
  openGraph: {
    title: 'Contact StreetCraft',
    description: 'Direct founder support for physical store operators.',
  },
};

export default function ContactPage() {
  return <ContactView />;
}
