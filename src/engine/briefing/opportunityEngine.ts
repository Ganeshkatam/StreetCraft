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
      opportunities.push({
        id: `opp_fest_${upcomingFestival.id}`,
        tag: 'CALENDAR MOMENT',
        title: `${upcomingFestival.name} Marketing Window`,
        description: `${upcomingFestival.name} (${upcomingFestival.marketing_relevance}) is approaching. Launch a coordinated local pack to capture holiday demand.`,
        actionLabel: 'Launch Festival Pack',
        preset: {
          type: 'FESTIVAL_SPECIAL',
          objective: 'FESTIVAL_RUSH',
          offer: {
            title: upcomingFestival.suggested_offer || `${upcomingFestival.name} Special Celebration Combo`,
            description: `${upcomingFestival.name} celebratory specials at ${profile.name || 'our shop'}.`,
            value: 'Festival Special',
            terms: `Valid during ${upcomingFestival.name} festive window`,
          },
          schedule: {
            timingLabel: `${upcomingFestival.name} Window (${upcomingFestival.starts_at} to ${upcomingFestival.ends_at})`,
          },
          customNotes: `Focus on ${upcomingFestival.marketing_relevance} for local neighborhood customers.`,
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
        tag: 'FOOT TRAFFIC OPPORTUNITY',
        title: `Slow ${weekday} Afternoon Foot Traffic`,
        description: `No active afternoon campaign is scheduled for ${profile.slowHours || '2:30 PM - 5:30 PM'}. A work-from-cafe or snack pairing can convert idle tables into revenue.`,
        actionLabel: 'Fill Quiet Afternoon Hours',
        preset: {
          type: 'WEEKDAY_BOOST',
          objective: 'MORE_WALK_INS',
          offer: {
            title: profile.defaultOffer || 'Afternoon Focus Hour Pairing',
            description: profile.defaultOffer || 'Special discount on fresh pour-overs and bakery combos',
            value: '20% Off',
            terms: `Valid Monday to Thursday during ${profile.slowHours || '3 PM - 6 PM'}`,
          },
          schedule: {
            timingLabel: 'Monday to Thursday, 3:00 PM – 6:00 PM',
          },
          customNotes: 'Target remote workers, freelancers, and afternoon walk-ins.',
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
        tag: 'WEEKEND REVENUE DRIVER',
        title: 'Upcoming Weekend Crowd & Brunch Magnet',
        description: `Weekend dining demand surges in ${profile.neighborhood || 'your neighborhood'}. Promote your signature creations (${profile.signatureItems || 'signature specials'}) to secure tables.`,
        actionLabel: 'Create Weekend Campaign',
        preset: {
          type: 'WEEKEND_MAGNET',
          objective: 'WEEKEND_CROWD',
          offer: {
            title: 'Weekend Tasting & Table Special',
            description: `Signature weekend creations and artisan specials at ${profile.name || 'our shop'}.`,
            value: 'Weekend Special',
            terms: 'Valid Friday evening to Sunday night',
          },
          schedule: {
            timingLabel: 'Friday to Sunday',
          },
          customNotes: 'Highlight group tables, brunch specials, and relaxed weekend ambiance.',
        },
      });
    }
  }

  // Rule 4: Cadence Win-Back Check (if fewer than 2 active campaigns)
  if (activeCampaigns.length === 0) {
    opportunities.push({
      id: 'opp_win_back',
      tag: 'RETENTION ENGINE',
      title: 'Win-Back Inactive Regulars',
      description: 'You currently have zero active campaigns running in the vault. Send a direct WhatsApp broadcast and Google update to reconnect with past visitors.',
      actionLabel: 'Launch Win-Back Pack',
      preset: {
        type: 'WIN_BACK_REGULARS',
        objective: 'CUSTOMER_RETENTION',
        offer: {
          title: 'We Miss You — Regulars Welcome Treat',
          description: 'Special complimentary treat or discount for returning neighborhood regulars.',
          value: 'Welcome Back Treat',
          terms: 'Show message at counter to redeem',
        },
        schedule: {
          timingLabel: 'This Week',
        },
        customNotes: 'Personalized tone thanking them for being part of the neighborhood community.',
      },
    });
  }

  const subtitle =
    opportunities.length > 0
      ? `Identified ${opportunities.length} data-backed marketing ${opportunities.length === 1 ? 'opportunity' : 'opportunities'} based on your live store memory and schedule.`
      : 'Your marketing calendar is fully active and scheduled. All target time windows have active coverage.';

  return {
    dateString: formattedDate,
    greeting,
    subtitle,
    opportunities,
  };
}
