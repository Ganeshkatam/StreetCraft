import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert';
import crypto from 'node:crypto';

/**
 * StreetCraft — Phase 4 Database Integration Test Runner
 *
 * Safe Execution Guarantee:
 * Strictly disallows running integration mutations against the production project (iodwiyfjwzdvqtrczttb).
 * Requires explicit target identity verification and disposable confirmation:
 *   - For remote cloud targets (*.supabase.co):
 *       SUPABASE_INTEGRATION_URL
 *       SUPABASE_INTEGRATION_SERVICE_KEY
 *       SUPABASE_INTEGRATION_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *       SUPABASE_INTEGRATION_PROJECT_REF (must match targetUrl project ref)
 *       CONFIRM_ISOLATED_TEST_DATABASE=true
 *   - For local targets (localhost / 127.0.0.1):
 *       ALLOW_LOCAL_TEST_TARGET=true or CONFIRM_ISOLATED_TEST_DATABASE=true
 *
 * Exits with code 2 on missing credentials or unverified target identity to prevent false-green reporting in CI.
 *
 * Verifies real PostgreSQL transactional and concurrency behaviors:
 * 1. Authorization boundaries on privileged RPCs (service_role vs anon/authenticated).
 * 2. Authenticated user context and cross-business isolation in save_campaign_atomically.
 * 3. Concurrent transaction race conditions across independent database connections:
 *    - Identical generation_request_id concurrency (row-lock & unique-violation rollback).
 *    - Distinct generation_request_id concurrency near quota limit (QUOTA_EXHAUSTED race).
 * 4. Multi-store entitlement propagation and audit events across persisted rows.
 * 5. Subscription cancellation scheduling via request_subscription_cancellation RPC.
 * 6. Fail-closed webhook ingestion, error tracking, and expired subscription downgrades matching SQL contracts.
 * 7. Guaranteed synthetic fixture teardown with early campaign registration, strict query error handling, and post-run residual sweep.
 */

const PRODUCTION_PROJECT_REF = 'iodwiyfjwzdvqtrczttb';

const targetUrl = process.env.SUPABASE_INTEGRATION_URL;
const serviceKey = process.env.SUPABASE_INTEGRATION_SERVICE_KEY;
const anonKey = process.env.SUPABASE_INTEGRATION_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- StreetCraft Phase 4 Database Integration Runner ---');

// 1. Strict Target & Credential Validation
if (!targetUrl || !serviceKey) {
  console.error('\n[Configuration Error] SUPABASE_INTEGRATION_URL and SUPABASE_INTEGRATION_SERVICE_KEY are required.');
  console.error('The live production database (ref: ' + PRODUCTION_PROJECT_REF + ') is strictly protected.');
  console.error('Integration mutations will not be executed against production.');
  console.error('\nTo execute Phase 4 integration tests safely:');
  console.error('1. Provision a dedicated Supabase staging project, development branch, or local database.');
  console.error('2. Set SUPABASE_INTEGRATION_URL, SUPABASE_INTEGRATION_SERVICE_KEY, and SUPABASE_INTEGRATION_ANON_KEY.');
  console.error('3. Set SUPABASE_INTEGRATION_PROJECT_REF matching the disposable project reference.');
  console.error('4. Confirm the disposable target by setting CONFIRM_ISOLATED_TEST_DATABASE=true.');
  console.error('5. Run: npm run test:integration\n');
  console.error('Exiting with code 2 (CONFIGURATION_REQUIRED). Refusing to report false-green when tests did not run.\n');
  process.exit(2);
}

// 2. Anonymous Key Validation (required for testing unprivileged and authenticated user contexts)
if (!anonKey) {
  console.error('\n[Configuration Error] SUPABASE_INTEGRATION_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) is required.');
  console.error('An anonymous key is required to test unprivileged RPC boundaries and authenticated user sessions.');
  console.error('Exiting with code 2 (CONFIGURATION_REQUIRED).\n');
  process.exit(2);
}

function extractProjectRef(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    if (hostname.endsWith('.supabase.co')) {
      return hostname.split('.')[0];
    }
    return hostname;
  } catch {
    return 'unknown';
  }
}

const targetRef = extractProjectRef(targetUrl);

// Strict Production Project Disallowance
if (targetUrl.includes(PRODUCTION_PROJECT_REF) || targetRef === PRODUCTION_PROJECT_REF) {
  console.error('\nSAFETY VIOLATION: Target URL matches production project ref (' + PRODUCTION_PROJECT_REF + ').');
  console.error('Integration tests must never execute against the live production database.');
  console.error('Please configure SUPABASE_INTEGRATION_URL pointing to an isolated staging or dev database.\n');
  process.exit(1);
}

// 3. Isolated Target Identity Verification
const isLocalTarget = targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1');

