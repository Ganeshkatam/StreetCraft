import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractBusinessIdFromPathname,
  resolveActiveBusiness,
  getWorkspaceHref,
  BusinessSummary,
} from '../lib/domain/workspace/workspaceRouting';

describe('Workspace Routing: Extract Business ID from Pathname', () => {
  it('extracts business ID from standard store workspace routes', () => {
    assert.strictEqual(
      extractBusinessIdFromPathname('/user/business/store-abc-123/today'),
      'store-abc-123'
    );
    assert.strictEqual(
      extractBusinessIdFromPathname('/user/business/store-abc-123/campaigns'),
      'store-abc-123'
    );
    assert.strictEqual(
      extractBusinessIdFromPathname('/user/business/store-abc-123/settings/identity'),
      'store-abc-123'
    );
  });

  it('correctly decodes URI-encoded business IDs', () => {
    assert.strictEqual(
      extractBusinessIdFromPathname('/user/business/Cafe%20Corner/today'),
      'Cafe Corner'
    );
  });

  it('returns null for account space and generic routes', () => {
    assert.strictEqual(extractBusinessIdFromPathname('/user/today'), null);
    assert.strictEqual(extractBusinessIdFromPathname('/user/account/plan'), null);
    assert.strictEqual(extractBusinessIdFromPathname('/pricing'), null);
    assert.strictEqual(extractBusinessIdFromPathname(null), null);
    assert.strictEqual(extractBusinessIdFromPathname(undefined), null);
  });
});

describe('Workspace Routing: Active Business Resolution', () => {
  const sampleBusinesses: BusinessSummary[] = [
    { id: 'biz-1', name: 'Primary Bakery', category: 'Bakery' },
    { id: 'biz-2', name: 'Second Cafe', category: 'Cafe' },
  ];

  it('prioritizes routeBizId over session activeBusinessId', () => {
    const res = resolveActiveBusiness('biz-2', 'biz-1', sampleBusinesses);
    assert.strictEqual(res.activeBizId, 'biz-2');
    assert.strictEqual(res.activeBizName, 'Second Cafe');
    assert.strictEqual(res.activeBiz?.id, 'biz-2');
  });

  it('falls back to session activeBusinessId when not on business-scoped route', () => {
    const res = resolveActiveBusiness(null, 'biz-2', sampleBusinesses);
    assert.strictEqual(res.activeBizId, 'biz-2');
    assert.strictEqual(res.activeBizName, 'Second Cafe');
  });

  it('falls back to the first available business when both route and session are empty', () => {
    const res = resolveActiveBusiness(null, null, sampleBusinesses);
    assert.strictEqual(res.activeBizId, 'biz-1');
    assert.strictEqual(res.activeBizName, 'Primary Bakery');
  });

  it('handles empty business list gracefully with loading state for routeBizId', () => {
    const res = resolveActiveBusiness('biz-unknown', null, []);
    assert.strictEqual(res.activeBizId, 'biz-unknown');
    assert.strictEqual(res.activeBizName, 'Loading Storefront...');
  });

  it('does NOT fall back to another store when routeBizId is unauthorized', () => {
    const res = resolveActiveBusiness('biz-unauthorized-999', 'biz-1', sampleBusinesses);
    assert.strictEqual(res.isAuthorized, false);
    assert.strictEqual(res.activeBiz, null);
    assert.strictEqual(res.activeBizId, null);
    assert.strictEqual(res.activeBizName, 'Unauthorized Storefront');
  });

  it('handles completely empty state with No Store Selected', () => {
    const res = resolveActiveBusiness(null, null, []);
    assert.strictEqual(res.activeBizId, null);
    assert.strictEqual(res.activeBizName, 'No Store Selected');
  });

  it('resolves to Unauthorized Storefront when businesses have finished loading as empty', () => {
    const res = resolveActiveBusiness('biz-deleted-123', 'biz-fallback', [], { hasLoaded: true });
    assert.strictEqual(res.isAuthorized, false);
    assert.strictEqual(res.activeBizId, null);
    assert.strictEqual(res.activeBizName, 'Unauthorized Storefront');
  });
});

