import type { CampaignType } from '../../types/campaign';

export interface ChannelStrategicAngle {
  role: string;
  focus: string;
  hookFormula: string;
  callToActionPattern: string;
}

export interface TouchpointStrategyPlan {
  google: ChannelStrategicAngle;
  instagram: ChannelStrategicAngle;
  whatsapp: ChannelStrategicAngle;
  poster: ChannelStrategicAngle;
}

export function resolveChannelAngles(campaignType: CampaignType): TouchpointStrategyPlan {
  switch (campaignType) {
    case 'WEEKDAY_BOOST':
      return {
        google: {
          role: 'Local Intent Capture',
          focus: 'Nearby remote workers searching for coffee/lunch pairings during afternoon slowdown',
          hookFormula: 'Afternoon special at [Store] in [Neighborhood]',
          callToActionPattern: 'Visit Us today before [End Time]',
        },
        instagram: {
          role: 'Sensory Visual Proof',
          focus: '3-second sensory Reel hook showing warm crusts or pour-overs with story countdown',
          hookFormula: 'The mid-day reset you did not know you needed.',
          callToActionPattern: 'Save this post & drop in between [Slow Hours]',
        },
        whatsapp: {
          role: 'Direct VIP Conversion',
          focus: 'Exclusive flash drop text with direct counter redemption code',
          hookFormula: 'Afternoon flash drop for our [Neighborhood] regulars',
          callToActionPattern: 'Show this text at the register to claim',
        },
        poster: {
          role: 'Point-of-Sale Upsell',
          focus: 'A5 counter card that converts single beverage orders into combo pairings',
          hookFormula: 'AFTERNOON COMBO / [HOURS]',
          callToActionPattern: 'Ask your barista / cashier to upgrade your order',
        },
      };

    case 'WEEKEND_MAGNET':
      return {
        google: {
          role: 'High-Street Search Discovery',
          focus: 'Weekend shoppers searching for top-rated spots near landmarks',
          hookFormula: 'Weekend special running at [Store] near [Landmark]',
          callToActionPattern: 'Get Directions & visit this weekend',
        },
        instagram: {
          role: 'Weekend Buzz & Atmosphere',
          focus: 'High-energy weekend story frames and unboxing reels',
          hookFormula: 'Your weekend plans in [Neighborhood] just got sorted.',
          callToActionPattern: 'Tag your weekend crew in the comments',
        },
        whatsapp: {
          role: 'Table & Slot Reservations',
          focus: 'Early weekend reservation and skip-the-line invitations',
          hookFormula: 'Weekend tables and signature batches are live at [Store]',
          callToActionPattern: 'Reply with your party size to reserve a slot',
        },
        poster: {
          role: 'Sidewalk & Window Footfall Capture',
          focus: 'High-contrast typography readable from 5 meters away',
          hookFormula: 'WEEKEND SPECIAL / LIMITED BATCH',
          callToActionPattern: 'Step inside to explore our featured menu',
        },
      };

    case 'FESTIVAL_SPECIAL':
      return {
        google: {
          role: 'Festival Search Presence',
          focus: 'Event cards optimized for holiday gift boxes and family feasts',
          hookFormula: '[Festival] celebrations at [Store] in [Neighborhood]',
          callToActionPattern: 'Pre-order your [Festival] pack now',
        },
        instagram: {
          role: 'Cultural Storytelling',
          focus: 'Warm festive color palettes and behind-the-counter preparation',
          hookFormula: 'Celebrating [Festival] with handcrafted traditions at [Store].',
          callToActionPattern: 'Order early before holiday slots fill up',
        },
        whatsapp: {
          role: 'Advance Family Pre-Orders',
          focus: 'Polite festive greetings with direct pre-order booking links',
          hookFormula: 'Wishing you a joyful [Festival] from the [Store] family',
          callToActionPattern: 'Tap here to pre-order your festive box',
        },
        poster: {
          role: 'Festive Window & Counter Signage',
          focus: 'Gold/festive typography welcoming holiday walk-ins',
          hookFormula: 'HAPPY [FESTIVAL] / CELEBRATION PACK',
          callToActionPattern: 'Speak with our team to pick up your festive gift box',
        },
      };

    default:
      return {
        google: {
          role: 'Search Visibility',
          focus: 'Local relevance with clear operating hours and directions',
          hookFormula: 'Special feature at [Store] in [Neighborhood]',
          callToActionPattern: 'Visit us at [Location]',
        },
        instagram: {
          role: 'Visual Engagement',
          focus: 'Product showcase with local neighborhood discovery tags',
          hookFormula: 'Now featured at [Store].',
          callToActionPattern: 'Check link in bio or visit in store',
        },
        whatsapp: {
          role: 'Direct Customer Message',
          focus: 'Personalized broadcast for registered customers',
          hookFormula: 'An update from your neighbors at [Store]',
          callToActionPattern: 'Show this message at counter',
        },
        poster: {
          role: 'Point of Sale Display',
          focus: 'Clear, high-contrast counter signage for walk-in upselling',
          hookFormula: 'FEATURED AT [STORE]',
          callToActionPattern: 'Ask our team at the register',
        },
      };
  }
}
