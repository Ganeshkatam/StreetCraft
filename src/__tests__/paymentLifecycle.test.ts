import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';

describe('Payment Lifecycle: Webhook Payload & Signature Verification', () => {
  const secret = 'whsec_test_secret_streetcraft_2026';

  function generateSignature(payload: string, key: string): string {
    return crypto.createHmac('sha256', key).update(payload).digest('hex');
  }

  function verifyWebhookSignature(payload: string, signature: string | null, key: string | undefined): boolean {
    if (!key || !signature) return false;
    const expected = generateSignature(payload, key);
    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expected, 'utf8');
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  }

  it('accepts perfectly matching signature and payload', () => {
    const rawPayload = JSON.stringify({
      event: 'subscription.charged',
      event_id: 'evt_test_charge_001',
      payload: {
        subscription: {
          entity: {
            id: 'sub_test_123',
            plan_id: 'plan_pro',
            status: 'active',
          },
        },
      },
    });

    const sig = generateSignature(rawPayload, secret);
    assert.strictEqual(verifyWebhookSignature(rawPayload, sig, secret), true);
  });

  it('rejects tampered payload content with valid signature header', () => {
    const rawPayload = JSON.stringify({ event: 'subscription.charged', event_id: 'evt_001' });
    const tamperedPayload = JSON.stringify({ event: 'subscription.charged', event_id: 'evt_002' });
    const sig = generateSignature(rawPayload, secret);

    assert.strictEqual(verifyWebhookSignature(tamperedPayload, sig, secret), false);
  });

  it('fails closed when webhook secret is undefined', () => {
    const rawPayload = JSON.stringify({ event: 'subscription.activated' });
    const sig = generateSignature(rawPayload, secret);

    assert.strictEqual(verifyWebhookSignature(rawPayload, sig, undefined), false);
  });

  it('rejects null or empty signature string', () => {
    const rawPayload = JSON.stringify({ event: 'subscription.activated' });
    assert.strictEqual(verifyWebhookSignature(rawPayload, null, secret), false);
    assert.strictEqual(verifyWebhookSignature(rawPayload, '', secret), false);
  });
});

