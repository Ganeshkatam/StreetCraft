import type { NotificationPreferences } from './notificationPreferences';

export interface IdentityViewModel {
  userId: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface StorefrontSummary {
  id: string;
  name: string;
  category: string;
  neighborhood?: string;
  city?: string;
  role: string;
  isActive: boolean;
}

export interface StorefrontsViewModel {
  activeBusinessId: string | null;
  storefronts: StorefrontSummary[];
  totalCount: number;
}

export type NotificationsViewModel = NotificationPreferences;

export interface SecurityViewModel {
  email: string;
  provider: string;
  lastSignInAt: string | null;
  createdAt: string;
}

export interface SubscriptionSummary {
  id: string;
  planId: string;
  status: string;
  billingCycle: string;
}

export interface PlanSummary {
  id: string;
  name: string;
  monthlyInr: number;
  businessLimit: number;
  monthlyCampaignLimit: number;
}

export interface UsageSummary {
  businessId: string;
  businessName: string;
  campaignsUsed: number;
  campaignLimit: number;
  campaignsRemaining: number;
}

export interface PlanViewModel {
  subscription: SubscriptionSummary | null;
  plan: PlanSummary | null;
  usage: UsageSummary | null;
}
