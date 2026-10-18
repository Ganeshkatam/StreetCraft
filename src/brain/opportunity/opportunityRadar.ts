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

interface CategoryVocab {
  storeContextLabel: string;
  slowHourSummary: string;
  slowHourNotes: string;
  weekendSummary: string;
  signatureSummary: string;
  counterLabel: string;
  posterCta: string;
  whatsappCta: string;
}

function resolveCategoryVocab(category: string): CategoryVocab {
  const cat = (category || '').toUpperCase();
  if (cat.includes('BAKERY') || cat.includes('CAFE') || cat.includes('RESTAURANT') || cat.includes('FOOD') || cat.includes('SWEET')) {
    return {
      storeContextLabel: 'kitchen and counter',
      slowHourSummary: 'Fill quiet afternoon tables and move fresh batches before evening closing.',
      slowHourNotes: 'Target quiet afternoon lull with high-margin pairings and fresh batches.',
      weekendSummary: 'Capture weekend brunch crowds and neighborhood diners with signature specials.',
      signatureSummary: "Reinforce your store's culinary craft to convert first-time walk-ins.",
      counterLabel: 'counter',
      posterCta: 'Ask our counter team to redeem.',
      whatsappCta: 'Show message at counter to redeem',
    };
  }
  if (cat.includes('SALON') || cat.includes('SPA') || cat.includes('BEAUTY') || cat.includes('BARBER')) {
    return {
      storeContextLabel: 'styling chairs and studio',
      slowHourSummary: 'Fill open appointment slots and styling chairs before the evening rush.',
      slowHourNotes: 'Target off-peak appointment windows with express styling packages.',
      weekendSummary: 'Attract weekend self-care and makeover appointments with signature styling packages.',
      signatureSummary: "Spotlight your studio's premier treatments and signature styling services.",
      counterLabel: 'reception desk',
      posterCta: 'Mention this offer at reception when checking in.',
      whatsappCta: 'Reply to reserve your slot or show at reception',
    };
  }
  if (cat.includes('BOUTIQUE') || cat.includes('RETAIL') || cat.includes('FASHION') || cat.includes('APPAREL') || cat.includes('CLOTH')) {
    return {
      storeContextLabel: 'storefront and collections',
      slowHourSummary: 'Drive mid-day browsing and footfall before the evening shopping rush.',
      slowHourNotes: 'Stimulate afternoon footfall with limited-time collection pairings.',
      weekendSummary: 'Capture weekend high-street shoppers and casual browsers with curated showcases.',
      signatureSummary: "Highlight your boutique's exclusive pieces and premium craftsmanship.",
      counterLabel: 'checkout register',
      posterCta: 'Show this card at checkout to redeem.',
      whatsappCta: 'Show message at checkout to redeem',
    };
  }
  if (cat.includes('FITNESS') || cat.includes('GYM') || cat.includes('YOGA')) {
    return {
      storeContextLabel: 'workout floor and studio',
      slowHourSummary: 'Fill off-peak workout slots and private training sessions.',
      slowHourNotes: 'Fill mid-day open floor slots with focused training perks.',
      weekendSummary: 'Energize weekend wellness seekers with premium trial sessions.',
      signatureSummary: "Showcase your studio's premier training programs and classes.",
      counterLabel: 'front desk',
      posterCta: 'Show this pass at the front desk.',
      whatsappCta: 'Reply or show at front desk to redeem',
    };
  }
  return {
    storeContextLabel: 'storefront',
    slowHourSummary: 'Engage neighborhood clients and drive footfall during quiet mid-day hours.',
    slowHourNotes: 'Target mid-day quiet hours with high-margin service pairings.',
    weekendSummary: 'Capture weekend neighborhood shoppers with high-margin signature highlights.',
    signatureSummary: "Reinforce your store's specialty and craftsmanship to convert first-time walk-ins.",
    counterLabel: 'store team',
    posterCta: 'Ask our store team to redeem.',
    whatsappCta: 'Show message at store to redeem',
  };
}

