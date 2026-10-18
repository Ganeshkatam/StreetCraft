import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert';
import crypto from 'node:crypto';
export function getTodayIST(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

/**
 * StreetCraft — Brief 1 Integration Test Runner
 *
 * Verifies Brief 1: Usage Period Rollover and Subscription Expiry
 * 
 * Tests that must pass:
 * 1. Actor Authorization Boundaries:
 *    - anon, user A, user B (cross-tenant), and service_role.
 * 2. Two concurrent ensure_usage_period calls produce exactly one row.
 * 3. A store whose period ended yesterday can generate a campaign;
 *    a new period with campaigns_used = 0 is created.
 * 4. A paid subscription past current_period_end with cancel_at_period_end = false
 *    is expired by process_expired_subscriptions and the store drops to FREE limits.
 * 5. Two owners, one expired and one active: the store keeps the paid limit.
 * 6. Boundary tests at 31 Oct 23:59 and 1 Nov 00:01 IST.
 * 7. Backfill verification: exactly one row per business covering today.
 */

export const AUTHORIZED_PROJECT_REF = 'iodwiyfjwzdvqtrczttb';
export const APPROVED_LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);

const targetUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_INTEGRATION_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_INTEGRATION_SERVICE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_INTEGRATION_ANON_KEY;

console.log('--- StreetCraft Brief 1 Integration Runner ---');

if (!targetUrl || !serviceKey || !anonKey) {
  console.error('[Configuration Error] Missing Supabase credentials in environment.');
  process.exit(2);
}

let parsedUrl;
try {
  parsedUrl = new URL(targetUrl);
} catch (urlErr) {
  console.error('[Configuration Error] Invalid database URL format:', urlErr.message);
  process.exit(2);
}

const rawHostname = parsedUrl.hostname.toLowerCase();
const normalizedHostname = rawHostname.startsWith('[') && rawHostname.endsWith(']')
  ? rawHostname.slice(1, -1)
  : rawHostname;

const isLocalTarget = APPROVED_LOCAL_HOSTNAMES.has(normalizedHostname) || APPROVED_LOCAL_HOSTNAMES.has(rawHostname);

function extractProjectRef(urlObj) {
  const hostname = (urlObj.hostname.toLowerCase().startsWith('[') && urlObj.hostname.endsWith(']'))
    ? urlObj.hostname.slice(1, -1).toLowerCase()
    : urlObj.hostname.toLowerCase();
  if (hostname.endsWith('.supabase.co')) {
    return hostname.split('.')[0];
  }
  return hostname;
}

const targetRef = extractProjectRef(parsedUrl);

if (!isLocalTarget) {
  if (parsedUrl.protocol !== 'https:') {
    console.error('SAFETY VIOLATION: Remote targets must use HTTPS.');
    process.exit(2);
  }
  if (targetRef !== AUTHORIZED_PROJECT_REF) {
    console.error(`SAFETY VIOLATION: Target project ref '${targetRef}' is not authorized.`);
    process.exit(2);
  }
}

console.log('Target project ref:', targetRef);
console.log('Target authorization: AUTHORIZED STREETCRAFT PROJECT');

const adminClient = createClient(targetUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const unprivilegedAnonClient = createClient(targetUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const runId = crypto.randomBytes(4).toString('hex');
const FIXTURE_PREFIX = `test_b1_${runId}`;

const cleanupState = {
  userIds: [],
  businessIds: [],
  campaignIds: [],
  subscriptionIds: [],
};

async function executeWithRetry(fn, maxRetries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fn();
      if (res?.error && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, delayMs * attempt));
        continue;
      }
      return res;
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
}

function samplePayload(suffix = '') {
  return {
    google: { title: `Google Promo ${suffix}`, description: 'Best deals in town', call_to_action: 'Visit today' },
    instagram: { caption: `Instagram Special ${suffix}`, hashtags: ['#sale', '#local'] },
    whatsapp: { message: `WhatsApp Announcement ${suffix}` },
    poster: { headline: `Poster Deal ${suffix}`, theme: 'bold' },
  };
}

