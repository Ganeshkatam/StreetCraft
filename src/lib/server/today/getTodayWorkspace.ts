import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { getBusinessProfile } from '../business/getBusinessProfile';
import { getCurrentUsagePeriod } from '../usage/getCurrentUsagePeriod';
import { getRecentCampaigns } from '../campaigns/getRecentCampaigns';
import { getFestivalMoments } from '../opportunities/getFestivalMoments';
import { TodayViewModel, TodayOpportunitySummary, TodayVaultSummary } from '../../domain/today/todayTypes';
import { getGreetingForHour, formatCurrentDate, mapFestivalsToSummaries } from '../../domain/today/todayBriefing';
import { resolveUpcomingFestivals } from '../../../engine/briefing/opportunityEngine';
import { buildBrainStoreContext, detectBrainOpportunities } from '../../../brain/index';

export async function getTodayWorkspace(businessId: string): Promise<TodayViewModel | null> {
  const claims = await requireAuthenticatedClaims(`/user/business/${businessId}/today`);

  const business = await resolveAuthorizedBusiness(claims.userId, businessId);
  if (!business) {
    return null;
  }

  // Parallelize reads for the authorized store
  const [profile, usagePeriod, campaigns, festivals] = await Promise.all([
    getBusinessProfile(business.id),
    getCurrentUsagePeriod(business.id),
    getRecentCampaigns(business.id),
    getFestivalMoments(),
  ]);

  const upcomingFestivals = resolveUpcomingFestivals(festivals, new Date(), 5);

  const packLimit = usagePeriod?.campaign_limit ?? 3;
  const packsUsed = usagePeriod?.campaigns_used ?? 0;
  const planTier = (usagePeriod?.plan || 'FREE').toUpperCase();

  const brainQuota = {
    planTier,
    packLimit,
    packsUsed,
    packsRemaining: Math.max(0, packLimit - packsUsed),
  };

  const brainContext = buildBrainStoreContext(
    profile as any,
    campaigns as any,
    upcomingFestivals,
    brainQuota,
    new Date()
  );

  const brainOpportunities = detectBrainOpportunities(brainContext);

  const opportunities: TodayOpportunitySummary[] = brainOpportunities.map((opp) => ({
    id: opp.id,
    tag: opp.badge,
    title: opp.title,
    description: `${opp.summary} ${opp.reasoning}`,
    actionLabel:
      opp.type === 'FESTIVAL'
        ? 'Create festive campaign'
        : opp.type === 'SLOW_HOUR'
        ? 'Create weekday offer'
        : opp.type === 'WEEKEND'
        ? 'Create weekend campaign'
        : opp.type === 'WIN_BACK'
        ? 'Broadcast VIP offer'
        : 'Spotlight signature menu',
    confidence: opp.confidence,
    score: opp.score,
    channelFocus: opp.channelFocus,
    preset: {
      type: opp.preset.type,
      objective: opp.preset.objective,
      offerTitle: opp.preset.offer?.title || '',
      offerDescription: opp.preset.offer?.description || '',
      timingLabel: opp.preset.schedule?.timingLabel || opp.targetWindow || 'Active this week',
      customNotes: opp.preset.customNotes,
    },
  }));

  const recentVault: TodayVaultSummary[] = campaigns.slice(0, 4).map((c) => {
    const rawOffer = (c.offer || {}) as Record<string, unknown>;
    const rawSchedule = (c.schedule || {}) as Record<string, unknown>;
    return {
      id: c.id,
      type: c.type,
      status: c.status as any,
      offerTitle: (rawOffer.title || rawOffer.description || 'Special Campaign') as string,
      timingLabel: (rawSchedule.timingLabel || 'Active') as string,
    };
  });

  const quota = usagePeriod
    ? {
        businessId: business.id,
        planName: usagePeriod.plan,
        campaignsUsed: usagePeriod.campaigns_used,
        campaignLimit: usagePeriod.campaign_limit,
        campaignsRemaining: Math.max(0, usagePeriod.campaign_limit - usagePeriod.campaigns_used),
        percentUsed: Math.min(
          100,
          Math.round((usagePeriod.campaigns_used / (usagePeriod.campaign_limit || 1)) * 100)
        ),
        canGenerate: usagePeriod.campaign_limit > usagePeriod.campaigns_used,
      }
    : null;

  const subtitle =
    opportunities.length > 0
      ? `${opportunities.length} ${opportunities.length === 1 ? 'opportunity' : 'opportunities'} identified by Storefront Intelligence.`
      : 'All current store periods are covered by active campaigns.';

  return {
    storefront: {
      id: business.id,
      name: business.name,
      category: business.category,
      neighborhood: profile?.neighborhood,
      city: profile?.city,
      signatureItems: profile?.signature_items || 'Signature items not specified',
    },
    briefing: {
      greeting: getGreetingForHour(),
      dateString: formatCurrentDate(),
      subtitle,
    },
    opportunities,
    recentVault,
    quota,
    festivals: mapFestivalsToSummaries(festivals),
  };
}
