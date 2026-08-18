import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { createClient } from '../../supabase/server';

export interface AccountPlanViewModel {
  planId: string;
  planName: string;
  status: string;
  billingCycle: string;
  monthlyPriceInr: number;
  businessLimit: number;
  monthlyCampaignLimit: number;
  activeBusiness: {
    id: string;
    name: string;
    campaignsRemaining: number;
    campaignLimit: number;
  } | null;
}

export async function getAccountPlan(candidateBizId?: string): Promise<AccountPlanViewModel> {
  const claims = await requireAuthenticatedClaims('/user/account/plan');
  const supabase = await createClient();

  const [business, subResult, freePlanResult] = await Promise.all([
    resolveAuthorizedBusiness(claims.userId, candidateBizId),
    supabase
      .from('subscriptions')
      .select(`
        plan_id,
        status,
        billing_cycle,
        plans (
          id,
          name,
          monthly_inr,
          business_limit,
          monthly_campaign_limit
        )
      `)
      .eq('user_id', claims.userId)
      .in('status', ['ACTIVE', 'TRIALING'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('plans')
      .select('*')
      .eq('id', 'FREE')
      .maybeSingle(),
  ]);

  let planId = 'FREE';
  let planName = 'Neighborhood Starter';
  let status = 'FREE';
  let billingCycle = 'monthly';
  let monthlyPriceInr = 0;
  let businessLimit = freePlanResult.data?.business_limit ?? 1;
  let monthlyCampaignLimit = freePlanResult.data?.monthly_campaign_limit ?? 3;

  if (subResult.data) {
    const sub = subResult.data;
    const plan = Array.isArray(sub.plans) ? sub.plans[0] : sub.plans;
    planId = sub.plan_id;
    planName = plan?.name || sub.plan_id;
    status = sub.status;
    billingCycle = sub.billing_cycle || 'monthly';
    monthlyPriceInr = plan?.monthly_inr || 0;
    businessLimit = plan?.business_limit ?? 1;
    monthlyCampaignLimit = plan?.monthly_campaign_limit ?? 3;
  }

  let activeBusinessInfo = null;
  if (business) {
    const { data: usage } = await supabase
      .from('usage_periods')
      .select('campaign_limit, campaigns_used')
      .eq('business_id', business.id)
      .gte('period_end', new Date().toISOString().split('T')[0])
      .order('period_end', { ascending: false })
      .limit(1)
      .maybeSingle();

    const limit = usage?.campaign_limit ?? monthlyCampaignLimit;
    const used = usage?.campaigns_used ?? 0;
    const remaining = Math.max(0, limit - used);

    activeBusinessInfo = {
      id: business.id,
      name: business.name,
      campaignsRemaining: remaining,
      campaignLimit: limit,
    };
  }

  return {
    planId,
    planName,
    status,
    billingCycle,
    monthlyPriceInr,
    businessLimit,
    monthlyCampaignLimit,
    activeBusiness: activeBusinessInfo,
  };
}
