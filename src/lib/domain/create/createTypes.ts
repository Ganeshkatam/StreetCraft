import { CampaignType, CampaignObjective } from '../../../types/campaign';
import { FestivalMoment } from '../../server/opportunities/getFestivalMoments';

export interface CreatePreset {
  type?: CampaignType;
  objective?: CampaignObjective;
  offerTitle?: string;
  offerDescription?: string;
  offerValue?: string;
  offerTerms?: string;
  timingLabel?: string;
  customNotes?: string;
}

export interface CreateCampaignBusinessSummary {
  id: string;
  name: string;
  category: string;
  neighborhood?: string;
  city?: string;
}

export interface CreateCampaignProfileSummary {
  signatureItems: string;
  targetCustomer: string;
  defaultOffer: string;
  styleVoice: string;
  slowHours: string | null;
  peakHours: string | null;
  avgTicketInr: number | null;
}

export interface CreateCampaignEntitlementSummary {
  available: boolean;
  campaignLimit: number;
  campaignsUsed: number;
  campaignsRemaining: number;
  isQuotaExceeded: boolean;
}

export interface CreateCampaignViewModel {
  business: CreateCampaignBusinessSummary;
  profile: CreateCampaignProfileSummary | null;
  entitlement: CreateCampaignEntitlementSummary;
  festivals: FestivalMoment[];
  preset: CreatePreset | null;
}
