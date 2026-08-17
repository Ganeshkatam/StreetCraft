import { z } from 'zod';
import { readFileSync } from 'fs';
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

import { BusinessProfileSchema } from '../src/lib/server/business/updateBusinessProfile';

async function main() {
  console.log('--------------------------------------------------');
  console.log('PHASE 5.2 BUSINESS MUTATION CONTRACT TEST SUITE');
  console.log('--------------------------------------------------\n');

  const root = resolve(process.cwd());

  // 1. Zod Validation Tests
  runTest('Validation: Empty required fields fail', () => {
    const res = BusinessProfileSchema.safeParse({ name: '', category: '' });
    if (res.success) throw new Error('Should fail on empty name/category');
  });

  runTest('Validation: Whitespace-only strings are trimmed and fail if required', () => {
    const res = BusinessProfileSchema.safeParse({ name: '   ', category: '   ' });
    if (res.success) throw new Error('Should fail on whitespace-only required fields');
  });

  runTest('Validation: Maximum lengths enforced', () => {
    const longName = 'A'.repeat(61);
    const res = BusinessProfileSchema.safeParse({ name: longName, category: 'Cafe' });
    if (res.success) throw new Error('Should fail on over-maximum length');
  });

  runTest('Validation: Negative numbers rejected for avg_ticket_inr', () => {
    const res = BusinessProfileSchema.safeParse({ name: 'Valid', category: 'Cafe', avg_ticket_inr: -10 });
    if (res.success) throw new Error('Should fail on negative numbers');
  });

  runTest('Validation: Decimal numbers rejected for avg_ticket_inr (must be int)', () => {
    const res = BusinessProfileSchema.safeParse({ name: 'Valid', category: 'Cafe', avg_ticket_inr: 10.5 });
    if (res.success) throw new Error('Should fail on decimal numbers');
  });

  runTest('Validation: Zero converted to null/empty semantics', () => {
    const res = BusinessProfileSchema.safeParse({ name: 'Valid', category: 'Cafe', avg_ticket_inr: 0 });
    if (!res.success) throw new Error('Should succeed on 0');
    if (res.data.avg_ticket_inr !== null) throw new Error('Zero should transform to null for integers in our semantic');
  });

  runTest('Validation: Very large integers rejected', () => {
    const res = BusinessProfileSchema.safeParse({ name: 'Valid', category: 'Cafe', avg_ticket_inr: 1000000 });
    if (res.success) throw new Error('Should fail on extremely large integers');
  });

  runTest('Validation: Missing optional fields transform to deterministic empty strings/nulls', () => {
    const res = BusinessProfileSchema.safeParse({ name: 'Valid', category: 'Cafe' });
    if (!res.success) throw new Error('Should succeed with only required fields');
    if (res.data.neighborhood !== '') throw new Error('Missing string should transform to empty string');
    if (res.data.avg_ticket_inr !== null && res.data.avg_ticket_inr !== undefined) throw new Error('Missing number should be null/undefined');
  });

  // 2. Server Action Static Analysis
  runTest('Server Action: No client Supabase writes or direct `businesses` mutation', () => {
    const file = resolve(root, 'src/lib/server/business/updateBusinessProfile.ts');
    const content = readFileSync(file, 'utf8');
    
    if (content.includes("from('businesses')")) {
      throw new Error('Server action mutates businesses directly!');
    }
    if (!content.includes(".from('business_profiles')")) {
      throw new Error('Server action must mutate business_profiles');
    }
    if (!content.includes('requireAuthenticatedClaims')) {
      throw new Error('Missing authentication verification');
    }
    if (!content.includes('resolveAuthorizedBusiness')) {
      throw new Error('Missing tenant authorization');
    }
    if (!content.includes('revalidatePath')) {
      throw new Error('Missing cache revalidation');
    }
  });

  // 3. UI Component Static Analysis
  runTest('UI: Form uses action state correctly with no client data fetching', () => {
    const file = resolve(root, 'src/app/app/business/BusinessView.tsx');
    const content = readFileSync(file, 'utf8');
    
    if (content.includes('useBusiness(') || content.includes('useAuth(') || content.includes('supabase.')) {
      throw new Error('UI component uses client-side Supabase or data hooks');
    }
    if (!content.includes('useActionState')) {
      throw new Error('UI component missing React 19 useActionState');
    }
    if (!content.includes('errors.name')) {
      throw new Error('UI component missing field-level error rendering');
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