if (isLocalTarget) {
  const isLocalConfirmed = process.env.ALLOW_LOCAL_TEST_TARGET === 'true' || process.env.CONFIRM_ISOLATED_TEST_DATABASE === 'true';
  if (!isLocalConfirmed) {
    console.error('\n[Target Validation] Local target detected but unconfirmed.');
    console.error('To run against a local disposable container, set:');
    console.error('  ALLOW_LOCAL_TEST_TARGET=true or CONFIRM_ISOLATED_TEST_DATABASE=true\n');
    process.exit(2);
  }
  console.log('Target database URL:', targetUrl.replace(/:\/\/.*@/, '://***@'));
  console.log('Target classification: LOCAL DISPOSABLE TEST INSTANCE');
} else {
  // Remote cloud target: require explicit identity verification against expected project ref
  const expectedProjectRef = process.env.SUPABASE_INTEGRATION_PROJECT_REF;
  const isConfirmed = process.env.CONFIRM_ISOLATED_TEST_DATABASE === 'true';

  if (!expectedProjectRef) {
    console.error(`\n[Target Validation] Remote cloud target detected with project ref '${targetRef}'.`);
    console.error('Target identity verification requires explicitly providing the expected disposable project ref:');
    console.error(`  SUPABASE_INTEGRATION_PROJECT_REF=${targetRef}`);
    console.error('  CONFIRM_ISOLATED_TEST_DATABASE=true\n');
    process.exit(2);
  }

  if (expectedProjectRef !== targetRef) {
    console.error(`\n[Target Validation] Target project ref mismatch!`);
    console.error(`  URL project ref:      '${targetRef}'`);
    console.error(`  Expected project ref: '${expectedProjectRef}'`);
    console.error('Refusing execution against an unverified target identity.\n');
    process.exit(2);
  }

  if (!isConfirmed) {
    console.error(`\n[Target Validation] Project ref '${targetRef}' verified, but explicit disposable confirmation is missing.`);
    console.error('Please set: CONFIRM_ISOLATED_TEST_DATABASE=true\n');
    process.exit(2);
  }

  console.log('Target database URL:', targetUrl.replace(/:\/\/.*@/, '://***@'));
  console.log('Target project ref:', targetRef);
  console.log('Target classification: VERIFIED DISPOSABLE TEST PROJECT (IDENTITY MATCHED)');
}

