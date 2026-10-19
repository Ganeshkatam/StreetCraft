import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert';
import crypto from 'node:crypto';

export const AUTHORIZED_PROJECT_REF = 'iodwiyfjwzdvqtrczttb';
export const APPROVED_LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);

const targetUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_INTEGRATION_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_INTEGRATION_SERVICE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_INTEGRATION_ANON_KEY;

console.log('--- StreetCraft Brief 2 Integration Runner ---');

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

const isApprovedLocal = APPROVED_LOCAL_HOSTNAMES.has(normalizedHostname);
const isAuthorizedSupabaseRef = rawHostname.startsWith(`${AUTHORIZED_PROJECT_REF}.`);

if (!isApprovedLocal && !isAuthorizedSupabaseRef) {
  console.error(`[Security Guard Rejection] Target URL host "${rawHostname}" is not authorized.`);
  process.exit(1);
}

const adminClient = createClient(targetUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const anonClient = createClient(targetUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Track test fixtures for clean teardown
const trackedUserIds = new Set();
const trackedBusinessIds = new Set();
const trackedCampaignIds = new Set();
const trackedRateLimits = new Set();

async function safeRetry(fn, maxRetries = 3, delayMs = 500) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
}

async function createActor(prefix) {
  const email = `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}@streetcraft.integration.internal`;
  const password = `TestP@ss_${crypto.randomBytes(8).toString('hex')}`;

  const { data: userData, error: userError } = await safeRetry(() =>
    adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
  );

  if (userError || !userData?.user) {
    throw new Error(`Failed to create test user ${prefix}: ${userError?.message}`);
  }

  const userId = userData.user.id;
  trackedUserIds.add(userId);

  const actorClient = createClient(targetUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await safeRetry(() =>
    actorClient.auth.signInWithPassword({ email, password })
  );

  if (authError || !authData?.session) {
    throw new Error(`Failed to sign in as ${prefix}: ${authError?.message}`);
  }

  return { userId, email, client: actorClient };
}

async function run() {
  console.log('[1/6] Capturing baseline state for merchant preservation check...');
  const { data: initialBusinesses } = await adminClient.from('businesses').select('id, name');
  const baselineBusinessIds = new Set((initialBusinesses || []).map((b) => b.id));

  let actorA;
  let actorB;

  try {
    console.log('[2/6] Provisioning test actors A and B...');
    actorA = await createActor('actor_a_brief2');
    actorB = await createActor('actor_b_brief2');

    // Create a business for actor A
    const { data: bizAData, error: bizAError } = await actorA.client.rpc('create_business_atomically', {
      p_name: 'Brief2 Test Store A',
      p_category: 'Cafe',
      p_neighborhood: 'Koramangala',
      p_city: 'Bengaluru',
      p_phone: '9876543210',
    });
    assert.ok(!bizAError && bizAData?.business_id, `Failed to create store A: ${bizAError?.message}`);
    const bizAId = bizAData.business_id;
    trackedBusinessIds.add(bizAId);

    // Create a business for actor B
    const { data: bizBData, error: bizBError } = await actorB.client.rpc('create_business_atomically', {
      p_name: 'Brief2 Test Store B',
      p_category: 'Bakery',
      p_neighborhood: 'Indiranagar',
      p_city: 'Bengaluru',
      p_phone: '9876543211',
    });
    assert.ok(!bizBError && bizBData?.business_id, `Failed to create store B: ${bizBError?.message}`);
    const bizBId = bizBData.business_id;
    trackedBusinessIds.add(bizBId);

    console.log('[3/6] Verifying create_anonymous_campaign RPC (service_role only, size bounds)...');
    
    // Anon calling create_anonymous_campaign should fail
    const { error: anonRpcError } = await anonClient.rpc('create_anonymous_campaign', {
      p_type: 'WEEKDAY_BOOST',
      p_objective: 'MORE_WALK_INS',
      p_audience: 'Locals',
      p_offer: { title: 'Special' },
      p_schedule: { timingLabel: 'Today' },
      p_google_content: { headline: 'Proof' },
      p_instagram_content: { caption: 'Proof' },
      p_whatsapp_content: { text: 'Proof' },
      p_poster_content: { title: 'Proof' },
    });
    assert.ok(anonRpcError, 'Anon must not have permission to execute create_anonymous_campaign RPC');

    // Oversized payload rejection by service_role
    const oversizedPayload = { huge: 'X'.repeat(25000) };
    const { error: oversizeError } = await adminClient.rpc('create_anonymous_campaign', {
      p_type: 'WEEKDAY_BOOST',
      p_objective: 'MORE_WALK_INS',
      p_audience: 'Locals',
      p_offer: oversizedPayload,
      p_schedule: { timingLabel: 'Today' },
      p_google_content: { headline: 'Proof' },
      p_instagram_content: { caption: 'Proof' },
      p_whatsapp_content: { text: 'Proof' },
      p_poster_content: { title: 'Proof' },
    });
    assert.ok(oversizeError && oversizeError.message.includes('PAYLOAD_OVERSIZED'), 'Oversized payload must be rejected');

    // Valid creation by service_role
    const { data: createData, error: createError } = await adminClient.rpc('create_anonymous_campaign', {
      p_type: 'WEEKDAY_BOOST',
      p_objective: 'MORE_WALK_INS',
      p_audience: 'Local Koramangala neighbors',
      p_offer: { title: 'Buy 1 Get 1 Cold Brew' },
      p_schedule: { timingLabel: '3-6 PM' },
      p_google_content: { headline: 'Special Cold Brew' },
      p_instagram_content: { caption: 'Afternoon coffee vibes' },
      p_whatsapp_content: { message: 'Show this for BOGO' },
      p_poster_content: { headline: 'Afternoon perks' },
    });
    assert.ok(!createError && createData?.campaign_id && createData?.claim_token, `Failed to create campaign via service_role: ${createError?.message}`);
    const campaignId = createData.campaign_id;
    const claimToken = createData.claim_token;
    trackedCampaignIds.add(campaignId);

    assert.ok(claimToken.length >= 32, `Claim token must have adequate entropy (got ${claimToken.length} chars)`);

    console.log('[4/6] Verifying rate limit RPC (5/hour, 20/day)...');
    const testIp = `test_ip_${Date.now()}`;
    trackedRateLimits.add(testIp);

    for (let i = 1; i <= 5; i++) {
      const { data: allowed, error: rlErr } = await adminClient.rpc('check_and_record_rate_limit', {
        p_identifier: testIp,
        p_action: 'free_tool_test',
        p_hourly_limit: 5,
        p_daily_limit: 20,
      });
      assert.ok(!rlErr && allowed === true, `Call ${i} should be allowed`);
    }

    // 6th call within the hour must be blocked
    const { data: blocked, error: blockErr } = await adminClient.rpc('check_and_record_rate_limit', {
      p_identifier: testIp,
      p_action: 'free_tool_test',
      p_hourly_limit: 5,
      p_daily_limit: 20,
    });
    assert.ok(!blockErr && blocked === false, '6th request within an hour must be blocked');

    console.log('[5/6] Verifying claiming lifecycle and cross-tenant boundaries...');
    
    // User A claims the campaign
    const { data: claimResultA, error: claimErrA } = await actorA.client.rpc('claim_anonymous_campaign', {
      p_claim_token: claimToken,
      p_business_id: bizAId,
    });
    assert.ok(!claimErrA && claimResultA === true, `User A should successfully claim campaign: ${claimErrA?.message}`);

    // Second claim of same token should return false (single-use)
    const { data: claimResultSecond } = await actorA.client.rpc('claim_anonymous_campaign', {
      p_claim_token: claimToken,
      p_business_id: bizAId,
    });
    assert.strictEqual(claimResultSecond, false, 'Second claim of the same token must return false');

    // Cross-tenant: User B cannot select User A's claimed campaign
    const { data: userBCampaigns } = await actorB.client.from('campaigns').select('id').eq('id', campaignId);
    assert.strictEqual((userBCampaigns || []).length, 0, 'User B must not be able to select User A’s claimed campaign');

    console.log('[6/6] Verifying expired token rejection...');
    // Create an expired campaign directly
    const expiredToken = crypto.randomUUID();
    const { data: expRow } = await adminClient.from('campaigns').insert({
      business_id: null,
      type: 'WEEKDAY_BOOST',
      objective: 'MORE_WALK_INS',
      offer: {},
      schedule: {},
      status: 'READY',
      claim_token: expiredToken,
      claim_expires_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    }).select('id').single();

    if (expRow?.id) {
      trackedCampaignIds.add(expRow.id);
      const { data: expClaimResult } = await actorA.client.rpc('claim_anonymous_campaign', {
        p_claim_token: expiredToken,
        p_business_id: bizAId,
      });
      assert.strictEqual(expClaimResult, false, 'Expired claim token must return false and be rejected');
    }

    console.log('All Brief 2 integration assertions passed successfully.');
  } finally {
    console.log('--- Cleaning up test fixtures with retry resilience ---');
    for (const cId of trackedCampaignIds) {
      await safeRetry(() => adminClient.from('campaign_outputs').delete().eq('campaign_id', cId));
      await safeRetry(() => adminClient.from('campaigns').delete().eq('id', cId));
    }
    for (const bId of trackedBusinessIds) {
      await safeRetry(() => adminClient.from('usage_events').delete().eq('business_id', bId));
      await safeRetry(() => adminClient.from('usage_periods').delete().eq('business_id', bId));
      await safeRetry(() => adminClient.from('business_members').delete().eq('business_id', bId));
      await safeRetry(() => adminClient.from('business_profiles').delete().eq('business_id', bId));
      await safeRetry(() => adminClient.from('businesses').delete().eq('id', bId));
    }
    for (const ip of trackedRateLimits) {
      await safeRetry(() => adminClient.from('request_rate_limits').delete().eq('identifier', ip));
    }
    for (const uId of trackedUserIds) {
      await safeRetry(() => adminClient.auth.admin.deleteUser(uId));
    }

    // Baseline preservation check
    const { data: finalBusinesses } = await adminClient.from('businesses').select('id');
    const finalBusinessIds = new Set((finalBusinesses || []).map((b) => b.id));
    for (const id of baselineBusinessIds) {
      assert.ok(finalBusinessIds.has(id), `Merchant preservation failed: business ${id} was altered or removed!`);
    }
    console.log('Merchant baseline verified: 100% pre-existing businesses intact.');
  }
}

run().catch((err) => {
  console.error('Integration run failed:', err);
  process.exit(1);
});
