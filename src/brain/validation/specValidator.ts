import type { EnrichedCampaignSpecification } from '../generation/generateCampaignSpec';

export interface BrainSpecValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

const DECEPTIVE_CLAIM_PATTERNS = [
  /\bguaranteed\s+100%\s+cure\b/i,
  /\bmiracle\s+cure\b/i,
  /\brisk-free\s+profit\b/i,
  /\bfree\s+money\b/i,
];

export function validateBrainSpecification(spec: EnrichedCampaignSpecification): BrainSpecValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { generationInput, engineContext, blueprint } = spec;

  // 1. Offer Quality & Character Bounds
  if (!generationInput.offer.title || generationInput.offer.title.trim().length === 0) {
    errors.push('Offer title is missing in campaign specification.');
  } else if (generationInput.offer.title.trim().length < 3) {
    errors.push('Offer title must be at least 3 characters.');
  } else if (generationInput.offer.title.trim().length > 100) {
    errors.push('Offer title exceeds maximum limit of 100 characters.');
  }

  if (generationInput.offer.description && generationInput.offer.description.trim().length > 500) {
    errors.push('Offer description exceeds maximum limit of 500 characters.');
  }

  // Deceptive claim guard
  const fullOfferText = `${generationInput.offer.title} ${generationInput.offer.description || ''}`;
  for (const pattern of DECEPTIVE_CLAIM_PATTERNS) {
    if (pattern.test(fullOfferText)) {
      errors.push('Offer contains unsubstantiated or deceptive claims prohibited by marketing policies.');
      break;
    }
  }

  // 2. Campaign Classification
  if (!generationInput.type) {
    errors.push('Campaign type is unspecified.');
  }
  if (!generationInput.objective) {
    errors.push('Campaign objective is unspecified.');
  }

  // 3. Schedule Chronological Bounds
  if (!generationInput.schedule.timingLabel || generationInput.schedule.timingLabel.trim().length === 0) {
    errors.push('Campaign schedule timing label is required.');
  }

  if (generationInput.schedule.startsAt && generationInput.schedule.endsAt) {
    const startMs = Date.parse(generationInput.schedule.startsAt);
    const endMs = Date.parse(generationInput.schedule.endsAt);
    if (!isNaN(startMs) && !isNaN(endMs) && endMs < startMs) {
      errors.push('Campaign end date cannot precede start date.');
    }
  }

  // 4. Strategic Blueprint & 4-Channel Completeness
  if (!blueprint) {
    errors.push('Strategic blueprint is missing from specification.');
  } else {
    const channels = blueprint.channels;
    if (!channels || !channels.google || !channels.instagram || !channels.whatsapp || !channels.poster) {
      errors.push('Strategic blueprint does not cover all 4 required marketing channels.');
    }
  }

  // 5. Store Context Guidance
  if (!engineContext.bizName || engineContext.bizName.trim().length === 0) {
    warnings.push('Store name is empty; using default placeholder.');
  }

  if (!engineContext.neighborhood || engineContext.neighborhood.trim().length === 0) {
    warnings.push('Neighborhood is not configured; local geo tags will fallback to city level.');
  }

  if (!engineContext.signatureItems || engineContext.signatureItems.trim().length === 0) {
    warnings.push('Signature items are not configured; campaign will use generic category messaging.');
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}
