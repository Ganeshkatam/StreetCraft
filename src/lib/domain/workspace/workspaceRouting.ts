/**
 * Pure functions for workspace storefront navigation and URL resolution.
 */

export function extractBusinessIdFromPathname(pathname?: string | null): string | null {
  if (!pathname) return null;
  const match = pathname.match(/^\/user\/business\/([^\/]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export interface BusinessSummary {
  id: string;
  name: string;
  category?: string;
}

export function resolveActiveBusiness(
  routeBizId: string | null,
  sessionBizId: string | null,
  businesses: BusinessSummary[],
  options?: { hasLoaded?: boolean }
): {
  activeBiz: BusinessSummary | null;
  activeBizId: string | null;
  activeBizName: string;
  isAuthorized: boolean;
} {
  const safeBusinesses = Array.isArray(businesses) ? businesses : [];
  const hasLoaded = options?.hasLoaded ?? (safeBusinesses.length > 0);

  // When a specific storefront is requested via URL route parameter:
  if (routeBizId) {
    const matched = safeBusinesses.find((b) => b && b.id === routeBizId);
    if (matched) {
      return {
        activeBiz: matched,
        activeBizId: matched.id,
        activeBizName: matched.name,
        isAuthorized: true,
      };
    }

    // If businesses have finished loading and the candidate is NOT in the list,
    // do NOT fall back to another storefront. Never mask unauthorized access.
    if (hasLoaded) {
      return {
        activeBiz: null,
        activeBizId: null,
        activeBizName: 'Unauthorized Storefront',
        isAuthorized: false,
      };
    }

    // Initial state before businesses have populated
    return {
      activeBiz: null,
      activeBizId: routeBizId,
      activeBizName: 'Loading Storefront...',
      isAuthorized: false,
    };
  }

  // Not on a route-scoped business path; resolve from session or primary authorized store
  const fallbackId = sessionBizId || (safeBusinesses[0]?.id ?? null);
  const matched = safeBusinesses.find((b) => b && b.id === fallbackId) || (safeBusinesses.length > 0 ? safeBusinesses[0] : null);

  return {
    activeBiz: matched,
    activeBizId: matched ? matched.id : null,
    activeBizName: matched ? matched.name : 'No Store Selected',
    isAuthorized: matched !== null,
  };
}

export type WorkspaceSection = 'today' | 'create' | 'campaigns' | 'settings' | 'plan';

export function getWorkspaceHref(activeBizId: string | null, section: WorkspaceSection): string {
  if (!activeBizId) {
    if (section === 'settings') return '/user/business';
    if (section === 'plan') return '/user/account/plan';
    return `/user/${section}`;
  }
  return `/user/business/${encodeURIComponent(activeBizId)}/${section}`;
}
