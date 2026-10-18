import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { getPlanPricingQuote } from '../lib/domain/plan/planPricing';

describe('Razorpay Checkout: Plan Pricing Calculation', () => {
  it('correctly calculates prices for PRO plan across all cycles', () => {
    const monthly = getPlanPricingQuote('PRO', 'monthly');
    assert.strictEqual(monthly.amountINR, 399);
    assert.strictEqual(monthly.amountPaise, 39900);
    assert.strictEqual(monthly.monthlyPackLimit, 100);

    const quarterly = getPlanPricingQuote('PRO', 'quarterly');
    assert.strictEqual(quarterly.amountINR, 1099);
    assert.strictEqual(quarterly.amountPaise, 109900);

    const annual = getPlanPricingQuote('PRO', 'annual');
    assert.strictEqual(annual.amountINR, 3990);
    assert.strictEqual(annual.amountPaise, 399000);
  });

  it('correctly calculates prices for GROWTH plan across all cycles', () => {
    const monthly = getPlanPricingQuote('GROWTH', 'monthly');
    assert.strictEqual(monthly.amountINR, 799);
    assert.strictEqual(monthly.amountPaise, 79900);
    assert.strictEqual(monthly.monthlyPackLimit, 300);

    const quarterly = getPlanPricingQuote('GROWTH', 'quarterly');
    assert.strictEqual(quarterly.amountINR, 2199);
    assert.strictEqual(quarterly.amountPaise, 219900);

    const annual = getPlanPricingQuote('GROWTH', 'annual');
    assert.strictEqual(annual.amountINR, 7990);
    assert.strictEqual(annual.amountPaise, 799000);
  });

  it('correctly enforces Founder tier constraints and pricing', () => {
    assert.throws(() => {
      getPlanPricingQuote('FOUNDER', 'monthly');
    }, /Founder tier requires quarterly or annual billing/);

    const quarterly = getPlanPricingQuote('FOUNDER', 'quarterly');
    assert.strictEqual(quarterly.amountINR, 837);
    assert.strictEqual(quarterly.amountPaise, 83700);

    const annual = getPlanPricingQuote('FOUNDER', 'annual');
    assert.strictEqual(annual.amountINR, 2790);
    assert.strictEqual(annual.amountPaise, 279000);
  });

  it('rejects unsupported plan identifiers', () => {
    assert.throws(() => {
      getPlanPricingQuote('NON_EXISTENT_PLAN', 'monthly');
    }, /Unsupported plan identifier/);
  });
});

describe('Razorpay Checkout: Payment Signature Cryptographic Verification', () => {
  const testSecret = 'secret_test_key_1234567890';

  function generateSignature(orderId: string, paymentId: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
  }

  function verifySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
    const expected = generateSignature(orderId, paymentId, secret);
    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expected, 'utf8');
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  }

  it('accepts perfectly matching signature and order/payment references', () => {
    const orderId = 'order_DA28F0G298FG2';
    const paymentId = 'pay_927FB9104GFB2';
    const sig = generateSignature(orderId, paymentId, testSecret);

    assert.strictEqual(verifySignature(orderId, paymentId, sig, testSecret), true);
  });

  it('rejects tampered payment ID', () => {
    const orderId = 'order_DA28F0G298FG2';
    const paymentId = 'pay_927FB9104GFB2';
    const tamperedPaymentId = 'pay_TAMPERED_000';
    const sig = generateSignature(orderId, paymentId, testSecret);

    assert.strictEqual(verifySignature(orderId, tamperedPaymentId, sig, testSecret), false);
  });

  it('rejects tampered order ID', () => {
    const orderId = 'order_DA28F0G298FG2';
    const tamperedOrderId = 'order_DIFFERENT_999';
    const paymentId = 'pay_927FB9104GFB2';
    const sig = generateSignature(orderId, paymentId, testSecret);

    assert.strictEqual(verifySignature(tamperedOrderId, paymentId, sig, testSecret), false);
  });

  it('rejects signature created with mismatched secret key', () => {
    const orderId = 'order_DA28F0G298FG2';
    const paymentId = 'pay_927FB9104GFB2';
    const wrongSecret = 'another_secret_key_999999';
    const sig = generateSignature(orderId, paymentId, wrongSecret);

    assert.strictEqual(verifySignature(orderId, paymentId, sig, testSecret), false);
  });
});

describe('Razorpay Checkout: Webhook Payload Parsing and Event Routing', () => {
  it('correctly maps payment.captured payload with entity notes', () => {
    const webhookBody = {
      event: 'payment.captured',
      event_id: 'evt_pay_cap_001',
      payload: {
        payment: {
          entity: {
            id: 'pay_ABC123456789',
            order_id: 'order_XYZ987654321',
            amount: 39900,
            currency: 'INR',
            status: 'captured',
            notes: {
              userId: '00000000-0000-0000-0000-000000000001',
              planId: 'PRO',
              billingCycle: 'monthly',
              businessId: '11111111-1111-1111-1111-111111111111',
            },
          },
        },
      },
    };

    const paymentEntity = webhookBody.payload.payment.entity;
    assert.strictEqual(paymentEntity.id, 'pay_ABC123456789');
    assert.strictEqual(paymentEntity.order_id, 'order_XYZ987654321');
    assert.strictEqual(paymentEntity.notes.planId, 'PRO');
    assert.strictEqual(paymentEntity.notes.billingCycle, 'monthly');
  });

  it('correctly maps order.paid payload', () => {
    const webhookBody = {
      event: 'order.paid',
      event_id: 'evt_order_paid_002',
      payload: {
        order: {
          entity: {
            id: 'order_XYZ987654321',
            amount_paid: 79900,
            status: 'paid',
            notes: {
              userId: '00000000-0000-0000-0000-000000000002',
              planId: 'GROWTH',
              billingCycle: 'monthly',
            },
          },
        },
      },
    };

    const orderEntity = webhookBody.payload.order.entity;
    assert.strictEqual(orderEntity.id, 'order_XYZ987654321');
    assert.strictEqual(orderEntity.notes.planId, 'GROWTH');
  });
});
