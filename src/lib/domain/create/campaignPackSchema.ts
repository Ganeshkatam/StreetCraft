import { z } from 'zod';

export const GoogleBusinessContentSchema = z.object({
  headline: z.string().min(1),
  body: z.string().min(1),
  callToAction: z.string().min(1),
  couponCode: z.string().optional().nullable(),
  eventDate: z.string().optional().nullable(),
});

export const InstagramContentSchema = z.object({
  caption: z.string().min(1),
  hashtags: z.array(z.string()).min(1),
  visualHook: z.string().min(1),
  storyPrompt: z.string().optional().nullable(),
});

export const WhatsAppContentSchema = z.object({
  messageText: z.string().min(1),
  ctaButtonText: z.string().min(1),
  urgencyNote: z.string().optional().nullable(),
});

export const InStorePosterContentSchema = z.object({
  headline: z.string().min(1),
  subheadline: z.string().min(1),
  bodyPoints: z.array(z.string()).min(1),
  qrCodePrompt: z.string().min(1),
  finePrint: z.string().optional().nullable(),
});

export const CampaignPackSchema = z.object({
  googleBusiness: GoogleBusinessContentSchema,
  instagram: InstagramContentSchema,
  whatsapp: WhatsAppContentSchema,
  poster: InStorePosterContentSchema,
});

export type ValidatedCampaignPack = z.infer<typeof CampaignPackSchema>;
