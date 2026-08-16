/**
 * StreetCraft Zod Output Validator & Auto-Repair Engine
 * Enforces strict channel schemas and repairs outputs if necessary.
 */

import { z } from 'zod';
import {
  GoogleBusinessOutput,
  GoogleBusinessOutputSchema,
  InstagramOutput,
  InstagramOutputSchema,
  WhatsAppOutput,
  WhatsAppOutputSchema,
  PosterOutput,
  PosterOutputSchema,
} from '../types/campaign';
import { ValidationReport, ValidationIssue } from '../types/common';

export interface ChannelOutputsBundle {
  googleBusiness: GoogleBusinessOutput;
  instagram: InstagramOutput;
  whatsapp: WhatsAppOutput;
  poster: PosterOutput;
}

export function validateAllOutputs(bundle: ChannelOutputsBundle): ValidationReport {
  const issues: ValidationIssue[] = [];

  // 1. Google Business
  const gResult = GoogleBusinessOutputSchema.safeParse(bundle.googleBusiness);
  if (!gResult.success) {
    gResult.error.issues.forEach((err: z.ZodIssue) => {
      issues.push({
        field: `googleBusiness.${err.path.join('.')}`,
        message: err.message,
        severity: 'error',
      });
    });
  }

  // 2. Instagram
  const igResult = InstagramOutputSchema.safeParse(bundle.instagram);
  if (!igResult.success) {
    igResult.error.issues.forEach((err: z.ZodIssue) => {
      issues.push({
        field: `instagram.${err.path.join('.')}`,
        message: err.message,
        severity: 'error',
      });
    });
  }

  // 3. WhatsApp
  const waResult = WhatsAppOutputSchema.safeParse(bundle.whatsapp);
  if (!waResult.success) {
    waResult.error.issues.forEach((err: z.ZodIssue) => {
      issues.push({
        field: `whatsapp.${err.path.join('.')}`,
        message: err.message,
        severity: 'error',
      });
    });
  }

  // 4. Poster
  const pResult = PosterOutputSchema.safeParse(bundle.poster);
  if (!pResult.success) {
    pResult.error.issues.forEach((err: z.ZodIssue) => {
      issues.push({
        field: `poster.${err.path.join('.')}`,
        message: err.message,
        severity: 'error',
      });
    });
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Ensures fallback content is fully compliant with Zod schemas.
 */
export function sanitizeGoogleBusiness(raw: Partial<GoogleBusinessOutput>, fallbackName: string): GoogleBusinessOutput {
  return {
    headline: (raw.headline || `Special update at ${fallbackName}`).slice(0, 115),
    body: raw.body && raw.body.length >= 30 ? raw.body : `Visit ${fallbackName} this week to enjoy our latest handcrafted specials and seasonal favorites. Available for dine-in and takeaway.`,
    ctaType: raw.ctaType || 'Visit Us',
    ctaValue: raw.ctaValue || '',
    offerSummary: (raw.offerSummary || 'Special limited time offer').slice(0, 95),
  };
}

export function sanitizeInstagram(raw: Partial<InstagramOutput>, fallbackTags: string[]): InstagramOutput {
  return {
    hook: (raw.hook || 'Your next favorite coffee ritual awaits.').slice(0, 135),
    caption: raw.caption && raw.caption.length >= 30 ? raw.caption : 'Step into our calm corner for fresh roasts and delicious bakes. Tag a friend who needs a break today!',
    storyFrames: raw.storyFrames && raw.storyFrames.length > 0 ? raw.storyFrames : ['FRESH ROASTS & BAKES', 'TODAY AT OUR COUNTER'],
    reelHook: (raw.reelHook || 'Why this neighborhood cafe is buzzing this week').slice(0, 115),
    localTags: raw.localTags && raw.localTags.length >= 2 ? raw.localTags : fallbackTags,
  };
}

export function sanitizeWhatsApp(raw: Partial<WhatsAppOutput>, fallbackName: string): WhatsAppOutput {
  return {
    broadcastMessage: (raw.broadcastMessage || `Hi from ${fallbackName}! Drop by this week for our exclusive neighborhood promotion. Show this message at checkout to redeem!`).slice(0, 490),
    cta: (raw.cta || 'Show message at counter').slice(0, 55),
    quickReplyPreview: raw.quickReplyPreview || 'Claim Offer',
  };
}

export function sanitizePoster(raw: Partial<PosterOutput>, fallbackName: string): PosterOutput {
  return {
    headline: (raw.headline || 'FRESH SPECIALS DAILY').slice(0, 55),
    subheading: (raw.subheading || 'Handcrafted roasts and artisanal bakes').slice(0, 115),
    body: (raw.body || `Ask our barista at the counter about today's fresh special at ${fallbackName}.`).slice(0, 240),
    cta: (raw.cta || 'Inquire at counter').slice(0, 75),
    offerPill: (raw.offerPill || 'Special Offer').slice(0, 35),
  };
}
