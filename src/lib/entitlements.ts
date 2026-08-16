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
    monthlyPackLimit: 5,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP'],
    features: [
      '5 multi-channel campaign packs / month',
      'Google Business, Instagram & WhatsApp copy',
      'Basic business profile memory',
      'One-click clipboard export',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'High-Street Pro',
    priceINR: 799,
    annualPriceINR: 7990,
    monthlyPackLimit: 100,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    features: [
      '100 multi-channel campaign packs / month',
      'All 4 channels (Google, IG, WhatsApp, In-Store Poster)',
      'Permanent Business Memory & neighborhood context',
      'Daily Morning Opportunity Briefings',
      'Campaign Vault with performance notes',
      'CSV & Text Export',
    ],
  },
  GROWTH: {
    id: 'GROWTH',
    name: 'Multi-Store Growth',
    priceINR: 1499,
    annualPriceINR: 14990,
    monthlyPackLimit: 300,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    features: [
      '300 multi-channel campaign packs / month',
      'Multi-team seats & roles (owner, admin, member)',
      'Priority local relevance enrichment',
      'Custom keyword prioritization',
      'Audit log access',
    ],
  },
};

export const PLAN_ENTITLEMENTS: Record<PlanTier, PlanEntitlements> = {
  FREE: {
    campaignPacks: 5,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP'],
    dailyBriefing: true,
    businessMemory: true,
    exportOptions: ['CLIPBOARD'],
    teamSeats: 1,
  },
  PRO: {
    campaignPacks: 100,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    dailyBriefing: true,
    businessMemory: true,
    exportOptions: ['CLIPBOARD', 'CSV', 'TEXT'],
    teamSeats: 3,
  },
  GROWTH: {
    campaignPacks: 300,
    channels: ['GOOGLE_BUSINESS', 'INSTAGRAM', 'WHATSAPP', 'IN_STORE_POSTER'],
    dailyBriefing: true,
    businessMemory: true,
    exportOptions: ['CLIPBOARD', 'CSV', 'TEXT'],
    teamSeats: 10,
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
