import { getAccessibleBusinesses, AccessibleBusiness } from './getAccessibleBusinesses';

/**
 * Validates untrusted ?biz candidate against memberships + fallback.
 * Ensures zero cross-tenant data leakage by treating unauthorized candidates
 * identically to malformed ones (falling back to a deterministic primary business).
 */
export async function resolveAuthorizedBusiness(
  userId: string,
  candidateBizId?: string
): Promise<AccessibleBusiness | null> {
  const accessibleBusinesses = await getAccessibleBusinesses(userId);

  if (accessibleBusinesses.length === 0) {
    return null;
  }

  // Validate candidateBizId UUID format
  const isCandidateValidUuid = candidateBizId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(candidateBizId);

  if (isCandidateValidUuid) {
    const authorizedCandidate = accessibleBusinesses.find(b => b.id === candidateBizId);
    if (authorizedCandidate) {
      return authorizedCandidate;
    }
  }

  // Fallback: Deterministically pick the primary business.
  // In a real app we might pick the one with role 'owner' or oldest by created_at.
  // Here we just pick the first one since getAccessibleBusinesses orders them deterministically (by db return order).
  // To be safe, we can sort by id to ensure determinism if the DB order changes.
  accessibleBusinesses.sort((a, b) => a.id.localeCompare(b.id));
  
  return accessibleBusinesses[0];
}
