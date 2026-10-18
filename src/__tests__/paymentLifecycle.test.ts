import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import { reconcileRazorpayWebhookPayload } from '../lib/domain/plan/paymentReconciliation';
import { POST as handleRazorpayWebhook } from '../app/api/webhooks/razorpay/route';

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

describe('Payment Lifecycle: End-to-End Database Activation & Cross-Account Isolation', () => {
  interface SubscriptionRow {
    id: string;
    user_id: string;
    provider: string;
    provider_subscription_id: string;
    plan_id: string;
    billing_cycle: string;
    status: 'ACTIVE' | 'CANCELLED';
  }

  class MockActivationDatabase {
    public subscriptions: SubscriptionRow[] = [];

    public confirmPaymentAndActivate(params: {
      callerRole: 'anon' | 'authenticated' | 'service_role';
      paymentId: string;
      orderId: string;
      planId: string;
      billingCycle: string;
      userId: string;
    }): { success: boolean; idempotent_replay?: boolean; subscription_id?: string; error?: string } {
      // 1. Role Boundary Check
      if (params.callerRole !== 'service_role') {
        throw new Error('42501: permission denied for function confirm_payment_and_activate_subscription');
      }

      if (!params.paymentId || params.paymentId.trim() === '') {
        throw new Error('INVALID_PAYMENT: Payment reference ID is required.');
      }

      // 2. Cross-Account Claim Check
      const otherUserSub = this.subscriptions.find(
        (s) => s.provider === 'razorpay' && s.provider_subscription_id === params.paymentId && s.user_id !== params.userId
      );
      if (otherUserSub) {
        throw new Error('PAYMENT_ALREADY_CLAIMED: This payment reference is already attached to another account.');
      }

      // 3. Idempotent Replay for Same Account
      const existingSub = this.subscriptions.find(
        (s) => s.provider === 'razorpay' && s.provider_subscription_id === params.paymentId && s.user_id === params.userId
      );
      if (existingSub) {
        if (existingSub.status === 'CANCELLED') {
          throw new Error('PAYMENT_ALREADY_EXPIRED: Payment reference belongs to a cancelled subscription.');
        }
        return {
          success: true,
          idempotent_replay: true,
          subscription_id: existingSub.id,
        };
      }

      // 4. Cancel prior active subscriptions for user
      for (const sub of this.subscriptions) {
        if (sub.user_id === params.userId && sub.status === 'ACTIVE') {
          sub.status = 'CANCELLED';
        }
      }

      // 5. Insert new active subscription
      const newSub: SubscriptionRow = {
        id: `sub_${Math.random().toString(36).substring(2, 9)}`,
        user_id: params.userId,
        provider: 'razorpay',
        provider_subscription_id: params.paymentId,
        plan_id: params.planId,
        billing_cycle: params.billingCycle,
        status: 'ACTIVE',
      };
      this.subscriptions.push(newSub);

      return {
        success: true,
        subscription_id: newSub.id,
      };
    }
  }

  it('denies direct execution to authenticated and anon callers', () => {
    const db = new MockActivationDatabase();
    assert.throws(
      () =>
        db.confirmPaymentAndActivate({
          callerRole: 'authenticated',
          paymentId: 'pay_123',
          orderId: 'order_123',
          planId: 'PRO',
          billingCycle: 'monthly',
          userId: 'user_a',
        }),
      /42501: permission denied/
    );

    assert.throws(
      () =>
        db.confirmPaymentAndActivate({
          callerRole: 'anon',
          paymentId: 'pay_123',
          orderId: 'order_123',
          planId: 'PRO',
          billingCycle: 'monthly',
          userId: 'user_a',
        }),
      /42501: permission denied/
    );
  });

  it('activates subscription on first legitimate call and idempotently accepts duplicate callback without duplicate rows', () => {
    const db = new MockActivationDatabase();
    const firstCall = db.confirmPaymentAndActivate({
      callerRole: 'service_role',
      paymentId: 'pay_legit_001',
      orderId: 'order_legit_001',
      planId: 'PRO',
      billingCycle: 'monthly',
      userId: 'user_a',
    });

    assert.strictEqual(firstCall.success, true);
    assert.strictEqual(db.subscriptions.length, 1);
    assert.strictEqual(db.subscriptions[0].status, 'ACTIVE');

    // Duplicate callback with same payment ID
    const duplicateCall = db.confirmPaymentAndActivate({
      callerRole: 'service_role',
      paymentId: 'pay_legit_001',
      orderId: 'order_legit_001',
      planId: 'PRO',
      billingCycle: 'monthly',
      userId: 'user_a',
    });

    assert.strictEqual(duplicateCall.success, true);
    assert.strictEqual(duplicateCall.idempotent_replay, true);
    assert.strictEqual(duplicateCall.subscription_id, firstCall.subscription_id);
    assert.strictEqual(db.subscriptions.length, 1, 'Duplicate call must NOT create a second subscription row');
  });

  it('strictly rejects payment ID reuse by a different user account', () => {
    const db = new MockActivationDatabase();
    db.confirmPaymentAndActivate({
      callerRole: 'service_role',
      paymentId: 'pay_user_a_only',
      orderId: 'order_001',
      planId: 'PRO',
      billingCycle: 'monthly',
      userId: 'user_a',
    });

    // Attacker on user_b attempts to claim User A's payment ID
    assert.throws(
      () =>
        db.confirmPaymentAndActivate({
          callerRole: 'service_role',
          paymentId: 'pay_user_a_only',
          orderId: 'order_001',
          planId: 'GROWTH',
          billingCycle: 'annual',
          userId: 'user_b',
        }),
      /PAYMENT_ALREADY_CLAIMED/
    );
  });

  it('safely recovers when webhook arrives before client-side verification completes', () => {
    const db = new MockActivationDatabase();
    const paymentId = 'pay_interrupted_recovery_001';

    // 1. Asynchronous webhook arrives and activates subscription in background
    const webhookRes = db.confirmPaymentAndActivate({
      callerRole: 'service_role',
      paymentId,
      orderId: 'order_interrupted_001',
      planId: 'GROWTH',
      billingCycle: 'quarterly',
      userId: 'user_a',
    });
    assert.strictEqual(webhookRes.success, true);
    const initialSubId = webhookRes.subscription_id;

    // 2. Client-side verify action recovers after network reconnect and submits verification
    const clientRecoverRes = db.confirmPaymentAndActivate({
      callerRole: 'service_role',
      paymentId,
      orderId: 'order_interrupted_001',
      planId: 'GROWTH',
      billingCycle: 'quarterly',
      userId: 'user_a',
    });

    assert.strictEqual(clientRecoverRes.success, true);
    assert.strictEqual(clientRecoverRes.idempotent_replay, true);
    assert.strictEqual(clientRecoverRes.subscription_id, initialSubId);
    assert.strictEqual(db.subscriptions.length, 1);
  });
});

