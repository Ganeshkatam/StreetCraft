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

  // 4. Verify user ownership (strictly require authoritative userId directly in server-created order notes)
  const orderUserId = order.notes?.userId as string | undefined;
  if (!orderUserId || typeof orderUserId !== 'string' || orderUserId.trim() === '') {
    return {
      valid: false,
      error: 'Security violation: Purchase order is missing authoritative user ownership metadata in order notes.',
    };
  }

  if (orderUserId !== authenticatedUserId) {
    return {
      valid: false,
      error: 'Security violation: Order was created for a different account.',
    };
  }

  // Cross-check payment notes if present to prevent mismatched payloads
  const paymentUserId = payment.notes?.userId as string | undefined;
  if (paymentUserId && paymentUserId !== authenticatedUserId) {
    return {
      valid: false,
      error: 'Security violation: Payment notes indicate a different account.',
    };
  }

  // 5. Authoritatively derive Plan and Billing Cycle directly from server-created order notes (fail-closed)
  const notePlan = order.notes?.planId as string | undefined;
  if (!notePlan || typeof notePlan !== 'string' || notePlan.trim() === '') {
    return {
      valid: false,
      error: 'Security violation: Purchase order is missing authoritative plan metadata in order notes.',
    };
  }

  const authoritativePlan = notePlan.toUpperCase();
  if (!['PRO', 'GROWTH', 'FOUNDER'].includes(authoritativePlan)) {
    return {
      valid: false,
      error: `Invalid plan specification in purchase record: ${authoritativePlan}`,
    };
  }

  const noteCycle = order.notes?.billingCycle as string | undefined;
  if (!noteCycle || typeof noteCycle !== 'string' || noteCycle.trim() === '') {
    return {
      valid: false,
      error: 'Security violation: Purchase order is missing authoritative billing cycle in order notes.',
    };
  }

  const authoritativeCycle = noteCycle.toLowerCase();
  if (!['monthly', 'quarterly', 'annual'].includes(authoritativeCycle)) {
    return {
      valid: false,
      error: `Invalid billing cycle specification in purchase record: ${authoritativeCycle}`,
    };
  }

  // If client provided target plan, verify strict agreement with authoritative order
  if (clientTargetPlanId && clientTargetPlanId.toUpperCase() !== authoritativePlan) {
    return {
      valid: false,
      error: `Plan mismatch: order was created for ${authoritativePlan}, but activation requested ${clientTargetPlanId.toUpperCase()}.`,
    };
  }

  // If client provided billing cycle, verify strict agreement with authoritative order
  if (clientBillingCycle && clientBillingCycle.toLowerCase() !== authoritativeCycle) {
    return {
      valid: false,
      error: `Billing cycle mismatch: order was created for ${authoritativeCycle}, but activation requested ${clientBillingCycle.toLowerCase()}.`,
    };
  }

  const verifiedPlanId = authoritativePlan as BillablePlanId;
  const verifiedBillingCycle = authoritativeCycle as BillingCycle;

  // 6. Enforce price calculation match on BOTH order.amount and payment.amount
  let expectedQuote;
  try {
    expectedQuote = getPlanPricingQuote(verifiedPlanId, verifiedBillingCycle);
  } catch (err: unknown) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Failed to calculate expected plan pricing.',
    };
  }

  if (order.amount !== expectedQuote.amountPaise) {
    return {
      valid: false,
      error: `Order amount ${order.amount} paise does not match expected amount ${expectedQuote.amountPaise} paise for plan ${verifiedPlanId} (${verifiedBillingCycle}).`,
    };
  }

  if (payment.amount !== expectedQuote.amountPaise) {
    return {
      valid: false,
      error: `Payment amount ${payment.amount} paise does not match expected amount ${expectedQuote.amountPaise} paise for plan ${verifiedPlanId} (${verifiedBillingCycle}).`,
    };
  }

  const verifiedBusinessId = order.notes?.businessId as string | undefined;

  return {
    valid: true,
    verifiedPlanId,
    verifiedBillingCycle,
    verifiedBusinessId: verifiedBusinessId || undefined,
    verifiedAmountPaise: payment.amount,
  };
}
