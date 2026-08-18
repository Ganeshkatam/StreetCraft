import { TodayBriefingSummary, TodayOpportunitySummary, TodayFestivalSummary } from './todayTypes';
import { FestivalMoment } from '../../server/opportunities/getFestivalMoments';

export function getGreetingForHour(hour: number = new Date().getHours()): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatCurrentDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelativeTimeLabel(eventDateStr: string, now: Date = new Date()): {
  relativeTimeLabel: string;
  isTodayOrActive: boolean;
  formattedDate: string;
} {
  const eventDate = new Date(eventDateStr);
  const diffDays = Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const formattedDate = eventDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  if (diffDays <= 0) {
    return { relativeTimeLabel: 'TODAY', isTodayOrActive: true, formattedDate };
  }
  if (diffDays === 1) {
    return { relativeTimeLabel: 'TOMORROW', isTodayOrActive: true, formattedDate };
  }
  return {
    relativeTimeLabel: `IN ${diffDays} DAYS`,
    isTodayOrActive: false,
    formattedDate,
  };
}

export function mapFestivalsToSummaries(
  festivals: FestivalMoment[],
  now: Date = new Date(),
  limit: number = 3
): TodayFestivalSummary[] {
  return festivals.slice(0, limit).map((f) => {
    const timing = formatRelativeTimeLabel(f.starts_at, now);
    return {
      id: f.id,
      name: f.name,
      relativeTimeLabel: timing.relativeTimeLabel,
      formattedDate: timing.formattedDate,
      isTodayOrActive: timing.isTodayOrActive,
      marketingRelevance: f.marketing_relevance,
      suggestedOffer: f.suggested_offer || undefined,
    };
  });
}