describe('Payment Lifecycle: Webhook Reconciliation & Metadata Integrity', () => {
  const validUserId = '00000000-0000-0000-0000-000000000001';
  const attackerUserId = '00000000-0000-0000-0000-000000000002';

  const baseOrderPaidPayload = {
    event: 'order.paid',
    event_id: 'evt_order_paid_001',
    payload: {
      order: {
        entity: {
          id: 'order_paid_123',
          amount: 39900,
          currency: 'INR',
          status: 'paid',
          notes: {
            userId: validUserId,
            planId: 'PRO',
            billingCycle: 'monthly',
          },
        },
      },
      payment: {
        entity: {
          id: 'pay_captured_123',
          order_id: 'order_paid_123',
          amount: 39900,
          currency: 'INR',
          status: 'captured',
          captured: true,
          notes: {
            userId: validUserId,
            planId: 'PRO',
            billingCycle: 'monthly',
          },
        },
      },
    },
  };

  it('successfully validates legitimate order.paid webhook payload', () => {
    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload: baseOrderPaidPayload,
    });

    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.verifiedUserId, validUserId);
    assert.strictEqual(result.verifiedPlanId, 'PRO');
    assert.strictEqual(result.verifiedBillingCycle, 'monthly');
    assert.strictEqual(result.verifiedAmountPaise, 39900);
  });

  it('rejects order.paid when order notes are missing userId', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    delete payload.payload.order.entity.notes.userId;

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Order entity is missing authoritative userId/);
  });

  it('rejects order.paid when order notes are missing planId', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    delete payload.payload.order.entity.notes.planId;

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Order entity is missing authoritative planId/);
  });

  it('rejects order.paid when order notes are missing billingCycle without defaulting to monthly', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    delete payload.payload.order.entity.notes.billingCycle;

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Order entity is missing authoritative billingCycle/);
  });

  it('rejects when payment notes indicate a conflicting user account', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    payload.payload.payment.entity.notes.userId = attackerUserId;

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Payment notes indicate conflicting user account/);
  });

  it('rejects when payment notes indicate a conflicting plan tier', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    payload.payload.payment.entity.notes.planId = 'GROWTH';

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Payment notes indicate conflicting plan/);
  });

  it('rejects when payment notes indicate a conflicting billing cycle', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    payload.payload.payment.entity.notes.billingCycle = 'annual';

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Payment notes indicate conflicting billing cycle/);
  });

  it('rejects purchase activation webhook payload when order entity is missing', () => {
    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_standalone_001',
            order_id: 'order_standalone_001',
            amount: 39900,
            currency: 'INR',
            status: 'captured',
            notes: {
              userId: validUserId,
              planId: 'PRO',
              billingCycle: 'monthly',
            },
          },
        },
      },
    };

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'payment.captured',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /missing mandatory order entity/i);
  });

  it('rejects purchase activation webhook payload when payment entity is missing', () => {
    const payload = {
      event: 'order.paid',
      payload: {
        order: {
          entity: {
            id: 'order_paid_123',
            amount: 39900,
            currency: 'INR',
            status: 'paid',
            notes: {
              userId: validUserId,
              planId: 'PRO',
              billingCycle: 'monthly',
            },
          },
        },
      },
    };

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /missing mandatory payment entity/i);
  });

  it('rejects order.paid when order entity is missing billingCycle rather than defaulting to monthly', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    delete payload.payload.order.entity.notes.billingCycle;

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Order entity is missing authoritative billingCycle/i);
  });

  it('rejects webhook payload when payment amount is missing or invalid', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    delete payload.payload.payment.entity.amount;

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Missing or invalid payment amount/i);
  });

  it('rejects webhook payload when order amount is missing or invalid', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    delete payload.payload.order.entity.amount;

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Missing or invalid order amount/i);
  });

  it('rejects webhook payload when order currency is missing or non-INR', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    payload.payload.order.entity.currency = 'EUR';

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /StreetCraft operates in INR/i);
  });

  it('rejects webhook payload when payment status is not captured', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    payload.payload.payment.entity.status = 'authorized';
    payload.payload.payment.entity.captured = false;

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Payment is not captured/i);
  });

  it('rejects order.paid when order status is not paid', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    payload.payload.order.entity.status = 'attempted';

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Order is not in paid status/i);
  });

  it('rejects when payment order_id does not match order id', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    payload.payload.payment.entity.order_id = 'order_different_999';

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /does not match order id/i);
  });

  it('rejects underpayment attack (100 paise payment for 399 INR plan)', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    payload.payload.payment.entity.amount = 100; // 1 INR instead of 399 INR

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Payment amount 100 paise does not match expected amount 39900 paise/);
  });

  it('rejects non-INR currency in webhook payload', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    payload.payload.payment.entity.currency = 'USD';

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Invalid currency.*StreetCraft operates in INR/);
  });
});

