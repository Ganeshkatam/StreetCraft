/**
 * Static Plan Configuration & Entitlements Definition
 * Zero mock business records. Only immutable structure and rules.
 */

export interface PlanConfig {
  id: 'FREE' | 'PRO' | 'GROWTH';
  name: string;
  monthlyPackLimit: number;
  priceINR: number;
  channels: ('GOOGLE_BUSINESS' | 'INSTAGRAM' | 'WHATSAPP' | 'IN_STORE_POSTER')[];
  features: string[];
}

export const STATIC_PLANS: Record<'FREE' | 'PRO' | 'GROWTH', PlanConfig> = {
  FREE: {
    id: 'FREE',
    name: 'Neighborhood Starter',
    monthlyPackLimit: 5,
    priceINR: 0,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP'],
    features: [
      '5 Coordinated Campaign Packs / mo',
      'Google Business Profile Updates',
      'Instagram Post & Reels Generator',
      'WhatsApp Broadcast Copy',
      'Realtime Campaign Vault',
      'Daily Opportunity Briefing',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'High-Street Pro',
    monthlyPackLimit: 100,
    priceINR: 799,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    features: [
      '100 Coordinated Campaign Packs / mo',
      'All 4 Marketing Channels Included',
      'Print-Ready In-Store Poster Layouts',
      'Advanced Festival & Holiday Strategy',
      'Permanent Business Memory Studio',
      'Priority Generation Latency',
    ],
  },
  GROWTH: {
    id: 'GROWTH',
    name: 'Multi-Store Growth',
    monthlyPackLimit: 300,
    priceINR: 1499,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    features: [
      '300 Coordinated Campaign Packs / mo',
      'Full 4-Channel Distribution Engine',
      'Dedicated Fast Lane Generation',
      'Custom Brand Tone & Voice Presets',
      'Role-Based Team Collaboration',
      'Audit Log & Usage Metering',
    ],
  },
};
