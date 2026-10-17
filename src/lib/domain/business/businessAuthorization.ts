export interface AccessibleBusinessSummary {
  id: string;
  name: string;
  category: string;
  role: string;
}

/**
 * Pure authorization filter that resolves untrusted candidate ID against memberships.
 * When candidateBizId is provided, strictly requires validity and authorization.
 * Never falls back to primary store if an explicit candidate ID was supplied.
 */
export function filterAuthorizedBusiness<T extends AccessibleBusinessSummary>(
  accessibleBusinesses: T[],
  candidateBizId?: string | null
): T | null {
  if (accessibleBusinesses.length === 0) {
    return null;
  }

  // If a specific business ID was requested, strictly validate and require membership.
  // Never fall back to another store if a candidate was explicitly provided.
  if (candidateBizId !== undefined && candidateBizId !== null && candidateBizId.trim() !== '') {
    const trimmed = candidateBizId.trim();
    const isCandidateValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
    if (!isCandidateValidUuid) {
      return null;
    }

    const authorizedCandidate = accessibleBusinesses.find((b) => b.id === trimmed);
    return authorizedCandidate || null;
  }

  // When no business ID is specified, deterministically select the primary business.
  const sorted = [...accessibleBusinesses].sort((a, b) => a.id.localeCompare(b.id));
  return sorted[0];
}