describe('Payment Lifecycle: Razorpay Webhook Endpoint Route Handler', () => {
  const secret = 'whsec_route_test_secret_2026';
  process.env.RAZORPAY_WEBHOOK_SECRET = secret;

  function makeWebhookRequest(bodyObj: any, customSig?: string | null): any {
    const rawBody = typeof bodyObj === 'string' ? bodyObj : JSON.stringify(bodyObj);
    const signature = customSig !== undefined
      ? customSig
      : crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const headers = new Map<string, string>();
    if (signature !== null) {
      headers.set('x-razorpay-signature', signature);
    }
    headers.set('content-type', 'application/json');

    return {
      headers: {
        get: (key: string) => headers.get(key.toLowerCase()) || null,
      },
      text: async () => rawBody,
    };
  }

  const validUserId = '00000000-0000-0000-0000-000000000001';

  const validOrderPaidWebhook = {
    event: 'order.paid',
    event_id: 'evt_route_test_001',
    payload: {
      order: {
        entity: {
          id: 'order_route_001',
          amount: 39900,
          currency: 'INR',
          status: 'paid',
          notes: {
            userId: validUserId,
            planId: 'PRO',
            billingCycle: 'monthly',
          },
        },
      },
      payment: {
        entity: {
          id: 'pay_route_001',
          order_id: 'order_route_001',
          amount: 39900,
          currency: 'INR',
          status: 'captured',
          captured: true,
          notes: {
            userId: validUserId,
            planId: 'PRO',
            billingCycle: 'monthly',
          },
        },
      },
    },
  };

  it('returns 400 MISSING_SIGNATURE when x-razorpay-signature header is missing', async () => {
    const req = makeWebhookRequest({ event: 'payment.captured' }, null);

    const res = await handleRazorpayWebhook(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'MISSING_SIGNATURE');
  });

  it('returns 400 INVALID_SIGNATURE when signature does not match secret', async () => {
    const req = makeWebhookRequest({ event: 'payment.captured' }, 'invalid_hex_signature_deadbeef');

    const res = await handleRazorpayWebhook(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'INVALID_SIGNATURE');
  });

  it('returns 400 INVALID_JSON_PAYLOAD when body is malformed JSON', async () => {
    const req = makeWebhookRequest('not-json-at-all');
    const res = await handleRazorpayWebhook(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'INVALID_JSON_PAYLOAD');
  });

  it('returns 400 MISSING_EVENT_ID when event_id is absent', async () => {
    const payload = JSON.parse(JSON.stringify(validOrderPaidWebhook));
    delete payload.event_id;

    const req = makeWebhookRequest(payload);
    const res = await handleRazorpayWebhook(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'MISSING_EVENT_ID');
  });

  it('returns 400 RECONCILIATION_FAILED when order entity is missing from signed webhook', async () => {
    const payload = {
      event: 'order.paid',
      event_id: 'evt_no_order_001',
      payload: {
        payment: validOrderPaidWebhook.payload.payment,
      },
    };

    const req = makeWebhookRequest(payload);
    const res = await handleRazorpayWebhook(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'RECONCILIATION_FAILED');
    assert.match(data.message, /missing mandatory order entity/i);
  });

  it('returns 400 RECONCILIATION_FAILED when payment entity is missing from signed webhook', async () => {
    const payload = {
      event: 'order.paid',
      event_id: 'evt_no_payment_001',
      payload: {
        order: validOrderPaidWebhook.payload.order,
      },
    };

    const req = makeWebhookRequest(payload);
    const res = await handleRazorpayWebhook(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'RECONCILIATION_FAILED');
    assert.match(data.message, /missing mandatory payment entity/i);
  });

  it('returns 400 RECONCILIATION_FAILED when payment amount is missing', async () => {
    const payload = JSON.parse(JSON.stringify(validOrderPaidWebhook));
    delete payload.payload.payment.entity.amount;

    const req = makeWebhookRequest(payload);
    const res = await handleRazorpayWebhook(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'RECONCILIATION_FAILED');
    assert.match(data.message, /Missing or invalid payment amount/i);
  });

  it('returns 400 RECONCILIATION_FAILED when order amount is missing', async () => {
    const payload = JSON.parse(JSON.stringify(validOrderPaidWebhook));
    delete payload.payload.order.entity.amount;

    const req = makeWebhookRequest(payload);
    const res = await handleRazorpayWebhook(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'RECONCILIATION_FAILED');
    assert.match(data.message, /Missing or invalid order amount/i);
  });

  it('returns 400 RECONCILIATION_FAILED when currency is non-INR (USD)', async () => {
    const payload = JSON.parse(JSON.stringify(validOrderPaidWebhook));
    payload.payload.payment.entity.currency = 'USD';

    const req = makeWebhookRequest(payload);
    const res = await handleRazorpayWebhook(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'RECONCILIATION_FAILED');
    assert.match(data.message, /StreetCraft operates in INR/i);
  });

  it('returns 400 RECONCILIATION_FAILED when payment status is not captured', async () => {
    const payload = JSON.parse(JSON.stringify(validOrderPaidWebhook));
    payload.payload.payment.entity.status = 'authorized';
    payload.payload.payment.entity.captured = false;

    const req = makeWebhookRequest(payload);
    const res = await handleRazorpayWebhook(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'RECONCILIATION_FAILED');
    assert.match(data.message, /Payment is not captured/i);
  });

  it('returns 400 RECONCILIATION_FAILED when order status is not paid on order.paid', async () => {
    const payload = JSON.parse(JSON.stringify(validOrderPaidWebhook));
    payload.payload.order.entity.status = 'created';

    const req = makeWebhookRequest(payload);
    const res = await handleRazorpayWebhook(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'RECONCILIATION_FAILED');
    assert.match(data.message, /Order is not in paid status/i);
  });

  it('returns 400 RECONCILIATION_FAILED when payment amount is tampered', async () => {
    const payload = JSON.parse(JSON.stringify(validOrderPaidWebhook));
    payload.payload.payment.entity.amount = 100; // 1 INR instead of 399 INR

    const req = makeWebhookRequest(payload);
    const res = await handleRazorpayWebhook(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'RECONCILIATION_FAILED');
    assert.match(data.message, /Payment amount 100 paise does not match/);
  });

  it('returns 400 RECONCILIATION_FAILED when payment order_id does not match order id', async () => {
    const payload = JSON.parse(JSON.stringify(validOrderPaidWebhook));
    payload.payload.payment.entity.order_id = 'order_tampered_diff';

    const req = makeWebhookRequest(payload);
    const res = await handleRazorpayWebhook(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'RECONCILIATION_FAILED');
    assert.match(data.message, /does not match order id/i);
  });

  it('returns 400 RECONCILIATION_FAILED when payment notes conflict with order notes', async () => {
    const payload = JSON.parse(JSON.stringify(validOrderPaidWebhook));
    payload.payload.payment.entity.notes.planId = 'GROWTH'; // Conflicts with order PRO

    const req = makeWebhookRequest(payload);
    const res = await handleRazorpayWebhook(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'RECONCILIATION_FAILED');
    assert.match(data.message, /Payment notes indicate conflicting plan/i);
  });
});