// Privileged admin client with service_role key
const adminClient = createClient(targetUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const runId = crypto.randomBytes(4).toString('hex');
const FIXTURE_PREFIX = `test_p4_${runId}`;

// State tracking for deterministic fixture cleanup
const cleanupState = {
  userIds: [],
  businessIds: [],
  campaignIds: [],
  providerEventIds: [],
};

// Fixture helpers
function samplePayload(suffix = '') {
  return {
    google: { title: `Google Promo ${suffix}`, description: 'Best deals in town', call_to_action: 'Visit today' },
    instagram: { caption: `Instagram Special ${suffix}`, hashtags: ['#sale', '#local'] },
    whatsapp: { message: `WhatsApp Announcement ${suffix}` },
    poster: { headline: `Poster Deal ${suffix}`, theme: 'bold' },
  };
}

async function runIntegrationSuite() {
  let passedSuites = 0;
  const totalSuites = 6;

  try {
    // ------------------------------------------------------------------------
    // Authoritative Plan Parameter Resolution
    // ------------------------------------------------------------------------
    console.log('\n[Setup] Querying authoritative plan records from public.plans...');
    const { data: plansData, error: plansErr } = await adminClient
      .from('plans')
      .select('id, name, monthly_campaign_limit, business_limit, active');
    assert.ifError(plansErr);
    assert.ok(plansData && plansData.length > 0, 'public.plans must contain plan records');

    const proPlan = plansData.find((p) => p.id === 'PRO');
    assert.ok(proPlan, 'PRO plan must exist in public.plans');
    const expectedProLimit = proPlan.monthly_campaign_limit;
    console.log(`  Authoritative PRO plan: monthly_campaign_limit = ${expectedProLimit}, business_limit = ${proPlan.business_limit}`);

    // ------------------------------------------------------------------------
    // Suite 1: Privileged RPC Authorization Boundaries
    // ------------------------------------------------------------------------
    console.log('\n[Suite 1/6] Verifying RPC Authorization Boundaries in PostgreSQL...');
    const unprivilegedAnonClient = createClient(targetUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1a. confirm_payment_and_activate_subscription must reject unprivileged anon callers
    const { error: anonPayError } = await unprivilegedAnonClient.rpc('confirm_payment_and_activate_subscription', {
      p_payment_provider: 'razorpay',
      p_payment_id: `${FIXTURE_PREFIX}_pay_anon`,
      p_order_id: `${FIXTURE_PREFIX}_order_anon`,
      p_plan_id: 'PRO',
      p_billing_cycle: 'monthly',
      p_user_id: crypto.randomUUID(),
      p_amount_paise: 39900,
    });
    assert.ok(anonPayError, 'confirm_payment_and_activate_subscription MUST reject anon callers');
    assert.match(
      anonPayError.message.toLowerCase(),
      /permission denied|function public\.confirm_payment_and_activate_subscription/i,
      'Error must be permission denied'
    );
    console.log('  PASS: confirm_payment_and_activate_subscription rejected unprivileged caller');

    // 1b. reconcile_provider_event must reject unprivileged anon callers
    const { error: anonReconError } = await unprivilegedAnonClient.rpc('reconcile_provider_event', {
      p_provider: 'razorpay',
      p_provider_event_id: `${FIXTURE_PREFIX}_evt_anon`,
      p_event_type: 'order.paid',
      p_payload: {},
    });
    assert.ok(anonReconError, 'reconcile_provider_event MUST reject anon callers');
    assert.match(
      anonReconError.message.toLowerCase(),
      /permission denied|function public\.reconcile_provider_event/i,
      'Error must be permission denied'
    );
    console.log('  PASS: reconcile_provider_event rejected unprivileged caller');

    // 1c. save_campaign_atomically must reject unauthenticated callers
    const { error: anonSaveError } = await unprivilegedAnonClient.rpc('save_campaign_atomically', {
      p_business_id: crypto.randomUUID(),
      p_campaign_type: 'FESTIVAL',
      p_objective: 'AWARENESS',
      p_audience: 'Local',
      p_offer: {},
      p_schedule: {},
      p_google_content: { text: 'test' },
      p_instagram_content: { text: 'test' },
      p_whatsapp_content: { text: 'test' },
      p_poster_content: { text: 'test' },
    });
    assert.ok(anonSaveError, 'save_campaign_atomically MUST reject unauthenticated callers');
    assert.match(anonSaveError.message, /UNAUTHORIZED|permission denied/i);
    console.log('  PASS: save_campaign_atomically rejected unauthenticated caller');
    passedSuites++;

    // ------------------------------------------------------------------------
    // Suite 2: PostgreSQL Financial Validation & Fail-Closed Webhooks
    // ------------------------------------------------------------------------
    console.log('\n[Suite 2/6] Verifying PostgreSQL Financial Integrity & Webhook Fail-Closed Ingestion...');
    
    // 2a. Underpayment rejection in confirm_payment_and_activate_subscription
    const { error: underpaymentError } = await adminClient.rpc('confirm_payment_and_activate_subscription', {
      p_payment_provider: 'razorpay',
      p_payment_id: `${FIXTURE_PREFIX}_pay_underpay`,
      p_order_id: `${FIXTURE_PREFIX}_order_underpay`,
      p_plan_id: 'PRO',
      p_billing_cycle: 'monthly',
      p_user_id: crypto.randomUUID(),
      p_amount_paise: 100, // 1 INR instead of 399 INR
    });
    assert.ok(underpaymentError, 'RPC must reject underpayment');
    assert.match(underpaymentError.message, /AMOUNT_MISMATCH/, 'Must return AMOUNT_MISMATCH error');
    console.log('  PASS: RPC rejected underpayment with AMOUNT_MISMATCH');

    // 2b. Null/invalid amount rejection
    const { error: nullAmountError } = await adminClient.rpc('confirm_payment_and_activate_subscription', {
      p_payment_provider: 'razorpay',
      p_payment_id: `${FIXTURE_PREFIX}_pay_null`,
      p_order_id: `${FIXTURE_PREFIX}_order_null`,
      p_plan_id: 'PRO',
      p_billing_cycle: 'monthly',
      p_user_id: crypto.randomUUID(),
      p_amount_paise: null,
    });
    assert.ok(nullAmountError, 'RPC must reject null amount');
    assert.match(nullAmountError.message, /INVALID_AMOUNT/, 'Must return INVALID_AMOUNT error');
    console.log('  PASS: RPC rejected null amount with INVALID_AMOUNT');

    // 2c. Webhook missing order entity
    const invalidEventId = `${FIXTURE_PREFIX}_evt_no_order`;
    cleanupState.providerEventIds.push(invalidEventId);

    const { error: missingOrderError } = await adminClient.rpc('reconcile_provider_event', {
      p_provider: 'razorpay',
      p_provider_event_id: invalidEventId,
      p_event_type: 'order.paid',
      p_payload: {
        payload: {
          payment: { entity: { id: 'pay_1', amount: 39900, currency: 'INR', status: 'captured' } },
        },
      },
    });
    assert.ok(missingOrderError, 'Must reject webhook without order entity');
    assert.match(missingOrderError.message, /SECURITY_VIOLATION.*mandatory order entity/i);
    console.log('  PASS: PostgreSQL rejected webhook missing order entity with SECURITY_VIOLATION');

    // 2d. Check failed event row was persisted in public.provider_events
    const { data: failedEventRow, error: fetchFailedEventErr } = await adminClient
      .from('provider_events')
      .select('status, attempt_count, error_message')
      .eq('provider_event_id', invalidEventId)
      .single();

    assert.ifError(fetchFailedEventErr);
    assert.ok(failedEventRow, 'Failed event must be recorded for auditability');
    assert.strictEqual(failedEventRow.status, 'FAILED');
    assert.strictEqual(failedEventRow.attempt_count, 1);
    assert.match(failedEventRow.error_message, /mandatory order entity/i);
    console.log('  PASS: provider_events stored failed event record with attempt_count=1');
    passedSuites++;

    // ------------------------------------------------------------------------
    // Synthetic Fixture Provisioning for Isolation
    // ------------------------------------------------------------------------
    console.log('\n[Provisioning] Creating isolated synthetic fixtures for concurrency & lifecycle tests...');
    const userAPassword = `SecTest_${crypto.randomBytes(8).toString('hex')}!`;
    const userAEmail = `${FIXTURE_PREFIX}_merchant_a@internal.streetcraft.test`;

    const { data: userACreated, error: userAError } = await adminClient.auth.admin.createUser({
      email: userAEmail,
      password: userAPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Merchant Test A' },
    });
    if (userAError || !userACreated?.user?.id) {
      throw new Error(`Failed to create synthetic user A: ${userAError?.message}`);
    }
    const userAId = userACreated.user.id;
    cleanupState.userIds.push(userAId);

    // Profile record for user A
    const { error: profileAErr } = await adminClient.from('profiles').upsert({
      id: userAId,
      full_name: 'Merchant Test A',
      phone: '+919999999901',
      notification_preferences: {},
    });
    if (profileAErr) throw new Error(`Profile A upsert failed: ${profileAErr.message}`);

    // Synthetic Store A1 (Primary)
    const storeA1Id = crypto.randomUUID();
    cleanupState.businessIds.push(storeA1Id);
    const { error: storeA1Err } = await adminClient.from('businesses').insert({
      id: storeA1Id,
      name: `${FIXTURE_PREFIX} Cafe 1`,
      category: 'Cafe',
      timezone: 'Asia/Kolkata',
    });
    if (storeA1Err) throw new Error(`Store A1 insert failed: ${storeA1Err.message}`);

    const { error: memberA1Err } = await adminClient.from('business_members').insert({
      business_id: storeA1Id,
      user_id: userAId,
      role: 'owner',
    });
    if (memberA1Err) throw new Error(`Member A1 insert failed: ${memberA1Err.message}`);

    const periodStart = new Date().toISOString().slice(0, 10);
    const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    const { error: usageA1Err } = await adminClient.from('usage_periods').insert({
      business_id: storeA1Id,
      period_start: periodStart,
      period_end: periodEnd,
      plan: 'FREE',
      campaign_limit: 3,
      campaigns_used: 0,
    });
    if (usageA1Err) throw new Error(`Usage A1 insert failed: ${usageA1Err.message}`);

    // Synthetic Store A2 (Secondary store owned by User A to test multi-store entitlement propagation)
    const storeA2Id = crypto.randomUUID();
    cleanupState.businessIds.push(storeA2Id);
    const { error: storeA2Err } = await adminClient.from('businesses').insert({
      id: storeA2Id,
      name: `${FIXTURE_PREFIX} Bakery 2`,
      category: 'Bakery',
      timezone: 'Asia/Kolkata',
    });
    if (storeA2Err) throw new Error(`Store A2 insert failed: ${storeA2Err.message}`);

    const { error: memberA2Err } = await adminClient.from('business_members').insert({
      business_id: storeA2Id,
      user_id: userAId,
      role: 'owner',
    });
    if (memberA2Err) throw new Error(`Member A2 insert failed: ${memberA2Err.message}`);

    const { error: usageA2Err } = await adminClient.from('usage_periods').insert({
      business_id: storeA2Id,
      period_start: periodStart,
      period_end: periodEnd,
      plan: 'FREE',
      campaign_limit: 3,
      campaigns_used: 0,
    });
    if (usageA2Err) throw new Error(`Usage A2 insert failed: ${usageA2Err.message}`);

    // Synthetic User B (Unrelated merchant to test cross-tenant isolation)
    const userBPassword = `SecTest_${crypto.randomBytes(8).toString('hex')}!`;
    const userBEmail = `${FIXTURE_PREFIX}_merchant_b@internal.streetcraft.test`;
    const { data: userBCreated, error: userBError } = await adminClient.auth.admin.createUser({
      email: userBEmail,
      password: userBPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Merchant Test B' },
    });
    if (userBError || !userBCreated?.user?.id) {
      throw new Error(`Failed to create synthetic user B: ${userBError?.message}`);
    }
    const userBId = userBCreated.user.id;
    cleanupState.userIds.push(userBId);

    const { error: profileBErr } = await adminClient.from('profiles').upsert({
      id: userBId,
      full_name: 'Merchant Test B',
      phone: '+919999999902',
      notification_preferences: {},
    });
    if (profileBErr) throw new Error(`Profile B upsert failed: ${profileBErr.message}`);

    console.log('  PASS: Synthetic accounts and stores provisioned in isolated sandbox');

    // Create independent authenticated clients
    const clientA_conn1 = createClient(targetUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: loginA1Err } = await clientA_conn1.auth.signInWithPassword({
      email: userAEmail,
      password: userAPassword,
    });
    assert.ifError(loginA1Err);

    const clientA_conn2 = createClient(targetUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: loginA2Err } = await clientA_conn2.auth.signInWithPassword({
      email: userAEmail,
      password: userAPassword,
    });
    assert.ifError(loginA2Err);

    const clientB_conn = createClient(targetUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: loginBErr } = await clientB_conn.auth.signInWithPassword({
      email: userBEmail,
      password: userBPassword,
    });
    assert.ifError(loginBErr);

    // ------------------------------------------------------------------------
    // Suite 3: Cross-Tenant Business Membership Security
    // ------------------------------------------------------------------------
    console.log('\n[Suite 3/6] Verifying Cross-Tenant Business Isolation in save_campaign_atomically...');
    const payloadA = samplePayload('Cross Tenant');
    const { error: crossTenantErr } = await clientB_conn.rpc('save_campaign_atomically', {
      p_business_id: storeA1Id, // Store owned by User A
      p_campaign_type: 'FESTIVAL',
      p_objective: 'SALES',
      p_audience: 'Local Shoppers',
      p_offer: { discount: '10%' },
      p_schedule: { start: periodStart },
      p_google_content: payloadA.google,
      p_instagram_content: payloadA.instagram,
      p_whatsapp_content: payloadA.whatsapp,
      p_poster_content: payloadA.poster,
    });

    assert.ok(crossTenantErr, 'Cross-tenant campaign creation must be rejected');
    assert.match(crossTenantErr.message, /UNAUTHORIZED: User is not a member of this business/i);
    console.log('  PASS: Foreign business campaign persistence rejected with UNAUTHORIZED membership error');
    passedSuites++;

    // ------------------------------------------------------------------------
    // Suite 4: Concurrent Transactions with Identical generation_request_id
    // ------------------------------------------------------------------------
    console.log('\n[Suite 4/6] Testing Concurrent Transaction Race with Identical generation_request_id...');
    const identicalReqId = crypto.randomUUID();
    const payloadRace = samplePayload('Identical Race');

    // Dispatch two competing requests simultaneously over independent database sessions
    const [res1, res2] = await Promise.all([
      clientA_conn1.rpc('save_campaign_atomically', {
        p_business_id: storeA1Id,
        p_campaign_type: 'FESTIVAL',
        p_objective: 'SALES',
        p_audience: 'Race Audience',
        p_offer: { discount: '15%' },
        p_schedule: { start: periodStart },
        p_google_content: payloadRace.google,
        p_instagram_content: payloadRace.instagram,
        p_whatsapp_content: payloadRace.whatsapp,
        p_poster_content: payloadRace.poster,
        p_generation_request_id: identicalReqId,
      }),
      clientA_conn2.rpc('save_campaign_atomically', {
        p_business_id: storeA1Id,
        p_campaign_type: 'FESTIVAL',
        p_objective: 'SALES',
        p_audience: 'Race Audience',
        p_offer: { discount: '15%' },
        p_schedule: { start: periodStart },
        p_google_content: payloadRace.google,
        p_instagram_content: payloadRace.instagram,
        p_whatsapp_content: payloadRace.whatsapp,
        p_poster_content: payloadRace.poster,
        p_generation_request_id: identicalReqId,
      }),
    ]);

    // Immediately register returned campaign IDs before any assertion that may throw
    if (res1?.data?.campaign_id && !cleanupState.campaignIds.includes(res1.data.campaign_id)) {
      cleanupState.campaignIds.push(res1.data.campaign_id);
    }
    if (res2?.data?.campaign_id && !cleanupState.campaignIds.includes(res2.data.campaign_id)) {
      cleanupState.campaignIds.push(res2.data.campaign_id);
    }

    assert.ifError(res1.error);
    assert.ifError(res2.error);

    const campaignId1 = res1.data.campaign_id;
    const campaignId2 = res2.data.campaign_id;
    assert.strictEqual(campaignId1, campaignId2, 'Both concurrent calls must return the identical campaign ID');

    const hasReplay = res1.data.idempotent_replay === true || res2.data.idempotent_replay === true;
    assert.ok(hasReplay, 'At least one concurrent branch must acknowledge idempotent replay');

    // Assert that exactly one campaign row was persisted in PostgreSQL
    const { count: campaignCount, error: countErr } = await adminClient
      .from('campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('generation_request_id', identicalReqId);
    assert.ifError(countErr);
    assert.strictEqual(campaignCount, 1, 'Exactly one campaign row must exist for the generation_request_id');

    // Assert quota was deducted exactly once (campaigns_used == 1, not 2)
    const { data: periodRow1, error: p1Err } = await adminClient
      .from('usage_periods')
      .select('campaigns_used')
      .eq('business_id', storeA1Id)
      .single();
    assert.ifError(p1Err);
    assert.strictEqual(periodRow1.campaigns_used, 1, 'Quota must be deducted exactly once despite concurrent race');
    console.log('  PASS: Concurrent identical request race resolved idempotently without double quota deduction');
    passedSuites++;

    // ------------------------------------------------------------------------
    // Suite 5: Concurrent Requests Near Quota Boundary (Lock Contention)
    // ------------------------------------------------------------------------
    console.log('\n[Suite 5/6] Testing Concurrent Transaction Race Near Quota Boundary...');
    // Set campaigns_used to 2 (limit is 3, exactly 1 slot remaining)
    const { error: updateBoundaryErr } = await adminClient
      .from('usage_periods')
      .update({ campaigns_used: 2 })
      .eq('business_id', storeA1Id);
    assert.ifError(updateBoundaryErr);

    const reqIdSlotA = crypto.randomUUID();
    const reqIdSlotB = crypto.randomUUID();
    const payloadSlotA = samplePayload('Slot A');
    const payloadSlotB = samplePayload('Slot B');

    // Fire 2 concurrent requests for the single available slot
    const [raceA, raceB] = await Promise.allSettled([
      clientA_conn1.rpc('save_campaign_atomically', {
        p_business_id: storeA1Id,
        p_campaign_type: 'FESTIVAL',
        p_objective: 'SALES',
        p_audience: 'Slot A',
        p_offer: {},
        p_schedule: {},
        p_google_content: payloadSlotA.google,
        p_instagram_content: payloadSlotA.instagram,
        p_whatsapp_content: payloadSlotA.whatsapp,
        p_poster_content: payloadSlotA.poster,
        p_generation_request_id: reqIdSlotA,
      }),
      clientA_conn2.rpc('save_campaign_atomically', {
        p_business_id: storeA1Id,
        p_campaign_type: 'FESTIVAL',
        p_objective: 'SALES',
        p_audience: 'Slot B',
        p_offer: {},
        p_schedule: {},
        p_google_content: payloadSlotB.google,
        p_instagram_content: payloadSlotB.instagram,
        p_whatsapp_content: payloadSlotB.whatsapp,
        p_poster_content: payloadSlotB.poster,
        p_generation_request_id: reqIdSlotB,
      }),
    ]);

    const resAValue = raceA.status === 'fulfilled' ? raceA.value : null;
    const resBValue = raceB.status === 'fulfilled' ? raceB.value : null;

    // Register any created campaign IDs immediately before assertions that might throw
    if (resAValue?.data?.campaign_id && !cleanupState.campaignIds.includes(resAValue.data.campaign_id)) {
      cleanupState.campaignIds.push(resAValue.data.campaign_id);
    }
    if (resBValue?.data?.campaign_id && !cleanupState.campaignIds.includes(resBValue.data.campaign_id)) {
      cleanupState.campaignIds.push(resBValue.data.campaign_id);
    }

    const aSucceeded = !resAValue?.error && resAValue?.data?.campaign_id;
    const bSucceeded = !resBValue?.error && resBValue?.data?.campaign_id;

    assert.ok(
      (aSucceeded && !bSucceeded) || (!aSucceeded && bSucceeded),
      'Exactly one concurrent caller must win the remaining quota slot'
    );

    const winningCampaignId = aSucceeded ? resAValue.data.campaign_id : resBValue.data.campaign_id;
    assert.ok(winningCampaignId);

    const losingError = aSucceeded ? resBValue.error : resAValue.error;
    assert.match(
      losingError.message,
      /QUOTA_EXHAUSTED/,
      'The losing concurrent caller must be rejected with QUOTA_EXHAUSTED'
    );

    // Verify usage_periods campaigns_used reached exactly 3 (no overrun)
    const { data: periodRowBoundary, error: pBoundaryErr } = await adminClient
      .from('usage_periods')
      .select('campaigns_used, campaign_limit')
      .eq('business_id', storeA1Id)
      .single();
    assert.ifError(pBoundaryErr);
    assert.strictEqual(periodRowBoundary.campaigns_used, 3, 'campaigns_used must cap strictly at limit');
    assert.strictEqual(periodRowBoundary.campaign_limit, 3);
    console.log('  PASS: Row-level lock strictly guarded quota limit: 1 winner, 1 QUOTA_EXHAUSTED rejection');
    passedSuites++;

    // ------------------------------------------------------------------------
    // Suite 6: Multi-Store Entitlement Upgrades, Cancellation, & Expired Transitions
    // ------------------------------------------------------------------------
    console.log('\n[Suite 6/6] Verifying Multi-Store Entitlement Lifecycle & Audit Trails...');

    // 6a. Activate PRO plan for User A (who owns Store A1 and Store A2)
    const activationPaymentId = `${FIXTURE_PREFIX}_pay_act`;
    const activationOrderId = `${FIXTURE_PREFIX}_order_act`;
    const { error: actError } = await adminClient.rpc('confirm_payment_and_activate_subscription', {
      p_payment_provider: 'razorpay',
      p_payment_id: activationPaymentId,
      p_order_id: activationOrderId,
      p_plan_id: 'PRO',
      p_billing_cycle: 'monthly',
      p_user_id: userAId,
      p_amount_paise: 39900,
    });
    assert.ifError(actError);

    // Verify subscription row in subscriptions table
    const { data: activeSub, error: subFetchErr } = await adminClient
      .from('subscriptions')
      .select('id, plan_id, status, cancel_at_period_end, provider_subscription_id, current_period_end')
      .eq('user_id', userAId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    assert.ifError(subFetchErr);
    assert.ok(activeSub, 'Active subscription must exist for User A');
    assert.strictEqual(activeSub.plan_id, 'PRO');
    assert.strictEqual(activeSub.status, 'ACTIVE');
    assert.strictEqual(activeSub.cancel_at_period_end, false);
    assert.strictEqual(activeSub.provider_subscription_id, activationPaymentId);

    // Verify multi-store entitlement upgrade: BOTH Store A1 and Store A2 must have limit = expectedProLimit
    const { data: storeA1Usage, error: uA1Err } = await adminClient
      .from('usage_periods')
      .select('plan, campaign_limit')
      .eq('business_id', storeA1Id)
      .single();
    assert.ifError(uA1Err);
    assert.strictEqual(storeA1Usage.plan, 'PRO');
    assert.strictEqual(storeA1Usage.campaign_limit, expectedProLimit);

    const { data: storeA2Usage, error: uA2Err } = await adminClient
      .from('usage_periods')
      .select('plan, campaign_limit')
      .eq('business_id', storeA2Id)
      .single();
    assert.ifError(uA2Err);
    assert.strictEqual(storeA2Usage.plan, 'PRO');
    assert.strictEqual(storeA2Usage.campaign_limit, expectedProLimit);

    // Verify audit event SUBSCRIPTION_ACTIVATED
    const { data: auditEvents, error: auditErr } = await adminClient
      .from('usage_events')
      .select('event_type, business_id')
      .eq('user_id', userAId)
      .eq('event_type', 'SUBSCRIPTION_ACTIVATED');
    assert.ifError(auditErr);
    assert.ok(auditEvents.length >= 2, 'Audit events must record SUBSCRIPTION_ACTIVATED for each owned store');
    console.log(`  PASS: Multi-store entitlement upgrade propagated to both stores (limit ${expectedProLimit}) with audit events`);

    // 6b. Request cancellation at period end via authenticated client
    const cancelReason = 'Automated Phase 4 Lifecycle Test';
    const { data: cancelRes, error: cancelErr } = await clientA_conn1.rpc('request_subscription_cancellation', {
      p_subscription_id: activeSub.id,
      p_reason: cancelReason,
    });
    assert.ifError(cancelErr);
    assert.strictEqual(cancelRes.success, true);
    assert.strictEqual(cancelRes.cancel_at_period_end, true);

    const { data: cancelledSub, error: subCancelFetchErr } = await adminClient
      .from('subscriptions')
      .select('cancel_at_period_end, cancellation_reason')
      .eq('id', activeSub.id)
      .single();
    assert.ifError(subCancelFetchErr);
    assert.strictEqual(cancelledSub.cancel_at_period_end, true);
    assert.strictEqual(cancelledSub.cancellation_reason, cancelReason);

    const { data: cancelAudit, error: cancelAuditErr } = await adminClient
      .from('usage_events')
      .select('event_type, description')
      .eq('user_id', userAId)
      .eq('event_type', 'SUBSCRIPTION_CANCEL_REQUESTED');
    assert.ifError(cancelAuditErr);
    assert.ok(cancelAudit.length >= 1, 'Audit log must record SUBSCRIPTION_CANCEL_REQUESTED');
    console.log('  PASS: Cancellation scheduled at period end with audit trail preserved');

    // 6c. Expired subscription transition via webhook reconciliation
    // In PostgreSQL reconcile_provider_event:
    // - Looks up subscription by provider_subscription_id = v_sub_id (which is activeSub.provider_subscription_id)
    // - If current_period_end < CURRENT_DATE, sets status = 'CANCELLED' (downgrades usage_periods to Free limit 3, emits SUBSCRIPTION_ENTITLEMENT_ENDED)
    // Provision expired current_period_end on activeSub to exercise this contract:
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const { error: setExpiredPeriodErr } = await adminClient
      .from('subscriptions')
      .update({ current_period_end: yesterdayDate })
      .eq('id', activeSub.id);
    assert.ifError(setExpiredPeriodErr);

    const expiredSubEventId = `${FIXTURE_PREFIX}_evt_expired`;
    cleanupState.providerEventIds.push(expiredSubEventId);

    const { error: expiryReconErr } = await adminClient.rpc('reconcile_provider_event', {
      p_provider: 'razorpay',
      p_provider_event_id: expiredSubEventId,
      p_event_type: 'subscription.cancelled',
      p_payload: {
        payload: {
          subscription: {
            entity: {
              id: activeSub.provider_subscription_id,
            },
          },
        },
      },
    });
    assert.ifError(expiryReconErr);

    // Verify subscription status matches SQL contract: CANCELLED
    const { data: expiredSub, error: fetchExpSubErr } = await adminClient
      .from('subscriptions')
      .select('status, cancel_at_period_end')
      .eq('id', activeSub.id)
      .single();
    assert.ifError(fetchExpSubErr);
    assert.strictEqual(expiredSub.status, 'CANCELLED');
    assert.strictEqual(expiredSub.cancel_at_period_end, true);

    // Verify usage periods downgraded to FREE with limit 3
    const { data: downgradedStore1, error: dStore1Err } = await adminClient
      .from('usage_periods')
      .select('plan, campaign_limit')
      .eq('business_id', storeA1Id)
      .single();
    assert.ifError(dStore1Err);
    assert.strictEqual(downgradedStore1.plan, 'FREE');
    assert.strictEqual(downgradedStore1.campaign_limit, 3);

    const { data: downgradedStore2, error: dStore2Err } = await adminClient
      .from('usage_periods')
      .select('plan, campaign_limit')
      .eq('business_id', storeA2Id)
      .single();
    assert.ifError(dStore2Err);
    assert.strictEqual(downgradedStore2.plan, 'FREE');
    assert.strictEqual(downgradedStore2.campaign_limit, 3);

    // Verify audit event SUBSCRIPTION_ENTITLEMENT_ENDED matches SQL contract
    const { data: downgradeAudit, error: dAuditErr } = await adminClient
      .from('usage_events')
      .select('event_type')
      .eq('user_id', userAId)
      .eq('event_type', 'SUBSCRIPTION_ENTITLEMENT_ENDED');
    assert.ifError(dAuditErr);
    assert.ok(downgradeAudit.length >= 1, 'SUBSCRIPTION_ENTITLEMENT_ENDED audit event recorded');
    console.log('  PASS: Expired subscription transitioned to CANCELLED and downgraded stores to FREE (limit 3)');
    passedSuites++;

    console.log('\n========================================================================');
    console.log(`Phase 4 Integration Suite: ${passedSuites}/${totalSuites} Suites Passed`);
    console.log('Real PostgreSQL Transaction & Concurrency Verification Complete!');
    console.log('========================================================================\n');
  } finally {
    console.log('\n[Teardown] Cleaning up isolated synthetic test fixtures...');
    const cleanupErrors = [];

    // 1. Delete campaign outputs and campaigns
    if (cleanupState.campaignIds.length > 0) {
      const { error: outErr } = await adminClient.from('campaign_outputs').delete().in('campaign_id', cleanupState.campaignIds);
      if (outErr) cleanupErrors.push(`campaign_outputs deletion error: ${outErr.message}`);
      const { error: cmpErr } = await adminClient.from('campaigns').delete().in('id', cleanupState.campaignIds);
      if (cmpErr) cleanupErrors.push(`campaigns deletion error: ${cmpErr.message}`);
    }

    // 2. Delete usage events, periods, members, profiles, businesses
    if (cleanupState.businessIds.length > 0) {
      const { error: evErr } = await adminClient.from('usage_events').delete().in('business_id', cleanupState.businessIds);
      if (evErr) cleanupErrors.push(`usage_events deletion error: ${evErr.message}`);
      const { error: upErr } = await adminClient.from('usage_periods').delete().in('business_id', cleanupState.businessIds);
      if (upErr) cleanupErrors.push(`usage_periods deletion error: ${upErr.message}`);
      const { error: bmErr } = await adminClient.from('business_members').delete().in('business_id', cleanupState.businessIds);
      if (bmErr) cleanupErrors.push(`business_members deletion error: ${bmErr.message}`);
      const { error: bpErr } = await adminClient.from('business_profiles').delete().in('business_id', cleanupState.businessIds);
      if (bpErr) cleanupErrors.push(`business_profiles deletion error: ${bpErr.message}`);
      const { error: bzErr } = await adminClient.from('businesses').delete().in('id', cleanupState.businessIds);
      if (bzErr) cleanupErrors.push(`businesses deletion error: ${bzErr.message}`);
    }

    // 3. Delete subscriptions, profiles, and auth users
    if (cleanupState.userIds.length > 0) {
      const { error: subErr } = await adminClient.from('subscriptions').delete().in('user_id', cleanupState.userIds);
      if (subErr) cleanupErrors.push(`subscriptions deletion error: ${subErr.message}`);
      const { error: prfErr } = await adminClient.from('profiles').delete().in('id', cleanupState.userIds);
      if (prfErr) cleanupErrors.push(`profiles deletion error: ${prfErr.message}`);
      for (const uid of cleanupState.userIds) {
        const { error: usrErr } = await adminClient.auth.admin.deleteUser(uid);
        if (usrErr) cleanupErrors.push(`auth user deletion error (${uid}): ${usrErr.message}`);
      }
    }

    // 4. Delete provider events
    if (cleanupState.providerEventIds.length > 0) {
      const { error: peErr } = await adminClient.from('provider_events').delete().in('provider_event_id', cleanupState.providerEventIds);
      if (peErr) cleanupErrors.push(`provider_events deletion error: ${peErr.message}`);
    }

    // 5. Post-run residual fixture sweep with explicit query error handling
    try {
      if (cleanupState.campaignIds.length > 0) {
        const { data: remainingCampaigns, error: rcErr } = await adminClient
          .from('campaigns')
          .select('id')
          .in('id', cleanupState.campaignIds);
        if (rcErr) {
          cleanupErrors.push(`Residual fixture sweep query error (campaigns): ${rcErr.message}`);
        } else if (remainingCampaigns && remainingCampaigns.length > 0) {
          cleanupErrors.push(`Residual fixture check: ${remainingCampaigns.length} campaigns still present`);
        }
      }

      if (cleanupState.businessIds.length > 0) {
        const { data: remainingBusinesses, error: rbErr } = await adminClient
          .from('businesses')
          .select('id')
          .in('id', cleanupState.businessIds);
        if (rbErr) {
          cleanupErrors.push(`Residual fixture sweep query error (businesses): ${rbErr.message}`);
        } else if (remainingBusinesses && remainingBusinesses.length > 0) {
          cleanupErrors.push(`Residual fixture check: ${remainingBusinesses.length} businesses still present`);
        }
      }

      if (cleanupState.providerEventIds.length > 0) {
        const { data: remainingEvents, error: reErr } = await adminClient
          .from('provider_events')
          .select('id')
          .in('provider_event_id', cleanupState.providerEventIds);
        if (reErr) {
          cleanupErrors.push(`Residual fixture sweep query error (provider_events): ${reErr.message}`);
        } else if (remainingEvents && remainingEvents.length > 0) {
          cleanupErrors.push(`Residual fixture check: ${remainingEvents.length} provider events still present`);
        }
      }
    } catch (sweepErr) {
      cleanupErrors.push(`Residual fixture sweep check failed: ${sweepErr.message}`);
    }

    if (cleanupErrors.length > 0) {
      console.error('  FAIL: Teardown errors encountered:');
      for (const err of cleanupErrors) {
        console.error('   -', err);
      }
      throw new Error(`Integration fixture teardown failed with ${cleanupErrors.length} errors.`);
    }

    console.log('  PASS: All synthetic fixtures cleanly deleted from PostgreSQL database; zero residual records verified');
  }
}

runIntegrationSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nIntegration Suite Failure:', err);
    process.exit(1);
  });
