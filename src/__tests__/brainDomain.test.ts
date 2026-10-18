import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  buildBrainStoreContext,
  calculateOpportunityScore,
  detectBrainOpportunities,
  formulateStrategicBlueprint,
  synthesizeCampaignSpec,
  validateBrainSpecification,
} from '../brain/index';
import { generateCampaignPack } from '../engine/campaignEngine';
import { CampaignPackSchema } from '../lib/domain/create/campaignPackSchema';

describe('Brain: Store Context Builder', () => {
  it('correctly maps store profile and computes campaign recency', () => {
    const profile = {
      businessId: '00000000-0000-0000-0000-000000000001',
      name: 'Blue Door Cafe',
      category: 'CAFE',
      neighborhood: 'Indiranagar',
      city: 'Bengaluru',
      signatureItems: 'Cold Brew, Almond Croissant, Sourdough Toast',
      targetCustomer: 'Remote workers and neighborhood creatives',
      slowHours: '3:00 PM – 5:30 PM',
    };

    const refDate = new Date('2026-08-19T14:30:00Z'); // Wednesday 2:30 PM
    const context = buildBrainStoreContext(profile, [], [], undefined, refDate);

    assert.strictEqual(context.name, 'Blue Door Cafe');
    assert.strictEqual(context.category, 'CAFE');
    assert.strictEqual(context.signatureItems.length, 3);
    assert.strictEqual(context.signatureItems[0], 'Cold Brew');
    assert.strictEqual(context.signatureItems[1], 'Almond Croissant');
    assert.strictEqual(context.isWeekend, false);
  });
});

describe('Brain: Opportunity Scoring', () => {
  it('gives high confidence to afternoon slow hours during weekday afternoons', () => {
    const context = buildBrainStoreContext(
      {
        name: 'Artisan Bakery',
        category: 'BAKERY',
        neighborhood: 'Koramangala',
        signatureItems: 'Focaccia, Pain au Chocolat',
        slowHours: '3:00 PM – 5:00 PM',
      },
      [],
      [],
      undefined,
      new Date('2026-08-19T14:00:00') // 2 PM Wednesday
    );

    const score = calculateOpportunityScore(context, 'SLOW_HOUR');
    assert.ok(score.score >= 75);
    assert.strictEqual(score.confidence, 'HIGH');
    assert.ok(score.reasons.length >= 3);
  });

  it('boosts festival score when festival is within 7 days', () => {
    const context = buildBrainStoreContext(
      { name: 'Sweets Corner', category: 'RETAIL', neighborhood: 'Jayanagar' },
      [],
      [],
      undefined,
      new Date('2026-08-19T10:00:00')
    );

    const score = calculateOpportunityScore(context, 'FESTIVAL', { festivalDaysRemaining: 3 });
    assert.ok(score.score >= 70);
    assert.ok(score.reasons.some((r) => r.includes('High cultural urgency')));
  });
});

describe('Brain: Opportunity Radar & Strategy Formulation', () => {
  it('detects and prioritizes reasoning-backed opportunities with 4-channel angles', () => {
    const context = buildBrainStoreContext(
      {
        name: 'The Roasted Bean',
        category: 'CAFE',
        neighborhood: 'Indiranagar',
        signatureItems: 'Pour-Over Coffee, Cinnamon Roll',
        slowHours: '3:00 PM – 5:30 PM',
      },
      [],
      [],
      undefined,
      new Date('2026-08-19T15:00:00') // 3 PM
    );

    const opportunities = detectBrainOpportunities(context);
    assert.ok(opportunities.length >= 3);

    // First opportunity should be highest score
    assert.ok(opportunities[0].score >= opportunities[1].score);

    const topOpp = opportunities[0];
    assert.ok(topOpp.title.length > 5);
    assert.ok(topOpp.reasoning.length > 10);
    assert.ok(topOpp.channelFocus.google.length > 5);
    assert.ok(topOpp.channelFocus.instagram.length > 5);
    assert.ok(topOpp.channelFocus.whatsapp.length > 5);
    assert.ok(topOpp.channelFocus.poster.length > 5);

    // Formulate Strategy Blueprint
    const blueprint = formulateStrategicBlueprint(topOpp, context);
    assert.strictEqual(blueprint.type, topOpp.preset.type);
    assert.ok(blueprint.channels.google.hookFormula.length > 0);
    assert.ok(blueprint.channels.instagram.role.length > 0);
  });
});

