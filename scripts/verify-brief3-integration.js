import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert';
import crypto from 'node:crypto';

export const AUTHORIZED_PROJECT_REF = 'iodwiyfjwzdvqtrczttb';
export const APPROVED_LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);

const targetUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_INTEGRATION_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_INTEGRATION_SERVICE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_INTEGRATION_ANON_KEY;

console.log('--- StreetCraft Brief 3 Integration Runner ---');

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

  return { userId, email, client: actorClient, token: authData.session.access_token };
}

async function run() {
  console.log('[1/8] Capturing baseline state for merchant preservation check...');

  const { data: preBiz, error: preBizErr } = await adminClient
    .from('businesses')
    .select('id, name, created_at');
  if (preBizErr) throw new Error(`Pre-check businesses failed: ${preBizErr.message}`);

  const { data: preSubs, error: preSubsErr } = await adminClient
    .from('subscriptions')
    .select('id, user_id, plan_id, status');
  if (preSubsErr) throw new Error(`Pre-check subscriptions failed: ${preSubsErr.message}`);

  const { data: preMembers, error: preMembersErr } = await adminClient
    .from('business_members')
    .select('id, business_id, user_id, role');
  if (preMembersErr) throw new Error(`Pre-check business_members failed: ${preMembersErr.message}`);

  const baselineBizIds = new Set(preBiz.map((b) => b.id));
  const baselineMemberIds = new Set(preMembers.map((m) => m.id));
  console.log(`Baseline captured: ${preBiz.length} businesses, ${preMembers.length} members, ${preSubs.length} subscriptions.`);

  let actorA, actorB, actorC, actorD;
  let testBusinessId;
  let deleteTestBizId;

  try {
    console.log('[2/8] Creating test actors with authentic sessions and JWTs...');
    actorA = await createActor('b3_user_a'); // Will be owner of test store
    actorB = await createActor('b3_user_b'); // Will be member / admin
    actorC = await createActor('b3_user_c'); // Cross-tenant user
    actorD = await createActor('b3_user_d'); // Additional user for transfer/multi-owner

    console.log(`Created actors: User A (${actorA.userId}), User B (${actorB.userId}), User C (${actorC.userId}), User D (${actorD.userId})`);

    // Create test business for actorA
    const { data: createBizData, error: createBizErr } = await actorA.client.rpc('create_business_atomically', {
      p_name: 'Brief 3 Test Store Alpha',
      p_category: 'Cafe',
      p_city: 'Bengaluru',
      p_neighborhood: 'Indiranagar',
    });
    if (createBizErr) throw new Error(`Failed to create test business for Actor A: ${createBizErr.message}`);
    testBusinessId = createBizData.business_id;
    trackedBusinessIds.add(testBusinessId);

    // Verify actorA is owner in business_members
    const { data: initialMembers, error: initMemErr } = await adminClient
      .from('business_members')
      .select('*')
      .eq('business_id', testBusinessId);
    if (initMemErr) throw new Error(`Failed to query initial members: ${initMemErr.message}`);
    assert.strictEqual(initialMembers.length, 1, 'Store should have exactly 1 initial member');
    assert.strictEqual(initialMembers[0].user_id, actorA.userId, 'Initial member must be Actor A');
    assert.strictEqual(initialMembers[0].role, 'owner', 'Initial member role must be owner');

    // -------------------------------------------------------------------------
    // Suite 3: RLS INSERT Policy Tests
    // -------------------------------------------------------------------------
    console.log('[3/8] Testing RLS INSERT policy (business_members_insert)...');

    // Test 3.1: Anon cannot insert any member row
    const { error: anonInsErr } = await anonClient
      .from('business_members')
      .insert({ business_id: testBusinessId, user_id: actorB.userId, role: 'member' });
    assert.ok(anonInsErr, 'Anon must not be able to insert business members');

    // Test 3.2: Cross-tenant User C cannot insert member row into Store A
    const { error: crossInsErr } = await actorC.client
      .from('business_members')
      .insert({ business_id: testBusinessId, user_id: actorB.userId, role: 'member' });
    assert.ok(crossInsErr, 'Cross-tenant user C must not be able to insert member into Store A');

    // Test 3.3: Owner A inserts User B as a 'member' -> must SUCCEED
    const { data: insMemData, error: insMemErr } = await actorA.client
      .from('business_members')
      .insert({ business_id: testBusinessId, user_id: actorB.userId, role: 'member' })
      .select();
    assert.strictEqual(insMemErr, null, `Owner A must be able to insert a member: ${insMemErr?.message}`);

    // Test 3.4: Member B attempts to insert User D -> must FAIL (members cannot insert)
    const { error: memInsErr } = await actorB.client
      .from('business_members')
      .insert({ business_id: testBusinessId, user_id: actorD.userId, role: 'member' });
    assert.ok(memInsErr, 'Regular member must not be able to insert new members');

    // Owner A updates User B to 'admin'
    const { error: promAdminErr } = await actorA.client
      .from('business_members')
      .update({ role: 'admin' })
      .eq('business_id', testBusinessId)
      .eq('user_id', actorB.userId);
    assert.strictEqual(promAdminErr, null, `Owner A must be able to promote member to admin: ${promAdminErr?.message}`);

    // Test 3.5: Admin B attempts to insert an 'owner' row -> must FAIL
    const { error: adminInsOwnerErr } = await actorB.client
      .from('business_members')
      .insert({ business_id: testBusinessId, user_id: actorD.userId, role: 'owner' });
    assert.ok(adminInsOwnerErr, 'Admin must not be able to insert an owner row');

    // Test 3.6: Admin B attempts to insert an 'admin' row -> must FAIL
    const { error: adminInsAdminErr } = await actorB.client
      .from('business_members')
      .insert({ business_id: testBusinessId, user_id: actorD.userId, role: 'admin' });
    assert.ok(adminInsAdminErr, 'Admin must not be able to insert an admin row');

    // Test 3.7: Admin B inserts User D as 'member' -> must SUCCEED
    const { error: adminInsMemErr } = await actorB.client
      .from('business_members')
      .insert({ business_id: testBusinessId, user_id: actorD.userId, role: 'member' });
    assert.strictEqual(adminInsMemErr, null, `Admin B must be able to insert a member: ${adminInsMemErr?.message}`);

    console.log('Passed Suite 3: RLS INSERT policy strictly enforced.');

    // -------------------------------------------------------------------------
    // Suite 4: RLS UPDATE Policy Tests
    // -------------------------------------------------------------------------
    console.log('[4/8] Testing RLS UPDATE policy (business_members_update)...');

    // Test 4.1: Anon cannot update any member row
    const { data: anonUpdData, error: anonUpdErr } = await anonClient
      .from('business_members')
      .update({ role: 'admin' })
      .eq('business_id', testBusinessId)
      .eq('user_id', actorD.userId)
      .select();
    assert.ok(anonUpdErr !== null || (anonUpdData && anonUpdData.length === 0), 'Anon must not be able to update business members');

    // Test 4.2: Cross-tenant User C cannot update Store A members
    const { data: crossUpdData, error: crossUpdErr } = await actorC.client
      .from('business_members')
      .update({ role: 'admin' })
      .eq('business_id', testBusinessId)
      .eq('user_id', actorD.userId)
      .select();
    assert.ok(crossUpdErr !== null || (crossUpdData && crossUpdData.length === 0), 'Cross-tenant User C must not be able to update Store A members');

    // Test 4.3: Admin B attempts to self-promote to 'owner' -> must FAIL / reject
    const { data: selfPromData, error: selfPromErr } = await actorB.client
      .from('business_members')
      .update({ role: 'owner' })
      .eq('business_id', testBusinessId)
      .eq('user_id', actorB.userId)
      .select();
    const selfPromFailed = selfPromErr !== null || (selfPromData && selfPromData.length === 0);
    assert.ok(selfPromFailed, 'Admin B must not be able to self-promote to owner');

    // Test 4.4: Admin B attempts to demote Owner A to 'member' -> must FAIL / reject
    const { data: demoteOwnerData, error: demoteOwnerErr } = await actorB.client
      .from('business_members')
      .update({ role: 'member' })
      .eq('business_id', testBusinessId)
      .eq('user_id', actorA.userId)
      .select();
    const demoteOwnerFailed = demoteOwnerErr !== null || (demoteOwnerData && demoteOwnerData.length === 0);
    assert.ok(demoteOwnerFailed, 'Admin B must not be able to demote Owner A');

    // Verify Owner A's role is still 'owner'
    const { data: checkOwnerRole } = await adminClient
      .from('business_members')
      .select('role')
      .eq('business_id', testBusinessId)
      .eq('user_id', actorA.userId)
      .single();
    assert.strictEqual(checkOwnerRole?.role, 'owner', 'Owner A role must remain owner');

    // Test 4.5: Owner A updates non-owner User D from 'member' to 'admin' -> must SUCCEED
    const { error: ownerUpdAdminErr } = await actorA.client
      .from('business_members')
      .update({ role: 'admin' })
      .eq('business_id', testBusinessId)
      .eq('user_id', actorD.userId);
    assert.strictEqual(ownerUpdAdminErr, null, `Owner A must be able to promote member to admin: ${ownerUpdAdminErr?.message}`);

    // Test 4.6: Owner A updates User D from 'admin' back to 'member' -> must SUCCEED
    const { error: ownerUpdMemErr } = await actorA.client
      .from('business_members')
      .update({ role: 'member' })
      .eq('business_id', testBusinessId)
      .eq('user_id', actorD.userId);
    assert.strictEqual(ownerUpdMemErr, null, `Owner A must be able to demote admin to member: ${ownerUpdMemErr?.message}`);

    console.log('Passed Suite 4: RLS UPDATE policy strictly enforced.');

    // -------------------------------------------------------------------------
    // Suite 5: Last-Owner Guard Trigger Tests
    // -------------------------------------------------------------------------
    console.log('[5/8] Testing Last-Owner Guard Trigger (trg_guard_last_business_owner)...');

    // Test 5.1: Owner A is the only owner. Owner A attempts to leave (DELETE own row) -> must FAIL with LAST_OWNER
    const { error: lastOwnerDelErr } = await actorA.client
      .from('business_members')
      .delete()
      .eq('business_id', testBusinessId)
      .eq('user_id', actorA.userId);
    assert.ok(lastOwnerDelErr, 'Last owner must not be able to delete their own membership');
    assert.ok(
      lastOwnerDelErr.message.includes('LAST_OWNER') || lastOwnerDelErr.code === 'P0001',
      `Error must cite LAST_OWNER guard: ${lastOwnerDelErr.message}`
    );

    // Test 5.2: Attempt to demote the only owner via service_role to test trigger directly -> must FAIL with LAST_OWNER
    const { error: srvDemoteErr } = await adminClient
      .from('business_members')
      .update({ role: 'admin' })
      .eq('business_id', testBusinessId)
      .eq('user_id', actorA.userId);
    assert.ok(srvDemoteErr, 'Trigger must prevent demoting the last owner even from service_role');
    assert.ok(
      srvDemoteErr.message.includes('LAST_OWNER') || srvDemoteErr.code === 'P0001',
      `Error must cite LAST_OWNER guard: ${srvDemoteErr.message}`
    );

    // Promote User D to second owner via service_role so we have two owners
    const { error: addSecondOwnerErr } = await adminClient
      .from('business_members')
      .update({ role: 'owner' })
      .eq('business_id', testBusinessId)
      .eq('user_id', actorD.userId);
    assert.strictEqual(addSecondOwnerErr, null, 'Must be able to add second owner');

    // Test 5.3: With TWO owners, Owner A leaves (deletes own row) -> must SUCCEED
    const { error: twoOwnersDelErr } = await actorA.client
      .from('business_members')
      .delete()
      .eq('business_id', testBusinessId)
      .eq('user_id', actorA.userId);
    assert.strictEqual(twoOwnersDelErr, null, `One owner must be able to leave when another owner exists: ${twoOwnersDelErr?.message}`);

    // Verify User D is now the only owner
    const { data: remainingMembers } = await adminClient
      .from('business_members')
      .select('user_id, role')
      .eq('business_id', testBusinessId);
    const remainingOwners = remainingMembers.filter((m) => m.role === 'owner');
    assert.strictEqual(remainingOwners.length, 1, 'Store must now have exactly 1 owner');
    assert.strictEqual(remainingOwners[0].user_id, actorD.userId, 'Remaining owner must be User D');

    // Test 5.4: User D is now the only owner and attempts to leave -> must FAIL with LAST_OWNER
    const { error: userDLeaveErr } = await actorD.client
      .from('business_members')
      .delete()
      .eq('business_id', testBusinessId)
      .eq('user_id', actorD.userId);
    assert.ok(userDLeaveErr, 'User D as the now last owner must not be able to leave');
    assert.ok(
      userDLeaveErr.message.includes('LAST_OWNER') || userDLeaveErr.code === 'P0001',
      `Error must cite LAST_OWNER guard: ${userDLeaveErr.message}`
    );

    console.log('Passed Suite 5: Last-owner guard successfully protects against leaving ownerless store.');

    // -------------------------------------------------------------------------
    // Suite 6: Atomic Ownership Transfer RPC (transfer_business_ownership)
    // -------------------------------------------------------------------------
    console.log('[6/8] Testing transfer_business_ownership RPC...');

    // Test 6.1: Anon cannot call transfer_business_ownership
    const { error: anonTransferErr } = await anonClient.rpc('transfer_business_ownership', {
      p_business_id: testBusinessId,
      p_new_owner: actorB.userId,
    });
    assert.ok(anonTransferErr, 'Anon must not be able to call transfer_business_ownership');

    // Test 6.2: Non-owner User B (admin) attempts to transfer ownership -> must FAIL
    const { error: nonOwnerTransferErr } = await actorB.client.rpc('transfer_business_ownership', {
      p_business_id: testBusinessId,
      p_new_owner: actorB.userId,
    });
    assert.ok(nonOwnerTransferErr, 'Non-owner must not be able to transfer ownership');
    assert.ok(
      nonOwnerTransferErr.message.includes('UNAUTHORIZED') || nonOwnerTransferErr.code === '42501',
      `Error must cite UNAUTHORIZED: ${nonOwnerTransferErr.message}`
    );

    // Test 6.3: Owner D transfers ownership to non-member User C -> must FAIL with NOT_FOUND
    const { error: nonMemberTransferErr } = await actorD.client.rpc('transfer_business_ownership', {
      p_business_id: testBusinessId,
      p_new_owner: actorC.userId,
    });
    assert.ok(nonMemberTransferErr, 'Transfer to non-member must be rejected');
    assert.ok(
      nonMemberTransferErr.message.includes('NOT_FOUND') || nonMemberTransferErr.code === 'P0002',
      `Error must cite NOT_FOUND: ${nonMemberTransferErr.message}`
    );

    // Test 6.4: Owner D transfers ownership to existing member User B (default retain=false) -> must SUCCEED
    const { data: transferResult, error: transferErr } = await actorD.client.rpc('transfer_business_ownership', {
      p_business_id: testBusinessId,
      p_new_owner: actorB.userId,
    });
    assert.strictEqual(transferErr, null, `Ownership transfer must succeed: ${transferErr?.message}`);
    assert.strictEqual(transferResult.success, true, 'Result success must be true');
    assert.strictEqual(transferResult.new_owner, actorB.userId, 'New owner must be User B');
    assert.strictEqual(transferResult.caller_role, 'admin', 'Old owner D must step down to admin');

    // Verify in database: User B is owner, User D is admin
    const { data: updatedMemB } = await adminClient
      .from('business_members')
      .select('role')
      .eq('business_id', testBusinessId)
      .eq('user_id', actorB.userId)
      .single();
    assert.strictEqual(updatedMemB?.role, 'owner', 'User B must now be owner');

    const { data: updatedMemD } = await adminClient
      .from('business_members')
      .select('role')
      .eq('business_id', testBusinessId)
      .eq('user_id', actorD.userId)
      .single();
    assert.strictEqual(updatedMemD?.role, 'admin', 'User D must now be admin');

    // Test 6.5: User B transfers back to User D with p_retain_ownership = true (co-ownership) -> must SUCCEED
    const { data: coOwnerResult, error: coOwnerErr } = await actorB.client.rpc('transfer_business_ownership', {
      p_business_id: testBusinessId,
      p_new_owner: actorD.userId,
      p_retain_ownership: true,
    });
    assert.strictEqual(coOwnerErr, null, `Transfer with retain_ownership must succeed: ${coOwnerErr?.message}`);
    assert.strictEqual(coOwnerResult.caller_role, 'owner', 'User B must retain owner role');

    // Verify both User B and User D are owners
    const { data: coOwners } = await adminClient
      .from('business_members')
      .select('user_id, role')
      .eq('business_id', testBusinessId)
      .eq('role', 'owner');
    assert.strictEqual(coOwners.length, 2, 'Both users must be owners');

    // Test 6.6: BUSINESS_LIMIT_REACHED test
    // User C creates one business to reach the FREE tier limit (1 business)
    const { data: cBiz1, error: cBiz1Err } = await actorC.client.rpc('create_business_atomically', {
      p_name: 'User C Store One',
      p_category: 'Bakery',
      p_city: 'Delhi',
      p_neighborhood: 'Connaught Place',
    });
    if (cBiz1Err) throw new Error(`Failed to create User C business 1: ${cBiz1Err.message}`);
    trackedBusinessIds.add(cBiz1.business_id);

    const { data: cBiz2, error: cBiz2Err } = await actorC.client.rpc('create_business_atomically', {
      p_name: 'User C Store Two',
      p_category: 'Cafe',
      p_city: 'Delhi',
      p_neighborhood: 'Hauz Khas',
    });
    if (cBiz2Err) throw new Error(`Failed to create User C business 2: ${cBiz2Err.message}`);
    trackedBusinessIds.add(cBiz2.business_id);

    // Add User C as a member to testBusinessId
    const { error: addCMemErr } = await actorB.client
      .from('business_members')
      .insert({ business_id: testBusinessId, user_id: actorC.userId, role: 'member' });
    assert.strictEqual(addCMemErr, null, 'Must be able to add User C as member');

    // User B attempts to transfer ownership to User C (who already owns 2 stores on FREE tier) -> must FAIL with BUSINESS_LIMIT_REACHED
    const { error: limitTransferErr } = await actorB.client.rpc('transfer_business_ownership', {
      p_business_id: testBusinessId,
      p_new_owner: actorC.userId,
    });
    assert.ok(limitTransferErr, 'Transfer must fail when target has reached business_limit');
    assert.ok(
      limitTransferErr.message.includes('BUSINESS_LIMIT_REACHED'),
      `Error must cite BUSINESS_LIMIT_REACHED: ${limitTransferErr.message}`
    );

    console.log('Passed Suite 6: Atomic ownership transfer RPC and business_limit check verified.');

    // -------------------------------------------------------------------------
    // Suite 7: delete_business_atomically with Trigger Guard
    // -------------------------------------------------------------------------
    console.log('[7/8] Testing delete_business_atomically cascade compatibility...');

    // Use User C's store (cBiz1) to test atomic deletion
    deleteTestBizId = cBiz1.business_id;

    // Test 7.1: Non-owner User A attempts to delete User C's store -> must FAIL
    const { error: nonOwnerDelErr } = await actorA.client.rpc('delete_business_atomically', {
      p_business_id: deleteTestBizId,
    });
    assert.ok(nonOwnerDelErr, 'Non-owner must not be able to delete another user business');

    // Test 7.2: Owner C deletes their own business (single owner) -> must SUCCEED without trigger blocking cascade
    const { data: delResult, error: delErr } = await actorC.client.rpc('delete_business_atomically', {
      p_business_id: deleteTestBizId,
    });
    assert.strictEqual(delErr, null, `delete_business_atomically must succeed: ${delErr?.message}`);
    assert.strictEqual(delResult.success, true, 'delete_business_atomically success must be true');

    // Verify the business and its members are completely deleted
    const { data: checkDeletedBiz } = await adminClient
      .from('businesses')
      .select('id')
      .eq('id', deleteTestBizId);
    assert.strictEqual(checkDeletedBiz.length, 0, 'Deleted business must not exist');

    const { data: checkDeletedMems } = await adminClient
      .from('business_members')
      .select('id')
      .eq('business_id', deleteTestBizId);
    assert.strictEqual(checkDeletedMems.length, 0, 'Cascaded business members must not exist');

    console.log('Passed Suite 7: delete_business_atomically cascade successfully bypasses last-owner guard.');

  } finally {
    // -------------------------------------------------------------------------
    // Suite 8: Teardown & Merchant Data Preservation Verification
    // -------------------------------------------------------------------------
    console.log('[8/8] Cleaning up test fixtures and verifying merchant data preservation...');

    // Clean up test businesses
    for (const bId of trackedBusinessIds) {
      try {
        await adminClient.from('businesses').delete().eq('id', bId);
      } catch (e) {
        console.warn(`Failed to cleanup test business ${bId}:`, e.message);
      }
    }

    // Clean up test users
    for (const uId of trackedUserIds) {
      try {
        await adminClient.auth.admin.deleteUser(uId);
      } catch (e) {
        console.warn(`Failed to cleanup test user ${uId}:`, e.message);
      }
    }

    // Post-check preservation verification
    const { data: postBiz, error: postBizErr } = await adminClient
      .from('businesses')
      .select('id, name, created_at');
    if (postBizErr) throw new Error(`Post-check businesses failed: ${postBizErr.message}`);

    const { data: postSubs, error: postSubsErr } = await adminClient
      .from('subscriptions')
      .select('id, user_id, plan_id, status');
    if (postSubsErr) throw new Error(`Post-check subscriptions failed: ${postSubsErr.message}`);

    const { data: postMembers, error: postMembersErr } = await adminClient
      .from('business_members')
      .select('id, business_id, user_id, role');
    if (postMembersErr) throw new Error(`Post-check business_members failed: ${postMembersErr.message}`);

    assert.strictEqual(postBiz.length, preBiz.length, 'Zero businesses created or lost');
    assert.strictEqual(postSubs.length, preSubs.length, 'Zero subscriptions altered');
    assert.strictEqual(postMembers.length, preMembers.length, 'Zero pre-existing business members altered');

    for (const biz of postBiz) {
      assert.ok(baselineBizIds.has(biz.id), `Preserved business ID must match baseline: ${biz.id}`);
    }

    for (const mem of postMembers) {
      assert.ok(baselineMemberIds.has(mem.id), `Preserved member ID must match baseline: ${mem.id}`);
    }

    console.log('--- Brief 3 Verification Completed Successfully: 100% Merchant Preservation Confirmed ---');
  }
}

run().catch((err) => {
  console.error('[Fatal Error in Brief 3 Integration Runner]:', err);
  process.exit(1);
});
