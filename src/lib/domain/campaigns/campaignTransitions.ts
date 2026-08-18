import { CampaignStatus } from '../../../types/campaign';

/**
 * Shared Domain Transition Logic for Campaign Status.
 * 
 * This map represents the STRICT UX guidance for operators.
 * It intentionally omits historical legacy states (DRAFT, GENERATING, FAILED)
 * as destinations, meaning operators cannot manually transition into them,
 * nor can they "operate" on them (only internal legacy workflows handle them).
 */

const OPERATOR_TRANSITIONS: Record<string, CampaignStatus[]> = {
  ready: ['published', 'archived'],
  published: ['completed', 'archived'],
  completed: ['archived'],
  archived: [],
  // Legacy states do not expose manual operator transitions in the UI
  draft: [],
  generating: [],
  failed: [],
};

/**
 * Returns the legal statuses an operator can transition to from the current status.
 */
export function getOperatorTransitions(currentStatus: CampaignStatus): CampaignStatus[] {
  return OPERATOR_TRANSITIONS[currentStatus.toLowerCase()] || [];
}
