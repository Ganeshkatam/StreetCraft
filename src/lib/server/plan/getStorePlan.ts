import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { getAccessibleBusinesses } from '../business/getAccessibleBusinesses';
import { createClient } from '../../supabase/server';
import { StorePlanViewModel, BillingActivityItem, CommercialSubscriptionSummary } from '../../domain/plan/planTypes';
import { deriveCommercialEntitlementStatus } from '../../domain/plan/entitlementState';

export async function getStorePlan(candidateBizId: string): Promise<StorePlanViewModel | null> {
  const claims = await requireAuthenticatedClaims(`/user/business/${candidateBizId}/plan`);
  const supabase = await createClient();

  const [business, accessibleList] = await Promise.all([
    resolveAuthorizedBusiness(claims.userId, candidateBizId),
    getAccessibleBusinesses(claims.userId),
  ]);

  if (!business) {
    return null;
  }

  // Parallel commercial reads
  const [subResult, freePlanResult, usageResult, eventsResult] = await Promise.all([
    supabase
      .from('subscriptions')
      .select(`
        id,
        plan_id,
        status,
        billing_cycle,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
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
    supabase.from('plans').select('*').eq('id', 'FREE').maybeSingle(),
    supabase
      .from('usage_periods')
      .select('*')
      .eq('business_id', business.id)
      .gte('period_end', new Date().toISOString().split('T')[0])
      .order('period_end', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('usage_events')
      .select('id, event_type, delta, created_at, metadata')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  let subscription: CommercialSubscriptionSummary;
  const freePlan = freePlanResult.data;

  if (subResult.data) {
    const sub = subResult.data;
    const planRow = Array.isArray(sub.plans) ? sub.plans[0] : sub.plans;
    const { status, isCancellationScheduled } = deriveCommercialEntitlementStatus(sub);

    subscription = {
      id: sub.id,
      planId: sub.plan_id,
      planName: planRow?.name || sub.plan_id,
      monthlyInr: planRow?.monthly_inr || 0,
      status,
      billingCycle: sub.billing_cycle || 'monthly',
      currentPeriodStart: sub.current_period_start || new Date().toISOString(),
      currentPeriodEnd: sub.current_period_end || new Date(Date.now() + 30 * 86400000).toISOString(),
      cancelAtPeriodEnd: isCancellationScheduled,
      storefrontLimit: planRow?.business_limit ?? 1,
      monthlyCampaignLimit: planRow?.monthly_campaign_limit ?? 3,
    };
  } else {
    subscription = {
      id: 'free',
      planId: 'FREE',
      planName: freePlan?.name || 'Neighborhood Starter',
      monthlyInr: freePlan?.monthly_inr || 0,
      status: 'ACTIVE',
      billingCycle: 'monthly',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
      storefrontLimit: freePlan?.business_limit ?? 1,
      monthlyCampaignLimit: freePlan?.monthly_campaign_limit ?? 3,
    };
  }

  const limit = usageResult.data?.campaign_limit ?? subscription.monthlyCampaignLimit;
  const used = usageResult.data?.campaigns_used ?? 0;
  const remaining = Math.max(0, limit - used);

  const quota = {
    businessId: business.id,
    businessName: business.name,
    campaignsUsed: used,
    campaignLimit: limit,
    campaignsRemaining: remaining,
    percentUsed: Math.min(100, Math.round((used / (limit || 1)) * 100)),
    canGenerate: remaining > 0,
  };

  const activityLedger: BillingActivityItem[] = (eventsResult.data || []).map((e) => {
    const rawType = e.event_type || 'CAMPAIGN_GENERATION';
    let eventType: BillingActivityItem['eventType'] = 'CAMPAIGN_GENERATION';
    if (rawType.includes('REGEN')) eventType = 'CAMPAIGN_REGENERATION';
    else if (rawType.includes('RENEW')) eventType = 'SUBSCRIPTION_RENEWAL';
    else if (rawType.includes('UPGRADE')) eventType = 'PLAN_UPGRADE';

    let description = 'Campaign generation';
    if (eventType === 'CAMPAIGN_REGENERATION') description = 'Campaign pack regeneration';
    else if (eventType === 'SUBSCRIPTION_RENEWAL') description = 'Monthly quota allowance reset';
    else if (eventType === 'PLAN_UPGRADE') description = 'Plan upgrade allowance credited';

    return {
      id: e.id,
      eventType,
      description,
      unitsDelta: e.delta || -1,
      createdAt: e.created_at,
      metadata: e.metadata as Record<string, unknown>,
    };
  });

  return {
    businessId: business.id,
    businessName: business.name,
    connectedStorefrontsCount: accessibleList.length,
    subscription,
    quota,
    activityLedger,
  };
}
