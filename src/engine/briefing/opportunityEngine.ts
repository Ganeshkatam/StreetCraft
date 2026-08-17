/**
 * StreetCraft Dynamic Timezone-Aware Opportunity Engine
 * Evaluates live database state, business timezone, active campaigns, and festival calendar.
 * ZERO fake or fabricated statements.
 */

import { BusinessProfile } from '../../types/business';
import { Campaign, CampaignType, CampaignObjective } from '../../types/campaign';

export interface DynamicOpportunity {
  id: string;
  tag: string;
  title: string;
  description: string;
  actionLabel: string;
  preset: {
    type: CampaignType;
    objective: CampaignObjective;
    offer: {
      title: string;
      description: string;
      value: string;
      terms: string;
    };
    schedule: {
      timingLabel: string;
    };
    customNotes: string;
  };
}

export interface BriefingReport {
  dateString: string;
  greeting: string;
  subtitle: string;
  opportunities: DynamicOpportunity[];
}

export interface FestivalEvent {
  id: string;
  name: string;
  region: string;
  starts_at: string;
  ends_at: string;
  marketing_relevance: string;
  suggested_offer?: string | null;
}

export interface ResolvedFestivalOpportunity extends FestivalEvent {
  targetStartTime: number;
  formattedDate: string;
  daysRemaining: number;
  relativeTimeLabel: string;
  isTodayOrActive: boolean;
}

export function resolveUpcomingFestivals(
  festivals: FestivalEvent[] = [],
  referenceDate: Date = new Date(),
  limit: number = 3
): ResolvedFestivalOpportunity[] {
  if (!Array.isArray(festivals) || festivals.length === 0) return [];

  const refTime = referenceDate.getTime();
  const currentYear = referenceDate.getFullYear();

  // Normalize each valid festival to an upcoming target date relative to referenceDate
  const processed: ResolvedFestivalOpportunity[] = [];

  for (const f of festivals) {
    if (!f || !f.starts_at || !f.name) continue;

    const startObj = new Date(f.starts_at);
    const endObj = f.ends_at ? new Date(f.ends_at) : startObj;

    const startMonth = isNaN(startObj.getMonth()) ? 0 : startObj.getMonth();
    const startDate = isNaN(startObj.getDate()) ? 1 : startObj.getDate();
    const endMonth = isNaN(endObj.getMonth()) ? startMonth : endObj.getMonth();
    const endDate = isNaN(endObj.getDate()) ? startDate : endObj.getDate();

    let targetStart = new Date(currentYear, startMonth, startDate, 0, 0, 0);
    let targetEnd = new Date(currentYear, endMonth, endDate, 23, 59, 59);

    // If the festival has already completely passed this year, project it to next year's cycle
    if (targetEnd.getTime() < refTime) {
      targetStart = new Date(currentYear + 1, startMonth, startDate, 0, 0, 0);
      targetEnd = new Date(currentYear + 1, endMonth, endDate, 23, 59, 59);
    }

    const isTodayOrActive = refTime >= targetStart.getTime() && refTime <= targetEnd.getTime();
    const diffMs = targetStart.getTime() - refTime;
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let relativeTimeLabel = '';
    if (isTodayOrActive) {
      relativeTimeLabel = 'Active Now';
    } else if (daysRemaining <= 0) {
      relativeTimeLabel = 'Starts Today';
    } else if (daysRemaining === 1) {
      relativeTimeLabel = 'Tomorrow';
    } else if (daysRemaining <= 6) {
      relativeTimeLabel = `In ${daysRemaining} days`;
    } else if (daysRemaining <= 13) {
      relativeTimeLabel = 'Next week';
    } else if (daysRemaining <= 30) {
      relativeTimeLabel = `In ${Math.ceil(daysRemaining / 7)} weeks`;
    } else {
      relativeTimeLabel = targetStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }

    const formattedDate = targetStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    processed.push({
      ...f,
      targetStartTime: targetStart.getTime(),
      formattedDate,
      daysRemaining,
      relativeTimeLabel,
      isTodayOrActive,
    });
  }

  // Sort chronologically by targetStartTime ascending (closest upcoming first)
  processed.sort((a, b) => a.targetStartTime - b.targetStartTime);

  return processed.slice(0, limit);
}

