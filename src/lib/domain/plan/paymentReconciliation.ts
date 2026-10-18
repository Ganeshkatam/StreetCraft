import { BillablePlanId, BillingCycle, getPlanPricingQuote } from './planPricing';

export interface RazorpayOrderEntity {
  id: string;
  amount: number;
  amount_paid?: number;
  currency: string;
  status: string;
  notes?: Record<string, unknown>;
}

export interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  captured?: boolean;
  notes?: Record<string, unknown>;
}

export interface PurchaseReconciliationInput {
  authenticatedUserId: string;
  expectedOrderId: string;
  expectedPaymentId: string;
  clientTargetPlanId?: string;
  clientBillingCycle?: string;
  order: RazorpayOrderEntity;
  payment: RazorpayPaymentEntity;
}

export interface PurchaseReconciliationResult {
  valid: boolean;
  error?: string;
  verifiedPlanId?: BillablePlanId;
  verifiedBillingCycle?: BillingCycle;
  verifiedBusinessId?: string;
  verifiedAmountPaise?: number;
}

/**
 * Reconciles and cryptographically validates that an incoming Razorpay payment
 * matches the order details, user identity, plan entitlements, and payment status
 * before any privileged database activation RPC is executed.
 */
export function reconcileRazorpayPurchase(
  input: PurchaseReconciliationInput
): PurchaseReconciliationResult {
  const {
    authenticatedUserId,
    expectedOrderId,
    expectedPaymentId,
    clientTargetPlanId,
    clientBillingCycle,
    order,
    payment,
  } = input;

  // 1. Verify entity IDs match the verified signature references
  if (payment.id !== expectedPaymentId) {
    return {
      valid: false,
      error: `Payment reference mismatch: expected ${expectedPaymentId}, received ${payment.id}.`,
    };
  }

  if (payment.order_id !== expectedOrderId) {
    return {
      valid: false,
      error: `Order reference mismatch on payment: payment order ${payment.order_id} does not match expected ${expectedOrderId}.`,
    };
  }

  if (order.id !== expectedOrderId) {
    return {
      valid: false,
      error: `Order ID mismatch: expected ${expectedOrderId}, received ${order.id}.`,
    };
  }

  // 2. Verify payment status is captured
  const isCaptured = payment.status === 'captured' || payment.captured === true;
  if (!isCaptured) {
    return {
      valid: false,
      error: `Payment is not captured. Current payment status: '${payment.status}'.`,
    };
  }

  // 3. Verify currency
  if (payment.currency !== 'INR' || order.currency !== 'INR') {
    return {
      valid: false,
      error: `Invalid currency: payment=${payment.currency}, order=${order.currency}. StreetCraft operates in INR.`,
    };
  }

  // 4. Verify user ownership
  const orderUserId = (order.notes?.userId || payment.notes?.userId) as string | undefined;
  if (orderUserId && orderUserId !== authenticatedUserId) {
    return {
      valid: false,
      error: 'Security violation: Order was created for a different account.',
    };
  }

  // 5. Derive verified Plan and Billing Cycle from trusted server-signed order notes
  const notePlan = (order.notes?.planId || payment.notes?.planId) as string | undefined;
  const noteCycle = (order.notes?.billingCycle || payment.notes?.billingCycle) as string | undefined;

  const candidatePlan = (notePlan || clientTargetPlanId || '').toUpperCase();
  const candidateCycle = (noteCycle || clientBillingCycle || 'monthly').toLowerCase();

  if (!['PRO', 'GROWTH', 'FOUNDER'].includes(candidatePlan)) {
    return {
      valid: false,
      error: `Invalid or missing plan specification in purchase record: ${candidatePlan}`,
    };
  }

  if (!['monthly', 'quarterly', 'annual'].includes(candidateCycle)) {
    return {
      valid: false,
      error: `Invalid billing cycle specification in purchase record: ${candidateCycle}`,
    };
  }

  // If order notes contain the authoritative plan, enforce client agreement
  if (notePlan && clientTargetPlanId && notePlan.toUpperCase() !== clientTargetPlanId.toUpperCase()) {
    return {
      valid: false,
      error: `Plan mismatch: order was created for ${notePlan.toUpperCase()}, but activation requested ${clientTargetPlanId.toUpperCase()}.`,
    };
  }

  // If order notes contain the authoritative cycle, enforce client agreement
  if (noteCycle && clientBillingCycle && noteCycle.toLowerCase() !== clientBillingCycle.toLowerCase()) {
    return {
      valid: false,
      error: `Billing cycle mismatch: order was created for ${noteCycle.toLowerCase()}, but activation requested ${clientBillingCycle.toLowerCase()}.`,
    };
  }

  const verifiedPlanId = candidatePlan as BillablePlanId;
  const verifiedBillingCycle = candidateCycle as BillingCycle;

  // 6. Enforce price calculation match
  let expectedQuote;
  try {
    expectedQuote = getPlanPricingQuote(verifiedPlanId, verifiedBillingCycle);
  } catch (err: unknown) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Failed to calculate expected plan pricing.',
    };
  }

  if (payment.amount !== expectedQuote.amountPaise) {
    return {
      valid: false,
      error: `Payment amount ${payment.amount} paise does not match expected amount ${expectedQuote.amountPaise} paise for plan ${verifiedPlanId} (${verifiedBillingCycle}).`,
    };
  }

  const verifiedBusinessId = (order.notes?.businessId || payment.notes?.businessId) as string | undefined;

  return {
    valid: true,
    verifiedPlanId,
    verifiedBillingCycle,
    verifiedBusinessId: verifiedBusinessId || undefined,
    verifiedAmountPaise: payment.amount,
  };
}
