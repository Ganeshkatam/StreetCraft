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

export interface WebhookReconciliationInput {
  eventType: string;
  payload: Record<string, unknown>;
}

export interface WebhookReconciliationResult {
  valid: boolean;
  error?: string;
  verifiedUserId?: string;
  verifiedPlanId?: BillablePlanId;
  verifiedBillingCycle?: BillingCycle;
  verifiedBusinessId?: string;
  verifiedAmountPaise?: number;
  paymentId?: string;
  orderId?: string;
}

/**
 * Reconciles incoming Razorpay webhook payloads (e.g. payment.captured, order.paid)
 * against authoritative order notes, currency, captured status, and expected plan pricing.
 */
export function reconcileRazorpayWebhookPayload(
  input: WebhookReconciliationInput
): WebhookReconciliationResult {
  const { eventType, payload } = input;

  if (eventType !== 'payment.captured' && eventType !== 'order.paid') {
    // Non-purchase lifecycle events (such as subscription.cancelled) do not activate plans
    return { valid: true };
  }

  const payloadObj = payload.payload as Record<string, unknown> | undefined;
  const paymentEntity = (payloadObj?.payment as Record<string, unknown> | undefined)?.entity as
    | RazorpayPaymentEntity
    | undefined
    || (payload.payment as RazorpayPaymentEntity | undefined);

  const orderEntity = (payloadObj?.order as Record<string, unknown> | undefined)?.entity as
    | RazorpayOrderEntity
    | undefined
    || (payload.order as RazorpayOrderEntity | undefined);

  // Both payment and order entities are strictly required for purchase-activation events
  if (!paymentEntity) {
    return {
      valid: false,
      error: 'Security violation: Webhook payload missing mandatory payment entity.',
    };
  }

  if (!orderEntity) {
    return {
      valid: false,
      error: 'Security violation: Webhook payload missing mandatory order entity.',
    };
  }

  // Mandatory Payment Entity Fields
  if (!paymentEntity.id || typeof paymentEntity.id !== 'string' || paymentEntity.id.trim() === '') {
    return { valid: false, error: 'Security violation: Missing payment ID in payment entity.' };
  }
  if (!paymentEntity.order_id || typeof paymentEntity.order_id !== 'string' || paymentEntity.order_id.trim() === '') {
    return { valid: false, error: 'Security violation: Missing order reference on payment entity.' };
  }
  if (typeof paymentEntity.amount !== 'number' || paymentEntity.amount <= 0) {
    return { valid: false, error: 'Security violation: Missing or invalid payment amount.' };
  }
  if (!paymentEntity.currency || typeof paymentEntity.currency !== 'string') {
    return { valid: false, error: 'Security violation: Missing payment currency.' };
  }
  if (!paymentEntity.status || typeof paymentEntity.status !== 'string') {
    return { valid: false, error: 'Security violation: Missing payment status.' };
  }

  // Mandatory Order Entity Fields
  if (!orderEntity.id || typeof orderEntity.id !== 'string' || orderEntity.id.trim() === '') {
    return { valid: false, error: 'Security violation: Missing order ID in order entity.' };
  }
  if (typeof orderEntity.amount !== 'number' || orderEntity.amount <= 0) {
    return { valid: false, error: 'Security violation: Missing or invalid order amount.' };
  }
  if (!orderEntity.currency || typeof orderEntity.currency !== 'string') {
    return { valid: false, error: 'Security violation: Missing order currency.' };
  }

  // Cross-reference IDs
  if (paymentEntity.order_id !== orderEntity.id) {
    return {
      valid: false,
      error: `Security violation: Payment order_id ${paymentEntity.order_id} does not match order id ${orderEntity.id}.`,
    };
  }

  // Authoritative Order Notes
  const orderNotes = orderEntity.notes as Record<string, unknown> | undefined;
  if (!orderNotes || typeof orderNotes !== 'object') {
    return {
      valid: false,
      error: 'Security violation: Order entity is missing authoritative order notes.',
    };
  }

  const orderUserId = orderNotes.userId as string | undefined;
  if (!orderUserId || typeof orderUserId !== 'string' || orderUserId.trim() === '') {
    return {
      valid: false,
      error: 'Security violation: Order entity is missing authoritative userId in order notes.',
    };
  }
  const orderPlan = orderNotes.planId as string | undefined;
  if (!orderPlan || typeof orderPlan !== 'string' || orderPlan.trim() === '') {
    return {
      valid: false,
      error: 'Security violation: Order entity is missing authoritative planId in order notes.',
    };
  }
  const orderCycle = orderNotes.billingCycle as string | undefined;
  if (!orderCycle || typeof orderCycle !== 'string' || orderCycle.trim() === '') {
    return {
      valid: false,
      error: 'Security violation: Order entity is missing authoritative billingCycle in order notes.',
    };
  }

  const verifiedUserId = orderUserId;
  const rawPlan = orderPlan;
  const rawCycle = orderCycle;
  const verifiedBusinessId = orderNotes.businessId as string | undefined;

  // Cross-check payment notes if present
  const paymentNotes = paymentEntity.notes as Record<string, unknown> | undefined;
  if (paymentNotes && typeof paymentNotes === 'object') {
    if (paymentNotes.userId && paymentNotes.userId !== verifiedUserId) {
      return {
        valid: false,
        error: 'Security violation: Payment notes indicate conflicting user account.',
      };
    }
    if (paymentNotes.planId && String(paymentNotes.planId).toUpperCase() !== rawPlan.toUpperCase()) {
      return {
        valid: false,
        error: 'Security violation: Payment notes indicate conflicting plan.',
      };
    }
    if (paymentNotes.billingCycle && String(paymentNotes.billingCycle).toLowerCase() !== rawCycle.toLowerCase()) {
      return {
        valid: false,
        error: 'Security violation: Payment notes indicate conflicting billing cycle.',
      };
    }
  }

  // Plan and cycle normalization and validation
  const normalizedPlan = rawPlan.toUpperCase();
  if (!['PRO', 'GROWTH', 'FOUNDER'].includes(normalizedPlan)) {
    return {
      valid: false,
      error: `Invalid plan specification in webhook record: ${normalizedPlan}`,
    };
  }

  const normalizedCycle = rawCycle.toLowerCase();
  if (!['monthly', 'quarterly', 'annual'].includes(normalizedCycle)) {
    return {
      valid: false,
      error: `Invalid billing cycle specification in webhook record: ${normalizedCycle}`,
    };
  }

  const verifiedPlanId = normalizedPlan as BillablePlanId;
  const verifiedBillingCycle = normalizedCycle as BillingCycle;

  // Currency validation (strict INR for both payment and order)
  if (paymentEntity.currency !== 'INR' || orderEntity.currency !== 'INR') {
    return {
      valid: false,
      error: `Invalid currency: payment=${paymentEntity.currency}, order=${orderEntity.currency}. StreetCraft operates in INR.`,
    };
  }

  // Payment status validation
  const isCaptured = paymentEntity.status === 'captured' || paymentEntity.captured === true;
  if (!isCaptured) {
    return {
      valid: false,
      error: `Payment is not captured. Current status: '${paymentEntity.status}'.`,
    };
  }

  // Order status validation (on order.paid)
  if (eventType === 'order.paid') {
    if (orderEntity.status !== 'paid') {
      return {
        valid: false,
        error: `Order is not in paid status. Current status: '${orderEntity.status}'.`,
      };
    }
  }

  // Amount validation against authoritative plan pricing quote
  let expectedQuote;
  try {
    expectedQuote = getPlanPricingQuote(verifiedPlanId, verifiedBillingCycle);
  } catch (err: unknown) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Failed to calculate expected plan pricing.',
    };
  }

  if (paymentEntity.amount !== expectedQuote.amountPaise) {
    return {
      valid: false,
      error: `Payment amount ${paymentEntity.amount} paise does not match expected amount ${expectedQuote.amountPaise} paise for plan ${verifiedPlanId} (${verifiedBillingCycle}).`,
    };
  }

  if (orderEntity.amount !== expectedQuote.amountPaise) {
    return {
      valid: false,
      error: `Order amount ${orderEntity.amount} paise does not match expected amount ${expectedQuote.amountPaise} paise for plan ${verifiedPlanId} (${verifiedBillingCycle}).`,
    };
  }

  return {
    valid: true,
    verifiedUserId,
    verifiedPlanId,
    verifiedBillingCycle,
    verifiedBusinessId,
    verifiedAmountPaise: expectedQuote.amountPaise,
    paymentId: paymentEntity.id,
    orderId: orderEntity.id,
  };
}