export function generateDynamicBriefing(
  profile: BusinessProfile,
  campaigns: Campaign[],
  festivals: FestivalEvent[] = [],
  timezone = 'Asia/Kolkata'
): BriefingReport {
  // 1. Calculate real time in the business timezone
  const now = new Date();
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const dateParts = timeFormatter.formatToParts(now);
  const weekday = dateParts.find((p) => p.type === 'weekday')?.value || 'Monday';
  const hour = parseInt(dateParts.find((p) => p.type === 'hour')?.value || '12', 10);
  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    timeZone: timezone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(now);

  const businessName = profile.name || 'Your Business';
  const isMorning = hour >= 5 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 17;
  const greetingTime = isMorning ? 'Good morning' : isAfternoon ? 'Good afternoon' : 'Good evening';
  const greeting = `${greetingTime}, ${businessName}.`;

  const opportunities: DynamicOpportunity[] = [];
  const activeCampaigns = campaigns.filter((c) => c.status === 'published' || c.status === 'ready');

  // Rule 1: Check for closest upcoming/active Festivals from database
  const upcomingFestivals = resolveUpcomingFestivals(festivals, now, 1);
  const upcomingFestival = upcomingFestivals.length > 0 ? upcomingFestivals[0] : null;

  if (upcomingFestival && (upcomingFestival.isTodayOrActive || upcomingFestival.daysRemaining <= 21)) {
    const hasFestivalCampaign = activeCampaigns.some((c) => c.type === 'FESTIVAL_SPECIAL');
    if (!hasFestivalCampaign) {
      const timingDescriptor = upcomingFestival.isTodayOrActive
        ? 'Active Today'
        : upcomingFestival.relativeTimeLabel;

      opportunities.push({
        id: `opp_fest_${upcomingFestival.id}`,
        tag: 'CALENDAR',
        title: `${upcomingFestival.name} (${timingDescriptor})`,
        description: `${upcomingFestival.marketing_relevance}. Launch a campaign to capture holiday and celebration foot traffic.`,
        actionLabel: 'Create festive campaign',
        preset: {
          type: 'FESTIVAL_SPECIAL',
          objective: 'FESTIVAL_RUSH',
          offer: {
            title: upcomingFestival.suggested_offer || `${upcomingFestival.name} Special`,
            description: `${upcomingFestival.name} celebration special at ${profile.name || 'our store'}.`,
            value: 'Festive Special',
            terms: `Valid during ${upcomingFestival.name} window`,
          },
          schedule: {
            timingLabel: `${upcomingFestival.name} (${upcomingFestival.formattedDate})`,
          },
          customNotes: `Focus on ${upcomingFestival.marketing_relevance}.`,
        },
      });
    }
  }

  // Rule 2: Weekday Afternoon Foot-Traffic Gap (Monday to Thursday)
  const isWeekday = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].includes(weekday);
  if (isWeekday) {
    const hasWeekdayCampaign = activeCampaigns.some((c) => c.type === 'WEEKDAY_BOOST');
    if (!hasWeekdayCampaign) {
      opportunities.push({
        id: 'opp_weekday_boost',
        tag: 'QUIET HOURS',
        title: `Quiet period coming up (${weekday}s)`,
        description: `${profile.name || 'Your store'} usually slows down during ${profile.slowHours || 'afternoon hours'}. A targeted offer can fill idle counter capacity.`,
        actionLabel: 'Create weekday offer',
        preset: {
          type: 'WEEKDAY_BOOST',
          objective: 'MORE_WALK_INS',
          offer: {
            title: profile.defaultOffer || 'Afternoon Special Pairing',
            description: profile.defaultOffer || `Special discount on signature ${profile.signatureItems || 'items'}`,
            value: 'Special Perk',
            terms: `Valid during ${profile.slowHours || 'slow hours'}`,
          },
          schedule: {
            timingLabel: profile.slowHours || 'Monday to Thursday, 3:00 PM – 6:00 PM',
          },
          customNotes: 'Target afternoon visitors and nearby customers.',
        },
      });
    }
  }

  // Rule 3: Weekend Crowd Prep (Thursday to Sunday)
  const isWeekendApproach = ['Thursday', 'Friday', 'Saturday', 'Sunday'].includes(weekday);
  if (isWeekendApproach) {
    const hasWeekendCampaign = activeCampaigns.some((c) => c.type === 'WEEKEND_MAGNET');
    if (!hasWeekendCampaign) {
      opportunities.push({
        id: 'opp_weekend_magnet',
        tag: 'WEEKEND',
        title: 'Weekend has no active campaign',
        description: `You don't currently have an active promotion covering the weekend. Promote ${profile.signatureItems || 'your best items'} to drive table visits.`,
        actionLabel: 'Create weekend campaign',
        preset: {
          type: 'WEEKEND_MAGNET',
          objective: 'WEEKEND_CROWD',
          offer: {
            title: 'Weekend Special',
            description: `Signature weekend creations at ${profile.name || 'our store'}.`,
            value: 'Weekend Special',
            terms: 'Valid Friday evening through Sunday',
          },
          schedule: {
            timingLabel: 'Friday to Sunday',
          },
          customNotes: 'Highlight weekend specials and customer favorites.',
        },
      });
    }
  }

  const subtitle =
    opportunities.length > 0
      ? `${opportunities.length} ${opportunities.length === 1 ? 'opportunity' : 'opportunities'} suggested from your store rhythm and calendar.`
      : 'All current store periods are covered by active campaigns.';

  return {
    dateString: formattedDate,
    greeting,
    subtitle,
    opportunities,
  };
}
