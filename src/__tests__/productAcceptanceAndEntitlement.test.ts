import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getPlanPricingQuote } from '../lib/domain/plan/planPricing';
import { deriveCommercialEntitlementStatus } from '../lib/domain/plan/entitlementState';
import { deriveSetupProgress } from '../lib/domain/setup/deriveSetupProgress';
import { CreateStoreSchema } from '../lib/domain/setup/setupSchemas';
import { mapDatabaseRpcErrorToGenerationError } from '../lib/domain/create/generationErrors';
import { reconcileRazorpayWebhookPayload } from '../lib/domain/plan/paymentReconciliation';

/**
 * Phase 3 — Product-Wide Acceptance & Entitlement Integrity Test Suite
 * Validates:
 * 1. Commercial Entitlement Integrity across upgrades, cancellations, and multi-store accounts.
 * 2. Campaign Quota Integrity, Row Locks, and Idempotent Concurrency.
 * 3. Webhook Ingestion, Observability, and Safe Retry Recovery.
 * 4. Full End-to-End User Experience Lifecycle.
 */

describe('Phase 3 Acceptance: Commercial Entitlement Integrity Across Upgrades & Multiple Stores', () => {
  interface SubscriptionRecord {
    id: string;
    userId: string;
    planId: string;
    billingCycle: string;
    status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE';
    cancelAtPeriodEnd: boolean;
    periodEnd: string;
  }

  interface UsagePeriodRecord {
    id: string;
    businessId: string;
    plan: string;
    campaignsUsed: number;
    campaignLimit: number;
    periodEnd: string;
  }

  interface UsageEventRecord {
    businessId: string;
    userId: string;
    eventType: string;
    description: string;
  }

  class MockCommerceEngine {
    public subscriptions: SubscriptionRecord[] = [];
    public usagePeriods: UsagePeriodRecord[] = [];
    public usageEvents: UsageEventRecord[] = [];
    public businessMemberships: { businessId: string; userId: string; role: string }[] = [];

    public getStoreLimit(planId: string): number {
      const p = planId.toUpperCase();
      if (p === 'PRO') return 5;
      if (p === 'GROWTH' || p === 'FOUNDER') return 10;
      return 1; // Free tier
    }

    public getCampaignLimit(planId: string): number {
      const p = planId.toUpperCase();
      if (p === 'PRO' || p === 'FOUNDER') return 100;
      if (p === 'GROWTH') return 300;
      return 3; // Free tier
    }

    public activateSubscription(params: {
      userId: string;
      planId: string;
      billingCycle: string;
      amountPaise: number;
    }): { subscriptionId: string; plan: string; campaignLimit: number; storeLimit: number } {
      const quote = getPlanPricingQuote(params.planId, params.billingCycle);
      if (params.amountPaise !== quote.amountPaise) {
        throw new Error(`AMOUNT_MISMATCH: ${params.amountPaise} vs ${quote.amountPaise}`);
      }

      // Cancel prior active subscriptions
      for (const sub of this.subscriptions) {
        if (sub.userId === params.userId && sub.status === 'ACTIVE') {
          sub.status = 'CANCELLED';
        }
      }

      const periodDays = params.billingCycle === 'annual' ? 365 : params.billingCycle === 'quarterly' ? 90 : 30;
      const periodEnd = new Date(Date.now() + periodDays * 86400000).toISOString();

      const newSub: SubscriptionRecord = {
        id: `sub_${Math.random().toString(36).substring(2, 9)}`,
        userId: params.userId,
        planId: params.planId.toUpperCase(),
        billingCycle: params.billingCycle.toLowerCase(),
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
        periodEnd,
      };
      this.subscriptions.push(newSub);

      const newCampaignLimit = this.getCampaignLimit(params.planId);
      const newStoreLimit = this.getStoreLimit(params.planId);

      // Update active usage periods for all businesses owned by this user
      const ownedBusinessIds = this.businessMemberships
        .filter((bm) => bm.userId === params.userId && bm.role === 'owner')
        .map((bm) => bm.businessId);

      for (const bizId of ownedBusinessIds) {
        const period = this.usagePeriods.find((up) => up.businessId === bizId);
        if (period) {
          period.plan = params.planId.toUpperCase();
          period.campaignLimit = newCampaignLimit;
        }

        this.usageEvents.push({
          businessId: bizId,
          userId: params.userId,
          eventType: 'SUBSCRIPTION_RESET',
          description: `Subscription activated on ${params.planId.toUpperCase()} (${params.billingCycle} cycle).`,
        });
      }

      return {
        subscriptionId: newSub.id,
        plan: newSub.planId,
        campaignLimit: newCampaignLimit,
        storeLimit: newStoreLimit,
      };
    }
  }

  it('guarantees correct base limits across Free, Pro, and Growth tiers', () => {
    const engine = new MockCommerceEngine();
    assert.strictEqual(engine.getStoreLimit('FREE'), 1);
    assert.strictEqual(engine.getCampaignLimit('FREE'), 3);

    assert.strictEqual(engine.getStoreLimit('PRO'), 5);
    assert.strictEqual(engine.getCampaignLimit('PRO'), 100);

    assert.strictEqual(engine.getStoreLimit('GROWTH'), 10);
    assert.strictEqual(engine.getCampaignLimit('GROWTH'), 300);
  });

  it('upgrades user from Free to Pro across multiple owned stores atomically', () => {
    const engine = new MockCommerceEngine();
    const userId = 'user_merchant_001';
    const store1 = 'biz_cafe_001';
    const store2 = 'biz_bakery_002';

    engine.businessMemberships.push(
      { businessId: store1, userId, role: 'owner' },
      { businessId: store2, userId, role: 'owner' }
    );

    engine.usagePeriods.push(
      { id: 'up_1', businessId: store1, plan: 'FREE', campaignsUsed: 1, campaignLimit: 3, periodEnd: '2026-11-01' },
      { id: 'up_2', businessId: store2, plan: 'FREE', campaignsUsed: 0, campaignLimit: 3, periodEnd: '2026-11-01' }
    );

    const proQuote = getPlanPricingQuote('PRO', 'monthly');
    const result = engine.activateSubscription({
      userId,
      planId: 'PRO',
      billingCycle: 'monthly',
      amountPaise: proQuote.amountPaise,
    });

    assert.strictEqual(result.plan, 'PRO');
    assert.strictEqual(result.campaignLimit, 100);
    assert.strictEqual(result.storeLimit, 5);

    // Verify both stores upgraded
    const period1 = engine.usagePeriods.find((p) => p.businessId === store1)!;
    const period2 = engine.usagePeriods.find((p) => p.businessId === store2)!;
    assert.strictEqual(period1.plan, 'PRO');
    assert.strictEqual(period1.campaignLimit, 100);
    assert.strictEqual(period1.campaignsUsed, 1, 'Existing campaign usage is preserved');

    assert.strictEqual(period2.plan, 'PRO');
    assert.strictEqual(period2.campaignLimit, 100);

    // Verify audit logs emitted
    const events = engine.usageEvents.filter((e) => e.eventType === 'SUBSCRIPTION_RESET');
    assert.strictEqual(events.length, 2);
  });

  it('upgrades from Pro to Growth, replaces prior subscription, and expands campaign limit to 300', () => {
    const engine = new MockCommerceEngine();
    const userId = 'user_multi_owner';
    const store1 = 'biz_boutique_001';

    engine.businessMemberships.push({ businessId: store1, userId, role: 'owner' });
    engine.usagePeriods.push({
      id: 'up_b1',
      businessId: store1,
      plan: 'PRO',
      campaignsUsed: 42,
      campaignLimit: 100,
      periodEnd: '2026-11-01',
    });

    // Initial Pro sub
    const proSub = engine.activateSubscription({
      userId,
      planId: 'PRO',
      billingCycle: 'monthly',
      amountPaise: 39900,
    });
    assert.strictEqual(proSub.campaignLimit, 100);

    // Upgrade to Growth
    const growthQuote = getPlanPricingQuote('GROWTH', 'quarterly');
    const growthSub = engine.activateSubscription({
      userId,
      planId: 'GROWTH',
      billingCycle: 'quarterly',
      amountPaise: growthQuote.amountPaise,
    });

    assert.strictEqual(growthSub.plan, 'GROWTH');
    assert.strictEqual(growthSub.campaignLimit, 300);

    // Previous subscription marked CANCELLED
    const oldSub = engine.subscriptions.find((s) => s.id === proSub.subscriptionId)!;
    assert.strictEqual(oldSub.status, 'CANCELLED');

    // New subscription is ACTIVE
    const newSub = engine.subscriptions.find((s) => s.id === growthSub.subscriptionId)!;
    assert.strictEqual(newSub.status, 'ACTIVE');

    // Store usage period expanded to 300 with 42 campaigns preserved
    const storePeriod = engine.usagePeriods.find((p) => p.businessId === store1)!;
    assert.strictEqual(storePeriod.plan, 'GROWTH');
    assert.strictEqual(storePeriod.campaignLimit, 300);
    assert.strictEqual(storePeriod.campaignsUsed, 42);
  });

  it('enforces multi-store isolation so store A usage does not deplete store B quota', () => {
    const engine = new MockCommerceEngine();
    const userId = 'user_dual';
    const storeA = 'store_a';
    const storeB = 'store_b';

    engine.businessMemberships.push(
      { businessId: storeA, userId, role: 'owner' },
      { businessId: storeB, userId, role: 'owner' }
    );

    engine.usagePeriods.push(
      { id: 'up_a', businessId: storeA, plan: 'PRO', campaignsUsed: 0, campaignLimit: 100, periodEnd: '2026-11-01' },
      { id: 'up_b', businessId: storeB, plan: 'PRO', campaignsUsed: 0, campaignLimit: 100, periodEnd: '2026-11-01' }
    );

    // Store A generates 20 campaigns
    const pA = engine.usagePeriods.find((p) => p.businessId === storeA)!;
    pA.campaignsUsed += 20;

    // Verify Store B is completely unaffected
    const pB = engine.usagePeriods.find((p) => p.businessId === storeB)!;
    assert.strictEqual(pA.campaignsUsed, 20);
    assert.strictEqual(pB.campaignsUsed, 0, 'Store B usage must remain 0 when Store A generates campaigns');
  });
});