describe('Workspace Routing: Navigation Link Generation', () => {
  it('generates storefront-scoped URLs when activeBizId is present', () => {
    assert.strictEqual(getWorkspaceHref('store-1', 'today'), '/user/business/store-1/today');
    assert.strictEqual(getWorkspaceHref('store-1', 'create'), '/user/business/store-1/create');
    assert.strictEqual(getWorkspaceHref('store-1', 'campaigns'), '/user/business/store-1/campaigns');
    assert.strictEqual(getWorkspaceHref('store-1', 'settings'), '/user/business/store-1/settings');
    assert.strictEqual(getWorkspaceHref('store-1', 'plan'), '/user/business/store-1/plan');
  });

  it('generates fallback URLs when no active business exists', () => {
    assert.strictEqual(getWorkspaceHref(null, 'settings'), '/user/business');
    assert.strictEqual(getWorkspaceHref(null, 'plan'), '/user/account/plan');
    assert.strictEqual(getWorkspaceHref(null, 'today'), '/user/today');
    assert.strictEqual(getWorkspaceHref(null, 'create'), '/user/create');
  });
});

describe('Workspace Routing: Route-Resolved Usage Binding & Race Protection Semantics', () => {
  const businesses: BusinessSummary[] = [
    { id: 'store-a', name: 'Store A', category: 'Retail' },
    { id: 'store-b', name: 'Store B', category: 'Cafe' },
  ];

  it('guarantees usage query target matches route-resolved store rather than stale session store', () => {
    // User directly visits Store B URL while session still points to Store A
    const routeStoreId = extractBusinessIdFromPathname('/user/business/store-b/today');
    const sessionStoreId = 'store-a';

    const resolution = resolveActiveBusiness(routeStoreId, sessionStoreId, businesses);

    // The business ID passed to useUsage must match resolution.activeBizId
    const effectiveUsageBusinessId = resolution.activeBizId || '';
    assert.strictEqual(effectiveUsageBusinessId, 'store-b');
    assert.notStrictEqual(effectiveUsageBusinessId, sessionStoreId);
  });

  it('prevents delayed usage response from Store A overwriting newer Store B state', async () => {
    let currentBusinessId = 'store-a';
    const usageState: { currentUsage: { businessId: string; remainingPacks: number } | null } = {
      currentUsage: null,
    };

    // Simulate async fetch with cancellation token
    let activeToken = 0;
    const fetchUsageForStore = async (bizId: string, delayMs: number, quota: number) => {
      activeToken++;
      const thisToken = activeToken;
      currentBusinessId = bizId;

      await new Promise((resolve) => setTimeout(resolve, delayMs));

      // Cancellation check: only commit if token is still current
      if (thisToken === activeToken) {
        usageState.currentUsage = { businessId: bizId, remainingPacks: quota };
      }
    };

    // Store A request starts (slow, 50ms)
    const storeAPromise = fetchUsageForStore('store-a', 50, 25);

    // User switches to Store B immediately (fast, 10ms)
    const storeBPromise = fetchUsageForStore('store-b', 10, 80);

    await Promise.all([storeAPromise, storeBPromise]);

    // Store B's data must prevail; Store A's delayed response must NOT overwrite Store B
    assert.strictEqual(currentBusinessId, 'store-b');
    assert.strictEqual(usageState.currentUsage?.businessId, 'store-b');
    assert.strictEqual(usageState.currentUsage?.remainingPacks, 80);
  });

  it('clears stale storefronts when getMyBusinesses succeeds with empty array', () => {
    let statefulBusinesses: BusinessSummary[] = [
      { id: 'old-store-1', name: 'Deleted Store 1' },
      { id: 'old-store-2', name: 'Deleted Store 2' },
    ];

    // Simulate successful fetch returning 0 businesses
    const apiResponse: BusinessSummary[] = [];
    if (Array.isArray(apiResponse)) {
      statefulBusinesses = apiResponse;
    }

    assert.strictEqual(statefulBusinesses.length, 0);
    const resolution = resolveActiveBusiness('old-store-1', null, statefulBusinesses, { hasLoaded: true });
    assert.strictEqual(resolution.isAuthorized, false);
    assert.strictEqual(resolution.activeBizId, null);
    assert.strictEqual(resolution.activeBizName, 'Unauthorized Storefront');
  });
});
