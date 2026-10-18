import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { setServerClientOverride } from '../lib/supabase/server';
import { getCampaignDetail } from '../lib/server/campaigns/getCampaignDetail';
import { createCampaignAction } from '../lib/server/create/createCampaignAction';
import { updateBusinessProfile } from '../lib/server/business/updateBusinessProfile';
import { saveSetupDomainAction } from '../lib/server/setup/saveSetupDomainAction';

interface MockTrackers {
  updateCalled: boolean;
  rpcCalled: boolean;
  rpcName?: string;
}

function createMockSupabaseClient(options: {
  userId: string;
  memberships: Array<{ businessId: string; role: string; name?: string; category?: string }>;
  campaigns?: Array<{ id: string; businessId: string }>;
  trackers?: MockTrackers;
}) {
  const trackers = options.trackers || { updateCalled: false, rpcCalled: false };

  return {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: options.userId,
            email: `${options.userId}@example.com`,
            role: 'authenticated',
            app_metadata: {},
            user_metadata: {},
          },
        },
        error: null,
      }),
    },
    from: (table: string) => {
      if (table === 'business_members') {
        return {
          select: () => ({
            eq: (_field: string, val: string) => {
              if (val === options.userId) {
                return Promise.resolve({
                  data: options.memberships.map((m) => ({
                    role: m.role,
                    businesses: {
                      id: m.businessId,
                      name: m.name || 'Alpha Store',
                      category: m.category || 'Bakery',
                    },
                  })),
                  error: null,
                });
              }
              return Promise.resolve({ data: [], error: null });
            },
          }),
        };
      }

      if (table === 'campaigns') {
        return {
          select: () => ({
            eq: (_field: string, id: string) => ({
              single: async () => {
                const found = options.campaigns?.find((c) => c.id === id);
                if (found) {
                  return {
                    data: {
                      id: found.id,
                      business_id: found.businessId,
                      type: 'WEEKEND_MAGNET',
                      objective: 'MORE_WALK_INS',
                      audience: 'Local shoppers',
                      status: 'READY',
                      created_at: new Date().toISOString(),
                      offer: { title: 'Special Promo', description: 'Promo description' },
                      schedule: { timingLabel: 'Weekend' },
                      performance_notes: '',
                      generation_revision: 1,
                      campaign_outputs: [],
                    },
                    error: null,
                  };
                }
                return { data: null, error: { message: 'Campaign not found' } };
              },
            }),
          }),
        };
      }

      if (table === 'business_profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: {
                  business_id: options.memberships[0]?.businessId || '11111111-1111-1111-1111-111111111111',
                  name: 'Alpha Store',
                  category: 'Bakery',
                },
                error: null,
              }),
            }),
          }),
          update: () => {
            trackers.updateCalled = true;
            return {
              eq: () => Promise.resolve({ error: null }),
            };
          },
        };
      }

      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
        update: () => {
          trackers.updateCalled = true;
          return { eq: () => Promise.resolve({ error: null }) };
        },
      };
    },
    rpc: (name: string) => {
      trackers.rpcCalled = true;
      trackers.rpcName = name;
      return Promise.resolve({ data: null, error: null });
    },
  };
}

describe('Tenant Authorization & Cross-Store Boundary Isolation', () => {
  const storeA = '11111111-1111-1111-1111-111111111111';
  const storeB = '22222222-2222-2222-2222-222222222222';
  const campaignStoreB = '33333333-3333-3333-3333-333333333333';
  const userA = 'aaaa1111-1111-1111-1111-aaaaaaaaaaaa';

  afterEach(() => {
    setServerClientOverride(null);
  });

  it('P0: getCampaignDetail returns null when campaign belongs to another merchant', async () => {
    // Arrange: User A is a member of Store A only. Campaign belongs to Store B.
    setServerClientOverride(() =>
      createMockSupabaseClient({
        userId: userA,
        memberships: [{ businessId: storeA, role: 'owner' }],
        campaigns: [{ id: campaignStoreB, businessId: storeB }],
      })
    );

    // Act: User A requests campaign belonging to Store B
    const result = await getCampaignDetail(campaignStoreB);

    // Assert: Result is null (deliberate 404 to avoid leaking existence of another tenant's campaign)
    assert.strictEqual(result, null);
  });

  it('P0: createCampaignAction rejects foreign businessId with UNAUTHORIZED_BUSINESS before generation or RPC', async () => {
    const trackers: MockTrackers = { updateCalled: false, rpcCalled: false };

    // Arrange: User A can access only Store A
    setServerClientOverride(() =>
      createMockSupabaseClient({
        userId: userA,
        memberships: [{ businessId: storeA, role: 'owner' }],
        trackers,
      })
    );

    // Act: Submit campaign creation targeting Store B
    const formData = new FormData();
    formData.append('businessId', storeB);
    formData.append('type', 'WEEKEND_MAGNET');
    formData.append('objective', 'MORE_WALK_INS');
    formData.append('offerTitle', 'Unauthorized Promo');
    formData.append('offerDesc', 'Special croissant discount');

    const result = await createCampaignAction({ success: false, message: '' }, formData);

    // Assert: Fails closed with UNAUTHORIZED_BUSINESS
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.errorCode, 'UNAUTHORIZED_BUSINESS');
    assert.strictEqual(result.message, 'You are not authorized to create campaigns for this storefront.');

    // Assert: Database mutations and atomic RPC were NOT invoked
    assert.strictEqual(trackers.rpcCalled, false);
    assert.strictEqual(trackers.updateCalled, false);
  });

  it('P0: updateBusinessProfile rejects members without owner/admin role before modifying database', async () => {
    const trackers: MockTrackers = { updateCalled: false, rpcCalled: false };

    // Arrange: User A belongs to Store A, but only with role 'member' (not owner or admin)
    setServerClientOverride(() =>
      createMockSupabaseClient({
        userId: userA,
        memberships: [{ businessId: storeA, role: 'member' }],
        trackers,
      })
    );

    // Act: Member attempts to update store profile
    const formData = new FormData();
    formData.append('name', 'Modified Store Name');
    formData.append('category', 'Bakery');

    const result = await updateBusinessProfile(storeA, { success: false }, formData);

    // Assert: Rejected with explicit role authorization error
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.message, 'Only store owners or admins can update the profile.');

    // Assert: Database update was NOT executed
    assert.strictEqual(trackers.updateCalled, false);
  });

  it('P0: saveSetupDomainAction rejects users who do not belong to target storefront before writing setup data', async () => {
    const trackers: MockTrackers = { updateCalled: false, rpcCalled: false };

    // Arrange: User A is member of Store A only
    setServerClientOverride(() =>
      createMockSupabaseClient({
        userId: userA,
        memberships: [{ businessId: storeA, role: 'owner' }],
        trackers,
      })
    );

    // Act: User A attempts to save setup domain on Store B
    const formData = new FormData();
    formData.append('name', 'Hacked Bakery Name');
    formData.append('category', 'Bakery');

    const result = await saveSetupDomainAction(storeB, 'identity', { success: false }, formData);

    // Assert: Rejected with tenant authorization failure
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.message, 'Unauthorized: You do not have permission to manage this storefront.');

    // Assert: Database update was NOT called
    assert.strictEqual(trackers.updateCalled, false);
  });
});