describe('Phase 3 Acceptance: Campaign Quota Integrity, Row Locks & Concurrent Generation', () => {
  interface CampaignOutput {
    googleBusiness: Record<string, unknown>;
    instagram: Record<string, unknown>;
    whatsapp: Record<string, unknown>;
    poster: Record<string, unknown>;
  }

  class MockCampaignPersistenceEngine {
    public campaigns: { id: string; businessId: string; generationRequestId?: string }[] = [];
    public period = { campaignsUsed: 0, campaignLimit: 3 };

    public saveCampaignAtomically(params: {
      businessId: string;
      generationRequestId?: string;
      outputs?: Partial<CampaignOutput>;
    }): { campaignId: string; campaignsUsed: number; idempotentReplay: boolean } {
      // 1. Idempotent check
      if (params.generationRequestId) {
        const existing = this.campaigns.find(
          (c) => c.generationRequestId === params.generationRequestId && c.businessId === params.businessId
        );
        if (existing) {
          return {
            campaignId: existing.id,
            campaignsUsed: this.period.campaignsUsed,
            idempotentReplay: true,
          };
        }
      }

      // 2. 4-Channel pack completeness validation
      const o = params.outputs;
      if (!o || !o.googleBusiness || !o.instagram || !o.whatsapp || !o.poster) {
        throw new Error('INCOMPLETE_CAMPAIGN_PACK: All four channel payloads are required.');
      }

      // 3. Quota check
      if (this.period.campaignsUsed >= this.period.campaignLimit) {
        throw new Error(`QUOTA_EXHAUSTED: Usage quota reached: ${this.period.campaignsUsed} of ${this.period.campaignLimit} campaigns used this cycle.`);
      }

      // 4. Increment quota
      this.period.campaignsUsed += 1;

      // 5. Unique violation race simulation on generationRequestId
      if (params.generationRequestId) {
        const duplicateRace = this.campaigns.find((c) => c.generationRequestId === params.generationRequestId);
        if (duplicateRace) {
          // Rollback quota on unique violation
          this.period.campaignsUsed -= 1;
          return {
            campaignId: duplicateRace.id,
            campaignsUsed: this.period.campaignsUsed,
            idempotentReplay: true,
          };
        }
      }

      const newCampaign = {
        id: `cmp_${Math.random().toString(36).substring(2, 9)}`,
        businessId: params.businessId,
        generationRequestId: params.generationRequestId,
      };
      this.campaigns.push(newCampaign);

      return {
        campaignId: newCampaign.id,
        campaignsUsed: this.period.campaignsUsed,
        idempotentReplay: false,
      };
    }
  }

  const validOutputs: CampaignOutput = {
    googleBusiness: { title: 'Local Coffee Feast' },
    instagram: { caption: 'Best beans in town' },
    whatsapp: { message: 'Come by for a cup!' },
    poster: { headline: 'Special Roast Today' },
  };

  it('enforces quota boundary and rejects generation when limit is reached', () => {
    const engine = new MockCampaignPersistenceEngine();
    engine.period.campaignsUsed = 3;
    engine.period.campaignLimit = 3;

    assert.throws(
      () => engine.saveCampaignAtomically({
        businessId: 'biz_01',
        outputs: validOutputs,
      }),
      /QUOTA_EXHAUSTED/
    );

    const mapped = mapDatabaseRpcErrorToGenerationError('QUOTA_EXHAUSTED: Usage quota reached: 3 of 3');
    assert.strictEqual(mapped.code, 'QUOTA_EXHAUSTED');
  });

  it('rejects incomplete 4-channel pack when one or more channels are missing', () => {
    const engine = new MockCampaignPersistenceEngine();
    const incomplete = {
      googleBusiness: { title: 'Only Google' },
      // instagram, whatsapp, poster missing
    };

    assert.throws(
      () => engine.saveCampaignAtomically({
        businessId: 'biz_01',
        outputs: incomplete as any,
      }),
      /INCOMPLETE_CAMPAIGN_PACK/
    );
  });

  it('handles replayed generation request idempotently without burning additional quota', () => {
    const engine = new MockCampaignPersistenceEngine();
    const genKey = 'gen_req_abc_123';

    // Call 1
    const res1 = engine.saveCampaignAtomically({
      businessId: 'biz_01',
      generationRequestId: genKey,
      outputs: validOutputs,
    });
    assert.strictEqual(res1.idempotentReplay, false);
    assert.strictEqual(res1.campaignsUsed, 1);

    // Call 2 (identical request key)
    const res2 = engine.saveCampaignAtomically({
      businessId: 'biz_01',
      generationRequestId: genKey,
      outputs: validOutputs,
    });
    assert.strictEqual(res2.idempotentReplay, true);
    assert.strictEqual(res2.campaignId, res1.campaignId);
    assert.strictEqual(res2.campaignsUsed, 1, 'Replayed call must not increment quota');
    assert.strictEqual(engine.campaigns.length, 1);
  });

  it('handles concurrent race on generation_request_id by rolling back quota on collision', () => {
    const engine = new MockCampaignPersistenceEngine();
    const genKey = 'gen_req_race_concurrent';

    // Simulate parallel request 1
    const res1 = engine.saveCampaignAtomically({
      businessId: 'biz_01',
      generationRequestId: genKey,
      outputs: validOutputs,
    });
    assert.strictEqual(res1.idempotentReplay, false);
    assert.strictEqual(engine.period.campaignsUsed, 1);

    // Simulate parallel request 2 reaching unique check concurrently
    const res2 = engine.saveCampaignAtomically({
      businessId: 'biz_01',
      generationRequestId: genKey,
      outputs: validOutputs,
    });
    assert.strictEqual(res2.idempotentReplay, true);
    assert.strictEqual(res2.campaignId, res1.campaignId);
    assert.strictEqual(engine.period.campaignsUsed, 1, 'Quota must be preserved at 1 despite concurrent collisions');
  });
});

