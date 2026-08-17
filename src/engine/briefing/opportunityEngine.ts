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
  const nowMs = now.getTime();

  // Rule 1: Check for upcoming Festivals from database
  const upcomingFestival = festivals.find((f) => {
    const festStart = new Date(f.starts_at).getTime();
    const diffDays = (festStart - nowMs) / (1000 * 60 * 60 * 24);
    return diffDays >= -1 && diffDays <= 14;
  });

  if (upcomingFestival) {
    const hasFestivalCampaign = activeCampaigns.some((c) => c.type === 'FESTIVAL_SPECIAL');
    if (!hasFestivalCampaign) {
      const festDate = new Date(upcomingFestival.starts_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      opportunities.push({
        id: `opp_fest_${upcomingFestival.id}`,
        tag: 'CALENDAR',
        title: `${upcomingFestival.name} approaching (${festDate})`,
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
            timingLabel: `${upcomingFestival.name} (${upcomingFestival.starts_at} to ${upcomingFestival.ends_at})`,
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
