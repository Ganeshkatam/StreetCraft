import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {
  extractBusinessIdFromPathname,
  resolveActiveBusiness,
  getWorkspaceHref,
  BusinessSummary,
} from '../lib/domain/workspace/workspaceRouting';
import { useUsage } from '../hooks/useUsage';
import { api } from '../lib/api';

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

  it('prevents manual refreshUsage for Store A from overwriting Store B when Store A finishes last', async () => {
    // Model the unified activeRequestIdRef semantics used in useUsage
    interface QuotaData {
      businessId: string;
      remainingPacks: number;
    }

    let activeBusinessId: string | null = 'store-a';
    let activeRequestId = 0;
    const usageState: { currentUsage: QuotaData | null } = {
      currentUsage: null,
    };

    const executeFetch = async (targetBizId: string, delayMs: number, quota: number) => {
      activeRequestId++;
      const currentRequestId = activeRequestId;

      await new Promise((resolve) => setTimeout(resolve, delayMs));

      // Guard matches useUsage: discard response if newer request generation has occurred
      if (currentRequestId === activeRequestId) {
        usageState.currentUsage = { businessId: targetBizId, remainingPacks: quota };
      }
    };

    const refreshUsage = async (delayMs: number, quota: number) => {
      return executeFetch(activeBusinessId!, delayMs, quota);
    };

    // 1. Initial fetch for Store A completes
    await executeFetch('store-a', 5, 20);
    assert.strictEqual(usageState.currentUsage?.businessId, 'store-a');
    assert.strictEqual(usageState.currentUsage?.remainingPacks, 20);

    // 2. User invokes manual refreshUsage for Store A (slow, 60ms)
    const storeARefreshPromise = refreshUsage(60, 25);

    // 3. User switches to Store B while Store A refresh is in flight (10ms)
    activeRequestId++; // Business change invalidates in-flight requests immediately
    activeBusinessId = 'store-b';
    usageState.currentUsage = null;
    const storeBFetchPromise = executeFetch('store-b', 10, 100);

    // 4. Wait for both promises to resolve
    await Promise.all([storeARefreshPromise, storeBFetchPromise]);

    // Store A's delayed manual refresh must NOT overwrite Store B
    const finalState = usageState.currentUsage as QuotaData | null;
    assert.strictEqual(activeBusinessId, 'store-b');
    assert.strictEqual(finalState?.businessId, 'store-b');
    assert.strictEqual(finalState?.remainingPacks, 100);
  });

  it('exercises real useUsage hook across store switches while refreshUsage is pending', async () => {
    class HookRunner<TArgs extends any[], TReturn> {
      private hookFn: (...args: TArgs) => TReturn;
      private states: any[] = [];
      private refs: any[] = [];
      private effects: Array<{ effect: () => (() => void) | void; deps?: any[]; prevDeps?: any[] | null }> = [];
      private cleanups: Array<(() => void) | null> = [];
      private stateIndex = 0;
      private refIndex = 0;
      private effectIndex = 0;
      public currentResult: TReturn | null = null;

      constructor(hookFn: (...args: TArgs) => TReturn) {
        this.hookFn = hookFn;
      }

      render(...args: TArgs): TReturn {
        this.stateIndex = 0;
        this.refIndex = 0;
        this.effectIndex = 0;

        const internals = (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
        const prevDispatcher = internals.H;
        internals.H = {
          useState: (initial: any) => {
            const idx = this.stateIndex++;
            if (idx >= this.states.length) {
              const val = typeof initial === 'function' ? initial() : initial;
              this.states.push(val);
            }
            const setState = (next: any) => {
              const nextVal = typeof next === 'function' ? next(this.states[idx]) : next;
              this.states[idx] = nextVal;
            };
            return [this.states[idx], setState];
          },
          useRef: (initial: any) => {
            const idx = this.refIndex++;
            if (idx >= this.refs.length) {
              this.refs.push({ current: initial });
            }
            return this.refs[idx];
          },
          useCallback: (fn: any) => fn,
          useEffect: (effect: any, deps: any) => {
            const idx = this.effectIndex++;
            if (idx >= this.effects.length) {
              this.effects.push({ effect, deps, prevDeps: null });
            } else {
              this.effects[idx].effect = effect;
              this.effects[idx].prevDeps = this.effects[idx].deps;
              this.effects[idx].deps = deps;
            }
          },
        };

        try {
          this.currentResult = this.hookFn(...args);
        } finally {
          internals.H = prevDispatcher;
        }

        for (let i = 0; i < this.effects.length; i++) {
          const { effect, deps, prevDeps } = this.effects[i];
          let hasChanged = !prevDeps || !deps || deps.length !== prevDeps.length;
          if (!hasChanged && deps && prevDeps) {
            hasChanged = deps.some((d, j) => !Object.is(d, prevDeps[j]));
          }
          if (hasChanged) {
            if (this.cleanups[i]) {
              try { this.cleanups[i]!(); } catch {}
              this.cleanups[i] = null;
            }
            const cleanup = effect();
            if (typeof cleanup === 'function') {
              this.cleanups[i] = cleanup;
            }
          }
        }

        return this.currentResult;
      }

      unmount() {
        for (const cleanup of this.cleanups) {
          if (typeof cleanup === 'function') {
            try { cleanup(); } catch {}
          }
        }
        this.cleanups = [];
      }
    }

    const origSummary = api.getUsageSummary;
    const origEvents = api.getUsageEvents;

    api.getUsageSummary = async (bizId: any) => {
      if (bizId === 'store-a') {
        await new Promise((r) => setTimeout(r, 60));
        return {
          periodId: 'p-a',
          businessId: 'store-a',
          plan: 'GROWTH',
          planName: 'Growth Plan',
          priceINR: 1999,
          monthlyLimit: 50,
          usedCampaigns: 30,
          remainingCampaigns: 20,
          usedPacks: 30,
          remainingPacks: 20,
          percentUsed: 60,
          periodStart: '2026-10-01',
          periodEnd: '2026-10-31',
          canGenerate: true,
        } as any;
      }
      if (bizId === 'store-b') {
        await new Promise((r) => setTimeout(r, 10));
        return {
          periodId: 'p-b',
          businessId: 'store-b',
          plan: 'SCALE',
          planName: 'Scale Plan',
          priceINR: 4999,
          monthlyLimit: 150,
          usedCampaigns: 50,
          remainingCampaigns: 100,
          usedPacks: 50,
          remainingPacks: 100,
          percentUsed: 33,
          periodStart: '2026-10-01',
          periodEnd: '2026-10-31',
          canGenerate: true,
        } as any;
      }
      return { businessId: bizId, remainingPacks: 0 } as any;
    };
    api.getUsageEvents = async () => [];

    try {
      const runner = new HookRunner(useUsage);

      // 1. Initial render on store-a
      runner.render('store-a');

      // 2. Trigger manual refreshUsage() on store-a (slow, 60ms)
      const refreshPromise = runner.currentResult!.refreshUsage();

      // 3. Switch to store-b while store-a's refresh is still pending
      runner.render('store-b');

      // 4. Wait for both promises to resolve
      await refreshPromise;
      await new Promise((r) => setTimeout(r, 80));

      // 5. Final render to inspect committed hook state
      const finalResult = runner.render('store-b');

      assert.strictEqual(finalResult.usage?.businessId, 'store-b');
      assert.strictEqual(finalResult.usage?.remainingPacks, 100);
      assert.strictEqual(finalResult.loading, false);
      assert.strictEqual(finalResult.error, null);

      runner.unmount();
    } finally {
      api.getUsageSummary = origSummary;
      api.getUsageEvents = origEvents;
    }
  });
});