describe('Brain: Specification Synthesis & Validation', () => {
  it('synthesizes an enriched campaign specification and validates it', () => {
    const context = buildBrainStoreContext({
      name: 'Studio Glow',
      category: 'SALON',
      neighborhood: 'Bandra',
      city: 'Mumbai',
      signatureItems: 'Keratin Treatment',
    });

    const opportunities = detectBrainOpportunities(context);
    const blueprint = formulateStrategicBlueprint(opportunities[0], context);
    const spec = synthesizeCampaignSpec(blueprint, context);

    assert.strictEqual(spec.engineContext.bizName, 'Studio Glow');
    assert.strictEqual(spec.engineContext.neighborhood, 'Bandra');
    assert.strictEqual(spec.generationInput.type, blueprint.type);

    const validation = validateBrainSpecification(spec);
    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.errors.length, 0);
  });

  it('rejects deceptive claims and chronologically invalid schedules in specification', () => {
    const context = buildBrainStoreContext({
      name: 'Wellness Oasis',
      category: 'RETAIL',
      neighborhood: 'Koramangala',
      city: 'Bengaluru',
    });

    const opportunities = detectBrainOpportunities(context);
    const blueprint = formulateStrategicBlueprint(opportunities[0], context);

    // Deceptive claim test
    const deceptiveSpec = synthesizeCampaignSpec(blueprint, context, {
      offer: {
        title: 'Guaranteed 100% Cure Elixir',
        description: 'Miracle cure for all ailments.',
        value: 'Special Elixir',
        terms: 'No refunds.',
      },
    });

    const deceptiveValidation = validateBrainSpecification(deceptiveSpec);
    assert.strictEqual(deceptiveValidation.valid, false);
    assert.ok(deceptiveValidation.errors.some((e) => e.includes('deceptive claims')));

    // Chronologically inverted schedule test
    const invertedScheduleSpec = synthesizeCampaignSpec(blueprint, context, {
      offer: {
        title: 'Valid Organic Honey',
        description: 'Fresh local batch.',
        value: 'Special price',
        terms: 'Daily.',
      },
      schedule: {
        startsAt: '2026-08-25T10:00:00Z',
        endsAt: '2026-08-20T10:00:00Z', // Inverted: 5 days before start
        timingLabel: 'This Week',
      },
    });

    const invertedValidation = validateBrainSpecification(invertedScheduleSpec);
    assert.strictEqual(invertedValidation.valid, false);
    assert.ok(invertedValidation.errors.some((e) => e.includes('end date cannot precede start date')));
  });
});

