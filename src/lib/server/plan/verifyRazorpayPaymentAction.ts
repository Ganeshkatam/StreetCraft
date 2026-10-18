'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const VerifyPaymentInputSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Order reference required.'),
  razorpayPaymentId: z.string().min(1, 'Payment reference required.'),
  razorpaySignature: z.string().min(1, 'Signature required.'),
  targetPlanId: z.enum(['PRO', 'GROWTH', 'FOUNDER']),
  billingCycle: z.enum(['monthly', 'quarterly', 'annual']).default('monthly'),
  businessId: z.string().uuid().optional(),
});

export interface VerifyPaymentResult {
  success: boolean;
  message?: string;
  subscriptionId?: string;
  planId?: string;
  status?: string;
}

export async function verifyRazorpayPaymentAction(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  targetPlanId: string;
  billingCycle: string;
  businessId?: string;
}): Promise<VerifyPaymentResult> {
  try {
    const claims = await requireAuthenticatedClaims('/user/account/plan');

    const parsed = VerifyPaymentInputSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Invalid payment verification payload.',
      };
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, targetPlanId, billingCycle, businessId } = parsed.data;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;

    if (!secret || !keyId) {
      console.error('[Razorpay Verify] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured on the server.');
      return {
        success: false,
        message: 'Payment verification service is not properly configured. Cannot securely verify purchase.',
      };
    }

    // 1. Verify cryptographic signature: HMAC-SHA256(order_id + "|" + payment_id, secret)
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const sigBuf = Buffer.from(razorpaySignature, 'utf8');
    const expBuf = Buffer.from(expectedSignature, 'utf8');

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.error('[Razorpay Verify] Cryptographic signature mismatch.');
      return {
        success: false,
        message: 'Payment signature could not be verified. If your account was charged, please contact support.',
      };
    }

    // 2. Mandatory gateway purchase reconciliation (fail-closed)
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${secret}`).toString('base64');
    const [orderRes, payRes] = await Promise.all([
      fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpayOrderId)}`, {
        headers: { 'Authorization': authHeader },
      }),
      fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpayPaymentId)}`, {
        headers: { 'Authorization': authHeader },
      }),
    ]);

    if (!orderRes.ok || !payRes.ok) {
      console.error('[Razorpay Verify] Gateway lookup failed:', orderRes.status, payRes.status);
      return {
        success: false,
        message: 'Unable to reconcile payment with payment gateway records.',
      };
    }

    const orderData = await orderRes.json();
    const paymentData = await payRes.json();

    const { reconcileRazorpayPurchase } = await import('../../domain/plan/paymentReconciliation');
    const reconciliation = reconcileRazorpayPurchase({
      authenticatedUserId: claims.userId,
      expectedOrderId: razorpayOrderId,
      expectedPaymentId: razorpayPaymentId,
      clientTargetPlanId: targetPlanId,
      clientBillingCycle: billingCycle,
      order: orderData,
      payment: paymentData,
    });

    if (!reconciliation.valid || !reconciliation.verifiedPlanId || !reconciliation.verifiedBillingCycle) {
      console.error('[Razorpay Verify] Purchase reconciliation rejected:', reconciliation.error);
      return {
        success: false,
        message: reconciliation.error || 'Payment reconciliation failed.',
      };
    }

    const verifiedPlanId = reconciliation.verifiedPlanId;
    const verifiedCycle = reconciliation.verifiedBillingCycle;

    // 3. Connect to Supabase using privileged service role to safely activate verified payment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Database connection credentials missing.');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('confirm_payment_and_activate_subscription', {
      p_payment_provider: 'razorpay',
      p_payment_id: razorpayPaymentId,
      p_order_id: razorpayOrderId,
      p_plan_id: verifiedPlanId,
      p_billing_cycle: verifiedCycle,
      p_user_id: claims.userId,
      p_amount_paise: reconciliation.verifiedAmountPaise,
    });


    if (rpcError) {
      console.error('[Razorpay Verify] confirm_payment_and_activate_subscription error:', rpcError);
      return {
        success: false,
        message: rpcError.message || 'Failed to activate subscription.',
      };
    }

    if (businessId) {
      revalidatePath(`/user/business/${businessId}/plan`);
      revalidatePath(`/user/business/${businessId}/today`);
    }
    revalidatePath('/user/today');
    revalidatePath('/user/campaigns');

    return {
      success: true,
      subscriptionId: rpcResult?.subscription_id,
      planId: rpcResult?.plan,
      status: rpcResult?.status,
      message: 'Subscription successfully activated.',
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REDIRECT_TO_LOGIN') throw err;
    console.error('verifyRazorpayPaymentAction error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Payment verification failed.',
    };
  }
}
