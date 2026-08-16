/**
 * Immutable Channel Validation Parameters & Limits
 */

export const VALIDATION_LIMITS = {
  GOOGLE_BUSINESS: {
    MIN_HEADLINE: 10,
    MAX_HEADLINE: 120,
    MIN_BODY: 50,
    MAX_BODY: 1500,
  },
  INSTAGRAM: {
    MIN_HOOK: 10,
    MAX_HOOK: 150,
    MIN_CAPTION: 50,
    MAX_CAPTION: 2200,
    MIN_TAGS: 3,
    MAX_TAGS: 15,
  },
  WHATSAPP: {
    MIN_MESSAGE: 20,
    MAX_MESSAGE: 500,
    MIN_CTA: 3,
    MAX_CTA: 60,
  },
  IN_STORE_POSTER: {
    MIN_HEADLINE: 5,
    MAX_HEADLINE: 60,
    MIN_SUBHEADING: 5,
    MAX_SUBHEADING: 100,
    MIN_BODY: 20,
    MAX_BODY: 250,
  },
} as const;
