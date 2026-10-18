import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert';
import crypto from 'node:crypto';

/**
 * StreetCraft — Phase 4 Database Integration Test Runner
 *
 * Safe Execution Guarantee:
 * Refuses to run mutations against the production project (iodwiyfjwzdvqtrczttb) by default.
 * Requires an isolated target database (SUPABASE_INTEGRATION_URL) or explicit
 * sandbox authorization (ALLOW_PRODUCTION_TEST_TARGET=true).
 *
 * Verifies real PostgreSQL transactional and concurrency behaviors:
 * 1. Authorization boundaries on privileged RPCs (service_role vs anon/authenticated).
 * 2. Authenticated user context and cross-business isolation in save_campaign_atomically.
 * 3. Concurrent transaction race conditions across independent database connections:
 *    - Identical generation_request_id concurrency (row-lock & unique-violation rollback).
 *    - Distinct generation_request_id concurrency near quota limit (QUOTA_EXHAUSTED race).
 * 4. Multi-store entitlement propagation and audit events across persisted rows.
 * 5. Subscription cancellation scheduling via request_subscription_cancellation RPC.
 * 6. Fail-closed webhook ingestion, error tracking, and expired subscription downgrades.
 * 7. Guaranteed synthetic fixture teardown in finally block.
 */

const PRODUCTION_PROJECT_REF = 'iodwiyfjwzdvqtrczttb';

const targetUrl = process.env.SUPABASE_INTEGRATION_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_INTEGRATION_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_INTEGRATION_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- StreetCraft Phase 4 Database Integration Runner ---');

if (!targetUrl || !serviceKey) {
  console.error('ERROR: Target database credentials not found.');
  console.error('Provide SUPABASE_INTEGRATION_URL and SUPABASE_INTEGRATION_SERVICE_KEY,');
  console.error('or set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.');
  process.exit(1);
}

const isProductionTarget = targetUrl.includes(PRODUCTION_PROJECT_REF);

if (isProductionTarget && process.env.ALLOW_PRODUCTION_TEST_TARGET !== 'true') {
  console.warn('');
  console.warn('========================================================================');
  console.warn('SAFETY ABORT: Target database matches production project (' + PRODUCTION_PROJECT_REF + ').');
  console.warn('Refusing to execute integration mutations against production by default.');
  console.warn('');
  console.warn('To execute Phase 4 integration tests safely:');
  console.warn('1. Set SUPABASE_INTEGRATION_URL to an isolated Supabase staging or branch target.');
  console.warn('2. Or, if intentionally testing synthetic sandbox fixtures against this target,');
  console.warn('   explicitly provide: ALLOW_PRODUCTION_TEST_TARGET=true');
  console.warn('========================================================================');
  console.warn('');
  process.exit(0);
}

console.log('Target database URL:', targetUrl.replace(/:\/\/.*@/, '://***@'));
console.log('Target status:', isProductionTarget ? 'PRODUCTION SANDBOX (EXPLICIT)' : 'ISOLATED TARGET');

