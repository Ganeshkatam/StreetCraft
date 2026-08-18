import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { createClient } from '../../supabase/server';

export interface BillingUsagePeriodViewModel {
  id: string;
  plan: string;
  periodStart: string;
  periodEnd: string;
  campaignLimit: number;
  campaignsUsed: number;
  campaignsRemaining: number;
  percentageUsed: number;
}

export interface BillingSubscriptionViewModel {
  id: string;
  planId: string;
  planName: string;
  status: string;
  billingCycle: string;
  provider: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  monthlyPriceInr: number;
}

export interface BillingUsageEventViewModel {
  id: string;
  eventType: string;
  units: number;
  description: string;
  createdAt: string;
}

export interface BillingPlanViewModel {
  id: string;
  name: string;
  monthlyCampaignLimit: number;
  monthlyInr: number;
  businessLimit: number;
  channels: string[];
  features: string[];
}

export interface BillingViewModel {
  business: { id: string; name: string } | null;
  subscription: BillingSubscriptionViewModel | null;
  usagePeriod: BillingUsagePeriodViewModel | null;
  events: BillingUsageEventViewModel[];
  availablePlans: BillingPlanViewModel[];
  isEntitled: boolean;
}

export async function getBillingData(candidateBizId?: string): Promise<BillingViewModel> {
  const claims = await requireAuthenticatedClaims('/user/billing');
  const supabase = await createClient();

  const business = await resolveAuthorizedBusiness(claims.userId, candidateBizId);

  // If user has zero businesses, we still resolve their account-level subscription and plan catalogue
  if (!business) {
    const [subResult, plansResult] = await Promise.all([
      supabase
        .from('subscriptions')
        .select(`
          id,
          plan_id,
          status,
          billing_cycle,
          provider,
          current_period_start,
          current_period_end,
          cancel_at_period_end,
          plans (
            id,
            name,
            monthly_inr
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
        .eq('active', true)
        .order('monthly_inr', { ascending: true }),
    ]);

    let subscription: BillingSubscriptionViewModel | null = null;
    if (subResult.data) {
      const sub = subResult.data;
      const plan = Array.isArray(sub.plans) ? sub.plans[0] : sub.plans;
      subscription = {
        id: sub.id,
        planId: sub.plan_id,
        planName: plan?.name || sub.plan_id,
        status: sub.status,
        billingCycle: sub.billing_cycle,
        provider: sub.provider,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: (sub as any).cancel_at_period_end === true,
        monthlyPriceInr: plan?.monthly_inr || 0,
      };
    }

    const availablePlans: BillingPlanViewModel[] = (plansResult.data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      monthlyCampaignLimit: p.monthly_campaign_limit,
      monthlyInr: p.monthly_inr,
      businessLimit: p.business_limit,
      channels: Array.isArray(p.channels) ? p.channels : [],
      features: Array.isArray(p.features) ? p.features : [],
    }));

    return {
      business: null,
      subscription,
      usagePeriod: null,
      events: [],
      availablePlans,
      isEntitled: false,
    };
  }

  // Business exists: Parallelize business-level and account-level reads
  const todayIso = new Date().toISOString().split('T')[0];

  const [usagePeriodResult, subResult, eventsResult, plansResult] = await Promise.all([
    supabase
      .from('usage_periods')
      .select('id, plan, period_start, period_end, campaign_limit, campaigns_used')
      .eq('business_id', business.id)
      .lte('period_start', todayIso)
      .gte('period_end', todayIso)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('subscriptions')
      .select(`
        id,
        plan_id,
        status,
        billing_cycle,
        provider,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        plans (
          id,
          name,
          monthly_inr
        )
      `)
      .eq('user_id', claims.userId)
      .in('status', ['ACTIVE', 'TRIALING'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('usage_events')
      .select('id, event_type, units, description, created_at')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(50),
    supabase
      .from('plans')
      .select('*')
      .eq('active', true)
      .order('monthly_inr', { ascending: true }),
  ]);

  let usagePeriod: BillingUsagePeriodViewModel | null = null;
  if (usagePeriodResult.data) {
    const raw = usagePeriodResult.data;
    const limit = raw.campaign_limit || 0;
    const used = raw.campaigns_used || 0;
    const remaining = Math.max(0, limit - used);
    const percentageUsed = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

    usagePeriod = {
      id: raw.id,
      plan: raw.plan,
      periodStart: raw.period_start,
      periodEnd: raw.period_end,
      campaignLimit: limit,
      campaignsUsed: used,
      campaignsRemaining: remaining,
      percentageUsed,
    };
  }

  let subscription: BillingSubscriptionViewModel | null = null;
  if (subResult.data) {
    const sub = subResult.data;
    const plan = Array.isArray(sub.plans) ? sub.plans[0] : sub.plans;
    subscription = {
      id: sub.id,
      planId: sub.plan_id,
      planName: plan?.name || sub.plan_id,
      status: sub.status,
      billingCycle: sub.billing_cycle,
      provider: sub.provider,
      currentPeriodStart: sub.current_period_start,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: (sub as any).cancel_at_period_end === true,
      monthlyPriceInr: plan?.monthly_inr || 0,
    };
  }

  const events: BillingUsageEventViewModel[] = (eventsResult.data || []).map((e: any) => ({
    id: e.id,
    eventType: e.event_type,
    units: e.units,
    description: e.description || '',
    createdAt: e.created_at,
  }));

  const availablePlans: BillingPlanViewModel[] = (plansResult.data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    monthlyCampaignLimit: p.monthly_campaign_limit,
    monthlyInr: p.monthly_inr,
    businessLimit: p.business_limit,
    channels: Array.isArray(p.channels) ? p.channels : [],
    features: Array.isArray(p.features) ? p.features : [],
  }));

  return {
    business: { id: business.id, name: business.name },
    subscription,
    usagePeriod,
    events,
    availablePlans,
    isEntitled: !!usagePeriod,
  };
}
