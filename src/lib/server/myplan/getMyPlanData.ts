import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { createClient } from '../../supabase/server';

export interface MyPlanUsagePeriodViewModel {
  id: string;
  plan: string;
  periodStart: string;
  periodEnd: string;
  campaignLimit: number;
  campaignsUsed: number;
  campaignsRemaining: number;
  percentageUsed: number;
}

export interface MyPlanSubscriptionViewModel {
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

export interface MyPlanUsageEventViewModel {
  id: string;
  eventType: string;
  units: number;
  description: string;
  createdAt: string;
}

export interface MyPlanPlanOptionViewModel {
  id: string;
  name: string;
  monthlyCampaignLimit: number;
  monthlyInr: number;
  businessLimit: number;
  channels: string[];
  features: string[];
}

export interface MyPlanViewModel {
  business: {
    id: string;
    name: string;
    category: string;
  } | null;
  subscription: MyPlanSubscriptionViewModel | null;
  usagePeriod: MyPlanUsagePeriodViewModel | null;
  events: MyPlanUsageEventViewModel[];
  availablePlans: MyPlanPlanOptionViewModel[];
  isEntitled: boolean;
}

export async function getMyPlanData(candidateBizId?: string): Promise<MyPlanViewModel> {
  const claims = await requireAuthenticatedClaims('/user/myplan');
  const supabase = await createClient();

  const business = await resolveAuthorizedBusiness(claims.userId, candidateBizId);

  // If user has zero businesses, resolve account-level subscription and plan catalogue
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

    let subscription: MyPlanSubscriptionViewModel | null = null;
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

    const availablePlans: MyPlanPlanOptionViewModel[] = (plansResult.data || []).map((p: any) => ({
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

  // Fetch subscription, active usage_periods, plans catalog, and usage_events in parallel
  const [subResult, usageResult, plansResult, eventsResult] = await Promise.all([
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
      .from('usage_periods')
      .select('id, plan, period_start, period_end, campaign_limit, campaigns_used')
      .eq('business_id', business.id)
      .gte('period_end', new Date().toISOString().split('T')[0])
      .order('period_end', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('plans')
      .select('*')
      .eq('active', true)
      .order('monthly_inr', { ascending: true }),
    supabase
      .from('usage_events')
      .select('id, event_type, units, description, created_at')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(15),
  ]);

  let subscription: MyPlanSubscriptionViewModel | null = null;
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

  let usagePeriod: MyPlanUsagePeriodViewModel | null = null;
  if (usageResult.data) {
    const u = usageResult.data;
    const limit = u.campaign_limit ?? 3;
    const used = u.campaigns_used ?? 0;
    const remaining = Math.max(0, limit - used);
    const percentage = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

    usagePeriod = {
      id: u.id,
      plan: u.plan || 'FREE',
      periodStart: u.period_start,
      periodEnd: u.period_end,
      campaignLimit: limit,
      campaignsUsed: used,
      campaignsRemaining: remaining,
      percentageUsed: percentage,
    };
  }

  const availablePlans: MyPlanPlanOptionViewModel[] = (plansResult.data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    monthlyCampaignLimit: p.monthly_campaign_limit,
    monthlyInr: p.monthly_inr,
    businessLimit: p.business_limit,
    channels: Array.isArray(p.channels) ? p.channels : [],
    features: Array.isArray(p.features) ? p.features : [],
  }));

  const events: MyPlanUsageEventViewModel[] = (eventsResult.data || []).map((e: any) => ({
    id: e.id,
    eventType: e.event_type,
    units: e.units,
    description: e.description,
    createdAt: e.created_at,
  }));

  const isEntitled = !!usagePeriod;

  return {
    business: {
      id: business.id,
      name: business.name,
      category: business.category,
    },
    subscription,
    usagePeriod,
    events,
    availablePlans,
    isEntitled,
  };
}
