/**
 * Immutable Channel Constants and Constraints
 */

export type MarketingChannel = 'GOOGLE_BUSINESS' | 'INSTAGRAM' | 'WHATSAPP' | 'IN_STORE_POSTER';

export interface ChannelMeta {
  key: MarketingChannel;
  displayName: string;
  badgeClass: string;
  charLimit: number;
  description: string;
}

export const CHANNELS: Record<MarketingChannel, ChannelMeta> = {
  GOOGLE_BUSINESS: {
    key: 'GOOGLE_BUSINESS',
    displayName: 'Google Business Profile',
    badgeClass: 'channel-badge-google',
    charLimit: 1500,
    description: 'Search discovery updates with neighborhood tags and clear CTA.',
  },
  INSTAGRAM: {
    key: 'INSTAGRAM',
    displayName: 'Instagram Post & Reels',
    badgeClass: 'channel-badge-ig',
    charLimit: 2200,
    description: 'Visual hook, storytelling caption, and neighborhood discovery hashtags.',
  },
  WHATSAPP: {
    key: 'WHATSAPP',
    displayName: 'WhatsApp Broadcast',
    badgeClass: 'channel-badge-wa',
    charLimit: 500,
    description: 'Direct customer broadcast with immediate counter redemption hook.',
  },
  IN_STORE_POSTER: {
    key: 'IN_STORE_POSTER',
    displayName: 'In-Store Poster & Tent Card',
    badgeClass: 'channel-badge-poster',
    charLimit: 250,
    description: 'High-contrast counter headline, offer terms, and table QR callout.',
  },
};
