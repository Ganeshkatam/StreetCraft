import { CampaignType, CampaignObjective, CampaignStatus } from '../../../types/campaign';

export interface TodayStorefrontSummary {
  id: string;
  name: string;
  category: string;
  neighborhood?: string;
  city?: string;
  signatureItems: string;
}

export interface TodayBriefingSummary {
  greeting: string;
  dateString: string;
  subtitle: string;
}

export interface TodayOpportunitySummary {
  id: string;
  tag: string;
  title: string;
  description: string;
  actionLabel: string;
  preset: {
    type: CampaignType;
    objective: CampaignObjective;
    offerTitle: string;
    offerDescription: string;
    timingLabel: string;
    customNotes?: string;
  };
}

export interface TodayVaultSummary {
  id: string;
  type: string;
  status: CampaignStatus;
  offerTitle: string;
  timingLabel: string;
}

export interface TodayQuotaSummary {
  businessId: string;
  planName: string;
  campaignsUsed: number;
  campaignLimit: number;
  campaignsRemaining: number;
  percentUsed: number;
  canGenerate: boolean;
}

export interface TodayFestivalSummary {
  id: string;
  name: string;
  relativeTimeLabel: string;
  formattedDate: string;
  isTodayOrActive: boolean;
  marketingRelevance: string;
  suggestedOffer?: string;
}

export interface TodayViewModel {
  storefront: TodayStorefrontSummary;
  briefing: TodayBriefingSummary;
  opportunities: TodayOpportunitySummary[];
  recentVault: TodayVaultSummary[];
  quota: TodayQuotaSummary | null;
  festivals: TodayFestivalSummary[];
}
