import type { Metadata } from 'next';
import { ComingSoonView } from '../../components/ComingSoonView';

export const metadata: Metadata = {
  title: 'WhatsApp VIP Broadcasts & Drops — StreetCraft',
  description: 'Craft non-spammy, high-converting WhatsApp message drops for neighborhood store regulars.',
};

export default function WhatsAppTouchpointPage() {
  return (
    <ComingSoonView
      category="CUSTOMER TOUCHPOINT"
      title="WhatsApp VIP Broadcasts"
      subtitle="Direct, personal marketing that reaches your best regular customers instantly."
      description="StreetCraft formats concise, respectful WhatsApp promotional broadcasts with rich bolding, clear redemption codes, and zero spam feel for your store VIP list."
      highlights={[
        {
          title: 'Respectful, High-Value Copy',
          desc: 'Carefully paced messaging that feels like a personal note from the store manager rather than generic mass advertising.',
        },
        {
          title: 'Instant Flash Codes',
          desc: 'Includes simple, recognizable counter flash codes (e.g. #RAINY20 or #COFFEE3PM) for frictionless staff verification.',
        },
        {
          title: 'Timing & Daypart Recommendations',
          desc: 'Optimized delivery suggestions matched to your store’s predictable foot-traffic troughs.',
        },
      ]}
    />
  );
}
