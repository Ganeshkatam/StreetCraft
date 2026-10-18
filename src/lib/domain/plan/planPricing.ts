/**
 * Deterministic Plan Pricing Calculator
 * Central source of truth for Razorpay checkout amounts across monthly, quarterly, and annual billing cycles.
 */

export type BillablePlanId = 'PRO' | 'GROWTH' | 'FOUNDER';
export type BillingCycle = 'monthly' | 'quarterly' | 'annual';

export interface PlanPricingQuote {
  planId: BillablePlanId;
  planName: string;
  billingCycle: BillingCycle;
  amountINR: number;
  amountPaise: number;
  monthlyEffectiveINR: number;
  monthlyPackLimit: number;
}

const PLAN_RATES: Record<BillablePlanId, {
  name: string;
  monthlyPackLimit: number;
  rates: Record<BillingCycle, number>;
}> = {
  PRO: {
    name: 'High-Street Pro',
    monthlyPackLimit: 100,
    rates: {
      monthly: 399,
      quarterly: 1099,
      annual: 3990,
    },
  },
  GROWTH: {
    name: 'Multi-Business Growth',
    monthlyPackLimit: 300,
    rates: {
      monthly: 799,
      quarterly: 2199,
      annual: 7990,
    },
  },
  FOUNDER: {
    name: 'Early Adopter Pro',
    monthlyPackLimit: 100,
    rates: {
      monthly: 279,
      quarterly: 837,
      annual: 2790,
    },
  },
};

export function getPlanPricingQuote(
  planId: string,
  billingCycle: string = 'monthly'
): PlanPricingQuote {
  const normalizedPlan = planId.toUpperCase() as BillablePlanId;
  const normalizedCycle = billingCycle.toLowerCase() as BillingCycle;

  const planDef = PLAN_RATES[normalizedPlan];
  if (!planDef) {
    throw new Error(`Unsupported plan identifier: ${planId}`);
  }

  if (normalizedPlan === 'FOUNDER' && normalizedCycle === 'monthly') {
    throw new Error('Founder tier requires quarterly or annual billing.');
  }

  const amountINR = planDef.rates[normalizedCycle];
  if (amountINR === undefined) {
    throw new Error(`Unsupported billing cycle '${billingCycle}' for plan ${planId}`);
  }

  const durationMonths = normalizedCycle === 'monthly' ? 1 : normalizedCycle === 'quarterly' ? 3 : 12;
  const monthlyEffectiveINR = Math.round(amountINR / durationMonths);

  return {
    planId: normalizedPlan,
    planName: planDef.name,
    billingCycle: normalizedCycle,
    amountINR,
    amountPaise: amountINR * 100,
    monthlyEffectiveINR,
    monthlyPackLimit: planDef.monthlyPackLimit,
  };
}
