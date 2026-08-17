/**
 * StreetCraft Centralized Entitlements & Plan Matrix
 */

import { PlanTier, PlanConfig, PlanEntitlements } from '../types/billing';

export const PLANS: Record<PlanTier, PlanConfig> = {
  FREE: {
    id: 'FREE',
    name: 'Neighborhood Starter',
    priceINR: 0,
    annualPriceINR: 0,
    monthlyCampaignLimit: 3,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP'],
    features: [
      '3 complete campaigns / month',
      'Google Business, Instagram & WhatsApp copy',
      'Basic business profile preferences',
      'One-click clipboard export',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'High-Street Pro',
    priceINR: 399,
    annualPriceINR: 3990,
    monthlyCampaignLimit: 100,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    features: [
      '100 complete campaigns / month',
      'All storefront formats (Google, IG, WhatsApp, In-Store Poster)',
      'Permanent Business Preferences & neighborhood context',
      'Daily Morning Opportunity Briefings',
      'Campaign Vault with performance notes',
      'CSV & Text Export',
    ],
  },
  GROWTH: {
    id: 'GROWTH',
    name: 'Multi-Store Growth',
    priceINR: 799,
    annualPriceINR: 7990,
    monthlyCampaignLimit: 300,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    features: [
      '300 complete campaigns / month',
      'Multi-team seats & roles (owner, admin, member)',
      'Priority contextual relevance enrichment',
      'Custom keyword prioritization',
      'Audit log access',
    ],
  },
  FOUNDER: {
    id: 'FOUNDER',
    name: 'Early Adopter Pro',
    priceINR: 279,
    annualPriceINR: 2790,
    monthlyCampaignLimit: 100,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    features: [
      '100 complete campaigns / month',
      'All storefront formats (Google, IG, WhatsApp, In-Store Poster)',
      'Permanent Business Preferences & neighborhood context',
      'Daily Morning Opportunity Briefings',
      'Campaign Vault with performance notes',
      'One Founder claim per account',
    ],
  },
};

export const PLAN_ENTITLEMENTS: Record<PlanTier, PlanEntitlements> = {
  FREE: {
    campaigns: 3,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP'],
    dailyBriefing: true,
    businessPreferences: true,
    exportOptions: ['CLIPBOARD'],
    teamSeats: 1,
  },
  PRO: {
    campaigns: 100,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    dailyBriefing: true,
    businessPreferences: true,
    exportOptions: ['CLIPBOARD', 'CSV', 'TEXT'],
    teamSeats: 3,
  },
  GROWTH: {
    campaigns: 300,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    dailyBriefing: true,
    businessPreferences: true,
    exportOptions: ['CLIPBOARD', 'CSV', 'TEXT'],
    teamSeats: 10,
  },
  FOUNDER: {
    campaigns: 100,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    dailyBriefing: true,
    businessPreferences: true,
    exportOptions: ['CLIPBOARD', 'CSV', 'TEXT'],
    teamSeats: 5,
  },
};

export function getPlanConfig(plan: PlanTier): PlanConfig {
  return PLANS[plan] || PLANS.FREE;
}

export function getEntitlement<K extends keyof PlanEntitlements>(
  plan: PlanTier,
  feature: K
): PlanEntitlements[K] {
  const entitlements = PLAN_ENTITLEMENTS[plan] || PLAN_ENTITLEMENTS.FREE;
  return entitlements[feature];
}

export function hasChannelAccess(
  plan: PlanTier,
  channel: 'GOOGLE_BUSINESS' | 'INSTAGRAM' | 'WHATSAPP' | 'IN_STORE_POSTER'
): boolean {
  const channels = getEntitlement(plan, 'channels');
  return channels.includes(channel);
}

export function canCreateCampaignPack(
  plan: PlanTier,
  currentMonthPacksUsed: number
): boolean {
  const packLimit = getEntitlement(plan, 'campaigns');
  return currentMonthPacksUsed < packLimit;
}
