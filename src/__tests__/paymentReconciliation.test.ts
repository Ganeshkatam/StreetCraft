import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { reconcileRazorpayPurchase, RazorpayOrderEntity, RazorpayPaymentEntity } from '../lib/domain/plan/paymentReconciliation';

describe('Payment Reconciliation: Razorpay Purchase Validation', () => {
  const validUserId = '00000000-0000-0000-0000-000000000001';
  const attackerUserId = '00000000-0000-0000-0000-000000000002';
  const orderId = 'order_valid_123456';
  const paymentId = 'pay_valid_789012';

  const baseOrder: RazorpayOrderEntity = {
    id: orderId,
    amount: 39900,
    amount_paid: 39900,
    currency: 'INR',
    status: 'paid',
    notes: {
      userId: validUserId,
      planId: 'PRO',
      billingCycle: 'monthly',
      businessId: '11111111-1111-1111-1111-111111111111',
    },
  };

  const basePayment: RazorpayPaymentEntity = {
    id: paymentId,
    order_id: orderId,
    amount: 39900,
    currency: 'INR',
    status: 'captured',
    captured: true,
    notes: {
      userId: validUserId,
      planId: 'PRO',
      billingCycle: 'monthly',
    },
  };

  it('successfully reconciles valid captured payment with matching order and user', () => {
    const result = reconcileRazorpayPurchase({
      authenticatedUserId: validUserId,
      expectedOrderId: orderId,
      expectedPaymentId: paymentId,
      clientTargetPlanId: 'PRO',
      clientBillingCycle: 'monthly',
      order: baseOrder,
      payment: basePayment,
    });

    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.verifiedPlanId, 'PRO');
    assert.strictEqual(result.verifiedBillingCycle, 'monthly');
    assert.strictEqual(result.verifiedAmountPaise, 39900);
    assert.strictEqual(result.verifiedBusinessId, '11111111-1111-1111-1111-111111111111');
  });

  it('rejects when payment is not in captured status', () => {
    const uncapturedPayment = { ...basePayment, status: 'authorized', captured: false };
    const result = reconcileRazorpayPurchase({
      authenticatedUserId: validUserId,
      expectedOrderId: orderId,
      expectedPaymentId: paymentId,
      clientTargetPlanId: 'PRO',
      clientBillingCycle: 'monthly',
      order: baseOrder,
      payment: uncapturedPayment,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Payment is not captured/);
  });

  it('rejects when payment order_id does not match expected order', () => {
    const mismatchedPayment = { ...basePayment, order_id: 'order_completely_different' };
    const result = reconcileRazorpayPurchase({
      authenticatedUserId: validUserId,
      expectedOrderId: orderId,
      expectedPaymentId: paymentId,
      order: baseOrder,
      payment: mismatchedPayment,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Order reference mismatch on payment/);
  });

  it('rejects when order notes belong to a different account (cross-account claiming attack)', () => {
    const result = reconcileRazorpayPurchase({
      authenticatedUserId: attackerUserId,
      expectedOrderId: orderId,
      expectedPaymentId: paymentId,
      order: baseOrder,
      payment: basePayment,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Order was created for a different account/);
  });

  it('rejects when client attempts to claim a higher tier plan than ordered', () => {
    const result = reconcileRazorpayPurchase({
      authenticatedUserId: validUserId,
      expectedOrderId: orderId,
      expectedPaymentId: paymentId,
      clientTargetPlanId: 'GROWTH', // Client claims GROWTH on a PRO order
      clientBillingCycle: 'monthly',
      order: baseOrder,
      payment: basePayment,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Plan mismatch: order was created for PRO, but activation requested GROWTH/);
  });

  it('rejects when paid amount does not match expected quote for plan and cycle', () => {
    const tamperedPayment = {
      ...basePayment,
      amount: 10000,
    };

    const result = reconcileRazorpayPurchase({
      authenticatedUserId: validUserId,
      expectedOrderId: orderId,
      expectedPaymentId: paymentId,
      clientTargetPlanId: 'PRO',
      clientBillingCycle: 'monthly',
      order: baseOrder, // has 39900
      payment: tamperedPayment,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Payment amount 10000 paise does not match expected amount 39900 paise/);
  });

  it('rejects when order notes are missing userId even if payment notes contain valid userId', () => {
    const orderWithoutUserId = {
      ...baseOrder,
      notes: { planId: 'PRO', billingCycle: 'monthly' },
    };
    const paymentWithUserId = {
      ...basePayment,
      notes: { userId: validUserId, planId: 'PRO', billingCycle: 'monthly' },
    };

    const result = reconcileRazorpayPurchase({
      authenticatedUserId: validUserId,
      expectedOrderId: orderId,
      expectedPaymentId: paymentId,
      order: orderWithoutUserId,
      payment: paymentWithUserId,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Purchase order is missing authoritative user ownership metadata in order notes/);
  });

  it('rejects when order notes are missing planId even if payment notes contain valid planId', () => {
    const orderWithoutPlan = {
      ...baseOrder,
      notes: { userId: validUserId, billingCycle: 'monthly' },
    };
    const paymentWithPlan = {
      ...basePayment,
      notes: { userId: validUserId, planId: 'PRO', billingCycle: 'monthly' },
    };

    const result = reconcileRazorpayPurchase({
      authenticatedUserId: validUserId,
      expectedOrderId: orderId,
      expectedPaymentId: paymentId,
      clientTargetPlanId: 'PRO',
      order: orderWithoutPlan,
      payment: paymentWithPlan,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Purchase order is missing authoritative plan metadata in order notes/);
  });

  it('rejects when order notes are missing billingCycle', () => {
    const orderWithoutCycle = {
      ...baseOrder,
      notes: { userId: validUserId, planId: 'PRO' },
    };

    const result = reconcileRazorpayPurchase({
      authenticatedUserId: validUserId,
      expectedOrderId: orderId,
      expectedPaymentId: paymentId,
      clientTargetPlanId: 'PRO',
      order: orderWithoutCycle,
      payment: basePayment,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Purchase order is missing authoritative billing cycle in order notes/);
  });

  it('rejects when order.amount does not match expected plan quote even if payment.amount matches', () => {
    const orderWithWrongAmount = {
      ...baseOrder,
      amount: 10000, // 100 INR instead of 399 INR
    };

    const result = reconcileRazorpayPurchase({
      authenticatedUserId: validUserId,
      expectedOrderId: orderId,
      expectedPaymentId: paymentId,
      clientTargetPlanId: 'PRO',
      clientBillingCycle: 'monthly',
      order: orderWithWrongAmount,
      payment: basePayment, // has 39900
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Order amount 10000 paise does not match expected amount 39900 paise/);
  });

  it('rejects when payment notes indicate a different account than authenticated user', () => {
    const paymentWithOtherUser = {
      ...basePayment,
      notes: { userId: attackerUserId, planId: 'PRO', billingCycle: 'monthly' },
    };

    const result = reconcileRazorpayPurchase({
      authenticatedUserId: validUserId,
      expectedOrderId: orderId,
      expectedPaymentId: paymentId,
      order: baseOrder,
      payment: paymentWithOtherUser,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Payment notes indicate a different account/);
  });

  it('rejects when client attempts to activate a different billing cycle than ordered', () => {
    const result = reconcileRazorpayPurchase({
      authenticatedUserId: validUserId,
      expectedOrderId: orderId,
      expectedPaymentId: paymentId,
      clientTargetPlanId: 'PRO',
      clientBillingCycle: 'annual', // Ordered monthly, client asks annual
      order: baseOrder,
      payment: basePayment,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Billing cycle mismatch/);
  });

  it('rejects non-INR currency payments', () => {
    const usdPayment = { ...basePayment, currency: 'USD' };
    const result = reconcileRazorpayPurchase({
      authenticatedUserId: validUserId,
      expectedOrderId: orderId,
      expectedPaymentId: paymentId,
      order: baseOrder,
      payment: usdPayment,
    });

    assert.strictEqual(result.valid, false);
    assert.match(result.error || '', /Invalid currency/);
  });
});