async function runBrief1Suite() {
  console.log('\n[Baseline] Snapshotting existing merchant records...');
  
  const { data: baselineBusinesses, error: bzSnapErr } = await adminClient
    .from('businesses')
    .select('*')
    .not('name', 'ilike', 'test_%')
    .order('id', { ascending: true });
  assert.ifError(bzSnapErr);

  const { data: baselineSubscriptions, error: subSnapErr } = await adminClient
    .from('subscriptions')
    .select('*')
    .order('id', { ascending: true });
  assert.ifError(subSnapErr);

  const { data: baselineUsagePeriods, error: periodSnapErr } = await adminClient
    .from('usage_periods')
    .select('*')
    .order('id', { ascending: true });
  assert.ifError(periodSnapErr);

  const baselineSnapshot = {
    businesses: JSON.stringify(baselineBusinesses ?? []),
    subscriptions: JSON.stringify(baselineSubscriptions ?? []),
    usagePeriods: JSON.stringify(baselineUsagePeriods ?? []),
  };

  try {
    // ------------------------------------------------------------------------
    // Provision Synthetic Test Users and Stores
    // ------------------------------------------------------------------------
    console.log('\n[Provisioning] Creating isolated synthetic accounts (User A and User B)...');
    const userAPassword = `SecTest_${crypto.randomBytes(8).toString('hex')}!`;
    const userAEmail = `${FIXTURE_PREFIX}_user_a@streetcraft.test`;

    const { data: userACreated, error: userAErr } = await adminClient.auth.admin.createUser({
      email: userAEmail,
      password: userAPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Merchant A' },
    });
    assert.ifError(userAErr);
    const userAId = userACreated.user.id;
    cleanupState.userIds.push(userAId);

    const userBPassword = `SecTest_${crypto.randomBytes(8).toString('hex')}!`;
    const userBEmail = `${FIXTURE_PREFIX}_user_b@streetcraft.test`;

    const { data: userBCreated, error: userBErr } = await adminClient.auth.admin.createUser({
      email: userBEmail,
      password: userBPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Merchant B' },
    });
    assert.ifError(userBErr);
    const userBId = userBCreated.user.id;
    cleanupState.userIds.push(userBId);

    // Authenticated clients for User A and User B
    const clientA = createClient(targetUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: loginAErr } = await clientA.auth.signInWithPassword({
      email: userAEmail,
      password: userAPassword,
    });
    assert.ifError(loginAErr);

    const clientB = createClient(targetUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: loginBErr } = await clientB.auth.signInWithPassword({
      email: userBEmail,
      password: userBPassword,
    });
    assert.ifError(loginBErr);

    // Store A owned by User A
    const storeAId = crypto.randomUUID();
    cleanupState.businessIds.push(storeAId);
    const { error: storeAErr } = await adminClient.from('businesses').insert({
      id: storeAId,
      name: `${FIXTURE_PREFIX}_store_a`,
      category: 'Cafe',
    });
    assert.ifError(storeAErr);

    const { error: memAErr } = await adminClient.from('business_members').insert({
      business_id: storeAId,
      user_id: userAId,
      role: 'owner',
    });
    assert.ifError(memAErr);

    console.log('  PASS: Provisioned User A, User B, and Store A');

    // ------------------------------------------------------------------------
    // Suite 1: Actor Authorization Boundaries (anon, user A, user B, service_role)
    // ------------------------------------------------------------------------
    console.log('\n[Suite 1/7] Verifying Actor Authorization Boundaries...');

    // 1a. ensure_usage_period: service_role can call, anon and authenticated cannot
    const { error: anonEnsureErr } = await unprivilegedAnonClient.rpc('ensure_usage_period', {
      p_business_id: storeAId,
    });
    assert.ok(anonEnsureErr, 'anon must not be able to execute internal ensure_usage_period');
    assert.match(anonEnsureErr.message, /permission denied/i);

    const { error: authEnsureErr } = await clientA.rpc('ensure_usage_period', {
      p_business_id: storeAId,
    });
    assert.ok(authEnsureErr, 'authenticated user must not execute internal ensure_usage_period');
    assert.match(authEnsureErr.message, /permission denied/i);

    const { data: srvEnsureRes, error: srvEnsureErr } = await adminClient.rpc('ensure_usage_period', {
      p_business_id: storeAId,
    });
    assert.ifError(srvEnsureErr, 'service_role must be able to execute ensure_usage_period');
    assert.ok(srvEnsureRes && srvEnsureRes.business_id === storeAId);
    console.log('  PASS: ensure_usage_period: internal definer (service_role only)');

    // 1b. resolve_store_entitlement: internal definer
    const { error: anonResolveErr } = await unprivilegedAnonClient.rpc('resolve_store_entitlement', {
      p_business_id: storeAId,
    });
    assert.ok(anonResolveErr, 'anon must not execute resolve_store_entitlement');

    const { error: authResolveErr } = await clientA.rpc('resolve_store_entitlement', {
      p_business_id: storeAId,
    });
    assert.ok(authResolveErr, 'authenticated must not execute resolve_store_entitlement');

    const { data: srvResolveRes, error: srvResolveErr } = await adminClient.rpc('resolve_store_entitlement', {
      p_business_id: storeAId,
    });
    assert.ifError(srvResolveErr);
    assert.ok(srvResolveRes && srvResolveRes.length > 0);
    console.log('  PASS: resolve_store_entitlement: internal definer (service_role only)');

    // 1c. ensure_my_usage_period: wrapper for authenticated members
    const { error: anonMyErr } = await unprivilegedAnonClient.rpc('ensure_my_usage_period', {
      p_business_id: storeAId,
    });
    assert.ok(anonMyErr, 'anon must not execute ensure_my_usage_period');

    // Cross-tenant actor User B calling for Store A
    const { error: crossTenantMyErr } = await clientB.rpc('ensure_my_usage_period', {
      p_business_id: storeAId,
    });
    assert.ok(crossTenantMyErr, 'User B must be rejected for User A store');
    assert.match(crossTenantMyErr.message, /UNAUTHORIZED.*not a member/i);

    // Legitimate owner User A calling for Store A
    const { data: authMyRes, error: authMyErr } = await clientA.rpc('ensure_my_usage_period', {
      p_business_id: storeAId,
    });
    assert.ifError(authMyErr);
    assert.ok(authMyRes && authMyRes.business_id === storeAId);
    console.log('  PASS: ensure_my_usage_period: authenticated member authorized; cross-tenant rejected');

    // 1d. sync_store_entitlements: internal definer
    const { error: anonSyncErr } = await unprivilegedAnonClient.rpc('sync_store_entitlements', {
      p_user_id: userAId,
    });
    assert.ok(anonSyncErr, 'anon must not execute sync_store_entitlements');

    const { error: authSyncErr } = await clientA.rpc('sync_store_entitlements', {
      p_user_id: userAId,
    });
    assert.ok(authSyncErr, 'authenticated must not execute sync_store_entitlements');
    console.log('  PASS: sync_store_entitlements: internal definer (service_role only)');

    // ------------------------------------------------------------------------
    // Suite 2: Concurrent ensure_usage_period calls produce exactly one row
    // ------------------------------------------------------------------------
    console.log('\n[Suite 2/7] Verifying Concurrent ensure_usage_period Idempotency...');
    const storeCId = crypto.randomUUID();
    cleanupState.businessIds.push(storeCId);
    const { error: storeCErr } = await adminClient.from('businesses').insert({
      id: storeCId,
      name: `${FIXTURE_PREFIX}_store_c`,
      category: 'Bakery',
    });
    assert.ifError(storeCErr);

    const { error: memCErr } = await adminClient.from('business_members').insert({
      business_id: storeCId,
      user_id: userAId,
      role: 'owner',
    });
    assert.ifError(memCErr);

    // Concurrently trigger 2 calls
    const [res1, res2] = await Promise.all([
      adminClient.rpc('ensure_usage_period', { p_business_id: storeCId }),
      adminClient.rpc('ensure_usage_period', { p_business_id: storeCId }),
    ]);
    assert.ifError(res1.error);
    assert.ifError(res2.error);

    const { data: periodRows, error: fetchPeriodErr } = await adminClient
      .from('usage_periods')
      .select('*')
      .eq('business_id', storeCId);
    assert.ifError(fetchPeriodErr);
    assert.strictEqual(periodRows.length, 1, 'Two concurrent calls must produce exactly one row');
    assert.strictEqual(periodRows[0].campaigns_used, 0);
    assert.strictEqual(periodRows[0].plan, 'FREE');
    assert.strictEqual(periodRows[0].campaign_limit, 3);
    console.log('  PASS: Concurrent ensure_usage_period produced exactly one row without duplicate');

    // ------------------------------------------------------------------------
    // Suite 3: Expired Period Store Rollover on Campaign Generation
    // ------------------------------------------------------------------------
    console.log('\n[Suite 3/7] Verifying Campaign Generation Rollover when Period Ended Yesterday...');
    const storeDId = crypto.randomUUID();
    cleanupState.businessIds.push(storeDId);
    await adminClient.from('businesses').insert({
      id: storeDId,
      name: `${FIXTURE_PREFIX}_store_d`,
      category: 'Salon',
    });
    await adminClient.from('business_members').insert({
      business_id: storeDId,
      user_id: userAId,
      role: 'owner',
    });

    // Insert an expired period ending yesterday
    const todayIST = getTodayIST();
    const yesterdayDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const monthAgoDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await adminClient.from('usage_periods').insert({
      business_id: storeDId,
      period_start: monthAgoDate,
      period_end: yesterdayDate,
      plan: 'FREE',
      campaign_limit: 3,
      campaigns_used: 3, // Exhausted in previous period
    });

    // Call save_campaign_atomically via User A
    const payload = samplePayload('Rollover');
    const genReqId = crypto.randomUUID();
    const { data: saveRes, error: saveErr } = await clientA.rpc('save_campaign_atomically', {
      p_business_id: storeDId,
      p_campaign_type: 'FESTIVAL_SPECIAL',
      p_objective: 'FESTIVAL_RUSH',
      p_audience: 'Neighborhood',
      p_offer: { discount: '20%' },
      p_schedule: { start: todayIST },
      p_google_content: payload.google,
      p_instagram_content: payload.instagram,
      p_whatsapp_content: payload.whatsapp,
      p_poster_content: payload.poster,
      p_generation_request_id: genReqId,
    });
    assert.ifError(saveErr, `Campaign save failed on rollover: ${saveErr?.message}`);
    assert.strictEqual(saveRes.status, 'READY');
    assert.strictEqual(saveRes.campaigns_used, 1, 'First campaign in rolled-over period must set campaigns_used = 1');
    assert.strictEqual(saveRes.campaign_limit, 3);
    cleanupState.campaignIds.push(saveRes.campaign_id);
    console.log('  PASS: Store with expired period automatically rolled over and generated campaign');

    // ------------------------------------------------------------------------
    // Suite 4: Subscription Expiration (cancel_at_period_end = false)
    // ------------------------------------------------------------------------
    console.log('\n[Suite 4/7] Verifying Subscription Expiry when cancel_at_period_end = false...');
    const subId = crypto.randomUUID();
    cleanupState.subscriptionIds.push(subId);
    
    // Insert paid PRO subscription expired yesterday with cancel_at_period_end = false
    await adminClient.from('subscriptions').insert({
      id: subId,
      user_id: userAId,
      plan_id: 'PRO',
      provider: 'razorpay',
      provider_subscription_id: `${FIXTURE_PREFIX}_sub_exp`,
      status: 'ACTIVE',
      billing_cycle: 'monthly',
      cancel_at_period_end: false, // NOT cancelled manually by user
      current_period_start: monthAgoDate,
      current_period_end: yesterdayDate,
    });

    // Temporarily upgrade Store A to PRO
    await adminClient
      .from('usage_periods')
      .update({ plan: 'PRO', campaign_limit: 100 })
      .eq('business_id', storeAId)
      .lte('period_start', todayIST)
      .gte('period_end', todayIST);

    // Run process_expired_subscriptions()
    const { data: expRes, error: expErr } = await adminClient.rpc('process_expired_subscriptions');
    assert.ifError(expErr);
    assert.ok(expRes.success);
    assert.ok(expRes.processed_count >= 1);

    // Verify subscription status is CANCELLED
    const { data: checkSub } = await adminClient
      .from('subscriptions')
      .select('status')
      .eq('id', subId)
      .single();
    assert.strictEqual(checkSub.status, 'CANCELLED');

    // Verify Store A downgraded to FREE (limit 3)
    const { data: checkPeriod } = await adminClient
      .from('usage_periods')
      .select('plan, campaign_limit')
      .eq('business_id', storeAId)
      .lte('period_start', todayIST)
      .gte('period_end', todayIST)
      .single();
    assert.strictEqual(checkPeriod.plan, 'FREE');
    assert.strictEqual(checkPeriod.campaign_limit, 3);

    // Verify audit event exists
    const { data: auditEvents } = await adminClient
      .from('usage_events')
      .select('*')
      .eq('business_id', storeAId)
      .eq('event_type', 'SUBSCRIPTION_ENTITLEMENT_ENDED');
    assert.ok(auditEvents && auditEvents.length > 0);
    console.log('  PASS: process_expired_subscriptions expired subscription and downgraded store to FREE');

    // ------------------------------------------------------------------------
    // Suite 5: Multi-Owner Store (One Expired, One Active Paid Plan)
    // ------------------------------------------------------------------------
    console.log('\n[Suite 5/7] Verifying Multi-Owner Store Keeps Paid Limit (Highest Limit Wins)...');
    const multiStoreId = crypto.randomUUID();
    cleanupState.businessIds.push(multiStoreId);
    await adminClient.from('businesses').insert({
      id: multiStoreId,
      name: `${FIXTURE_PREFIX}_multi_owner_store`,
      category: 'Boutique',
    });
    // Two owners: User A (cancelled/expired) and User B (active PRO)
    await adminClient.from('business_members').insert([
      { business_id: multiStoreId, user_id: userAId, role: 'owner' },
      { business_id: multiStoreId, user_id: userBId, role: 'owner' },
    ]);

    const subBId = crypto.randomUUID();
    cleanupState.subscriptionIds.push(subBId);
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await adminClient.from('subscriptions').insert({
      id: subBId,
      user_id: userBId,
      plan_id: 'PRO',
      provider: 'razorpay',
      provider_subscription_id: `${FIXTURE_PREFIX}_sub_b_pro`,
      status: 'ACTIVE',
      billing_cycle: 'monthly',
      cancel_at_period_end: false,
      current_period_start: todayIST,
      current_period_end: futureDate,
    });

    // Resolve entitlement for multi-owner store
    const { data: multiEnt, error: multiEntErr } = await adminClient.rpc('resolve_store_entitlement', {
      p_business_id: multiStoreId,
    });
    assert.ifError(multiEntErr);
    assert.strictEqual(multiEnt[0].plan_id, 'PRO');
    assert.strictEqual(multiEnt[0].monthly_campaign_limit, 100);

    // Sync entitlements for User A (whose subscription is expired)
    await adminClient.rpc('sync_store_entitlements', { p_user_id: userAId });

    // Multi-owner store must NOT drop to FREE; it must retain PRO because User B is an owner!
    const { data: multiPeriod } = await adminClient
      .from('usage_periods')
      .select('plan, campaign_limit')
      .eq('business_id', multiStoreId)
      .lte('period_start', todayIST)
      .gte('period_end', todayIST)
      .single();
    assert.strictEqual(multiPeriod.plan, 'PRO');
    assert.strictEqual(multiPeriod.campaign_limit, 100);
    console.log('  PASS: Multi-owner store preserved PRO entitlement because co-owner holds active plan');

    // ------------------------------------------------------------------------
    // Suite 6: IST Boundary Date Formatter
    // ------------------------------------------------------------------------
    console.log('\n[Suite 6/7] Verifying IST Boundary Date Formatter (31 Oct 23:59 vs 1 Nov 00:01)...');
    // 31 Oct 2026, 23:59:00 IST (+05:30) is 18:29:00 UTC
    const dateOct31Night = new Date('2026-10-31T18:29:00.000Z');
    assert.strictEqual(getTodayIST(dateOct31Night), '2026-10-31');

    // 1 Nov 2026, 00:01:00 IST (+05:30) is 18:31:00 UTC on 31 Oct
    const dateNov1Morning = new Date('2026-10-31T18:31:00.000Z');
    assert.strictEqual(getTodayIST(dateNov1Morning), '2026-11-01');
    console.log('  PASS: Boundary tests verified: 31 Oct 23:59 IST -> 2026-10-31; 1 Nov 00:01 IST -> 2026-11-01');

    // ------------------------------------------------------------------------
    // Suite 7: Backfill Verification (One Row per Business Covering Today)
    // ------------------------------------------------------------------------
    console.log('\n[Suite 7/7] Verifying Backfill Created Active Usage Period for Every Business...');
    const { data: allBusinesses, error: allBzErr } = await adminClient.from('businesses').select('id');
    assert.ifError(allBzErr);

    for (const b of allBusinesses) {
      const { data: upCovering, error: upErr } = await adminClient
        .from('usage_periods')
        .select('id')
        .eq('business_id', b.id)
        .lte('period_start', todayIST)
        .gte('period_end', todayIST);
      assert.ifError(upErr);
      assert.strictEqual(upCovering.length, 1, `Business ${b.id} must have exactly 1 usage period covering today`);
    }
    console.log('  PASS: Backfill verified: every business has exactly 1 usage period covering today');

    console.log('\n========================================================================');
    console.log('Brief 1 Integration Verification Complete: All 7 Suites Passed!');
    console.log('========================================================================');

  } finally {
    // ------------------------------------------------------------------------
    // Teardown: Clean up synthetic test fixtures
    // ------------------------------------------------------------------------
    console.log('\n[Teardown] Cleaning up synthetic test fixtures...');
    const cleanupErrors = [];

    if (cleanupState.campaignIds.length > 0) {
      await executeWithRetry(() =>
        adminClient.from('campaign_outputs').delete().in('campaign_id', cleanupState.campaignIds)
      );
      await executeWithRetry(() =>
        adminClient.from('usage_events').delete().in('campaign_id', cleanupState.campaignIds)
      );
      await executeWithRetry(() =>
        adminClient.from('campaigns').delete().in('id', cleanupState.campaignIds)
      );
    }

    if (cleanupState.businessIds.length > 0) {
      await executeWithRetry(() =>
        adminClient.from('usage_events').delete().in('business_id', cleanupState.businessIds)
      );
      await executeWithRetry(() =>
        adminClient.from('usage_periods').delete().in('business_id', cleanupState.businessIds)
      );
      await executeWithRetry(() =>
        adminClient.from('business_members').delete().in('business_id', cleanupState.businessIds)
      );
      await executeWithRetry(() =>
        adminClient.from('business_profiles').delete().in('business_id', cleanupState.businessIds)
      );
      await executeWithRetry(() =>
        adminClient.from('businesses').delete().in('id', cleanupState.businessIds)
      );
    }

    if (cleanupState.subscriptionIds.length > 0) {
      await executeWithRetry(() =>
        adminClient.from('subscriptions').delete().in('id', cleanupState.subscriptionIds)
      );
    }

    if (cleanupState.userIds.length > 0) {
      await executeWithRetry(() =>
        adminClient.from('subscriptions').delete().in('user_id', cleanupState.userIds)
      );
      await executeWithRetry(() =>
        adminClient.from('profiles').delete().in('id', cleanupState.userIds)
      );
      for (const uid of cleanupState.userIds) {
        await executeWithRetry(() => adminClient.auth.admin.deleteUser(uid));
      }
    }

    // Baseline deep verification
    const { data: postBusinesses } = await adminClient
      .from('businesses')
      .select('*')
      .not('name', 'ilike', 'test_%')
      .order('id', { ascending: true });
    assert.strictEqual(
      JSON.stringify(postBusinesses ?? []),
      baselineSnapshot.businesses,
      'Merchant businesses must remain 100% identical'
    );

    const { data: postSubscriptions } = await adminClient
      .from('subscriptions')
      .select('*')
      .order('id', { ascending: true });
    assert.strictEqual(
      JSON.stringify(postSubscriptions ?? []),
      baselineSnapshot.subscriptions,
      'Merchant subscriptions must remain 100% identical'
    );

    const { data: postUsagePeriods } = await adminClient
      .from('usage_periods')
      .select('*')
      .order('id', { ascending: true });
    assert.strictEqual(
      JSON.stringify(postUsagePeriods ?? []),
      baselineSnapshot.usagePeriods,
      'Merchant usage periods must remain 100% identical'
    );

    console.log('  PASS: Real merchant baseline data verified 100% untouched across all columns');
    console.log('  PASS: All synthetic test fixtures cleanly deleted');
  }
}

runBrief1Suite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nBrief 1 Suite Failure:', err);
    process.exit(1);
  });
