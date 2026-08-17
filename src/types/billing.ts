/**
 * StreetCraft Billing, Entitlements & Usage Types
 */

import { UUID, ISODateString } from './common';

export type PlanTier = 'FREE' | 'PRO' | 'GROWTH' | 'FOUNDER';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  priceINR: number;
  monthlyCampaignLimit: number;
  monthlyPackLimit?: number; // legacy alias
  annualPriceINR: number;
  channels: ('GOOGLE_BUSINESS' | 'INSTAGRAM' | 'WHATSAPP' | 'IN_STORE_POSTER')[];
  features: string[];
}

export interface PlanEntitlements {
  campaigns: number;
  campaignPacks?: number; // legacy alias
  channels: ('GOOGLE_BUSINESS' | 'INSTAGRAM' | 'WHATSAPP' | 'IN_STORE_POSTER')[];
  dailyBriefing: boolean;
  businessPreferences: boolean;
  exportOptions: ('CLIPBOARD' | 'CSV' | 'TEXT' | 'MARKDOWN' | 'JSON')[];
  teamSeats: number;
}

export interface DatabasePlan {
  id: PlanTier;
  name: string;
  monthly_campaign_limit: number;
  monthly_pack_limit?: number; // legacy alias
  monthly_inr: number;
  quarterly_price_inr: number;
  annual_price_inr: number;
  business_limit: number;
  channels: ('GOOGLE_BUSINESS' | 'INSTAGRAM' | 'WHATSAPP' | 'IN_STORE_POSTER')[];
  features: string[];
  active: boolean;
  created_at: string;
}

export interface DatabaseSubscription {
  id: string;
  user_id: string;
  business_id?: string;
  plan_id: string;
  provider: string;
  provider_subscription_id: string | null;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING';
  billing_cycle?: 'quarterly' | 'annual';
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
  campaignLimit: number;
  campaignsUsed: number;
  packLimit?: number; // legacy alias
  packsUsed?: number; // legacy alias
  createdAt: ISODateString;
}

export interface UsageEvent {
  id: UUID;
  businessId: UUID;
  userId: UUID;
  eventType: 'CAMPAIGN_GENERATION' | 'CAMPAIGN_PACK_GENERATION' | 'MANUAL_ADJUSTMENT' | 'SUBSCRIPTION_RESET';
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
  usedCampaigns: number;
  remainingCampaigns: number;
  usedPacks: number;
  remainingPacks: number;
  percentUsed: number;
  periodStart: string;
  periodEnd: string;
  canGenerate: boolean;
}

export interface GatewayPaymentPayload {
  orderId: string;
  paymentId: string;
  signature: string;
  planId: PlanTier;
  billingCycle: 'quarterly' | 'annual';
}