describe('Payment Lifecycle: Event Mapping and State Transition Semantics', () => {
  type SubscriptionState = {
    id: string;
    status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELLED';
    cancel_at_period_end: boolean;
    current_period_end: string;
    plan_id: string;
  };

  type UsagePeriod = {
    plan: string;
    campaign_limit: number;
  };

  function simulateReconcileEvent(
    sub: SubscriptionState,
    period: UsagePeriod,
    eventType: string,
    eventPayload: any,
    currentDate: Date = new Date()
  ): { sub: SubscriptionState; period: UsagePeriod; action: string } {
    const updatedSub = { ...sub };
    const updatedPeriod = { ...period };

    switch (eventType) {
      case 'subscription.activated':
      case 'subscription.charged': {
        updatedSub.status = 'ACTIVE';
        updatedSub.cancel_at_period_end = false;
        if (eventPayload?.current_end) {
          updatedSub.current_period_end = new Date(eventPayload.current_end * 1000).toISOString();
        }
        updatedPeriod.plan = updatedSub.plan_id;
        updatedPeriod.campaign_limit = updatedSub.plan_id === 'GROWTH' ? 300 : 100;
        return { sub: updatedSub, period: updatedPeriod, action: 'ACTIVATED_OR_CHARGED' };
      }

      case 'subscription.halted':
      case 'subscription.pending': {
        updatedSub.status = 'PAST_DUE';
        return { sub: updatedSub, period: updatedPeriod, action: 'FLAGGED_PAST_DUE' };
      }

      case 'subscription.cancelled':
      case 'subscription.completed': {
        const periodEndDate = new Date(updatedSub.current_period_end);
        if (periodEndDate >= currentDate) {
          updatedSub.cancel_at_period_end = true;
          return { sub: updatedSub, period: updatedPeriod, action: 'SCHEDULED_FOR_PERIOD_END' };
        } else {
          updatedSub.status = 'CANCELLED';
          updatedSub.cancel_at_period_end = true;
          updatedPeriod.plan = 'FREE';
          updatedPeriod.campaign_limit = 3;
          return { sub: updatedSub, period: updatedPeriod, action: 'CANCELLED_AND_DOWNGRADED' };
        }
      }

      default:
        return { sub: updatedSub, period: updatedPeriod, action: 'IGNORED_EVENT' };
    }
  }

  it('activates subscription and raises campaign limit to plan level on subscription.activated', () => {
    const initialSub: SubscriptionState = {
      id: 'sub_001',
      status: 'CANCELLED',
      cancel_at_period_end: false,
      current_period_end: '2026-10-01T00:00:00Z',
      plan_id: 'PRO',
    };
    const initialPeriod: UsagePeriod = {
      plan: 'FREE',
      campaign_limit: 3,
    };

    const result = simulateReconcileEvent(
      initialSub,
      initialPeriod,
      'subscription.activated',
      { current_end: Math.floor(Date.now() / 1000) + 86400 * 30 }
    );

    assert.strictEqual(result.sub.status, 'ACTIVE');
    assert.strictEqual(result.sub.cancel_at_period_end, false);
    assert.strictEqual(result.period.plan, 'PRO');
    assert.strictEqual(result.period.campaign_limit, 100);
    assert.strictEqual(result.action, 'ACTIVATED_OR_CHARGED');
  });

  it('marks subscription PAST_DUE on payment failure (subscription.halted)', () => {
    const initialSub: SubscriptionState = {
      id: 'sub_001',
      status: 'ACTIVE',
      cancel_at_period_end: false,
      current_period_end: '2026-11-01T00:00:00Z',
      plan_id: 'PRO',
    };
    const initialPeriod: UsagePeriod = {
      plan: 'PRO',
      campaign_limit: 100,
    };

    const result = simulateReconcileEvent(initialSub, initialPeriod, 'subscription.halted', {});

    assert.strictEqual(result.sub.status, 'PAST_DUE');
    assert.strictEqual(result.action, 'FLAGGED_PAST_DUE');
  });

  it('schedules cancellation at period end when period is still in the future', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 20);

    const initialSub: SubscriptionState = {
      id: 'sub_001',
      status: 'ACTIVE',
      cancel_at_period_end: false,
      current_period_end: futureDate.toISOString(),
      plan_id: 'PRO',
    };
    const initialPeriod: UsagePeriod = {
      plan: 'PRO',
      campaign_limit: 100,
    };

    const result = simulateReconcileEvent(initialSub, initialPeriod, 'subscription.cancelled', {}, new Date());

    assert.strictEqual(result.sub.status, 'ACTIVE');
    assert.strictEqual(result.sub.cancel_at_period_end, true);
    assert.strictEqual(result.period.campaign_limit, 100);
    assert.strictEqual(result.action, 'SCHEDULED_FOR_PERIOD_END');
  });

  it('cancels immediately and downgrades to free tier when period end is already in the past', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);

    const initialSub: SubscriptionState = {
      id: 'sub_001',
      status: 'ACTIVE',
      cancel_at_period_end: true,
      current_period_end: pastDate.toISOString(),
      plan_id: 'GROWTH',
    };
    const initialPeriod: UsagePeriod = {
      plan: 'GROWTH',
      campaign_limit: 300,
    };

    const result = simulateReconcileEvent(initialSub, initialPeriod, 'subscription.cancelled', {}, new Date());

    assert.strictEqual(result.sub.status, 'CANCELLED');
    assert.strictEqual(result.period.plan, 'FREE');
    assert.strictEqual(result.period.campaign_limit, 3);
    assert.strictEqual(result.action, 'CANCELLED_AND_DOWNGRADED');
  });
});

describe('Payment Lifecycle: Idempotency & Duplicate Webhook Replay', () => {
  const processedEvents = new Set<string>();

  function processEventWithDeduplication(provider: string, eventId: string): { status: string; isDuplicate: boolean } {
    const key = `${provider}:${eventId}`;
    if (processedEvents.has(key)) {
      return { status: 'PROCESSED', isDuplicate: true };
    }
    processedEvents.add(key);
    return { status: 'PROCESSED', isDuplicate: false };
  }

  it('processes event on first attempt and flags identical event ID as duplicate replay', () => {
    const eventId = 'evt_razorpay_unique_998877';

    const firstAttempt = processEventWithDeduplication('razorpay', eventId);
    assert.strictEqual(firstAttempt.isDuplicate, false);
    assert.strictEqual(firstAttempt.status, 'PROCESSED');

    const secondAttempt = processEventWithDeduplication('razorpay', eventId);
    assert.strictEqual(secondAttempt.isDuplicate, true);
    assert.strictEqual(secondAttempt.status, 'PROCESSED');
  });
});
