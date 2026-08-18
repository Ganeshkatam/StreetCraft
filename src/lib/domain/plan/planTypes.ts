export type SubscriptionStatus =
  | 'ACTIVE'
  | 'TRIALING'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'CANCEL_SCHEDULED';

export interface CommercialSubscriptionSummary {
  id: string;
  planId: string;
  planName: string;
  monthlyInr: number;
  status: SubscriptionStatus;
  billingCycle: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  storefrontLimit: number;
  monthlyCampaignLimit: number;
}

export interface BusinessQuotaSummary {
  businessId: string;
  businessName: string;
  campaignsUsed: number;
  campaignLimit: number;
  campaignsRemaining: number;
  percentUsed: number;
  canGenerate: boolean;
}

export interface BillingActivityItem {
  id: string;
  eventType: 'CAMPAIGN_GENERATION' | 'CAMPAIGN_REGENERATION' | 'SUBSCRIPTION_RENEWAL' | 'PLAN_UPGRADE';
  description: string;
  unitsDelta: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface StorePlanViewModel {
  businessId: string;
  businessName: string;
  connectedStorefrontsCount: number;
  subscription: CommercialSubscriptionSummary;
  quota: BusinessQuotaSummary;
  activityLedger: BillingActivityItem[];
}
