import type { Metadata } from 'next';
import { ComingSoonView } from '../../components/ComingSoonView';

export const metadata: Metadata = {
  title: 'Instagram Feed & Story Campaigns — StreetCraft',
  description: 'Generate high-converting Instagram story scripts, reel hooks, and caption copy for physical retail stores.',
};

export default function InstagramTouchpointPage() {
  return (
    <ComingSoonView
      category="CUSTOMER TOUCHPOINT"
      title="Instagram Retail Marketing"
      subtitle="Turn casual scrollers within 3 km into walk-in store visitors."
      description="StreetCraft generates complete Instagram creative packs tailored to neighborhood retail: catchy reel hooks, 3-frame story sequences, geo-targeted hashtags, and urgent call-to-actions."
      highlights={[
        {
          title: '3-Frame Story Framework',
          desc: 'Structured hook, offer reveal, and counter-redemption urgency designed specifically for quick mobile viewing.',
        },
        {
          title: 'Hyper-Local Area Hashtags',
          desc: 'Pre-selected neighborhood, landmark, and category tags to maximize organic discovery near your storefront.',
        },
        {
          title: 'Coordinated Visual Copy',
          desc: 'On-screen text overlays, caption hooks, and bio link suggestions crafted in tandem with in-store printed displays.',
        },
      ]}
    />
  );
}
