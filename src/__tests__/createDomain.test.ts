import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseCreatePresetFromSearchParams } from '../lib/domain/create/createPreset';
import {
  CreatePresetSchema,
  CreateCampaignInputSchema,
} from '../lib/domain/create/createSchemas';
import { CampaignPackSchema } from '../lib/domain/create/campaignPackSchema';
import {
  mapDatabaseRpcErrorToGenerationError,
  GENERATION_ERROR_MESSAGES,
} from '../lib/domain/create/generationErrors';

describe('Create Domain: SearchParams Preset Parser', () => {
  it('returns null when no relevant searchParams are provided', () => {
    assert.strictEqual(parseCreatePresetFromSearchParams({}), null);
    assert.strictEqual(parseCreatePresetFromSearchParams({ biz: '11111111-1111-1111-1111-111111111111' }), null);
  });

  it('correctly parses valid campaign preset parameters', () => {
    const params = {
      type: 'WEEKDAY_BOOST',
      objective: 'MORE_ORDERS',
      offer_title: 'Afternoon Sourdough Special',
      offer_desc: 'Get 50% off on all specialty coffees with any pastry.',
      timing_label: '3 PM - 6 PM',
    };

    const preset = parseCreatePresetFromSearchParams(params);
    assert.notStrictEqual(preset, null);
    assert.strictEqual(preset?.type, 'WEEKDAY_BOOST');
    assert.strictEqual(preset?.objective, 'MORE_ORDERS');
    assert.strictEqual(preset?.offerTitle, 'Afternoon Sourdough Special');
    assert.strictEqual(preset?.timingLabel, '3 PM - 6 PM');
  });

  it('rejects invalid enum values gracefully', () => {
    const invalidParams = {
      type: 'NOT_A_REAL_TYPE',
      offer_title: 'Valid Title',
    };
    assert.strictEqual(parseCreatePresetFromSearchParams(invalidParams), null);
  });

  it('rejects oversized offer titles (> 100 chars)', () => {
    const oversizedTitle = 'A'.repeat(101);
    const params = {
      offer_title: oversizedTitle,
      offer_desc: 'Valid description',
    };
    assert.strictEqual(parseCreatePresetFromSearchParams(params), null);
  });
});

describe('Create Domain: Campaign Input Validation Schema', () => {
  it('validates a complete valid input payload', () => {
    const validPayload = {
      businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      generationRequestId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      type: 'WEEKDAY_BOOST',
      objective: 'MORE_ORDERS',
      audience: 'Neighborhood office workers and remote freelancers',
      offer: {
        title: 'Afternoon Roast Special',
        description: 'Complimentary cinnamon roll with any large brew.',
        value: 'Save ₹150',
        terms: 'Dine-in only.',
      },
      schedule: {
        startDate: '2026-08-20',
        endDate: '2026-08-27',
        timingLabel: 'Mon-Thu, 3 PM - 6 PM',
      },
      customNotes: 'Highlight our high-speed WiFi and outdoor patio.',
    };

    const result = CreateCampaignInputSchema.safeParse(validPayload);
    assert.strictEqual(result.success, true);
  });

  it('rejects invalid UUID business identifier', () => {
    const invalidPayload = {
      businessId: 'not-a-valid-uuid',
      type: 'WEEKDAY_BOOST',
      objective: 'MORE_ORDERS',
      offer: {
        title: 'Valid Title',
        description: 'Valid description of the offer.',
      },
      schedule: {},
    };

    const result = CreateCampaignInputSchema.safeParse(invalidPayload);
    assert.strictEqual(result.success, false);
  });

  it('rejects too short offer title or description', () => {
    const shortPayload = {
      businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      type: 'WEEKDAY_BOOST',
      objective: 'MORE_ORDERS',
      offer: {
        title: 'A',
        description: 'Tiny',
      },
      schedule: {},
    };

    const result = CreateCampaignInputSchema.safeParse(shortPayload);
    assert.strictEqual(result.success, false);
  });
});

