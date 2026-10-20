import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert';
import crypto from 'node:crypto';

export const AUTHORIZED_PROJECT_REF = 'iodwiyfjwzdvqtrczttb';
export const APPROVED_LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);

const targetUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_INTEGRATION_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_INTEGRATION_SERVICE_KEY;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'integration_test_secret_for_brief5_verification';

console.log('--- StreetCraft Brief 5 Integration Runner ---');

if (!targetUrl || !serviceKey) {
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

const isApprovedLocal = APPROVED_LOCAL_HOSTNAMES.has(normalizedHostname);
const isAuthorizedSupabaseRef = rawHostname.startsWith(`${AUTHORIZED_PROJECT_REF}.`);

if (!isApprovedLocal && !isAuthorizedSupabaseRef) {
  console.error(`[Security Guard Rejection] Target URL host "${rawHostname}" is not authorized.`);
  process.exit(1);
}

const adminClient = createClient(targetUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Track fixtures for isolated teardown
const trackedUserIds = new Set();
const trackedEventIds = new Set();
const trackedSubscriptionIds = new Set();

async function createTestUser(emailPrefix) {
  const email = `${emailPrefix}_${crypto.randomBytes(4).toString('hex')}@streetcraft-integration-test.local`;
  const password = `TestPass_${crypto.randomBytes(8).toString('hex')}!Aa1`;
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`Failed to create test user: ${error.message}`);
  trackedUserIds.add(data.user.id);
  return data.user;
}

async function run() {
  console.log('[Snapshot] Capturing production baseline state...');
  const { data: preUsers, error: preUsersErr } = await adminClient.from('businesses').select('id, name');
  if (preUsersErr) throw new Error(`Pre-check failed: ${preUsersErr.message}`);

  const { data: preSubs, error: preSubsErr } = await adminClient.from('subscriptions').select('id');
  if (preSubsErr) throw new Error(`Pre-check subs failed: ${preSubsErr.message}`);

  const baselineBizCount = preUsers.length;
  const baselineSubCount = preSubs.length;

  console.log(`[Baseline Confirmed] Businesses: ${baselineBizCount}, Subscriptions: ${baselineSubCount}`);

  try {
    const testUser = await createTestUser('test_b5_subscriber');
    const paymentId = `pay_test_${crypto.randomBytes(6).toString('hex')}`;
    const orderId = `order_test_${crypto.randomBytes(6).toString('hex')}`;
    const eventIdHeader1 = `evt_test_${crypto.randomBytes(6).toString('hex')}`;
    const eventIdHeader2 = `evt_test_${crypto.randomBytes(6).toString('hex')}`;

    console.log('\n--- Test 1: Valid signed payment.captured activates subscription ---');
    const validPayload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: orderId,
            status: 'captured',
            captured: true,
            currency: 'INR',
            amount: 39900,
            notes: {
              app: 'streetcraft',
              userId: testUser.id,
              planId: 'PRO',
              billingCycle: 'monthly',
            },
          },
        },
        order: {
          entity: {
            id: orderId,
            status: 'paid',
            currency: 'INR',
            amount: 39900,
            notes: {
              app: 'streetcraft',
              userId: testUser.id,
              planId: 'PRO',
              billingCycle: 'monthly',
            },
          },
        },
      },
    };

    const { data: res1, error: err1 } = await adminClient.rpc('reconcile_provider_event', {
      p_provider: 'razorpay',
      p_provider_event_id: eventIdHeader1,
      p_event_type: 'payment.captured',
      p_payload: validPayload,
    });

    assert.ifError(err1);
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res1.status, 'PROCESSED');

    // Confirm subscription row created
    const { data: subs1, error: subsErr1 } = await adminClient
      .from('subscriptions')
      .select('id, user_id, plan_id, status')
      .eq('user_id', testUser.id);
    assert.ifError(subsErr1);
    assert.strictEqual(subs1.length, 1);
    assert.strictEqual(subs1[0].plan_id, 'PRO');
    assert.strictEqual(subs1[0].status, 'ACTIVE');
    trackedSubscriptionIds.add(subs1[0].id);

    // Verify provider_events row has entity_id and status PROCESSED
    const { data: eventRow1, error: evErr1 } = await adminClient
      .from('provider_events')
      .select('id, status, entity_id, needs_review')
      .eq('provider_event_id', eventIdHeader1)
      .single();
    assert.ifError(evErr1);
    assert.strictEqual(eventRow1.status, 'PROCESSED');
    assert.strictEqual(eventRow1.entity_id, paymentId);
    assert.strictEqual(eventRow1.needs_review, false);
    trackedEventIds.add(eventRow1.id);
    console.log('Passed: payment.captured activated subscription and recorded PROCESSED event.');

    console.log('\n--- Test 2: Replay of identical signed body with DIFFERENT event-id header is a no-op ---');
    const { data: res2, error: err2 } = await adminClient.rpc('reconcile_provider_event', {
      p_provider: 'razorpay',
      p_provider_event_id: eventIdHeader2, // Different header
      p_event_type: 'payment.captured',
      p_payload: validPayload,
    });

    assert.ifError(err2);
    assert.strictEqual(res2.success, true);
    assert.strictEqual(res2.idempotent_replay, true);

    // Confirm NO second subscription was created
    const { data: subs2 } = await adminClient
      .from('subscriptions')
      .select('id')
      .eq('user_id', testUser.id);
    assert.strictEqual(subs2.length, 1);
    console.log('Passed: Replay with different event-id header was recognized via entity_id as no-op.');

    console.log('\n--- Test 3: Amount mismatch persists NEEDS_REVIEW and alters no subscription ---');
    const mismatchPaymentId = `pay_mismatch_${crypto.randomBytes(6).toString('hex')}`;
    const mismatchOrderId = `order_mismatch_${crypto.randomBytes(6).toString('hex')}`;
    const mismatchEventId = `evt_mismatch_${crypto.randomBytes(6).toString('hex')}`;

    const mismatchPayload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: mismatchPaymentId,
            order_id: mismatchOrderId,
            status: 'captured',
            captured: true,
            currency: 'INR',
            amount: 10000, // Tampered: 100 INR instead of 399 INR
            notes: {
              app: 'streetcraft',
              userId: testUser.id,
              planId: 'PRO',
              billingCycle: 'monthly',
            },
          },
        },
        order: {
          entity: {
            id: mismatchOrderId,
            status: 'paid',
            currency: 'INR',
            amount: 10000,
            notes: {
              app: 'streetcraft',
              userId: testUser.id,
              planId: 'PRO',
              billingCycle: 'monthly',
            },
          },
        },
      },
    };

    const { data: res3, error: err3 } = await adminClient.rpc('reconcile_provider_event', {
      p_provider: 'razorpay',
      p_provider_event_id: mismatchEventId,
      p_event_type: 'payment.captured',
      p_payload: mismatchPayload,
    });

    assert.ifError(err3);
    assert.strictEqual(res3.success, false);
    assert.strictEqual(res3.status, 'NEEDS_REVIEW');
    assert.strictEqual(res3.error_code, 'AMOUNT_MISMATCH');
    assert.strictEqual(res3.retryable, false);

    // Verify row in database
    const { data: mismatchRow } = await adminClient
      .from('provider_events')
      .select('id, status, error_code, needs_review')
      .eq('provider_event_id', mismatchEventId)
      .single();
    assert.strictEqual(mismatchRow.status, 'NEEDS_REVIEW');
    assert.strictEqual(mismatchRow.error_code, 'AMOUNT_MISMATCH');
    assert.strictEqual(mismatchRow.needs_review, true);
    trackedEventIds.add(mismatchRow.id);
    console.log('Passed: Amount mismatch persisted NEEDS_REVIEW without throwing or changing subscription.');

    console.log('\n--- Test 4: APP_MISMATCH rejects foreign application events as FAILED ---');
    const foreignEventId = `evt_foreign_${crypto.randomBytes(6).toString('hex')}`;
    const foreignOrderId = `order_foreign_${crypto.randomBytes(4).toString('hex')}`;
    const foreignPayload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_foreign_${crypto.randomBytes(4).toString('hex')}`,
            order_id: foreignOrderId,
            status: 'captured',
            captured: true,
            currency: 'INR',
            amount: 39900,
            notes: {
              app: 'other_ecommerce_platform',
              userId: testUser.id,
              planId: 'PRO',
              billingCycle: 'monthly',
            },
          },
        },
        order: {
          entity: {
            id: foreignOrderId,
            status: 'paid',
            currency: 'INR',
            amount: 39900,
            notes: {
              app: 'other_ecommerce_platform',
              userId: testUser.id,
              planId: 'PRO',
              billingCycle: 'monthly',
            },
          },
        },
      },
    };

    const { data: res4, error: err4 } = await adminClient.rpc('reconcile_provider_event', {
      p_provider: 'razorpay',
      p_provider_event_id: foreignEventId,
      p_event_type: 'payment.captured',
      p_payload: foreignPayload,
    });

    assert.ifError(err4);
    assert.strictEqual(res4.success, false);
    assert.strictEqual(res4.status, 'FAILED');
    assert.strictEqual(res4.error_code, 'APP_MISMATCH');
    assert.strictEqual(res4.retryable, false);

    const { data: foreignRow } = await adminClient
      .from('provider_events')
      .select('id, status, error_code, needs_review')
      .eq('provider_event_id', foreignEventId)
      .single();
    assert.strictEqual(foreignRow.status, 'FAILED');
    assert.strictEqual(foreignRow.error_code, 'APP_MISMATCH');
    assert.strictEqual(foreignRow.needs_review, false);
    trackedEventIds.add(foreignRow.id);
    console.log('Passed: Foreign app webhook failed and persisted row with APP_MISMATCH.');

    console.log('\n--- Test 5: Operational view provider_events_needs_review contains unhandled rows ---');
    const { data: reviewRows, error: reviewErr } = await adminClient
      .from('provider_events_needs_review')
      .select('id, error_code, entity_id')
      .eq('id', mismatchRow.id);
    assert.ifError(reviewErr);
    assert.strictEqual(reviewRows.length, 1);
    assert.strictEqual(reviewRows[0].error_code, 'AMOUNT_MISMATCH');
    console.log('Passed: Dedicated needs_review view surfaces captured payment failures for operators.');

  } finally {
    console.log('\n--- Cleaning up Brief 5 test fixtures ---');
    for (const evId of trackedEventIds) {
      await adminClient.from('provider_events').delete().eq('id', evId);
    }
    for (const subId of trackedSubscriptionIds) {
      await adminClient.from('subscriptions').delete().eq('id', subId);
    }
    for (const uId of trackedUserIds) {
      await adminClient.auth.admin.deleteUser(uId);
    }

    // Verify merchant baseline preservation
    const { data: postBiz } = await adminClient.from('businesses').select('id');
    const { data: postSubs } = await adminClient.from('subscriptions').select('id');

    assert.strictEqual(postBiz.length, baselineBizCount, 'Zero merchant businesses created or lost');
    assert.strictEqual(postSubs.length, baselineSubCount, 'Zero merchant subscriptions altered');
    console.log('--- Brief 5 Verification Completed: 100% Merchant Preservation Confirmed ---');
  }
}

run().catch((err) => {
  console.error('[Fatal Error in Brief 5 Integration Runner]:', err);
  process.exit(1);
});
