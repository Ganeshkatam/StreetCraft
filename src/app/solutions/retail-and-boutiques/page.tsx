import type { Metadata } from 'next';
import { ComingSoonView } from '../../components/ComingSoonView';

export const metadata: Metadata = {
  title: 'Marketing for Retail Stores, Boutiques & Lifestyle Shops — StreetCraft',
  description: 'Drive in-store footfall, clear end-of-season stock, and announce new collection arrivals.',
};

export default function RetailAndBoutiquesSolutionPage() {
  return (
    <ComingSoonView
      category="BUSINESS SOLUTION"
      title="Retail Stores &amp; Boutiques"
      subtitle="Turn street foot traffic into active buyers and move inventory off shelves."
      description="StreetCraft empowers boutique owners, apparel retailers, and lifestyle storefronts to coordinate new season collection arrivals, flash weekend clearances, and VIP preview nights across digital and physical touchpoints."
      highlights={[
        {
          title: 'New Arrival Showcase Packs',
          desc: 'Coordinated Instagram reels, WhatsApp lookbooks, and counter display signs highlighting newly arrived seasonal inventory.',
        },
        {
          title: 'Weekend Flash Clearance Promos',
          desc: 'Urgent limited-rack promotions designed to clear slow-moving SKUs without cheapening brand value.',
        },
        {
          title: 'Neighborhood VIP Loyalty Drops',
          desc: 'Exclusive first-look invitations for your top 50 local customers before public collection launches.',
        },
      ]}
    />
  );
}
