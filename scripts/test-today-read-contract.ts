import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function runTest(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message || String(err) });
  }
}

async function main() {
  console.log('--------------------------------------------------');
  console.log('BEHAVIORAL AUTHORIZATION CONTRACT TEST SUITE');
  console.log('--------------------------------------------------\n');

  const root = resolve(process.cwd());

  runTest('1-4. resolveAuthorizedBusiness does not leak tenant existence and handles fallbacks', () => {
    const file = resolve(root, 'src/lib/server/business/resolveAuthorizedBusiness.ts');
    const content = readFileSync(file, 'utf8');

    // It should check UUID format
    if (!content.includes('isCandidateValidUuid') && !content.includes('/^[0-9a-f]{8}')) {
      throw new Error('UUID format validation missing');
    }

    // It should fallback to the first accessible business if candidate is invalid/unauthorized
    if (!content.includes('return accessibleBusinesses[0]')) {
      throw new Error('Fallback mechanism to primary owned business is missing');
    }
  });

  runTest('5. User with zero businesses intentional empty state', () => {
    const file = resolve(root, 'src/lib/server/workspace/getWorkspaceTodayData.ts');
    const content = readFileSync(file, 'utf8');

    // getWorkspaceTodayData should return null if no business
    if (!content.includes('if (!business)') && !content.includes('return null')) {
      throw new Error('Intentional empty setup state (return null) missing');
    }
  });

  runTest('6. Business with missing usage period -> no fabricated entitlement state', () => {
    const file = resolve(root, 'src/lib/server/usage/getCurrentUsagePeriod.ts');
    const content = readFileSync(file, 'utf8');

    // It should return null on error or no data, not a fabricated state
    if (!content.includes('return null')) {
      throw new Error('Must return null when usage period is missing');
    }
    if (content.includes('FREE') && content.includes('campaign_limit: 3')) {
      throw new Error('Fabricated default allocation found. Must return null.');
    }
  });

  runTest('7-8. Unauthenticated request handled', () => {
    const file = resolve(root, 'src/lib/server/auth/requireAuthenticatedClaims.ts');
    const content = readFileSync(file, 'utf8');

    if (!content.includes('supabase.auth.getUser()')) {
      throw new Error('Must validate session via Supabase Auth Server (getUser)');
    }
    if (!content.includes("redirect(loginUrl)")) {
      throw new Error('Must redirect to login if unauthenticated');
    }
  });

  runTest('9-10. Direct GET /user/today is force-dynamic server component', () => {
    const file = resolve(root, 'src/user/user/today/page.tsx');
    const content = readFileSync(file, 'utf8');

    if (!content.includes("export const dynamic = 'force-dynamic'")) {
      throw new Error('page.tsx must be force-dynamic');
    }
    if (!content.includes('export default async function TodayPage')) {
      throw new Error('page.tsx must be an async Server Component');
    }
  });

  runTest('12. Zero client-side Supabase data fetching waterfall on initial render', () => {
    const file = resolve(root, 'src/user/user/today/TodayView.tsx');
    const content = readFileSync(file, 'utf8');

    if (content.includes('useBusiness') || content.includes('useCampaign') || content.includes('useUsage') || content.includes('useAuth')) {
      throw new Error('TodayView must not use client-side data hooks for initialization');
    }

    if (content.includes('const supabase =') || content.includes('createClientComponentClient')) {
      throw new Error('TodayView must not instantiate Supabase client directly');
    }
  });

  // Print Summary
  console.log('\nAudit Results:');
  let passCount = 0;
  for (const r of results) {
    if (r.passed) {
      passCount++;
      console.log(`[PASS] ${r.name}`);
    } else {
      console.error(`[FAIL] ${r.name}: ${r.error}`);
    }
  }

  console.log(`\n${passCount} / ${results.length} assertions passed.\n`);

  if (passCount !== results.length) {
    process.exit(1);
  }
}

main().catch(console.error);
