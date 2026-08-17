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
 * Ensures content is fully compliant with Zod schemas with clean, dynamic fallback defaults.
 */
export function sanitizeGoogleBusiness(raw: Partial<GoogleBusinessOutput>, fallbackName: string): GoogleBusinessOutput {
  const store = fallbackName || 'our store';
  return {
    headline: (raw.headline || `Special update at ${store}`).slice(0, 115),
    body: raw.body && raw.body.length >= 30 ? raw.body : `Visit ${store} this week to explore our latest specials and counter offers. Available in-store.`,
    ctaType: raw.ctaType || 'Visit Us',
    ctaValue: raw.ctaValue || '',
    offerSummary: (raw.offerSummary || 'Special in-store offer').slice(0, 95),
  };
}

export function sanitizeInstagram(raw: Partial<InstagramOutput>, fallbackTags: string[]): InstagramOutput {
  return {
    hook: (raw.hook || 'Discover what is happening at our counter this week.').slice(0, 135),
    caption: raw.caption && raw.caption.length >= 30 ? raw.caption : 'Drop by today to experience our latest specials and signature favorites. Tag someone who should visit!',
    storyFrames: raw.storyFrames && raw.storyFrames.length > 0 ? raw.storyFrames : ['EXCLUSIVE SPECIALS', 'VISIT OUR COUNTER TODAY'],
    reelHook: (raw.reelHook || 'What is happening in our neighborhood this week').slice(0, 115),
    localTags: raw.localTags && raw.localTags.length >= 2 ? raw.localTags : (fallbackTags.length > 0 ? fallbackTags : ['#localbusiness', '#neighborhood']),
  };
}

export function sanitizeWhatsApp(raw: Partial<WhatsAppOutput>, fallbackName: string): WhatsAppOutput {
  const store = fallbackName || 'our store';
  return {
    broadcastMessage: (raw.broadcastMessage || `Hi from ${store}! Drop by this week for our exclusive neighborhood special. Show this message at the counter to redeem!`).slice(0, 490),
    cta: (raw.cta || 'Show message at counter').slice(0, 55),
    quickReplyPreview: raw.quickReplyPreview || 'Claim Offer',
  };
}

export function sanitizePoster(raw: Partial<PosterOutput>, fallbackName: string): PosterOutput {
  const store = fallbackName || 'our store';
  return {
    headline: (raw.headline || 'TODAY AT THE COUNTER').slice(0, 55),
    subheading: (raw.subheading || 'Ask our team about our featured counter special').slice(0, 115),
    body: (raw.body || `Ask our team at the counter about today's special offer at ${store}.`).slice(0, 240),
    cta: (raw.cta || 'Inquire at counter').slice(0, 75),
    offerPill: (raw.offerPill || 'Featured Special').slice(0, 35),
  };
}
