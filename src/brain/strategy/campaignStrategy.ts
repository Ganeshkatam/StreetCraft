import type { BrainStoreContext } from '../context/storeContext';
import type { BrainOpportunity } from '../opportunity/opportunityRadar';
import { resolveChannelAngles, type TouchpointStrategyPlan } from './channelAngles';
import type { CampaignType, CampaignObjective } from '../../types/campaign';

export interface StrategicBlueprint {
  opportunityId: string;
  type: CampaignType;
  objective: CampaignObjective;
  anchorConcept: string;
  targetAudience: string;
  valueProposition: string;
  toneAndVoice: string;
  timingWindow: string;
  reasoningSummary: string;
  channels: TouchpointStrategyPlan;
}

export function formulateStrategicBlueprint(
  opportunity: BrainOpportunity,
  context: BrainStoreContext
): StrategicBlueprint {
  const channelStrategy = resolveChannelAngles(opportunity.preset.type);
  const heroItem = context.signatureItems.length > 0 ? context.signatureItems[0] : 'Featured Item';
  const voice = context.styleVoice || 'Warm, authentic neighborhood tone honoring local craft';
  const targetAudience = context.targetCustomer || 'Local neighborhood residents, commuters, and regulars';

  return {
    opportunityId: opportunity.id,
    type: opportunity.preset.type,
    objective: opportunity.preset.objective,
    anchorConcept: opportunity.preset.offer.title,
    targetAudience,
    valueProposition: opportunity.preset.offer.description || `Special promotion featuring ${heroItem}`,
    toneAndVoice: voice,
    timingWindow: opportunity.preset.schedule.timingLabel,
    reasoningSummary: opportunity.reasoning,
    channels: channelStrategy,
  };
}
