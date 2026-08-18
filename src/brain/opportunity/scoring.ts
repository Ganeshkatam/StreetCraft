import type { BrainStoreContext } from '../context/storeContext';

export interface OpportunityScore {
  score: number; // 0 to 100
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reasons: string[];
}

export function calculateOpportunityScore(
  context: BrainStoreContext,
  opportunityType: 'SLOW_HOUR' | 'WEEKEND' | 'FESTIVAL' | 'SIGNATURE' | 'WIN_BACK',
  extraContext?: { festivalDaysRemaining?: number }
): OpportunityScore {
  let score = 40; // baseline
  const reasons: string[] = [];

  const hasSignatureItems = context.signatureItems.length > 0;
  const hasNeighborhood = Boolean(context.neighborhood && context.neighborhood.trim().length > 0);
  const lastCampaignDaysAgo = context.recentCampaigns.length > 0 ? context.recentCampaigns[0].daysAgo : 999;

  if (hasSignatureItems) {
    score += 15;
    reasons.push(`Signature item anchor available (${context.signatureItems[0]})`);
  }

  if (hasNeighborhood) {
    score += 10;
    reasons.push(`Local neighborhood context mapped (${context.neighborhood})`);
  }

  if (lastCampaignDaysAgo >= 5) {
    score += 15;
    reasons.push(`No marketing campaign run in ${lastCampaignDaysAgo === 999 ? 'recent history' : `${lastCampaignDaysAgo} days`}`);
  }

  switch (opportunityType) {
    case 'SLOW_HOUR':
      // High score on weekday afternoons (13:00 to 17:30)
      if (!context.isWeekend && context.currentHour >= 12 && context.currentHour <= 17) {
        score += 25;
        reasons.push('Current time aligns with mid-day/afternoon slow hours window');
      } else if (!context.isWeekend) {
        score += 10;
        reasons.push('Weekday schedule benefits from planned slow-hour filling');
      }
      break;

    case 'WEEKEND':
      // High score on Thursday/Friday/Saturday
      if (context.currentDayOfWeek === 4 || context.currentDayOfWeek === 5 || context.currentDayOfWeek === 6) {
        score += 25;
        reasons.push('Current day aligns with weekend shopping and dining planning');
      }
      break;

    case 'FESTIVAL':
      if (extraContext?.festivalDaysRemaining !== undefined) {
        const days = extraContext.festivalDaysRemaining;
        if (days <= 7) {
          score += 30;
          reasons.push(`High cultural urgency: festival occurs in ${days === 0 ? 'today' : `${days} days`}`);
        } else if (days <= 14) {
          score += 20;
          reasons.push(`Advance pre-booking window: festival occurs in ${days} days`);
        }
      }
      break;

    case 'SIGNATURE':
      if (hasSignatureItems) {
        score += 20;
        reasons.push('Strong product specialization ready for immediate showcase');
      }
      break;

    case 'WIN_BACK':
      if (lastCampaignDaysAgo >= 7) {
        score += 25;
        reasons.push('Regular customer lapsed engagement window (> 7 days without broadcast)');
      }
      break;
  }

  const boundedScore = Math.min(100, Math.max(20, score));
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (boundedScore >= 75) confidence = 'HIGH';
  else if (boundedScore >= 50) confidence = 'MEDIUM';

  return {
    score: boundedScore,
    confidence,
    reasons,
  };
}
