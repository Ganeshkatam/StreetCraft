import type { Metadata } from 'next';
import { TermsView } from './TermsView';

export const metadata: Metadata = {
  title: 'Terms of Service — StreetCraft',
  description:
    'Terms of service governing access and use of StreetCraft for physical business storefronts and operators.',
  openGraph: {
    title: 'Terms of Service — StreetCraft',
    description: 'Commercial operating agreement and full asset ownership rights for physical storefronts.',
  },
};

export default function TermsPage() {
  return <TermsView />;
}
