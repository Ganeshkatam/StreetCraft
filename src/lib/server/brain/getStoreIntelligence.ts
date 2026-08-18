import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { createClient } from '../../supabase/server';
import {
  buildBrainStoreContext,
  detectBrainOpportunities,
  formulateStrategicBlueprint,
  type BrainOpportunity,
  type StrategicBlueprint,
  type BrainStoreContext,
} from '../../../brain/index';
import { resolveUpcomingFestivals } from '../../../engine/briefing/opportunityEngine';
import type { BusinessProfile } from '../../../types/business';
import type { Campaign } from '../../../types/campaign';

export interface StoreIntelligenceReport {
  context: BrainStoreContext;
  opportunities: BrainOpportunity[];
  topStrategies: StrategicBlueprint[];
  generatedAt: string;
}

export async function getStoreIntelligence(candidateBizId: string): Promise<StoreIntelligenceReport | null> {
  const claims = await requireAuthenticatedClaims(`/user/today?biz=${candidateBizId}`);
  const supabase = await createClient();

  const business = await resolveAuthorizedBusiness(claims.userId, candidateBizId);
  if (!business) {
    return null;
  }

  // Parallel database reads
  const [profileResult, campaignsResult, festivalsResult, usageResult, subResult] = await Promise.all([
    supabase.from('business_profiles').select('*').eq('business_id', business.id).maybeSingle(),
    supabase.from('campaigns').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('festival_calendar').select('*').order('starts_at', { ascending: true }),
    supabase.from('usage_periods').select('*').eq('business_id', business.id).gte('period_end', new Date().toISOString().split('T')[0]).order('period_end', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('subscriptions').select('id, plan_id, status').eq('user_id', claims.userId).in('status', ['ACTIVE', 'TRIALING']).maybeSingle(),
  ]);

  const profile = profileResult.data as Partial<BusinessProfile> | null;
  const recentCampaigns = (campaignsResult.data || []) as unknown as Campaign[];
  const festivals = festivalsResult.data || [];
  const upcomingFestivals = resolveUpcomingFestivals(festivals, new Date(), 5);

  const usagePeriod = usageResult.data;
  const packLimit = usagePeriod?.pack_limit ?? 3;
  const packsUsed = usagePeriod?.packs_used ?? 0;
  const planTier = (usagePeriod?.plan || subResult.data?.plan_id || 'FREE').toUpperCase();

  const quota = {
    planTier,
    packLimit,
    packsUsed,
    packsRemaining: Math.max(0, packLimit - packsUsed),
  };

  const context = buildBrainStoreContext(profile, recentCampaigns, upcomingFestivals, quota, new Date());
  const opportunities = detectBrainOpportunities(context);
  const topStrategies = opportunities.slice(0, 3).map((opp) => formulateStrategicBlueprint(opp, context));

  return {
    context,
    opportunities,
    topStrategies,
    generatedAt: new Date().toISOString(),
  };
}