describe('Create Domain: Campaign Pack 4-Channel Validation', () => {
  const completePack = {
    googleBusiness: {
      headline: 'Afternoon Pick-Me-Up at Corner Cafe',
      body: 'Enjoy half-priced artisanal brews every weekday from 3 to 6 PM.',
      callToAction: 'Visit Store Today',
      couponCode: 'AFTERNOON50',
      eventDate: null,
    },
    instagram: {
      caption: 'Your 4 PM craving just met its match. Fresh sourdough and pour-over pairings all week.',
      hashtags: ['#LocalCafe', '#SpecialtyCoffee', '#PastryPairing'],
      visualHook: 'Close up steam rising from fresh filter coffee alongside warm flaky pastry.',
      storyPrompt: 'Tag your coffee break partner.',
    },
    whatsapp: {
      messageText: 'Hello! Drop by Corner Cafe today between 3–6 PM for our afternoon coffee & pastry special.',
      ctaButtonText: 'View Location on Map',
      urgencyNote: 'Valid this week only',
    },
    poster: {
      headline: 'Afternoon Sourdough Special',
      subheadline: 'Pair any pour-over with a fresh pastry for ₹199',
      bodyPoints: ['Freshly baked daily', 'Valid 3 PM – 6 PM', 'Dine-in only'],
      qrCodePrompt: 'Scan to claim your counter coupon',
      finePrint: 'One per customer. Subject to availability.',
    },
  };

  it('validates a complete, structured 4-channel pack', () => {
    const result = CampaignPackSchema.safeParse(completePack);
    assert.strictEqual(result.success, true);
  });

  it('rejects a pack missing the In-Store Poster channel', () => {
    const incomplete = {
      googleBusiness: completePack.googleBusiness,
      instagram: completePack.instagram,
      whatsapp: completePack.whatsapp,
    };

    const result = CampaignPackSchema.safeParse(incomplete);
    assert.strictEqual(result.success, false);
  });

  it('rejects a pack with empty hashtags array in Instagram', () => {
    const invalidInstagram = {
      ...completePack,
      instagram: {
        ...completePack.instagram,
        hashtags: [],
      },
    };

    const result = CampaignPackSchema.safeParse(invalidInstagram);
    assert.strictEqual(result.success, false);
  });
});

describe('Create Domain: Database RPC Error Mapping', () => {
  it('maps UNAUTHORIZED database error to UNAUTHORIZED_BUSINESS code', () => {
    const mapped = mapDatabaseRpcErrorToGenerationError('RPC Error: UNAUTHORIZED business membership');
    assert.strictEqual(mapped.code, 'UNAUTHORIZED_BUSINESS');
    assert.strictEqual(mapped.message, GENERATION_ERROR_MESSAGES.UNAUTHORIZED_BUSINESS);
  });

  it('maps QUOTA_EXHAUSTED database error to QUOTA_EXHAUSTED code', () => {
    const mapped = mapDatabaseRpcErrorToGenerationError('RPC Error: QUOTA_EXHAUSTED for current usage period');
    assert.strictEqual(mapped.code, 'QUOTA_EXHAUSTED');
    assert.strictEqual(mapped.message, GENERATION_ERROR_MESSAGES.QUOTA_EXHAUSTED);
  });

  it('maps ENTITLEMENT_UNAVAILABLE database error to ENTITLEMENT_UNAVAILABLE code', () => {
    const mapped = mapDatabaseRpcErrorToGenerationError('RPC Error: ENTITLEMENT_UNAVAILABLE');
    assert.strictEqual(mapped.code, 'ENTITLEMENT_UNAVAILABLE');
    assert.strictEqual(mapped.message, GENERATION_ERROR_MESSAGES.ENTITLEMENT_UNAVAILABLE);
  });

  it('maps unclassified RPC errors to PERSISTENCE_FAILED', () => {
    const mapped = mapDatabaseRpcErrorToGenerationError('Generic Postgres failure connection timeout');
    assert.strictEqual(mapped.code, 'PERSISTENCE_FAILED');
    assert.strictEqual(mapped.message, GENERATION_ERROR_MESSAGES.PERSISTENCE_FAILED);
  });
});
