import type { Metadata } from 'next';
import { ComingSoonView } from '../../components/ComingSoonView';

export const metadata: Metadata = {
  title: 'Marketing for Cafés, Coffee Bars & Artisan Bakeries — StreetCraft',
  description: 'Boost slow afternoon sales, launch seasonal bakes, and pack morning counter rushes.',
};

export default function CafesAndBakeriesSolutionPage() {
  return (
    <ComingSoonView
      category="BUSINESS SOLUTION"
      title="Cafés, Coffee Bars &amp; Bakeries"
      subtitle="Fill slow 3:00 PM – 6:00 PM troughs and move fresh bakes before closing."
      description="StreetCraft understands café operations: predictable afternoon dips, evening surplus bakes, and intense morning counter rushes. Our marketing engine creates coordinated promotions designed to drive immediate foot traffic."
      highlights={[
        {
          title: '3 PM Afternoon Reset Campaigns',
          desc: 'Specialty pour-over + pastry pairings targeted at remote workers and neighborhood locals looking for a mid-day coffee break.',
        },
        {
          title: 'Fresh Bake Batch Announcements',
          desc: 'Urgent flash story drops and WhatsApp alerts when specialty sourdough, croissants, or tea cakes come out of the oven.',
        },
        {
          title: 'Rainy Day & Weekend Kickoffs',
          desc: 'Pre-written cozy monsoon treats, weekend brunch menus, and hot beverage combos tailored to local weather shifts.',
        },
      ]}
    />
  );
}