describe('Brain: Category Vocabulary & Grounding Differentiation', () => {
  it('adapts vocabulary for Salon and marks configured facts vs defaults', () => {
    const salonContext = buildBrainStoreContext({
      name: 'Luxe Locks Studio',
      category: 'SALON',
      neighborhood: 'Indiranagar',
      city: 'Bengaluru',
      slowHours: '1:00 PM – 4:00 PM', // Configured fact
      signatureItems: 'Balayage, Keratin Spa',
      // targetCustomer left unconfigured -> should be estimated default
    });

    const opportunities = detectBrainOpportunities(salonContext);
    const slowOpp = opportunities.find((o) => o.type === 'SLOW_HOUR');
    assert.ok(slowOpp);
    assert.ok(slowOpp.summary.includes('styling chairs'));
    assert.ok(slowOpp.summary.includes('Store-configured fact: 1:00 PM – 4:00 PM'));
    assert.ok(slowOpp.reasoning.includes('Store-configured fact'));
    assert.ok(slowOpp.channelFocus.poster.includes('reception desk'));

    const weekendOpp = opportunities.find((o) => o.type === 'WEEKEND');
    assert.ok(weekendOpp);
    assert.ok(weekendOpp.summary.includes('Estimated neighborhood default'));
  });

  it('adapts vocabulary for Retail Boutique and marks configured audience', () => {
    const boutiqueContext = buildBrainStoreContext({
      name: 'Silk & Thread',
      category: 'BOUTIQUE',
      neighborhood: 'Koramangala',
      city: 'Bengaluru',
      targetCustomer: 'Fashion-forward college students and young professionals', // Configured fact
      // slowHours left unconfigured -> should be estimated default
    });

    const opportunities = detectBrainOpportunities(boutiqueContext);
    const slowOpp = opportunities.find((o) => o.type === 'SLOW_HOUR');
    assert.ok(slowOpp);
    assert.ok(slowOpp.summary.includes('Estimated neighborhood default: 3:00 PM – 5:30 PM'));
    assert.ok(slowOpp.channelFocus.poster.includes('checkout register'));

    const weekendOpp = opportunities.find((o) => o.type === 'WEEKEND');
    assert.ok(weekendOpp);
    assert.ok(weekendOpp.summary.includes('Store-configured fact: Fashion-forward college students and young professionals'));
  });
});

describe('Brain & Engine: End-to-End Coordinated Pack Quality', () => {
  it('generates a full campaign pack without any placeholder URLs across all channels', () => {
    const storeProfile = {
      name: 'Artisan Bakes',
      category: 'BAKERY',
      neighborhood: 'Indiranagar',
      city: 'Bengaluru',
      landmarks: '100ft Road',
      signature_items: 'Sourdough Loaf, Almond Croissant',
      phone_whatsapp: '+91 98765 43210',
    };

    const context = buildBrainStoreContext(storeProfile as any);
    const opportunities = detectBrainOpportunities(context);
    const blueprint = formulateStrategicBlueprint(opportunities[0], context);
    const spec = synthesizeCampaignSpec(blueprint, context, {
      offer: {
        title: 'Afternoon Croissant Special',
        description: 'Complimentary pour-over with any artisanal pastry.',
        value: 'Save 150 INR',
        terms: 'Dine-in only during promotional hours.',
      },
    });

    const pack = generateCampaignPack(storeProfile as any, spec.generationInput);

    // Verify pack passes schema
    const validation = CampaignPackSchema.safeParse(pack.outputs);
    assert.strictEqual(validation.success, true);

    // Verify ZERO streetcraft.local URLs in any channel
    const serializedPack = JSON.stringify(pack.outputs);
    assert.strictEqual(serializedPack.includes('streetcraft.local'), false);
    assert.strictEqual(serializedPack.includes('placeholder'), false);

    // Verify phone CTA was mapped
    assert.strictEqual(pack.outputs.googleBusiness.ctaType, 'Call Now');
    assert.strictEqual(pack.outputs.googleBusiness.ctaValue, 'tel:+919876543210');
  });

  it('gracefully handles missing phone by setting ctaType to Visit Us without broken URL', () => {
    const storeProfileNoPhone = {
      name: 'Corner Boutique',
      category: 'BOUTIQUE',
      neighborhood: 'Jayanagar',
      city: 'Bengaluru',
    };

    const context = buildBrainStoreContext(storeProfileNoPhone as any);
    const opportunities = detectBrainOpportunities(context);
    const blueprint = formulateStrategicBlueprint(opportunities[0], context);
    const spec = synthesizeCampaignSpec(blueprint, context, {
      offer: {
        title: 'New Season Wardrobe Launch',
        description: 'Exclusive 20% preview for neighborhood residents.',
        value: '20% off',
        terms: 'Valid this weekend only.',
      },
    });

    const pack = generateCampaignPack(storeProfileNoPhone as any, spec.generationInput);

    assert.strictEqual(pack.outputs.googleBusiness.ctaType, 'Visit Us');
    assert.strictEqual(pack.outputs.googleBusiness.ctaValue, '');
    assert.strictEqual(JSON.stringify(pack.outputs).includes('streetcraft.local'), false);
  });
});
