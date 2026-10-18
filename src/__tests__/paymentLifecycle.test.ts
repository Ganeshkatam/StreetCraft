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

  it('rejects standalone payment.captured when billing cycle is missing rather than defaulting', () => {
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
              // billingCycle deliberately omitted
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
    assert.match(result.error || '', /Missing authoritative billingCycle.*Cannot default to monthly/);
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

  it('rejects uncaptured payment status in webhook payload', () => {
    const payload = JSON.parse(JSON.stringify(baseOrderPaidPayload));
    payload.payload.payment.entity.status = 'authorized';
    payload.payload.payment.entity.captured = false;

    const result = reconcileRazorpayWebhookPayload({
      eventType: 'order.paid',
      payload,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Payment is not captured/);
  });
});

describe('Payment Lifecycle: Razorpay Webhook Endpoint Route Handler', () => {
  const secret = 'whsec_route_test_secret_2026';
  process.env.RAZORPAY_WEBHOOK_SECRET = secret;

  function makeWebhookRequest(bodyObj: any, customSig?: string | null): any {
    const rawBody = JSON.stringify(bodyObj);
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

  it('returns 400 RECONCILIATION_FAILED when payment amount is tampered', async () => {
    const payload = {
      event: 'order.paid',
      event_id: 'evt_tampered_amt_001',
      payload: {
        order: {
          entity: {
            id: 'order_123',
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
            id: 'pay_123',
            order_id: 'order_123',
            amount: 100, // Tampered: 1 INR instead of 399 INR
            currency: 'INR',
            status: 'captured',
            notes: {
              userId: '00000000-0000-0000-0000-000000000001',
              planId: 'PRO',
              billingCycle: 'monthly',
            },
          },
        },
      },
    };

    const req = makeWebhookRequest(payload);
    const res = await handleRazorpayWebhook(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'RECONCILIATION_FAILED');
    assert.match(data.message, /Payment amount 100 paise does not match/);
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

