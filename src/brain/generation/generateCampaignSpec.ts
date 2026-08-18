import type { StrategicBlueprint } from '../strategy/campaignStrategy';
import type { BrainStoreContext } from '../context/storeContext';
import type { CampaignGenerationInput } from '../../types/campaign';

export interface EnrichedCampaignSpecification {
  blueprint: StrategicBlueprint;
  generationInput: CampaignGenerationInput;
  engineContext: {
    bizName: string;
    neighborhood: string;
    city: string;
    landmarks: string;
    signatureItems: string;
    category: string;
  };
}

export function synthesizeCampaignSpec(
  blueprint: StrategicBlueprint,
  context: BrainStoreContext,
  customOverrides?: Partial<CampaignGenerationInput>
): EnrichedCampaignSpecification {
  const heroItem = context.signatureItems.length > 0 ? context.signatureItems[0] : 'Featured Item';
  const customNotes = customOverrides?.customNotes || `${blueprint.reasoningSummary} Tone: ${blueprint.toneAndVoice}`;

  const generationInput: CampaignGenerationInput = {
    type: blueprint.type,
    objective: blueprint.objective,
    audience: customOverrides?.audience || blueprint.targetAudience,
    offer: {
      title: customOverrides?.offer?.title || blueprint.anchorConcept,
      description: customOverrides?.offer?.description || blueprint.valueProposition,
      value: customOverrides?.offer?.value || `${blueprint.anchorConcept} — ${heroItem}`,
      terms: customOverrides?.offer?.terms || 'Valid during specified promotional hours.',
    },
    schedule: {
      startsAt: customOverrides?.schedule?.startsAt || new Date().toISOString(),
      endsAt: customOverrides?.schedule?.endsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      timingLabel: customOverrides?.schedule?.timingLabel || blueprint.timingWindow,
    },
    customNotes,
  };

  return {
    blueprint,
    generationInput,
    engineContext: {
      bizName: context.name,
      neighborhood: context.neighborhood,
      city: context.city,
      landmarks: context.landmarks || '',
      signatureItems: context.signatureItems.join(', '),
      category: context.category,
    },
  };
}
