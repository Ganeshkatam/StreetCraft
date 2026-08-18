import type { Metadata } from 'next';
import { ComingSoonView } from '../../components/ComingSoonView';

export const metadata: Metadata = {
  title: 'Google Business Profile Marketing — StreetCraft',
  description: 'Automate Google Business updates, local SEO offers, and event posts for foot-traffic retail.',
};

export default function GoogleBusinessTouchpointPage() {
  return (
    <ComingSoonView
      category="CUSTOMER TOUCHPOINT"
      title="Google Business Profile Marketing"
      subtitle="Capture high-intent local search traffic when neighbors search for nearby stores."
      description="StreetCraft is developing automated Google Business Profile post generation, event scheduling, and localized promotion publishing built specifically for neighborhood foot-traffic businesses."
      highlights={[
        {
          title: 'Automated Local SEO Posts',
          desc: 'Generate keyword-optimized Google updates with store address, landmark cues, and call-to-actions that improve local map pack rankings.',
        },
        {
          title: 'Limited-Time Event Offers',
          desc: 'Publish weekend specials, festival thalis, and flash deals with structured start and end dates directly on your Google search listing.',
        },
        {
          title: 'One-Click Photo & Poster Sync',
          desc: 'Coordinate your Google Business imagery with your Instagram stories and in-store counter displays.',
        },
      ]}
    />
  );
}
