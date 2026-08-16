/**
 * StreetCraft Billing, Entitlements & Usage Types
 */

import { UUID, ISODateString } from './common';

export type PlanTier = 'FREE' | 'PRO' | 'GROWTH';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  priceINR: number;
  monthlyPackLimit: number;
  annualPriceINR: number;
  channels: ('GOOGLE_BUSINESS' | 'INSTAGRAM' | 'WHATSAPP' | 'IN_STORE_POSTER')[];
  features: string[];
}

export interface PlanEntitlements {
  campaignPacks: number;
  channels: ('GOOGLE_BUSINESS' | 'INSTAGRAM' | 'WHATSAPP' | 'IN_STORE_POSTER')[];
  dailyBriefing: boolean;
  businessMemory: boolean;
  exportOptions: ('CLIPBOARD' | 'CSV' | 'TEXT')[];
  teamSeats: number;
}

export interface DatabasePlan {
  id: string;
  name: string;
  monthly_pack_limit: number;
  price_inr: number;
  channels: string[];
  features: string[];
  active: boolean;
  created_at: string;
}

export interface DatabaseSubscription {
  id: string;
  business_id: string;
  plan_id: string;
  provider: string;
  provider_subscription_id: string | null;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface UsagePeriod {
  id: UUID;
  businessId: UUID;
  periodStart: string;
  periodEnd: string;
  plan: PlanTier;
  packLimit: number;
  packsUsed: number;
  createdAt: ISODateString;
}

export interface UsageEvent {
  id: UUID;
  businessId: UUID;
  userId: UUID;
  eventType: 'CAMPAIGN_PACK_GENERATION' | 'MANUAL_ADJUSTMENT' | 'SUBSCRIPTION_RESET';
  units: number;
  campaignId?: UUID;
  description?: string;
  createdAt: ISODateString;
}

export interface UsageSummary {
  periodId: UUID;
  businessId: UUID;
  plan: PlanTier;
  planName: string;
  priceINR: number;
  monthlyLimit: number;
  usedPacks: number;
  remainingPacks: number;
  percentUsed: number;
  periodStart: string;
  periodEnd: string;
  canGenerate: boolean;
}
