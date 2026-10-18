import { z } from 'zod';

export const GoogleBusinessContentSchema = z.object({
  headline: z.string().min(1),
  body: z.string().min(1),
  ctaType: z.string().optional(),
  callToAction: z.string().optional(),
  ctaValue: z.string().optional(),
  offerSummary: z.string().optional(),
  couponCode: z.string().optional().nullable(),
  eventDate: z.string().optional().nullable(),
}).refine((data) => Boolean(data.ctaType || data.callToAction), {
  message: 'Either ctaType or callToAction is required',
});

export const InstagramContentSchema = z.object({
  caption: z.string().min(1),
  hashtags: z.array(z.string()).optional(),
  localTags: z.array(z.string()).optional(),
  visualHook: z.string().optional(),
  reelHook: z.string().optional(),
  storyFrames: z.array(z.string()).optional(),
  storyPrompt: z.string().optional().nullable(),
  hook: z.string().optional(),
}).refine(
  (data) => (Array.isArray(data.hashtags) && data.hashtags.length > 0) || (Array.isArray(data.localTags) && data.localTags.length > 0),
  {
    message: 'At least one hashtag or local tag is required',
  }
);

export const WhatsAppContentSchema = z.object({
  messageText: z.string().optional(),
  broadcastMessage: z.string().optional(),
  ctaButtonText: z.string().optional(),
  cta: z.string().optional(),
  quickReplyPreview: z.string().optional(),
  urgencyNote: z.string().optional().nullable(),
}).refine((data) => Boolean(data.messageText || data.broadcastMessage), {
  message: 'Message text or broadcastMessage is required',
});

export const InStorePosterContentSchema = z.object({
  headline: z.string().min(1),
  subheadline: z.string().optional(),
  subheading: z.string().optional(),
  body: z.string().optional(),
  bodyPoints: z.array(z.string()).optional(),
  cta: z.string().optional(),
  qrCodePrompt: z.string().optional(),
  finePrint: z.string().optional().nullable(),
  offerPill: z.string().optional(),
});

export const CampaignPackSchema = z.object({
  googleBusiness: GoogleBusinessContentSchema,
  instagram: InstagramContentSchema,
  whatsapp: WhatsAppContentSchema,
  poster: InStorePosterContentSchema,
});

export type ValidatedCampaignPack = z.infer<typeof CampaignPackSchema>;
