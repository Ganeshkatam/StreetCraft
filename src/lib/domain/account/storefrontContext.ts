import type { StorefrontSummary } from './accountTypes';

export function determineActiveStorefront(
  storefronts: StorefrontSummary[],
  candidateBizId?: string
): StorefrontSummary | null {
  if (storefronts.length === 0) {
    return null;
  }

  if (candidateBizId) {
    const matched = storefronts.find((s) => s.id === candidateBizId);
    if (matched) {
      return matched;
    }
  }

  // Fallback to first available storefront
  return storefronts[0];
}
