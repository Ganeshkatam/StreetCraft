import type { BrainStoreContext } from '../context/storeContext';
import { calculateOpportunityScore } from './scoring';
import type { CampaignType, CampaignObjective } from '../../types/campaign';

export interface BrainOpportunity {
  id: string;
  type: 'SLOW_HOUR' | 'WEEKEND' | 'FESTIVAL' | 'SIGNATURE' | 'WIN_BACK';
  badge: string;
  title: string;
  targetWindow: string;
  summary: string;
  reasoning: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
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
  channelFocus: {
    google: string;
    instagram: string;
    whatsapp: string;
    poster: string;
  };
}

export function detectBrainOpportunities(context: BrainStoreContext): BrainOpportunity[] {
  const opportunities: BrainOpportunity[] = [];
  const heroItem = context.signatureItems.length > 0 ? context.signatureItems[0] : 'Featured Item';
  const bizName = context.name;

  // 1. Festival Opportunity (if any festival within 21 days)
  if (context.upcomingFestivals.length > 0) {
    const nextFestival = context.upcomingFestivals[0];
    if (nextFestival.daysRemaining <= 21) {
      const festivalScore = calculateOpportunityScore(context, 'FESTIVAL', {
        festivalDaysRemaining: nextFestival.daysRemaining,
      });

      const festTitle = `${nextFestival.name} Celebration Special`;
      const festTiming = nextFestival.relativeTimeLabel || `This ${nextFestival.name}`;

      opportunities.push({
        id: `fest-${nextFestival.id}`,
        type: 'FESTIVAL',
        badge: nextFestival.isTodayOrActive ? 'FESTIVAL TODAY' : `IN ${nextFestival.daysRemaining} DAYS`,
        title: `${nextFestival.name} Celebration Menu`,
        targetWindow: nextFestival.formattedDate || festTiming,
        summary: `Prepare your storefront for ${nextFestival.name} with festive specials and pre-orders.`,
        reasoning: festivalScore.reasons.join('. ') + '.',
        confidence: festivalScore.confidence,
        score: festivalScore.score,
        preset: {
          type: 'FESTIVAL_SPECIAL',
          objective: 'FESTIVAL_RUSH',
          offer: {
            title: nextFestival.suggested_offer || `${nextFestival.name} Celebration Platter`,
            description: `Exclusive festive preparations for ${nextFestival.name} at ${bizName}.`,
            value: `Festive Special: ${heroItem}`,
            terms: 'Available during festival week while supplies last.',
          },
          schedule: {
            timingLabel: festTiming,
          },
          customNotes: `Festival relevance: ${nextFestival.marketing_relevance || 'Cultural gathering'}`,
        },
        channelFocus: {
          google: 'Event post targeting holiday searches & Google Maps directions',
          instagram: 'Festive visual styling & cultural story cues',
          whatsapp: 'VIP family pre-order & advance booking link',
          poster: 'A4 festival chalkboard & window display signage',
        },
      });
    }
  }

  // 2. Slow Hour Boost (Mid-day / Afternoon lull)
  const slowScore = calculateOpportunityScore(context, 'SLOW_HOUR');
  const slowWindow = context.slowHours || '3:00 PM – 5:30 PM';
  opportunities.push({
    id: 'slow-hour-boost',
    type: 'SLOW_HOUR',
    badge: 'SLOW HOUR BOOST',
    title: `Afternoon Slowdown Reset (${slowWindow})`,
    targetWindow: slowWindow,
    summary: `Fill quiet afternoon tables and move fresh batches before evening closing.`,
    reasoning: slowScore.reasons.join('. ') + '.',
    confidence: slowScore.confidence,
    score: slowScore.score,
    preset: {
      type: 'WEEKDAY_BOOST',
      objective: 'MORE_WALK_INS',
      offer: {
        title: `Afternoon Pairing: ${heroItem}`,
        description: `Special afternoon promotion featuring ${heroItem} at ${bizName}.`,
        value: `Afternoon Special on ${heroItem}`,
        terms: `Valid weekdays ${slowWindow} only. Dine-in and counter pickup.`,
      },
      schedule: {
        timingLabel: slowWindow,
      },
      customNotes: `Target quiet afternoon lull with high-margin pairing.`,
    },
    channelFocus: {
      google: 'Local map update for nearby remote workers & office staff',
      instagram: '3-second sensory Reel hook & afternoon story reminder',
      whatsapp: 'Flash drop message with direct counter redemption code',
      poster: 'A5 counter tent card to upsell single orders to combos',
    },
  });

  // 3. Weekend Footfall Magnet
  const weekendScore = calculateOpportunityScore(context, 'WEEKEND');
  opportunities.push({
    id: 'weekend-magnet',
    type: 'WEEKEND',
    badge: 'WEEKEND RUSH',
    title: 'Weekend High-Street Footfall Magnet',
    targetWindow: 'Saturday & Sunday All Day',
    summary: `Capture weekend neighborhood shoppers and brunch crowds with high-margin signature highlights.`,
    reasoning: weekendScore.reasons.join('. ') + '.',
    confidence: weekendScore.confidence,
    score: weekendScore.score,
    preset: {
      type: 'WEEKEND_MAGNET',
      objective: 'WEEKEND_CROWD',
      offer: {
        title: `Weekend Signature Showcase: ${heroItem}`,
        description: `Weekend special featuring our handcrafted ${heroItem} at ${bizName}.`,
        value: `Weekend Special: ${heroItem}`,
        terms: 'Valid Saturday and Sunday. First come, first served.',
      },
      schedule: {
        timingLabel: 'This Weekend (Sat & Sun)',
      },
      customNotes: 'Maximize average ticket size during peak weekend footfall.',
    },
    channelFocus: {
      google: 'Weekend special update with prominent directions button',
      instagram: 'High-energy weekend Reel hook & unboxing/prep visuals',
      whatsapp: 'Weekend VIP table & first-look reservation invite',
      poster: 'Sidewalk chalkboard & high-contrast register sign',
    },
  });

  // 4. Signature Item Spotlight
  const sigScore = calculateOpportunityScore(context, 'SIGNATURE');
  opportunities.push({
    id: 'signature-spotlight',
    type: 'SIGNATURE',
    badge: 'SIGNATURE DROP',
    title: `Spotlight: ${heroItem}`,
    targetWindow: 'Active All Week',
    summary: `Reinforce your store's core specialty and craftsmanship to convert first-time walk-ins.`,
    reasoning: sigScore.reasons.join('. ') + '.',
    confidence: sigScore.confidence,
    score: sigScore.score,
    preset: {
      type: 'MENU_LAUNCH',
      objective: 'PROMOTE_PRODUCT',
      offer: {
        title: `House Specialty: ${heroItem}`,
        description: `Handcrafted with care at ${bizName}. Experience our signature ${heroItem}.`,
        value: `Specialty Feature: ${heroItem}`,
        terms: 'Daily fresh availability.',
      },
      schedule: {
        timingLabel: 'Available Daily',
      },
      customNotes: 'Highlight store craftsmanship and premium ingredients.',
    },
    channelFocus: {
      google: 'Permanent product post with photos and flavor profile',
      instagram: 'Behind-the-scenes preparation & origin story',
      whatsapp: 'Curated recommendation for loyal regulars',
      poster: 'Table talker highlighting ingredient origins',
    },
  });

  // 5. VIP Win-Back & Customer Loyalty
  const winBackScore = calculateOpportunityScore(context, 'WIN_BACK');
  if (context.recentCampaigns.length === 0 || context.recentCampaigns[0].daysAgo >= 5) {
    opportunities.push({
      id: 'win-back-regulars',
      type: 'WIN_BACK',
      badge: 'VIP RETENTION',
      title: 'VIP Client Reactivation Broadcast',
      targetWindow: 'Next 48 Hours',
      summary: 'Reactivate repeat customers who have not visited recently with an exclusive loyalty gesture.',
      reasoning: winBackScore.reasons.join('. ') + '.',
      confidence: winBackScore.confidence,
      score: winBackScore.score,
      preset: {
        type: 'WIN_BACK_REGULARS',
        objective: 'CUSTOMER_RETENTION',
        offer: {
          title: `VIP Regulars Appreciation: ${heroItem}`,
          description: `A special thank you to our regular community from ${bizName}.`,
          value: `VIP Regulars Perk on ${heroItem}`,
          terms: 'Exclusive for registered VIP list. Show message to claim.',
        },
        schedule: {
          timingLabel: 'Valid for 7 Days',
        },
        customNotes: 'Friendly, personalized tone that honors customer loyalty.',
      },
      channelFocus: {
        google: 'Local community update thanking neighborhood regulars',
        instagram: 'Behind-the-counter appreciation story',
        whatsapp: 'Direct personalized VIP perk message',
        poster: 'VIP member greeting sign at front register',
      },
    });
  }

  // Sort descending by calculated score
  return opportunities.sort((a, b) => b.score - a.score);
}
