'use server';

import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { getPlanPricingQuote } from '../../domain/plan/planPricing';
import { createClient } from '../../supabase/server';
import { z } from 'zod';

const CreateOrderInputSchema = z.object({
  targetPlanId: z.enum(['PRO', 'GROWTH', 'FOUNDER']),
  billingCycle: z.enum(['monthly', 'quarterly', 'annual']).default('monthly'),
  businessId: z.string().uuid().optional(),
});

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  planName?: string;
  message?: string;
}

export async function createRazorpayOrderAction(input: {
  targetPlanId: string;
  billingCycle: string;
  businessId?: string;
}): Promise<CreateOrderResult> {
  try {
    const claims = await requireAuthenticatedClaims('/user/account/plan');

    const parsed = CreateOrderInputSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Invalid plan or billing cycle selection.',
      };
    }

    const { targetPlanId, billingCycle, businessId } = parsed.data;

    let targetBusinessId = businessId;
    if (businessId) {
      const authorized = await resolveAuthorizedBusiness(claims.userId, businessId);
      if (!authorized) {
        return {
          success: false,
          message: 'Unauthorized storefront selection.',
        };
      }
      targetBusinessId = authorized.id;
    }

    const quote = getPlanPricingQuote(targetPlanId, billingCycle);

    // Pre-check for FOUNDER membership to avoid paid-but-unfulfilled orders
    if (targetPlanId === 'FOUNDER') {
      if (billingCycle !== 'quarterly' && billingCycle !== 'annual') {
        return {
          success: false,
          message: 'Founder tier requires quarterly or annual billing.',
        };
      }

      const supabase = await createClient();

      const { data: userClaim } = await supabase
        .from('founder_claims')
        .select('id')
        .eq('user_id', claims.userId)
        .maybeSingle();

      if (userClaim) {
        return {
          success: false,
          message: 'You have already claimed a Founder membership.',
        };
      }

      const { data: allocation } = await supabase
        .from('founder_allocation')
        .select('total_slots, claimed_slots')
        .eq('id', 1)
        .single();

      if (allocation && allocation.claimed_slots >= allocation.total_slots) {
        return {
          success: false,
          message: 'All Founder memberships are currently sold out.',
        };
      }
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return {
        success: false,
        message: 'Payment gateway configuration is incomplete on the server. Please ensure RAZORPAY keys are set.',
      };
    }

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const receiptId = `sc_${claims.userId.substring(0, 8)}_${Date.now()}`;

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: quote.amountPaise,
        currency: 'INR',
        receipt: receiptId,
        notes: {
          app: 'streetcraft',
          userId: claims.userId,
          planId: quote.planId,
          billingCycle: quote.billingCycle,
          businessId: targetBusinessId || '',
        },
      }),
    });

    if (!rzpResponse.ok) {
      const errorText = await rzpResponse.text();
      console.error('[Razorpay Order Creation Failed]', rzpResponse.status, errorText);
      return {
        success: false,
        message: 'Failed to initiate order with Razorpay. Please try again.',
      };
    }

    const orderData = await rzpResponse.json();

    return {
      success: true,
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      keyId,
      planName: quote.planName,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REDIRECT_TO_LOGIN') throw err;
    console.error('createRazorpayOrderAction unexpected error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Unexpected order initiation error.',
    };
  }
}
