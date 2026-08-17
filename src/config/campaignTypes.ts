/**
 * Immutable Campaign Type Definitions and Objectives
 */

import { CampaignType, CampaignObjective } from '../types/campaign';

export interface CampaignTypeMeta {
  type: CampaignType;
  label: string;
  defaultObjective: CampaignObjective;
  description: string;
  recommendedAudience: string;
}

export const CAMPAIGN_TYPES: Record<CampaignType, CampaignTypeMeta> = {
  WEEKDAY_BOOST: {
    type: 'WEEKDAY_BOOST',
    label: 'Slow Weekday Afternoon Boost',
    defaultObjective: 'MORE_WALK_INS',
    description: 'Fill empty seats and convert quiet afternoon hours with targeted work-from-cafe or snack offers.',
    recommendedAudience: 'Freelancers, remote professionals, and afternoon coffee meetings',
  },
  WEEKEND_MAGNET: {
    type: 'WEEKEND_MAGNET',
    label: 'Weekend Crowd & Brunch Magnet',
    defaultObjective: 'WEEKEND_CROWD',
    description: 'Maximize table turnover and group spend during peak Friday evening to Sunday night hours.',
    recommendedAudience: 'Families, friend groups, brunch lovers, and weekend visitors',
  },
  MENU_LAUNCH: {
    type: 'MENU_LAUNCH',
    label: 'New Menu or Dish Drop',
    defaultObjective: 'PROMOTE_PRODUCT',
    description: 'Introduce signature creations, seasonal ingredients, or specialty pairings.',
    recommendedAudience: 'Foodies, regulars, and adventurous diners',
  },
  FESTIVAL_SPECIAL: {
    type: 'FESTIVAL_SPECIAL',
    label: 'Festival or Holiday Special',
    defaultObjective: 'FESTIVAL_RUSH',
    description: 'Celebrate regional and national cultural moments with festive boxes, feasts, or pre-booking deals.',
    recommendedAudience: 'Neighborhood families, gifting shoppers, and festive diners',
  },
  REVIEW_SPOTLIGHT: {
    type: 'REVIEW_SPOTLIGHT',
    label: 'Customer Review Spotlight',
    defaultObjective: 'MORE_REVIEWS',
    description: 'Highlight 5-star feedback to build social proof and attract new neighborhood discoverers.',
    recommendedAudience: 'Residents who have not yet visited',
  },
  WIN_BACK_REGULARS: {
    type: 'WIN_BACK_REGULARS',
    label: 'Win-Back Inactive Regulars',
    defaultObjective: 'CUSTOMER_RETENTION',
    description: 'Re-engage loyal customers who have not visited in the last 30 to 60 days.',
    recommendedAudience: 'Past customers, VIP members, and WhatsApp contact list',
  },
};