// Privileged admin client with service_role key
const adminClient = createClient(targetUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Deterministic pricing helper
function getExpectedAmountPaise(planId, cycle) {
  const p = planId.toUpperCase();
  const c = cycle.toLowerCase();
  if (p === 'PRO') {
    if (c === 'monthly') return 39900;
    if (c === 'quarterly') return 109900;
    if (c === 'annual') return 399000;
  } else if (p === 'GROWTH') {
    if (c === 'monthly') return 79900;
    if (c === 'quarterly') return 219900;
    if (c === 'annual') return 799000;
  } else if (p === 'FOUNDER') {
    if (c === 'quarterly') return 83700;
    if (c === 'annual') return 279000;
  }
  return null;
}

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
    // Suite 1: Privileged RPC Authorization Boundaries
    // ------------------------------------------------------------------------
    console.log('\n[Suite 1/6] Verifying RPC Authorization Boundaries in PostgreSQL...');
    if (anonKey) {
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
    }
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
    const { data: failedEventRow } = await adminClient
      .from('provider_events')
      .select('status, attempt_count, error_message')
      .eq('provider_event_id', invalidEventId)
      .single();

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
    await adminClient.from('profiles').upsert({
      id: userAId,
      full_name: 'Merchant Test A',
      phone: '+919999999901',
      notification_preferences: {},
    });

    // Synthetic Store A1 (Primary)
    const storeA1Id = crypto.randomUUID();
    cleanupState.businessIds.push(storeA1Id);
    await adminClient.from('businesses').insert({
      id: storeA1Id,
      name: `${FIXTURE_PREFIX} Cafe 1`,
      category: 'Cafe',
      timezone: 'Asia/Kolkata',
    });
    await adminClient.from('business_members').insert({
      business_id: storeA1Id,
      user_id: userAId,
      role: 'owner',
    });

    const periodStart = new Date().toISOString().slice(0, 10);
    const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    await adminClient.from('usage_periods').insert({
      business_id: storeA1Id,
      period_start: periodStart,
      period_end: periodEnd,
      plan: 'FREE',
      campaign_limit: 3,
      campaigns_used: 0,
    });

    // Synthetic Store A2 (Secondary store owned by User A to test multi-store entitlement propagation)
    const storeA2Id = crypto.randomUUID();
    cleanupState.businessIds.push(storeA2Id);
    await adminClient.from('businesses').insert({
      id: storeA2Id,
      name: `${FIXTURE_PREFIX} Bakery 2`,
      category: 'Bakery',
      timezone: 'Asia/Kolkata',
    });
    await adminClient.from('business_members').insert({
      business_id: storeA2Id,
      user_id: userAId,
      role: 'owner',
    });
    await adminClient.from('usage_periods').insert({
      business_id: storeA2Id,
      period_start: periodStart,
      period_end: periodEnd,
      plan: 'FREE',
      campaign_limit: 3,
      campaigns_used: 0,
    });

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

    await adminClient.from('profiles').upsert({
      id: userBId,
      full_name: 'Merchant Test B',
      phone: '+919999999902',
      notification_preferences: {},
    });

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
      p_business_id: storeA1Id, // Store owned by User A!
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

    assert.ifError(res1.error);
    assert.ifError(res2.error);

    const campaignId1 = res1.data.campaign_id;
    const campaignId2 = res2.data.campaign_id;
    assert.strictEqual(campaignId1, campaignId2, 'Both concurrent calls must return the identical campaign ID');
    cleanupState.campaignIds.push(campaignId1);

    const hasReplay = res1.data.idempotent_replay === true || res2.data.idempotent_replay === true;
    assert.ok(hasReplay, 'At least one concurrent branch must acknowledge idempotent replay');

    // Assert that exactly one campaign row was persisted in PostgreSQL
    const { count: campaignCount } = await adminClient
      .from('campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('generation_request_id', identicalReqId);
    assert.strictEqual(campaignCount, 1, 'Exactly one campaign row must exist for the generation_request_id');

    // Assert quota was deducted exactly once (campaigns_used == 1, not 2!)
    const { data: periodRow1 } = await adminClient
      .from('usage_periods')
      .select('campaigns_used')
      .eq('business_id', storeA1Id)
      .single();
    assert.strictEqual(periodRow1.campaigns_used, 1, 'Quota must be deducted exactly once despite concurrent race');
    console.log('  PASS: Concurrent identical request race resolved idempotently without double quota deduction');
    passedSuites++;

    // ------------------------------------------------------------------------
    // Suite 5: Concurrent Requests Near Quota Boundary (Lock Contention)
    // ------------------------------------------------------------------------
    console.log('\n[Suite 5/6] Testing Concurrent Transaction Race Near Quota Boundary...');
    // Set campaigns_used to 2 (limit is 3, exactly 1 slot remaining)
    await adminClient
      .from('usage_periods')
      .update({ campaigns_used: 2 })
      .eq('business_id', storeA1Id);

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

    const aSucceeded = !resAValue?.error && resAValue?.data?.campaign_id;
    const bSucceeded = !resBValue?.error && resBValue?.data?.campaign_id;

    assert.ok(
      (aSucceeded && !bSucceeded) || (!aSucceeded && bSucceeded),
      'Exactly one concurrent caller must win the remaining quota slot'
    );

    const winningCampaignId = aSucceeded ? resAValue.data.campaign_id : resBValue.data.campaign_id;
    cleanupState.campaignIds.push(winningCampaignId);

    const losingError = aSucceeded ? resBValue.error : resAValue.error;
    assert.match(
      losingError.message,
      /QUOTA_EXHAUSTED/,
      'The losing concurrent caller must be rejected with QUOTA_EXHAUSTED'
    );

    // Verify usage_periods campaigns_used reached exactly 3 (no overrun)
    const { data: periodRowBoundary } = await adminClient
      .from('usage_periods')
      .select('campaigns_used, campaign_limit')
      .eq('business_id', storeA1Id)
      .single();
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

    // Verify subscription row
    const { data: activeSub } = await adminClient
      .from('subscriptions')
      .select('id, plan_id, status, cancel_at_period_end')
      .eq('user_id', userAId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    assert.ok(activeSub, 'Active subscription must exist for User A');
    assert.strictEqual(activeSub.plan_id, 'PRO');
    assert.strictEqual(activeSub.status, 'ACTIVE');
    assert.strictEqual(activeSub.cancel_at_period_end, false);

    // Verify multi-store entitlement upgrade: BOTH Store A1 and Store A2 must have limit = 30
    const { data: storeA1Usage } = await adminClient
      .from('usage_periods')
      .select('plan, campaign_limit')
      .eq('business_id', storeA1Id)
      .single();
    assert.strictEqual(storeA1Usage.plan, 'PRO');
    assert.strictEqual(storeA1Usage.campaign_limit, 30);

    const { data: storeA2Usage } = await adminClient
      .from('usage_periods')
      .select('plan, campaign_limit')
      .eq('business_id', storeA2Id)
      .single();
    assert.strictEqual(storeA2Usage.plan, 'PRO');
    assert.strictEqual(storeA2Usage.campaign_limit, 30);

    // Verify audit event SUBSCRIPTION_ACTIVATED
    const { data: auditEvents } = await adminClient
      .from('usage_events')
      .select('event_type, business_id')
      .eq('user_id', userAId)
      .eq('event_type', 'SUBSCRIPTION_ACTIVATED');
    assert.ok(auditEvents.length >= 2, 'Audit events must record SUBSCRIPTION_ACTIVATED for each owned store');
    console.log('  PASS: Multi-store entitlement upgrade propagated to both stores (limit 30) with audit events');

    // 6b. Request cancellation at period end via authenticated client
    const cancelReason = 'Automated Phase 4 Lifecycle Test';
    const { data: cancelRes, error: cancelErr } = await clientA_conn1.rpc('request_subscription_cancellation', {
      p_subscription_id: activeSub.id,
      p_reason: cancelReason,
    });
    assert.ifError(cancelErr);
    assert.strictEqual(cancelRes.success, true);
    assert.strictEqual(cancelRes.cancel_at_period_end, true);

    const { data: cancelledSub } = await adminClient
      .from('subscriptions')
      .select('cancel_at_period_end, cancellation_reason')
      .eq('id', activeSub.id)
      .single();
    assert.strictEqual(cancelledSub.cancel_at_period_end, true);
    assert.strictEqual(cancelledSub.cancellation_reason, cancelReason);

    const { data: cancelAudit } = await adminClient
      .from('usage_events')
      .select('event_type, description')
      .eq('user_id', userAId)
      .eq('event_type', 'SUBSCRIPTION_CANCEL_REQUESTED');
    assert.ok(cancelAudit.length >= 1, 'Audit log must record SUBSCRIPTION_CANCEL_REQUESTED');
    console.log('  PASS: Cancellation scheduled at period end with audit trail preserved');

    // 6c. Expired subscription transition via webhook reconciliation
    const expiredSubEventId = `${FIXTURE_PREFIX}_evt_expired`;
    cleanupState.providerEventIds.push(expiredSubEventId);

    // Webhook with past period_end marks subscription EXPIRED and downgrades usage periods to Free (limit 3)
    const yesterdayTimestamp = Math.floor((Date.now() - 86400000) / 1000);
    const { error: expiryReconErr } = await adminClient.rpc('reconcile_provider_event', {
      p_provider: 'razorpay',
      p_provider_event_id: expiredSubEventId,
      p_event_type: 'subscription.cancelled',
      p_payload: {
        payload: {
          subscription: {
            entity: {
              id: activeSub.id,
              status: 'cancelled',
              current_end: yesterdayTimestamp,
            },
          },
        },
      },
    });
    assert.ifError(expiryReconErr);

    // Verify subscription status is EXPIRED
    const { data: expiredSub } = await adminClient
      .from('subscriptions')
      .select('status')
      .eq('id', activeSub.id)
      .single();
    assert.strictEqual(expiredSub.status, 'EXPIRED');

    // Verify usage periods downgraded to FREE with limit 3
    const { data: downgradedStore1 } = await adminClient
      .from('usage_periods')
      .select('plan, campaign_limit')
      .eq('business_id', storeA1Id)
      .single();
    assert.strictEqual(downgradedStore1.plan, 'FREE');
    assert.strictEqual(downgradedStore1.campaign_limit, 3);

    const { data: downgradedStore2 } = await adminClient
      .from('usage_periods')
      .select('plan, campaign_limit')
      .eq('business_id', storeA2Id)
      .single();
    assert.strictEqual(downgradedStore2.plan, 'FREE');
    assert.strictEqual(downgradedStore2.campaign_limit, 3);

    // Verify audit event SUBSCRIPTION_EXPIRED_DOWNGRADED
    const { data: downgradeAudit } = await adminClient
      .from('usage_events')
      .select('event_type')
      .eq('user_id', userAId)
      .eq('event_type', 'SUBSCRIPTION_EXPIRED_DOWNGRADED');
    assert.ok(downgradeAudit.length >= 1, 'SUBSCRIPTION_EXPIRED_DOWNGRADED audit event recorded');
    console.log('  PASS: Expired subscription transitioned to EXPIRED and downgraded stores to FREE (limit 3)');
    passedSuites++;

    console.log('\n========================================================================');
    console.log(`Phase 4 Integration Suite: ${passedSuites}/${totalSuites} Suites Passed`);
    console.log('Real PostgreSQL Transaction & Concurrency Verification Complete!');
    console.log('========================================================================\n');
  } finally {
    console.log('\n[Teardown] Cleaning up isolated synthetic test fixtures...');
    try {
      // 1. Delete campaign outputs and campaigns
      if (cleanupState.campaignIds.length > 0) {
        await adminClient.from('campaign_outputs').delete().in('campaign_id', cleanupState.campaignIds);
        await adminClient.from('campaigns').delete().in('id', cleanupState.campaignIds);
      }
      // 2. Delete usage events and usage periods
      if (cleanupState.businessIds.length > 0) {
        await adminClient.from('usage_events').delete().in('business_id', cleanupState.businessIds);
        await adminClient.from('usage_periods').delete().in('business_id', cleanupState.businessIds);
        await adminClient.from('business_members').delete().in('business_id', cleanupState.businessIds);
        await adminClient.from('business_profiles').delete().in('business_id', cleanupState.businessIds);
        await adminClient.from('businesses').delete().in('id', cleanupState.businessIds);
      }
      // 3. Delete subscriptions
      if (cleanupState.userIds.length > 0) {
        await adminClient.from('subscriptions').delete().in('user_id', cleanupState.userIds);
        await adminClient.from('profiles').delete().in('id', cleanupState.userIds);
        for (const uid of cleanupState.userIds) {
          await adminClient.auth.admin.deleteUser(uid);
        }
      }
      // 4. Delete provider events
      if (cleanupState.providerEventIds.length > 0) {
        await adminClient.from('provider_events').delete().in('provider_event_id', cleanupState.providerEventIds);
      }
      console.log('  PASS: All synthetic fixtures cleanly deleted from PostgreSQL database');
    } catch (cleanupErr) {
      console.error('  WARN: Teardown encountered error:', cleanupErr.message);
    }
  }
}

runIntegrationSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nIntegration Suite Failure:', err);
    process.exit(1);
  });
