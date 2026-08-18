import type { EnrichedCampaignSpecification } from '../generation/generateCampaignSpec';

export interface BrainSpecValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

export function validateBrainSpecification(spec: EnrichedCampaignSpecification): BrainSpecValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { generationInput, engineContext } = spec;

  if (!generationInput.offer.title || generationInput.offer.title.trim().length === 0) {
    errors.push('Offer title is missing in campaign specification.');
  }

  if (!generationInput.type) {
    errors.push('Campaign type is unspecified.');
  }

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