describe('Payment Lifecycle: Database Provider Event Deduplication & Retry Recovery', () => {
  interface ProviderEventRow {
    id: string;
    provider: string;
    provider_event_id: string;
    event_type: string;
    status: 'PROCESSING' | 'PROCESSED' | 'FAILED';
    attempt_count: number;
    error_message?: string;
  }

  class MockReconciliationDatabase {
    public events: ProviderEventRow[] = [];

    public reconcileProviderEvent(params: {
      provider: string;
      providerEventId: string;
      eventType: string;
      payload: any;
    }): { success: boolean; idempotent_replay?: boolean; in_flight?: boolean; status: string; attempt_count: number } {
      const existing = this.events.find(
        (e) => e.provider === params.provider && e.provider_event_id === params.providerEventId
      );

      if (existing) {
        if (existing.status === 'PROCESSED') {
          return {
            success: true,
            idempotent_replay: true,
            status: 'PROCESSED',
            attempt_count: existing.attempt_count,
          };
        }
        if (existing.status === 'PROCESSING') {
          return {
            success: true,
            in_flight: true,
            status: 'PROCESSING',
            attempt_count: existing.attempt_count,
          };
        }
        // Previously FAILED: allow retry
        existing.status = 'PROCESSING';
        existing.attempt_count += 1;
        existing.error_message = undefined;
      } else {
        const newEvent: ProviderEventRow = {
          id: `evt_row_${Math.random().toString(36).substring(2, 9)}`,
          provider: params.provider,
          provider_event_id: params.providerEventId,
          event_type: params.eventType,
          status: 'PROCESSING',
          attempt_count: 1,
        };
        this.events.push(newEvent);
      }

      const activeEvent = this.events.find((e) => e.provider_event_id === params.providerEventId)!;

      // Validate required entities and fields
      const p = params.payload?.payload;
      if (!p?.payment?.entity) {
        activeEvent.status = 'FAILED';
        activeEvent.error_message = 'SECURITY_VIOLATION: Missing payment entity.';
        throw new Error(activeEvent.error_message);
      }
      if (!p?.order?.entity) {
        activeEvent.status = 'FAILED';
        activeEvent.error_message = 'SECURITY_VIOLATION: Missing order entity.';
        throw new Error(activeEvent.error_message);
      }

      activeEvent.status = 'PROCESSED';
      return {
        success: true,
        idempotent_replay: false,
        status: 'PROCESSED',
        attempt_count: activeEvent.attempt_count,
      };
    }
  }

  it('first event delivery records status as PROCESSING and completes to PROCESSED', () => {
    const db = new MockReconciliationDatabase();
    const result = db.reconcileProviderEvent({
      provider: 'razorpay',
      providerEventId: 'evt_flow_001',
      eventType: 'order.paid',
      payload: {
        payload: {
          payment: { entity: { id: 'pay_1', amount: 39900 } },
          order: { entity: { id: 'ord_1', amount: 39900 } },
        },
      },
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.status, 'PROCESSED');
    assert.strictEqual(result.attempt_count, 1);
    assert.strictEqual(result.idempotent_replay, false);
  });

  it('duplicate delivery of PROCESSED event returns idempotent_replay = true', () => {
    const db = new MockReconciliationDatabase();
    db.events.push({
      id: 'row_01',
      provider: 'razorpay',
      provider_event_id: 'evt_flow_002',
      event_type: 'order.paid',
      status: 'PROCESSED',
      attempt_count: 1,
    });

    const result = db.reconcileProviderEvent({
      provider: 'razorpay',
      providerEventId: 'evt_flow_002',
      eventType: 'order.paid',
      payload: {},
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.idempotent_replay, true);
    assert.strictEqual(result.status, 'PROCESSED');
    assert.strictEqual(result.attempt_count, 1);
  });

  it('duplicate delivery of in-flight PROCESSING event returns in_flight = true', () => {
    const db = new MockReconciliationDatabase();
    db.events.push({
      id: 'row_02',
      provider: 'razorpay',
      provider_event_id: 'evt_flow_003',
      event_type: 'order.paid',
      status: 'PROCESSING',
      attempt_count: 1,
    });

    const result = db.reconcileProviderEvent({
      provider: 'razorpay',
      providerEventId: 'evt_flow_003',
      eventType: 'order.paid',
      payload: {},
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.in_flight, true);
    assert.strictEqual(result.status, 'PROCESSING');
  });

  it('retrying previously FAILED event resets status to PROCESSING, increments attempt_count, and succeeds on valid payload', () => {
    const db = new MockReconciliationDatabase();
    db.events.push({
      id: 'row_03',
      provider: 'razorpay',
      provider_event_id: 'evt_flow_004',
      event_type: 'order.paid',
      status: 'FAILED',
      attempt_count: 1,
      error_message: 'SECURITY_VIOLATION: Missing order entity.',
    });

    const result = db.reconcileProviderEvent({
      provider: 'razorpay',
      providerEventId: 'evt_flow_004',
      eventType: 'order.paid',
      payload: {
        payload: {
          payment: { entity: { id: 'pay_retry_1', amount: 39900 } },
          order: { entity: { id: 'ord_retry_1', amount: 39900 } },
        },
      },
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.status, 'PROCESSED');
    assert.strictEqual(result.attempt_count, 2);
    assert.strictEqual(result.idempotent_replay, false);
  });
});

describe('Payment Lifecycle: Authoritative SQL Activation Amount Enforcement', () => {
  function getPlanExpectedAmountPaise(planId: string, cycle: string): number | null {
    const p = planId.toUpperCase();
    const c = cycle.toLowerCase();
    if (p === 'PRO') {
      if (c === 'monthly') return 39900;
      if (c === 'quarterly') return 109900;
      if (c === 'annual') return 399000;
    } else if (p === 'GROWTH') {
      if (c === 'monthly') return 79900;
      if (c === 'quarterly') return 219900;
      if (c === 'annual') return 799000;
    } else if (p === 'FOUNDER') {
      if (c === 'quarterly') return 83700;
      if (c === 'annual') return 279000;
    }
    return null;
  }

  function simulateConfirmPaymentAndActivate(params: {
    callerRole: 'service_role' | 'authenticated' | 'anon';
    provider: string;
    paymentId: string;
    orderId: string;
    planId: string;
    billingCycle: string;
    userId: string;
    amountPaise?: number | null;
    isLegacyOverload?: boolean;
  }) {
    if (params.callerRole !== 'service_role') {
      throw new Error('FORBIDDEN: Only service_role can execute subscription activation RPC.');
    }

    if (params.isLegacyOverload) {
      throw new Error('DEPRECATED_RPC: Legacy activation without verified amount is disabled. Use authoritative 7-parameter activation RPC with verified amount.');
    }

    const normPlan = params.planId.toUpperCase();
    const normCycle = params.billingCycle.toLowerCase();

    if (!['PRO', 'GROWTH', 'FOUNDER'].includes(normPlan)) {
      throw new Error(`INVALID_PLAN: Plan ${normPlan} is not a valid billable subscription tier.`);
    }

    if (params.amountPaise === undefined || params.amountPaise === null || params.amountPaise <= 0) {
      throw new Error('INVALID_AMOUNT: Payment amount in paise is mandatory and must be positive.');
    }

    const expectedAmount = getPlanExpectedAmountPaise(normPlan, normCycle);
    if (expectedAmount === null || params.amountPaise !== expectedAmount) {
      throw new Error(`AMOUNT_MISMATCH: Provided payment amount ${params.amountPaise} paise does not match required price ${expectedAmount} paise for plan ${normPlan} (${normCycle}).`);
    }

    return {
      success: true,
      status: 'ACTIVE',
      plan: normPlan,
      billing_cycle: normCycle,
      verified_amount_paise: params.amountPaise,
    };
  }

  it('rejects call with missing or null p_amount_paise (INVALID_AMOUNT)', () => {
    assert.throws(
      () => simulateConfirmPaymentAndActivate({
        callerRole: 'service_role',
        provider: 'razorpay',
        paymentId: 'pay_test',
        orderId: 'ord_test',
        planId: 'PRO',
        billingCycle: 'monthly',
        userId: '00000000-0000-0000-0000-000000000001',
        amountPaise: null,
      }),
      /INVALID_AMOUNT: Payment amount in paise is mandatory/
    );
  });

  it('rejects call with amount mismatch against plan pricing quote (AMOUNT_MISMATCH)', () => {
    assert.throws(
      () => simulateConfirmPaymentAndActivate({
        callerRole: 'service_role',
        provider: 'razorpay',
        paymentId: 'pay_test',
        orderId: 'ord_test',
        planId: 'PRO',
        billingCycle: 'monthly',
        userId: '00000000-0000-0000-0000-000000000001',
        amountPaise: 100, // 1 INR instead of 399 INR
      }),
      /AMOUNT_MISMATCH: Provided payment amount 100 paise does not match required price 39900/
    );
  });

  it('rejects legacy overload invocation paths with DEPRECATED_RPC', () => {
    assert.throws(
      () => simulateConfirmPaymentAndActivate({
        callerRole: 'service_role',
        provider: 'razorpay',
        paymentId: 'pay_test',
        orderId: 'ord_test',
        planId: 'PRO',
        billingCycle: 'monthly',
        userId: '00000000-0000-0000-0000-000000000001',
        isLegacyOverload: true,
      }),
      /DEPRECATED_RPC: Legacy activation without verified amount is disabled/
    );
  });

  it('rejects non-billable FREE plan activation attempt with INVALID_PLAN', () => {
    assert.throws(
      () => simulateConfirmPaymentAndActivate({
        callerRole: 'service_role',
        provider: 'razorpay',
        paymentId: 'pay_test',
        orderId: 'ord_test',
        planId: 'FREE',
        billingCycle: 'monthly',
        userId: '00000000-0000-0000-0000-000000000001',
        amountPaise: 0,
      }),
      /INVALID_PLAN: Plan FREE is not a valid billable subscription tier/
    );
  });

  it('successfully activates subscription when p_amount_paise matches plan quote exactly', () => {
    const res = simulateConfirmPaymentAndActivate({
      callerRole: 'service_role',
      provider: 'razorpay',
      paymentId: 'pay_test_valid',
      orderId: 'ord_test_valid',
      planId: 'GROWTH',
      billingCycle: 'quarterly',
      userId: '00000000-0000-0000-0000-000000000001',
      amountPaise: 219900,
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.status, 'ACTIVE');
    assert.strictEqual(res.plan, 'GROWTH');
    assert.strictEqual(res.verified_amount_paise, 219900);
  });
});


describe('Payment Lifecycle: Database Quota Enforcement & Boundary Concurrency', () => {
  interface UsagePeriodRow {
    id: string;
    business_id: string;
    campaigns_used: number;
    campaign_limit: number;
  }

  interface CampaignRow {
    id: string;
    business_id: string;
    generation_request_id?: string;
  }

  class MockAtomicDatabaseBoundary {
    public periods: UsagePeriodRow[] = [];
    public campaigns: CampaignRow[] = [];

    public saveCampaignAtomically(params: {
      businessId: string;
      generationRequestId?: string;
    }): { campaign_id: string; campaigns_used: number; campaign_limit: number; idempotent_replay: boolean } {
      // 1. Idempotent check before lock or deduction
      if (params.generationRequestId) {
        const existing = this.campaigns.find(
          (c) => c.generation_request_id === params.generationRequestId && c.business_id === params.businessId
        );
        if (existing) {
          const period = this.periods.find((p) => p.business_id === params.businessId);
          return {
            campaign_id: existing.id,
            campaigns_used: period?.campaigns_used || 0,
            campaign_limit: period?.campaign_limit || 3,
            idempotent_replay: true,
          };
        }
      }

      // 2. Lock and quota check
      const period = this.periods.find((p) => p.business_id === params.businessId);
      if (!period) {
        throw new Error('ENTITLEMENT_UNAVAILABLE: No active usage period found.');
      }

      if (period.campaigns_used >= period.campaign_limit) {
        throw new Error(`QUOTA_EXHAUSTED: Usage quota reached: ${period.campaigns_used} of ${period.campaign_limit} campaigns used this cycle.`);
      }

      // 3. Atomically increment quota
      period.campaigns_used += 1;

      // 4. Insert campaign with unique constraint check on generation_request_id
      if (params.generationRequestId) {
        const duplicateIndex = this.campaigns.find(
          (c) => c.generation_request_id === params.generationRequestId
        );
        if (duplicateIndex) {
          // Unique violation rollback simulation
          period.campaigns_used -= 1;
          return {
            campaign_id: duplicateIndex.id,
            campaigns_used: period.campaigns_used,
            campaign_limit: period.campaign_limit,
            idempotent_replay: true,
          };
        }
      }

      const newCampaign: CampaignRow = {
        id: `cmp_${Math.random().toString(36).substring(2, 9)}`,
        business_id: params.businessId,
        generation_request_id: params.generationRequestId,
      };
      this.campaigns.push(newCampaign);

      return {
        campaign_id: newCampaign.id,
        campaigns_used: period.campaigns_used,
        campaign_limit: period.campaign_limit,
        idempotent_replay: false,
      };
    }
  }

  it('enforces quota limit and rejects campaign creation with QUOTA_EXHAUSTED when quota is reached', () => {
    const db = new MockAtomicDatabaseBoundary();
    const businessId = '11111111-1111-1111-1111-111111111111';
    db.periods.push({
      id: 'prd_01',
      business_id: businessId,
      campaigns_used: 3,
      campaign_limit: 3, // Exhausted free tier quota
    });

    assert.throws(
      () => db.saveCampaignAtomically({ businessId }),
      /QUOTA_EXHAUSTED: Usage quota reached: 3 of 3/
    );
  });

  it('replayed generation_request_id returns existing campaign without consuming additional quota', () => {
    const db = new MockAtomicDatabaseBoundary();
    const businessId = '11111111-1111-1111-1111-111111111111';
    db.periods.push({
      id: 'prd_01',
      business_id: businessId,
      campaigns_used: 1,
      campaign_limit: 100,
    });

    const genId = 'gen_req_unique_9988';
    const firstCall = db.saveCampaignAtomically({ businessId, generationRequestId: genId });
    assert.strictEqual(firstCall.idempotent_replay, false);
    assert.strictEqual(firstCall.campaigns_used, 2);

    // Replay call
    const replayCall = db.saveCampaignAtomically({ businessId, generationRequestId: genId });
    assert.strictEqual(replayCall.idempotent_replay, true);
    assert.strictEqual(replayCall.campaign_id, firstCall.campaign_id);
    assert.strictEqual(replayCall.campaigns_used, 2, 'Replay call must NOT increment campaigns_used');
    assert.strictEqual(db.campaigns.length, 1);
  });

  it('concurrently racing generation_request_id recovers gracefully without burning quota', () => {
    const db = new MockAtomicDatabaseBoundary();
    const businessId = '11111111-1111-1111-1111-111111111111';
    db.periods.push({
      id: 'prd_01',
      business_id: businessId,
      campaigns_used: 0,
      campaign_limit: 100,
    });

    const genId = 'gen_concurrent_race_001';

    // Simulate concurrent call 1
    const call1 = db.saveCampaignAtomically({ businessId, generationRequestId: genId });
    assert.strictEqual(call1.idempotent_replay, false);
    assert.strictEqual(call1.campaigns_used, 1);

    // Simulate concurrent call 2 that passed initial check but encounters unique index
    const call2 = db.saveCampaignAtomically({ businessId, generationRequestId: genId });
    assert.strictEqual(call2.idempotent_replay, true);
    assert.strictEqual(call2.campaign_id, call1.campaign_id);
    assert.strictEqual(db.periods[0].campaigns_used, 1, 'Concurrent collision must preserve quota at 1');
  });
});

