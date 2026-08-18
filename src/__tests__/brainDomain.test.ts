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
});
