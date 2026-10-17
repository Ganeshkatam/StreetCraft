import { getAccessibleBusinesses, type AccessibleBusiness } from './getAccessibleBusinesses';
import { filterAuthorizedBusiness } from '../../domain/business/businessAuthorization';

export { filterAuthorizedBusiness };

/**
 * Validates untrusted candidate business ID against user memberships.
 * When an explicit candidate ID is supplied, strictly requires authorization
 * and returns null if invalid or unauthorized (preventing silent wrong-store mutations).
 * Deterministically defaults to primary business only when no candidate ID is requested.
 */
export async function resolveAuthorizedBusiness(
  userId: string,
  candidateBizId?: string | null
): Promise<AccessibleBusiness | null> {
  const accessibleBusinesses = await getAccessibleBusinesses(userId);
  return filterAuthorizedBusiness(accessibleBusinesses, candidateBizId);
}