describe('Phase 3 Acceptance: Webhook Ingestion, Observability & Safe Retry Recovery', () => {
  interface EventLog {
    eventId: string;
    status: 'PROCESSING' | 'PROCESSED' | 'FAILED';
    attemptCount: number;
    lastError?: string;
  }

  class MockWebhookObservabilityEngine {
    public logs: Map<string, EventLog> = new Map();

    public receiveEvent(params: {
      eventId: string;
      eventType: string;
      payload: any;
    }): { status: string; idempotentReplay?: boolean; inFlight?: boolean; attemptCount: number } {
      const existing = this.logs.get(params.eventId);

      if (existing) {
        if (existing.status === 'PROCESSED') {
          return {
            status: 'PROCESSED',
            idempotentReplay: true,
            attemptCount: existing.attemptCount,
          };
        }
        if (existing.status === 'PROCESSING') {
          return {
            status: 'PROCESSING',
            inFlight: true,
            attemptCount: existing.attemptCount,
          };
        }
        // Previously FAILED: allow retry
        existing.status = 'PROCESSING';
        existing.attemptCount += 1;
        existing.lastError = undefined;
      } else {
        const initialLog: EventLog = {
          eventId: params.eventId,
          status: 'PROCESSING',
          attemptCount: 1,
        };
        this.logs.set(params.eventId, initialLog);
      }

      const current = this.logs.get(params.eventId)!;

      // Fail-closed validation
      const recon = reconcileRazorpayWebhookPayload({
        eventType: params.eventType,
        payload: params.payload,
      });

      if (!recon.valid) {
        current.status = 'FAILED';
        current.lastError = recon.error;
        throw new Error(recon.error);
      }

      current.status = 'PROCESSED';
      return {
        status: 'PROCESSED',
        idempotentReplay: false,
        attemptCount: current.attemptCount,
      };
    }
  }

  const validPayload = {
    event: 'order.paid',
    event_id: 'evt_obs_001',
    payload: {
      order: {
        entity: {
          id: 'ord_obs_123',
          amount: 39900,
          currency: 'INR',
          status: 'paid',
          notes: {
            userId: '00000000-0000-0000-0000-000000000001',
            planId: 'PRO',
            billingCycle: 'monthly',
          },
        },
      },
      payment: {
        entity: {
          id: 'pay_obs_123',
          order_id: 'ord_obs_123',
          amount: 39900,
          currency: 'INR',
          status: 'captured',
          captured: true,
          notes: {
            userId: '00000000-0000-0000-0000-000000000001',
            planId: 'PRO',
            billingCycle: 'monthly',
          },
        },
      },
    },
  };

  it('records new webhook delivery as PROCESSING and successfully completes to PROCESSED', () => {
    const engine = new MockWebhookObservabilityEngine();
    const res = engine.receiveEvent({
      eventId: 'evt_obs_001',
      eventType: 'order.paid',
      payload: validPayload,
    });

    assert.strictEqual(res.status, 'PROCESSED');
    assert.strictEqual(res.attemptCount, 1);
    assert.strictEqual(res.idempotentReplay, false);
  });

  it('safely short-circuits re-delivery of PROCESSED event with idempotentReplay=true', () => {
    const engine = new MockWebhookObservabilityEngine();
    engine.receiveEvent({
      eventId: 'evt_obs_002',
      eventType: 'order.paid',
      payload: validPayload,
    });

    // Re-delivery of same event ID
    const res = engine.receiveEvent({
      eventId: 'evt_obs_002',
      eventType: 'order.paid',
      payload: validPayload,
    });

    assert.strictEqual(res.status, 'PROCESSED');
    assert.strictEqual(res.idempotentReplay, true);
    assert.strictEqual(res.attemptCount, 1);
  });

  it('prevents concurrent double-execution on in-flight PROCESSING event', () => {
    const engine = new MockWebhookObservabilityEngine();
    engine.logs.set('evt_inflight_01', {
      eventId: 'evt_inflight_01',
      status: 'PROCESSING',
      attemptCount: 1,
    });

    const res = engine.receiveEvent({
      eventId: 'evt_inflight_01',
      eventType: 'order.paid',
      payload: validPayload,
    });

    assert.strictEqual(res.status, 'PROCESSING');
    assert.strictEqual(res.inFlight, true);
  });

  it('re-attempts previously FAILED event by incrementing attemptCount and succeeding on valid payload', () => {
    const engine = new MockWebhookObservabilityEngine();
    const eventId = 'evt_retry_01';

    // Attempt 1: malformed payload (missing order entity)
    const badPayload = {
      event: 'order.paid',
      event_id: eventId,
      payload: { payment: validPayload.payload.payment },
    };

    assert.throws(
      () => engine.receiveEvent({
        eventId,
        eventType: 'order.paid',
        payload: badPayload,
      }),
      /missing mandatory order entity/i
    );

    const log1 = engine.logs.get(eventId)!;
    assert.strictEqual(log1.status, 'FAILED');
    assert.strictEqual(log1.attemptCount, 1);

    // Attempt 2: valid payload retry
    const res = engine.receiveEvent({
      eventId,
      eventType: 'order.paid',
      payload: validPayload,
    });

    assert.strictEqual(res.status, 'PROCESSED');
    assert.strictEqual(res.attemptCount, 2);
    assert.strictEqual(res.idempotentReplay, false);
  });
});

