export type GenerationErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'UNAUTHORIZED_BUSINESS'
  | 'ENTITLEMENT_UNAVAILABLE'
  | 'QUOTA_EXHAUSTED'
  | 'GENERATION_FAILED'
  | 'INCOMPLETE_CAMPAIGN_PACK'
  | 'GENERATION_CONFLICT'
  | 'PERSISTENCE_FAILED'
  | 'UNEXPECTED_ERROR';

export const GENERATION_ERROR_MESSAGES: Record<GenerationErrorCode, string> = {
  VALIDATION_ERROR: 'Please review and correct the campaign inputs.',
  UNAUTHENTICATED: 'Your session has expired. Please sign in again.',
  UNAUTHORIZED_BUSINESS: 'You are not authorized to create campaigns for this storefront.',
  ENTITLEMENT_UNAVAILABLE: 'No active subscription or usage plan found for this month.',
  QUOTA_EXHAUSTED: 'Your monthly campaign limit has been reached. Please upgrade to generate more.',
  GENERATION_FAILED: 'Failed to generate campaign pack. Please try again.',
  INCOMPLETE_CAMPAIGN_PACK: 'The generated campaign pack was incomplete. Please retry.',
  GENERATION_CONFLICT: 'A campaign generation request is already in progress.',
  PERSISTENCE_FAILED: 'Could not save the generated campaign. Please try again.',
  UNEXPECTED_ERROR: 'An unexpected error occurred while creating the campaign.',
};

export function mapDatabaseRpcErrorToGenerationError(rpcErrorMessage: string): {
  code: GenerationErrorCode;
  message: string;
} {
  if (rpcErrorMessage.includes('UNAUTHORIZED')) {
    return { code: 'UNAUTHORIZED_BUSINESS', message: GENERATION_ERROR_MESSAGES.UNAUTHORIZED_BUSINESS };
  }
  if (rpcErrorMessage.includes('ENTITLEMENT_UNAVAILABLE')) {
    return { code: 'ENTITLEMENT_UNAVAILABLE', message: GENERATION_ERROR_MESSAGES.ENTITLEMENT_UNAVAILABLE };
  }
  if (rpcErrorMessage.includes('QUOTA_EXHAUSTED')) {
    return { code: 'QUOTA_EXHAUSTED', message: GENERATION_ERROR_MESSAGES.QUOTA_EXHAUSTED };
  }
  if (rpcErrorMessage.includes('INCOMPLETE_CAMPAIGN_PACK')) {
    return { code: 'INCOMPLETE_CAMPAIGN_PACK', message: GENERATION_ERROR_MESSAGES.INCOMPLETE_CAMPAIGN_PACK };
  }
  return { code: 'PERSISTENCE_FAILED', message: GENERATION_ERROR_MESSAGES.PERSISTENCE_FAILED };
}