export function detectBrainOpportunities(context: BrainStoreContext): BrainOpportunity[] {
  const opportunities: BrainOpportunity[] = [];
  const heroItem = context.signatureItems.length > 0 ? context.signatureItems[0] : 'Featured Item';
  const bizName = context.name;
  const vocab = resolveCategoryVocab(context.category);

  // Grounding state flags
  const hasConfiguredSlowHours = Boolean(context.slowHours && context.slowHours.trim().length > 0);
  const slowWindow = hasConfiguredSlowHours ? context.slowHours!.trim() : '3:00 PM – 5:30 PM';
  const slowWindowGrounding = hasConfiguredSlowHours ? 'Store-configured fact' : 'Estimated neighborhood default';

  const hasConfiguredAudience = Boolean(context.targetCustomer && context.targetCustomer.trim().length > 0);
  const targetAudience = hasConfiguredAudience ? context.targetCustomer!.trim() : 'Local neighborhood customers and shoppers';
  const audienceGrounding = hasConfiguredAudience ? 'Store-configured fact' : 'Estimated neighborhood default';

  const hasConfiguredSignature = context.signatureItems.length > 0;
  const signatureGrounding = hasConfiguredSignature ? 'Store-configured fact' : 'Estimated default assumption';

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
        summary: `Prepare your ${vocab.storeContextLabel} for ${nextFestival.name} with festive specials and pre-orders.`,
        reasoning: festivalScore.reasons.join('. ') + '.',
        confidence: festivalScore.confidence,
        score: festivalScore.score,
        preset: {
          type: 'FESTIVAL_SPECIAL',
          objective: 'FESTIVAL_RUSH',
          offer: {
            title: nextFestival.suggested_offer || `${nextFestival.name} Celebration Special`,
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
          poster: `A4 festival chalkboard & ${vocab.counterLabel} signage`,
        },
      });
    }
  }

  // 2. Slow Hour Boost (Mid-day / Afternoon lull)
  const slowScore = calculateOpportunityScore(context, 'SLOW_HOUR');
  opportunities.push({
    id: 'slow-hour-boost',
    type: 'SLOW_HOUR',
    badge: 'SLOW HOUR BOOST',
    title: `Afternoon Slowdown Reset (${slowWindow})`,
    targetWindow: slowWindow,
    summary: `${vocab.slowHourSummary} [${slowWindowGrounding}: ${slowWindow}]`,
    reasoning: [
      `${slowWindowGrounding}: promotional window set to ${slowWindow}`,
      ...slowScore.reasons,
    ].join('. ') + '.',
    confidence: slowScore.confidence,
    score: slowScore.score,
    preset: {
      type: 'WEEKDAY_BOOST',
      objective: 'MORE_WALK_INS',
      offer: {
        title: `Afternoon Pairing: ${heroItem}`,
        description: `Special afternoon promotion featuring ${heroItem} at ${bizName}.`,
        value: `Afternoon Special on ${heroItem}`,
        terms: `Valid weekdays ${slowWindow} only. Dine-in and walk-in orders.`,
      },
      schedule: {
        timingLabel: slowWindow,
      },
      customNotes: vocab.slowHourNotes,
    },
    channelFocus: {
      google: 'Local map update for nearby remote workers & office staff',
      instagram: '3-second sensory Reel hook & afternoon story reminder',
      whatsapp: `Flash drop message with direct ${vocab.counterLabel} redemption code`,
      poster: `A5 tent card at ${vocab.counterLabel} to drive immediate upgrades`,
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
    summary: `${vocab.weekendSummary} [${audienceGrounding}: ${targetAudience}]`,
    reasoning: [
      `${audienceGrounding}: targeting ${targetAudience}`,
      ...weekendScore.reasons,
    ].join('. ') + '.',
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
      poster: `Sidewalk display & high-contrast ${vocab.counterLabel} sign`,
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
    summary: `${vocab.signatureSummary} [${signatureGrounding}: ${heroItem}]`,
    reasoning: [
      `${signatureGrounding}: anchored on ${heroItem}`,
      ...sigScore.reasons,
    ].join('. ') + '.',
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
      reasoning: [
        'Customer retention cycle window active',
        ...winBackScore.reasons,
      ].join('. ') + '.',
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
        poster: `VIP member greeting sign at ${vocab.counterLabel}`,
      },
    });
  }

  // Sort descending by calculated score
  return opportunities.sort((a, b) => b.score - a.score);
}