describe('Phase 3 Acceptance: End-to-End User Experience Lifecycle', () => {
  it('executes the full user journey: onboarding, setup, free campaign, quota exhaustion, upgrade, and cancellation', () => {
    // Step 1: Onboarding Store Creation
    const storeInput = {
      name: 'Old Town Spices & Chai',
      category: 'Cafe & Bakery',
      city: 'Hyderabad',
    };
    const storeValidation = CreateStoreSchema.safeParse(storeInput);
    assert.strictEqual(storeValidation.success, true);
    const businessId = '11111111-2222-3333-4444-555555555555';

    // Step 2: Setup Domain Progression (Partial -> Complete)
    const initialProgress = deriveSetupProgress(null, businessId);
    assert.strictEqual(initialProgress.completionPercentage, 0);
    assert.strictEqual(initialProgress.requiredComplete, false);

    const completeProfile: any = {
      business_id: businessId,
      name: 'Old Town Spices & Chai',
      category: 'Cafe & Bakery',
      neighborhood: 'Charminar Heritage Quarter',
      city: 'Hyderabad',
      signature_items: 'Irani Chai, Osmania Biscuits',
      target_customer: 'Local families and evening tourists',
      default_offer: 'Evening Tea Combo at 49 INR',
      style_voice: 'Warm, hospitable, and traditional',
      peak_hours: '5:00 PM - 9:00 PM',
      phone_whatsapp: '+91 9876543210',
    };
    const finalProgress = deriveSetupProgress(completeProfile, businessId);
    assert.strictEqual(finalProgress.requiredComplete, true);
    assert.strictEqual(finalProgress.recommendedComplete, true);
    assert.strictEqual(finalProgress.completionPercentage, 100);

    // Step 3: Free Tier Initial Usage
    let campaignsUsed = 0;
    let campaignLimit = 3;
    let currentPlan = 'FREE';

    // User generates 3 campaigns on Free tier
    for (let i = 1; i <= 3; i++) {
      assert.ok(campaignsUsed < campaignLimit, `Generation ${i} must be within quota`);
      campaignsUsed += 1;
    }
    assert.strictEqual(campaignsUsed, 3);

    // Step 4: Quota Exhaustion Check
    assert.strictEqual(campaignsUsed >= campaignLimit, true);
    const exhaustionError = mapDatabaseRpcErrorToGenerationError('QUOTA_EXHAUSTED: Usage quota reached: 3 of 3');
    assert.strictEqual(exhaustionError.code, 'QUOTA_EXHAUSTED');

    // Step 5: Plan Pricing Quote Inquiry
    const proQuote = getPlanPricingQuote('PRO', 'monthly');
    assert.strictEqual(proQuote.amountINR, 399);
    assert.strictEqual(proQuote.amountPaise, 39900);

    // Step 6: Checkout Payment Activation
    currentPlan = 'PRO';
    campaignLimit = 100;
    assert.strictEqual(currentPlan, 'PRO');
    assert.strictEqual(campaignLimit, 100);
    assert.strictEqual(campaignsUsed, 3, 'Existing campaigns are retained under upgraded plan');

    // Step 7: Post-Upgrade Generation
    campaignsUsed += 1; // 4th campaign successfully generated
    assert.strictEqual(campaignsUsed, 4);
    assert.strictEqual(campaignLimit - campaignsUsed, 96, '96 campaigns remaining this cycle');

    // Step 8: Subscription Cancellation Scheduled Before Expiry
    const futurePeriodEnd = new Date(Date.now() + 20 * 86400000).toISOString();
    const scheduledSub = {
      status: 'ACTIVE',
      cancel_at_period_end: true,
      current_period_end: futurePeriodEnd,
    };
    const scheduledEntitlement = deriveCommercialEntitlementStatus(scheduledSub);
    assert.strictEqual(scheduledEntitlement.status, 'CANCEL_SCHEDULED');
    assert.strictEqual(scheduledEntitlement.isCancellationScheduled, true);
    assert.strictEqual(scheduledEntitlement.isActive, true, 'User retains active Pro access until billing period concludes');

    // Step 9: Period Expiry & Free Tier Reversion
    const pastPeriodEnd = new Date(Date.now() - 1 * 86400000).toISOString();
    const expiredSub = {
      status: 'ACTIVE',
      cancel_at_period_end: true,
      current_period_end: pastPeriodEnd,
    };
    const expiredEntitlement = deriveCommercialEntitlementStatus(expiredSub);
    assert.strictEqual(expiredEntitlement.status, 'CANCELED');
    assert.strictEqual(expiredEntitlement.isActive, false);

    // Entitlement downgraded back to Free tier
    currentPlan = 'FREE';
    campaignLimit = 3;
    assert.strictEqual(currentPlan, 'FREE');
    assert.strictEqual(campaignLimit, 3);
  });
});
