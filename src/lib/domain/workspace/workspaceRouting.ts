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
  businesses: BusinessSummary[]
): {
  activeBiz: BusinessSummary | null;
  activeBizId: string | null;
  activeBizName: string;
} {
  const safeBusinesses = Array.isArray(businesses) ? businesses : [];
  const effectiveBizId = routeBizId || sessionBizId || (safeBusinesses[0]?.id ?? null);
  const activeBiz = safeBusinesses.find((b) => b && b.id === effectiveBizId) || (safeBusinesses.length > 0 ? safeBusinesses[0] : null);
  const activeBizId = activeBiz ? activeBiz.id : routeBizId;
  const activeBizName = activeBiz ? activeBiz.name : (routeBizId ? 'Loading Storefront...' : 'No Store Selected');

  return {
    activeBiz,
    activeBizId,
    activeBizName,
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
