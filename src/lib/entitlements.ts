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
    monthlyPackLimit: 3,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP'],
    features: [
      '3 complete campaign packs / month',
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
    monthlyPackLimit: 100,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    features: [
      '100 complete campaign packs / month',
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
    monthlyPackLimit: 300,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    features: [
      '300 complete campaign packs / month',
      'Multi-team seats & roles (owner, admin, member)',
      'Priority local relevance enrichment',
      'Custom keyword prioritization',
      'Audit log access',
    ],
  },
  FOUNDER: {
    id: 'FOUNDER',
    name: 'Early Adopter Pro',
    priceINR: 279,
    annualPriceINR: 2790,
    monthlyPackLimit: 100,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    features: [
      '100 complete campaign packs / month',
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
    campaignPacks: 3,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP'],
    dailyBriefing: true,
    businessPreferences: true,
    exportOptions: ['CLIPBOARD'],
    teamSeats: 1,
  },
  PRO: {
    campaignPacks: 100,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    dailyBriefing: true,
    businessPreferences: true,
    exportOptions: ['CLIPBOARD', 'CSV', 'TEXT'],
    teamSeats: 3,
  },
  GROWTH: {
    campaignPacks: 300,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    dailyBriefing: true,
    businessPreferences: true,
    exportOptions: ['CLIPBOARD', 'CSV', 'TEXT'],
    teamSeats: 10,
  },
  FOUNDER: {
    campaignPacks: 100,
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
  key: K
): PlanEntitlements[K] {
  const entitlements = PLAN_ENTITLEMENTS[plan] || PLAN_ENTITLEMENTS.FREE;
  return entitlements[key];
}

export function canGeneratePack(usedPacks: number, packLimit: number): boolean {
  return usedPacks < packLimit;
}
