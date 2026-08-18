import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { createClient } from '../../supabase/server';
import { PlanViewModel, SubscriptionSummary, PlanSummary, UsageSummary } from '../../domain/account/accountTypes';

export async function getAccountPlan(candidateBizId?: string): Promise<PlanViewModel> {
  const claims = await requireAuthenticatedClaims('/user/account/plan');
  const supabase = await createClient();

  const [business, subResult, freePlanResult] = await Promise.all([
    resolveAuthorizedBusiness(claims.userId, candidateBizId),
    supabase
      .from('subscriptions')
      .select(`
        id,
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

  let subscription: SubscriptionSummary | null = null;
  let plan: PlanSummary | null = null;

  if (subResult.data) {
    const sub = subResult.data;
    const planRow = Array.isArray(sub.plans) ? sub.plans[0] : sub.plans;

    subscription = {
      id: sub.id,
      planId: sub.plan_id,
      status: sub.status,
      billingCycle: sub.billing_cycle || 'monthly',
    };

    if (planRow) {
      plan = {
        id: planRow.id,
        name: planRow.name,
        monthlyInr: planRow.monthly_inr,
        businessLimit: planRow.business_limit,
        monthlyCampaignLimit: planRow.monthly_campaign_limit,
      };
    }
  } else if (freePlanResult.data) {
    const free = freePlanResult.data;
    plan = {
      id: free.id,
      name: free.name || 'Neighborhood Starter',
      monthlyInr: free.monthly_inr || 0,
      businessLimit: free.business_limit ?? 1,
      monthlyCampaignLimit: free.monthly_campaign_limit ?? 3,
    };
  }

  let usage: UsageSummary | null = null;
  if (business) {
    const { data: usageRow } = await supabase
      .from('usage_periods')
      .select('campaign_limit, campaigns_used')
      .eq('business_id', business.id)
      .gte('period_end', new Date().toISOString().split('T')[0])
      .order('period_end', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (usageRow) {
      const limit = usageRow.campaign_limit ?? (plan?.monthlyCampaignLimit ?? 3);
      const used = usageRow.campaigns_used ?? 0;
      usage = {
        businessId: business.id,
        businessName: business.name,
        campaignsUsed: used,
        campaignLimit: limit,
        campaignsRemaining: Math.max(0, limit - used),
      };
    }
  }

  return {
    subscription,
    plan,
    usage,
  };
}
