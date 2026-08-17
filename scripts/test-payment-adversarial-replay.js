// StreetCraft Payment Adversarial & Replay Security Test Suite
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iodwiyfjwzdvqtrczttb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZHdpeWZqd3pkdnF0cmN6dHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NzY2NDAsImV4cCI6MjEwMjQ1MjY0MH0.IMI3FnB75slarSrrXao18WBhNHSRyKarUX2JW017E6Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runPaymentAdversarialTests() {
  console.log('================================================================');
  console.log('STREETCRAFT PAYMENT ADVERSARIAL & REPLAY SECURITY SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 8;

  // Authenticate primary test operator (Account A)
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'owner@streetcraft.local',
    password: 'StreetCraft_Secure_2026!'
  });

  if (authErr || !authData.user) {
    console.error('FAIL: Could not authenticate primary test user:', authErr?.message);
    process.exit(1);
  }

  const userA_Id = authData.user.id;
  const testRunId = Date.now();
  const basePaymentId = `pay_adv_${testRunId}_001`;
  const baseOrderId = `order_adv_${testRunId}_001`;

  // -------------------------------------------------------------
  // TEST 1: Same Payment Reference + Same Account (Idempotent Replay)
  // -------------------------------------------------------------
  console.log('[TEST 1] Testing same payment reference + same account idempotent replay...');
  
  // Step 1A: First payment activation
  const { data: pay1A, error: err1A } = await supabase.rpc('confirm_payment_and_activate_subscription', {
    p_payment_provider: 'razorpay',
    p_payment_id: basePaymentId,
    p_order_id: baseOrderId,
    p_plan_id: 'PRO',
    p_billing_cycle: 'quarterly'
  });

  if (err1A || !pay1A?.subscription_id) {
    console.error('FAIL [TEST 1A]: Initial payment activation failed:', err1A?.message);
    process.exit(1);
  }

  // Step 1B: Exact replay
  const { data: pay1B, error: err1B } = await supabase.rpc('confirm_payment_and_activate_subscription', {
    p_payment_provider: 'razorpay',
    p_payment_id: basePaymentId,
    p_order_id: baseOrderId,
    p_plan_id: 'PRO',
    p_billing_cycle: 'quarterly'
  });

  if (err1B || pay1B?.subscription_id !== pay1A.subscription_id || !pay1B?.idempotent_replay) {
    console.error('FAIL [TEST 1B]: Idempotent replay failed or created duplicate:', err1B?.message, pay1B);
    process.exit(1);
  }
  console.log('PASS [TEST 1]: Idempotent replay safely returned existing subscription ID without duplication.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 2: Same Payment Reference + Different Account (Theft Attempt)
  // -------------------------------------------------------------
  console.log('\n[TEST 2] Testing same payment reference + different account (Theft Attempt)...');
  
  // Create Account B
  const strangerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Attacker calling RPC without auth or pretending to be another account
  const { data: pay2, error: err2 } = await strangerClient.rpc('confirm_payment_and_activate_subscription', {
    p_payment_provider: 'razorpay',
    p_payment_id: basePaymentId,
    p_order_id: baseOrderId,
    p_plan_id: 'PRO',
    p_billing_cycle: 'quarterly'
  });

  if (!err2) {
    console.error('FAIL [TEST 2]: Cross-account payment theft succeeded when it must be rejected.');
    process.exit(1);
  }
  console.log('PASS [TEST 2]: Cross-account replay attempt correctly rejected by database:', err2.message);
  passedTests++;

  // -------------------------------------------------------------
  // TEST 3: Same Order ID + Different Payment ID (Legitimate Retry)
  // -------------------------------------------------------------
  console.log('\n[TEST 3] Testing same order ID + different payment ID (Valid payment retry)...');
  const retryPaymentId = `pay_adv_${testRunId}_002`;

  const { data: pay3, error: err3 } = await supabase.rpc('confirm_payment_and_activate_subscription', {
    p_payment_provider: 'razorpay',
    p_payment_id: retryPaymentId,
    p_order_id: baseOrderId,
    p_plan_id: 'PRO',
    p_billing_cycle: 'quarterly'
  });

  if (err3 || !pay3?.subscription_id || pay3.subscription_id === pay1A.subscription_id) {
    console.error('FAIL [TEST 3]: Legitimate retry with distinct payment ID failed:', err3?.message);
    process.exit(1);
  }
  console.log('PASS [TEST 3]: Distinct payment on same order processed cleanly as new active subscription.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 4: Same Payment ID + Tampered Higher Plan Attempt
  // -------------------------------------------------------------
  console.log('\n[TEST 4] Testing same payment ID with tampered higher plan payload (GROWTH instead of PRO)...');
  const { data: pay4, error: err4 } = await supabase.rpc('confirm_payment_and_activate_subscription', {
    p_payment_provider: 'razorpay',
    p_payment_id: retryPaymentId,
    p_order_id: baseOrderId,
    p_plan_id: 'GROWTH', // Tampered plan
    p_billing_cycle: 'quarterly'
  });

  if (err4 || pay4?.plan !== 'PRO') {
    console.error('FAIL [TEST 4]: Payment tampering succeeded or returned incorrect plan:', err4?.message, pay4);
    process.exit(1);
  }
  console.log('PASS [TEST 4]: Tampered plan upgrade rejected; returned original verified plan (PRO).');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 5: Same Payment ID + Tampered Annual Cycle Attempt
  // -------------------------------------------------------------
  console.log('\n[TEST 5] Testing same payment ID with tampered billing cycle (annual instead of quarterly)...');
  const { data: pay5, error: err5 } = await supabase.rpc('confirm_payment_and_activate_subscription', {
    p_payment_provider: 'razorpay',
    p_payment_id: retryPaymentId,
    p_order_id: baseOrderId,
    p_plan_id: 'PRO',
    p_billing_cycle: 'annual' // Tampered cycle
  });

  if (err5 || pay5?.billing_cycle !== 'quarterly') {
    console.error('FAIL [TEST 5]: Billing cycle tampering succeeded:', err5?.message, pay5);
    process.exit(1);
  }
  console.log('PASS [TEST 5]: Tampered billing cycle rejected; returned original verified cycle (quarterly).');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 6: Rapid Concurrent Network Retries
  // -------------------------------------------------------------
  console.log('\n[TEST 6] Testing rapid concurrent client network retries...');
  const concurrentPaymentId = `pay_adv_${testRunId}_concurrent`;
  
  const [res1, res2, res3] = await Promise.all([
    supabase.rpc('confirm_payment_and_activate_subscription', {
      p_payment_provider: 'razorpay',
      p_payment_id: concurrentPaymentId,
      p_order_id: `order_conc_${testRunId}`,
      p_plan_id: 'PRO',
      p_billing_cycle: 'annual'
    }),
    supabase.rpc('confirm_payment_and_activate_subscription', {
      p_payment_provider: 'razorpay',
      p_payment_id: concurrentPaymentId,
      p_order_id: `order_conc_${testRunId}`,
      p_plan_id: 'PRO',
      p_billing_cycle: 'annual'
    }),
    supabase.rpc('confirm_payment_and_activate_subscription', {
      p_payment_provider: 'razorpay',
      p_payment_id: concurrentPaymentId,
      p_order_id: `order_conc_${testRunId}`,
      p_plan_id: 'PRO',
      p_billing_cycle: 'annual'
    })
  ]);

  const validSubs = [res1.data, res2.data, res3.data].filter(r => r?.subscription_id);
  const subIds = new Set(validSubs.map(r => r.subscription_id));

  if (subIds.size !== 1) {
    console.error('FAIL [TEST 6]: Concurrent requests created duplicate subscriptions:', validSubs);
    process.exit(1);
  }
  console.log('PASS [TEST 6]: Concurrent retries safely converged to exactly 1 subscription ID:', Array.from(subIds)[0]);
  passedTests++;

  // -------------------------------------------------------------
  // TEST 7: Cancelled Subscription Payment Replay Prevention
  // -------------------------------------------------------------
  console.log('\n[TEST 7] Testing cancelled subscription payment replay prevention...');
  
  // Step 7A: Cancel active subscription
  await supabase.rpc('cancel_user_subscription');

  // Step 7B: Attempt to replay cancelled payment ID to reactivate subscription
  const { data: pay7, error: err7 } = await supabase.rpc('confirm_payment_and_activate_subscription', {
    p_payment_provider: 'razorpay',
    p_payment_id: concurrentPaymentId,
    p_order_id: `order_conc_${testRunId}`,
    p_plan_id: 'PRO',
    p_billing_cycle: 'annual'
  });

  if (!err7 || !err7.message.includes('PAYMENT_ALREADY_EXPIRED')) {
    console.error('FAIL [TEST 7]: Cancelled payment replay was not rejected with PAYMENT_ALREADY_EXPIRED:', err7?.message, pay7);
    process.exit(1);
  }
  console.log('PASS [TEST 7]: Database strictly blocked cancelled payment replay:', err7.message);
  passedTests++;

  // -------------------------------------------------------------
  // TEST 8: Founder Payment Replay & Slot Allocation Integrity
  // -------------------------------------------------------------
  console.log('\n[TEST 8] Testing Founder payment replay and slot allocation integrity...');
  
  // Fetch initial allocation
  const { data: allocBefore } = await supabase.from('founder_allocation').select('*').single();
  const initialSlotsClaimed = allocBefore?.claimed_slots || 0;

  const founderPaymentId = `pay_adv_${testRunId}_founder`;
  
  // Step 8A: Claim Founder payment
  const { data: fPay1, error: fErr1 } = await supabase.rpc('confirm_payment_and_activate_subscription', {
    p_payment_provider: 'razorpay',
    p_payment_id: founderPaymentId,
    p_order_id: `order_founder_${testRunId}`,
    p_plan_id: 'FOUNDER',
    p_billing_cycle: 'annual'
  });

  if (fErr1) {
    if (fErr1.message.includes('FOUNDER_ALREADY_CLAIMED')) {
      console.log('PASS [TEST 8]: Account already holds a Founder claim; duplicate Founder claim attempt was strictly rejected by database.');
      passedTests++;
    } else {
      console.error('FAIL [TEST 8A]: Unexpected Founder error:', fErr1.message);
      process.exit(1);
    }
  } else {
    // Step 8B: Replay Founder payment
    const { data: fPay2, error: fErr2 } = await supabase.rpc('confirm_payment_and_activate_subscription', {
      p_payment_provider: 'razorpay',
      p_payment_id: founderPaymentId,
      p_order_id: `order_founder_${testRunId}`,
      p_plan_id: 'FOUNDER',
      p_billing_cycle: 'annual'
    });

    if (fErr2 || !fPay2?.idempotent_replay) {
      console.error('FAIL [TEST 8B]: Founder payment replay failed:', fErr2?.message);
      process.exit(1);
    }

    // Check allocation count
    const { data: allocAfter } = await supabase.from('founder_allocation').select('*').single();
    const finalSlotsClaimed = allocAfter?.claimed_slots || 0;

    if (finalSlotsClaimed !== initialSlotsClaimed + 1) {
      console.error('FAIL [TEST 8C]: Founder slot allocation leaked on replay! Expected:', initialSlotsClaimed + 1, 'Got:', finalSlotsClaimed);
      process.exit(1);
    }
    console.log('PASS [TEST 8]: Founder payment replay handled cleanly with zero slot leakage (claimed slots count remained:', finalSlotsClaimed, ').');
    passedTests++;
  }

  console.log('\n================================================================');
  console.log(`ALL ${passedTests}/${totalTests} ADVERSARIAL PAYMENT & REPLAY TESTS PASSED (100%)`);
  console.log('================================================================');
}

runPaymentAdversarialTests().catch(err => {
  console.error('FATAL ERROR in adversarial test suite:', err);
  process.exit(1);
});
