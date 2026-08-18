/**
 * StreetCraft Campaign Domain Types & Zod Output Schemas
 */

import { z } from 'zod';
import { UUID, ISODateString, ValidationStatus } from './common';

export type CampaignType =
  | 'WEEKDAY_BOOST'
  | 'WEEKEND_MAGNET'
  | 'MENU_LAUNCH'
  | 'FESTIVAL_SPECIAL'
  | 'REVIEW_SPOTLIGHT'
  | 'WIN_BACK_REGULARS';

export type CampaignObjective =
  | 'MORE_WALK_INS'
  | 'MORE_ORDERS'
  | 'MORE_BOOKINGS'
  | 'PROMOTE_PRODUCT'
  | 'BRING_BACK_CUSTOMERS'
  | 'REPEAT_VISITS'
  | 'INCREASE_AWARENESS'
  | 'WEEKEND_CROWD'
  | 'FESTIVAL_RUSH'
  | 'MORE_REVIEWS'
  | 'CUSTOMER_RETENTION';

export type ChannelType = 'GOOGLE_BUSINESS' | 'INSTAGRAM' | 'WHATSAPP' | 'IN_STORE_POSTER';

export type CampaignStatus =
  | 'draft'
  | 'generating'
  | 'ready'
  | 'failed'
  | 'published'
  | 'completed'
  | 'archived';

export type ChannelStatus = 'pending' | 'generating' | 'ready' | 'failed';

export interface StructuredOffer {
  title: string;
  description: string;
  value: string;
  terms: string;
}

export interface StructuredSchedule {
  startsAt: string;
  endsAt: string;
  timingLabel: string;
}

export interface CampaignGenerationInput {
  type: CampaignType;
  objective: CampaignObjective;
  audience?: string;
  offer: StructuredOffer;
  schedule: StructuredSchedule;
  customNotes?: string;
}

export interface Campaign {
  id: UUID;
  businessId: UUID | null;
  claimToken?: UUID | null;
  type: CampaignType;
  objective: CampaignObjective;
  audience: string;
  offer: StructuredOffer;
  schedule: StructuredSchedule;
  status: CampaignStatus;
  errorMessage?: string | null;
  performanceNotes: string;
  generationRevision?: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CampaignOutput {
  id: UUID;
  campaignId: UUID;
  channel: ChannelType;
  status: ChannelStatus;
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
  validationStatus: ValidationStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// Zod Channel Output Schemas
export const GoogleBusinessOutputSchema = z.object({
  headline: z.string().min(10).max(120),
  body: z.string().min(50).max(1500),
  ctaType: z.enum(['Call Now', 'Visit Us', 'Order Online', 'Learn More']),
  ctaValue: z.string().optional(),
  offerSummary: z.string().min(5).max(150),
});

export const InstagramOutputSchema = z.object({
  hook: z.string().min(10).max(150),
  caption: z.string().min(50).max(2200),
  storyFrames: z.array(z.string().min(5).max(120)).min(2).max(4),
  reelHook: z.string().min(10).max(150),
  localTags: z.array(z.string()).min(3).max(15),
});

export const WhatsAppOutputSchema = z.object({
  broadcastMessage: z.string().min(20).max(500),
  cta: z.string().min(3).max(60),
  quickReplyPreview: z.string().min(2).max(40),
});

export const PosterOutputSchema = z.object({
  headline: z.string().min(5).max(60),
  subheading: z.string().min(5).max(100),
  body: z.string().min(20).max(250),
  cta: z.string().min(5).max(80),
  offerPill: z.string().min(3).max(40),
});

export type GoogleBusinessOutput = z.infer<typeof GoogleBusinessOutputSchema>;
export type InstagramOutput = z.infer<typeof InstagramOutputSchema>;
export type WhatsAppOutput = z.infer<typeof WhatsAppOutputSchema>;
export type PosterOutput = z.infer<typeof PosterOutputSchema>;

export interface FullCampaignPack {
  campaign: Campaign;
  outputs: {
    googleBusiness: GoogleBusinessOutput;
    instagram: InstagramOutput;
    whatsapp: WhatsAppOutput;
    poster?: PosterOutput;
  };
  validationStatus: ValidationStatus;
}
