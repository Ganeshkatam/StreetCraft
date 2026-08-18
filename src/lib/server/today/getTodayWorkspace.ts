import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { getBusinessProfile } from '../business/getBusinessProfile';
import { getCurrentUsagePeriod } from '../usage/getCurrentUsagePeriod';
import { getRecentCampaigns } from '../campaigns/getRecentCampaigns';
import { getFestivalMoments } from '../opportunities/getFestivalMoments';
import { TodayViewModel, TodayOpportunitySummary, TodayVaultSummary } from '../../domain/today/todayTypes';
import { getGreetingForHour, formatCurrentDate, mapFestivalsToSummaries } from '../../domain/today/todayBriefing';
import { generateDynamicBriefing } from '../../../engine/briefing/opportunityEngine';

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

  const mappedProfile = profile
    ? {
        name: profile.name,
        neighborhood: profile.neighborhood,
        city: profile.city,
        signatureItems: profile.signature_items,
      }
    : null;

  const dynamicBriefing = generateDynamicBriefing(
    mappedProfile as any,
    campaigns as any,
    festivals as any
  );

  const opportunities: TodayOpportunitySummary[] = dynamicBriefing.opportunities.map((opp) => ({
    id: opp.id,
    tag: opp.tag,
    title: opp.title,
    description: opp.description,
    actionLabel: opp.actionLabel,
    preset: {
      type: opp.preset.type,
      objective: opp.preset.objective,
      offerTitle: opp.preset.offer?.title || '',
      offerDescription: opp.preset.offer?.description || '',
      timingLabel: opp.preset.schedule?.timingLabel || 'Active this week',
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
      subtitle: dynamicBriefing.subtitle || 'Your daily campaign radar and store performance overview.',
    },
    opportunities,
    recentVault,
    quota,
    festivals: mapFestivalsToSummaries(festivals),
  };
}
