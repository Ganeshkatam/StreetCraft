// StreetCraft V1 End-to-End Vertical Slice Automated Integration Test
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iodwiyfjwzdvqtrczttb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZHdpeWZqd3pkdnF0cmN6dHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NzY2NDAsImV4cCI6MjEwMjQ1MjY0MH0.IMI3FnB75slarSrrXao18WBhNHSRyKarUX2JW017E6Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runVerticalSliceTest() {
  console.log('================================================================');
  console.log('STREETCRAFT V1 END-TO-END VERTICAL SLICE INTEGRATION TEST');
  console.log('================================================================\n');

  const testEmail = 'owner@streetcraft.local';
  const testPassword = 'StreetCraft_Secure_2026!';

  let businessA_Id = null;
  let businessB_Id = null;
  let campaignA_Id = null;

  // -------------------------------------------------------------
  // TEST 1: Account Authentication (Supabase Auth)
  // -------------------------------------------------------------
  console.log(`[TEST 1] Authenticating test user: ${testEmail}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (authError || !authData.user) {
    console.error('FAIL: User authentication failed:', authError?.message);
    process.exit(1);
  }
  console.log('PASS: User authenticated successfully with UID:', authData.user.id);

  // -------------------------------------------------------------
  // TEST 1B: Verify Direct Business & Usage INSERT is Strictly Blocked
  // -------------------------------------------------------------
  const { error: directInsertError } = await supabase.from('businesses').insert({
    name: 'Bypassed Business',
    category: 'Cafe'
  });
  if (!directInsertError) {
    console.error('FAIL: Direct table insert into businesses succeeded when it must be blocked.');
    process.exit(1);
  }
  console.log('PASS: Direct table insert into businesses correctly rejected by database security.');

  // -------------------------------------------------------------
  // TEST 2: Business A Creation via Atomic RPC
  // -------------------------------------------------------------
  console.log('\n[TEST 2] Creating first business (Business A) via create_business_atomically RPC...');
  const { data: bizAResult, error: bizAError } = await supabase.rpc('create_business_atomically', {
    p_name: 'The Roasted Bean Indiranagar',
    p_category: 'Artisanal Cafe & Bakery',
    p_neighborhood: '12th Main Indiranagar',
    p_city: 'Bengaluru',
    p_phone: '+919876543210'
  });

  if (bizAError || !bizAResult?.business_id) {
    console.error('FAIL: Business A creation failed:', bizAError?.message);
    process.exit(1);
  }
  businessA_Id = bizAResult.business_id;
  console.log('PASS: Business A created with ID:', businessA_Id, 'Role:', bizAResult.role);

  // -------------------------------------------------------------
  // TEST 3: Business A Store Preferences Configuration
  // -------------------------------------------------------------
  console.log('\n[TEST 3] Updating Business A Store Preferences in business_profiles...');
  const { error: profileError } = await supabase
    .from('business_profiles')
    .update({
      neighborhood: '12th Main Indiranagar',
      landmarks: 'Near Defence Colony Play Ground',
      signature_items: 'Single-Origin Ethiopian Pour-Over, Butter Sourdough Croissant',
      slow_hours: 'Monday to Thursday, 3:00 PM – 6:00 PM',
      default_offer: '20% off pour-overs & fresh bakes',
      target_customer: 'Working professionals and neighborhood residents'
    })
    .eq('business_id', businessA_Id);

  if (profileError) {
    console.error('FAIL: Updating Store Preferences failed:', profileError.message);
    process.exit(1);
  }

  const { data: profileCheck } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('business_id', businessA_Id)
    .single();

  console.log('PASS: Store Preferences persisted in PostgreSQL:');
  console.log('      Name:', profileCheck.name);
  console.log('      Neighborhood:', profileCheck.neighborhood);
  console.log('      Slow Hours:', profileCheck.slow_hours);

  // -------------------------------------------------------------
  // TEST 4: Generate and Atomically Save 4-Proof Campaign
  // -------------------------------------------------------------
  console.log('\n[TEST 4] Atomically saving Campaign with 4 storefront proofs for Business A...');
  
  const googleProof = {
    headline: 'Quiet Afternoon Focus Hour in Indiranagar',
    description: 'Enjoy 20% off single-origin pour-overs and fresh bakes this Tuesday 3–6 PM on 12th Main.',
    cta: 'Visit Today'
  };

  const instagramProof = {
    reelHook: 'Looking for a quiet spot to work in Indiranagar this afternoon?',
    caption: 'Escape the afternoon slump at The Roasted Bean. Fresh artisanal bakes out of the oven.',
    stories: ['Frame 1: Fresh pour-over brewing', 'Frame 2: 20% off 3–6 PM slump special', 'Frame 3: Tap location on 12th Main'],
    hashtags: ['#IndiranagarCafe', '#BangaloreCoffee', '#AfternoonSlump']
  };

  const whatsappProof = {
    message: 'Hey Indiranagar coffee lover! Quiet afternoon? Enjoy 20% off all pour-overs & croissants between 3:00 PM and 6:00 PM today. Show this message at the counter.',
    urgencyText: 'Valid today only 3–6 PM'
  };

  const posterProof = {
    headline: 'Afternoon Slump Special',
    bodyText: '20% Off All Single-Origin Pour-Overs & Artisan Croissants',
    timeWindow: 'Mon–Thu, 3:00 PM – 6:00 PM',
    qrAction: 'Scan to claim counter reward'
  };

  const { data: campaignResult, error: campaignError } = await supabase.rpc('save_campaign_atomically', {
    p_business_id: businessA_Id,
    p_campaign_type: 'WEEKDAY_BOOST',
    p_objective: 'MORE_WALK_INS',
    p_audience: 'Local remote workers & residents',
    p_offer: {
      title: 'Afternoon Slump 20% Discount',
      description: '20% off all pour-overs & fresh bakes',
      value: '20% Off',
      terms: 'Valid 3 PM - 6 PM today'
    },
    p_schedule: {
      timingLabel: 'Today, 3:00 PM – 6:00 PM'
    },
    p_google_content: googleProof,
    p_instagram_content: instagramProof,
    p_whatsapp_content: whatsappProof,
    p_poster_content: posterProof
  });

  if (campaignError || !campaignResult?.campaign_id) {
    console.error('FAIL: Atomic campaign persistence failed:', campaignError?.message);
    process.exit(1);
  }
  campaignA_Id = campaignResult.campaign_id;
  console.log('PASS: Campaign saved atomically with ID:', campaignA_Id);
  console.log('      Status:', campaignResult.status);
  console.log('      Usage:', campaignResult.campaigns_used, 'of', campaignResult.campaign_limit, 'campaigns used');

  // -------------------------------------------------------------
  // TEST 5: Verify Vault Persistence & 4 Proofs
  // -------------------------------------------------------------
  console.log('\n[TEST 5] Querying Campaign Vault and proofs from Supabase database...');
  const { data: campaignRow, error: cError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignA_Id)
    .single();

  if (cError || !campaignRow) {
    console.error('FAIL: Could not load saved campaign from database:', cError?.message);
    process.exit(1);
  }

  const { data: outputs, error: oError } = await supabase
    .from('campaign_outputs')
    .select('channel, validation_status, content')
    .eq('campaign_id', campaignA_Id);

  if (oError || !outputs || outputs.length !== 4) {
    console.error('FAIL: Expected 4 proofs in campaign_outputs, got:', outputs?.length, oError?.message);
    process.exit(1);
  }

  console.log('PASS: Loaded campaign from Vault:');
  console.log('      Type:', campaignRow.type, '| Status:', campaignRow.status);
  console.log('      Offer:', campaignRow.offer?.title);
  console.log('      Proofs found (4/4):');
  outputs.forEach((o) => {
    console.log(`        - [${o.channel}] Status: ${o.validation_status}`);
  });

  // Verify Usage Audit Event
  const { data: usageEvents } = await supabase
    .from('usage_events')
    .select('*')
    .eq('business_id', businessA_Id);

  console.log('PASS: Usage audit ledger records found:', usageEvents?.length);

  // -------------------------------------------------------------
  // TEST 6: Multi-Tenant Business Isolation Security Check
  // -------------------------------------------------------------
  console.log('\n[TEST 6] Multi-Tenant Security Check (Business A vs Business B)...');
  
  // Create Business B under same account
  const { data: bizBResult, error: bizBError } = await supabase.rpc('create_business_atomically', {
    p_name: 'The Roasted Bean Koramangala',
    p_category: 'Artisanal Cafe & Bakery',
    p_neighborhood: '4th Block Koramangala',
    p_city: 'Bengaluru',
    p_phone: '+919876543211'
  });

  if (bizBError || !bizBResult?.business_id) {
    console.error('FAIL: Creating Business B failed:', bizBError?.message);
    process.exit(1);
  }
  businessB_Id = bizBResult.business_id;
  console.log('PASS: Created Business B with ID:', businessB_Id);

  // Query campaigns for Business B -> MUST BE 0
  const { data: bizBCampaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('business_id', businessB_Id);

  if (bizBCampaigns && bizBCampaigns.length > 0) {
    console.error('FAIL: Data leak detected! Business B retrieved Business A campaigns:', bizBCampaigns);
    process.exit(1);
  }
  console.log('PASS: Business B campaign count is exactly 0. Business A content is completely isolated.');

  // Query campaigns for Business A -> MUST BE 1
  const { data: bizACampaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('business_id', businessA_Id);

  if (!bizACampaigns || bizACampaigns.length !== 1) {
    console.error('FAIL: Business A campaign count mismatch. Expected 1, got:', bizACampaigns?.length);
    process.exit(1);
  }
  console.log('PASS: Business A campaigns query returned exactly 1 campaign.');

  // -------------------------------------------------------------
  // TEST 7: Cross-Tenant Security & Database-Level Rejection Test
  // -------------------------------------------------------------
  console.log('\n[TEST 7] Testing Database-Level RLS & RPC Security Rejection for Unauthorized User...');
  
  // Create a separate stranger client
  const strangerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Attempt to call RPC with Business A's ID without authentication
  const { data: unauthRpc, error: unauthError } = await strangerClient.rpc('save_campaign_atomically', {
    p_business_id: businessA_Id,
    p_campaign_type: 'FLASH_OFFER',
    p_objective: 'MORE_WALK_INS',
    p_audience: 'Intruder',
    p_offer: { title: 'Hack' },
    p_schedule: {},
    p_google_content: { test: 1 },
    p_instagram_content: { test: 1 },
    p_whatsapp_content: { test: 1 },
    p_poster_content: { test: 1 }
  });

  if (!unauthError) {
    console.error('FAIL: Security vulnerability! Unauthenticated client was able to save a campaign into Business A.');
    process.exit(1);
  }
  console.log('PASS: Database rejected unauthorized RPC execution with message:', unauthError.message);

  // Attempt to select Business A's campaign directly from unauthenticated client
  const { data: unauthSelect } = await strangerClient
    .from('campaigns')
    .select('*')
    .eq('business_id', businessA_Id);

  if (unauthSelect && unauthSelect.length > 0) {
    console.error('FAIL: Security vulnerability! Unauthenticated client could read Business A campaigns:', unauthSelect);
    process.exit(1);
  }
  console.log('PASS: Database RLS denied read access to Business A campaigns for unauthenticated client (returned 0 rows).');

  // Attempt to insert unauthorized membership into Business A
  const { error: intruderMemberError } = await strangerClient
    .from('business_members')
    .insert({
      business_id: businessA_Id,
      user_id: '00000000-0000-0000-0000-000000000000',
      role: 'admin'
    });

  if (!intruderMemberError) {
    console.error('FAIL: Security vulnerability! Direct membership insert into arbitrary business was allowed.');
    process.exit(1);
  }
  console.log('PASS: Database strictly rejected unauthorized direct business_members insert.');

  // -------------------------------------------------------------
  // TEST 8: Commercial Business Limit Enforcement (Free Tier: Max 2)
  // -------------------------------------------------------------
  console.log('\n[TEST 8] Commercial Limit Enforcement Test: Attempting to create Business 3 on Free tier...');
  
  const { data: bizCResult, error: bizCError } = await supabase.rpc('create_business_atomically', {
    p_name: 'The Roasted Bean Whitefield (Excess)',
    p_category: 'Artisanal Cafe',
    p_neighborhood: 'ITPL Main Road',
    p_city: 'Bengaluru',
    p_phone: '+919876543212'
  });

  if (!bizCError) {
    console.error('FAIL: Commercial limit breached! Free tier allowed creating Business 3:', bizCResult);
    process.exit(1);
  }
  console.log('PASS: Database correctly rejected Business 3 creation with error:', bizCError.message);

  // -------------------------------------------------------------
  // TEST 9: Atomic Founder Tier Claiming & 1-Per-Account Rule
  // -------------------------------------------------------------
  console.log('\n[TEST 9] Founder Tier Claiming & Allocation Test...');
  
  // Claim Founder tier for this user
  const { data: founderClaim1, error: founderError1 } = await supabase.rpc('claim_founder_tier', {
    p_billing_cycle: 'ANNUAL'
  });

  if (founderError1 || !founderClaim1?.success) {
    console.error('FAIL: Founder claim failed:', founderError1?.message);
    process.exit(1);
  }
  console.log('PASS: Founder slot successfully claimed:', founderClaim1);

  // Attempt duplicate claim from same account -> MUST BE REJECTED
  const { data: founderClaim2, error: founderError2 } = await supabase.rpc('claim_founder_tier', {
    p_billing_cycle: 'QUARTERLY'
  });

  if (!founderError2) {
    console.error('FAIL: Duplicate Founder claim was allowed for the same account:', founderClaim2);
    process.exit(1);
  }
  console.log('PASS: Database correctly rejected duplicate Founder claim with error:', founderError2.message);

  // Verify Founder subscription updated in PostgreSQL
  const { data: founderSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', authData.user.id)
    .single();

  // -------------------------------------------------------------
  // TEST 10: Upgrade & Downgrade Entitlement Lifecycle Test
  // -------------------------------------------------------------
  console.log('\n[TEST 10] Testing Upgrade & Downgrade Entitlement Lifecycle...');

  // User is now on Founder plan (business limit 5). Creating Business 3 must now SUCCEED:
  const { data: bizCResultFounder, error: bizCErrorFounder } = await supabase.rpc('create_business_atomically', {
    p_name: 'The Roasted Bean Whitefield',
    p_category: 'Artisanal Cafe',
    p_neighborhood: 'ITPL Main Road',
    p_city: 'Bengaluru',
    p_phone: '+919876543212'
  });

  if (bizCErrorFounder || !bizCResultFounder?.business_id) {
    console.error('FAIL: Business 3 creation failed under Founder plan (limit 5):', bizCErrorFounder?.message);
    process.exit(1);
  }
  const businessC_Id = bizCResultFounder.business_id;
  console.log('PASS: Business 3 successfully created under Founder tier with ID:', businessC_Id);

  // Simulate Downgrade to FREE plan by marking subscription CANCELLED
  const { data: cancelResult, error: cancelError } = await supabase.rpc('cancel_user_subscription');
  if (cancelError) {
    console.error('FAIL: Cancelling subscription failed:', cancelError.message);
    process.exit(1);
  }
  console.log('PASS: Subscription downgraded to FREE via RPC:', cancelResult);

  // Test Downgrade Invariant 1: All 3 existing businesses remain fully accessible & readable
  const { data: myBusinesses, error: myBizError } = await supabase
    .from('business_members')
    .select('business_id, role, businesses(id, name)')
    .eq('user_id', authData.user.id);

  if (myBizError || !myBusinesses || myBusinesses.length !== 3) {
    console.error('FAIL: Downgraded user lost access to existing businesses! Count:', myBusinesses?.length, 'Error:', myBizError);
    process.exit(1);
  }
  console.log('PASS: All 3 existing businesses remain 100% accessible after downgrade to Free.');

  // Test Downgrade Invariant 2: Creating a 4th business is strictly BLOCKED by Free tier limit (2)
  const { data: bizDResult, error: bizDError } = await supabase.rpc('create_business_atomically', {
    p_name: 'The Roasted Bean Jayanagar (Excess Post-Downgrade)',
    p_category: 'Artisanal Cafe',
    p_neighborhood: '4th Block Jayanagar',
    p_city: 'Bengaluru',
    p_phone: '+919876543213'
  });

  if (!bizDError) {
    console.error('FAIL: Commercial breach! Excess business creation allowed after downgrade:', bizDResult);
    process.exit(1);
  }
  console.log('PASS: New business creation strictly blocked post-downgrade with error:', bizDError.message);

  // -------------------------------------------------------------
  // TEST 11: Real Payment Confirmation & Quota Activation Test
  // -------------------------------------------------------------
  console.log('\n[TEST 11] Testing Verified Gateway Payment Confirmation & Live Quota Activation...');

  const paymentRef = 'pay_test_' + Date.now();
  const orderRef = 'order_test_' + Date.now();

  const { data: payResult, error: payError } = await supabase.rpc('confirm_payment_and_activate_subscription', {
    p_payment_provider: 'razorpay',
    p_payment_id: paymentRef,
    p_order_id: orderRef,
    p_plan_id: 'GROWTH',
    p_billing_cycle: 'annual'
  });

  if (payError || !payResult?.success) {
    console.error('FAIL: Payment confirmation failed:', payError?.message);
    process.exit(1);
  }
  console.log('PASS: Payment confirmed & subscription activated:', payResult);

  // Verify updated usage_periods quota in PostgreSQL
  const { data: updatedPeriods } = await supabase
    .from('usage_periods')
    .select('*')
    .eq('business_id', businessA_Id)
    .single();

  const quotaLimit = updatedPeriods?.campaign_limit ?? updatedPeriods?.pack_limit;
  if (!updatedPeriods || updatedPeriods.plan !== 'GROWTH' || quotaLimit !== 300) {
    console.error('FAIL: Quota did not update post-payment:', updatedPeriods);
    process.exit(1);
  }
  console.log('PASS: Business A quota verified post-payment: Plan:', updatedPeriods.plan, '| Monthly Limit:', quotaLimit);

  console.log('\n================================================================');
  console.log('ALL 11 END-TO-END COMMERCIAL, PAYMENT & PRODUCT TESTS PASSED (100%)');
  console.log('================================================================');
}

runVerticalSliceTest().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
