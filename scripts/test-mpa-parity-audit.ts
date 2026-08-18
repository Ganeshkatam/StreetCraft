import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

function runTest(suite: string, name: string, fn: () => void | Promise<void>) {
  const start = Date.now();
  try {
    const res = fn();
    if (res && typeof (res as any).then === 'function') {
      return (res as Promise<void>)
        .then(() => {
          results.push({ suite, name, passed: true, durationMs: Date.now() - start });
        })
        .catch((err) => {
          results.push({ suite, name, passed: false, error: String(err?.message || err), durationMs: Date.now() - start });
        });
    } else {
      results.push({ suite, name, passed: true, durationMs: Date.now() - start });
    }
  } catch (err: any) {
    results.push({ suite, name, passed: false, error: String(err?.message || err), durationMs: Date.now() - start });
  }
}

async function main() {
  console.log('--------------------------------------------------');
  console.log('STREETCRAFT MPA PARITY, ROUTE & SECURITY AUDIT');
  console.log('--------------------------------------------------\n');

  const root = resolve(process.cwd());

  // 1. ROUTE INVENTORY AND SERVER COMPONENT CONVENTIONS
  const routes = [
    { path: 'src/user/page.tsx', isDynamic: false, hasMeta: true, desc: 'Landing Home' },
    { path: 'src/user/how-it-works/page.tsx', isDynamic: false, hasMeta: true, desc: 'How It Works' },
    { path: 'src/user/pricing/page.tsx', isDynamic: false, hasMeta: true, desc: 'Pricing Rates' },
    { path: 'src/user/free-tool/page.tsx', isDynamic: false, hasMeta: true, desc: 'Free Campaign Tool' },
    { path: 'src/user/contact/page.tsx', isDynamic: false, hasMeta: true, desc: 'Founder Contact' },
    { path: 'src/user/privacy/page.tsx', isDynamic: false, hasMeta: true, desc: 'Privacy Policy' },
    { path: 'src/user/terms/page.tsx', isDynamic: false, hasMeta: true, desc: 'Terms of Service' },
    { path: 'src/user/not-found.tsx', isDynamic: false, hasMeta: false, desc: '404 Recovery State' },
    { path: 'src/user/login/page.tsx', isDynamic: false, hasMeta: true, desc: 'Store Operator Sign-In' },
    { path: 'src/user/signup/page.tsx', isDynamic: false, hasMeta: true, desc: 'Account Registration' },
    { path: 'src/user/forgot-password/page.tsx', isDynamic: false, hasMeta: true, desc: 'Password Reset Request' },
    { path: 'src/user/reset-password/page.tsx', isDynamic: false, hasMeta: true, desc: 'Password Reset Confirm' },
    { path: 'src/user/setup/page.tsx', isDynamic: false, hasMeta: true, desc: 'Store Setup & Onboarding' },
    { path: 'src/user/user/today/page.tsx', isDynamic: true, hasMeta: true, desc: 'Workspace Today Dashboard' },
    { path: 'src/user/user/create/page.tsx', isDynamic: true, hasMeta: true, desc: 'Campaign Composer' },
    { path: 'src/user/user/campaigns/page.tsx', isDynamic: true, hasMeta: true, desc: 'Campaign Vault' },
    { path: 'src/user/user/campaigns/[id]/page.tsx', isDynamic: true, hasMeta: true, desc: 'Campaign Detail' },
    { path: 'src/user/user/business/page.tsx', isDynamic: true, hasMeta: true, desc: 'Business Profile Settings' },
    { path: 'src/user/user/billing/page.tsx', isDynamic: true, hasMeta: true, desc: 'Billing & Usage' },
    { path: 'src/user/user/account/page.tsx', isDynamic: true, hasMeta: true, desc: 'Account Profile' },
    { path: 'src/user/user/auth-proof/page.tsx', isDynamic: true, hasMeta: false, desc: 'SSR Auth Proof' },
  ];

  for (const r of routes) {
    runTest('Route Structure', `Verifying ${r.desc} (${r.path})`, () => {
      const fullPath = resolve(root, r.path);
      if (!existsSync(fullPath)) {
        throw new Error(`File does not exist: ${r.path}`);
      }
      const content = readFileSync(fullPath, 'utf8');
      if (r.hasMeta && !content.includes('metadata: Metadata')) {
        throw new Error(`Route ${r.path} is missing export const metadata: Metadata`);
      }
      if (r.isDynamic && !content.includes("export const dynamic = 'force-dynamic'")) {
        throw new Error(`Workspace route ${r.path} must export dynamic = 'force-dynamic'`);
      }
    });
  }

  // 2. SUSPENSE BOUNDARIES FOR SEARCH PARAMS
  const suspenseRoutes = [
    { file: 'src/user/login/LoginView.tsx', name: 'LoginView' },
    { file: 'src/user/setup/SetupView.tsx', name: 'SetupView' },
  ];

  for (const sr of suspenseRoutes) {
    runTest('Suspense Boundary', `Verify <Suspense> wrapping in ${sr.file}`, () => {
      const content = readFileSync(resolve(root, sr.file), 'utf8');
      if (!content.includes('<Suspense')) {
        throw new Error(`${sr.file} is missing <Suspense> wrapper`);
      }
    });
  }

  // 3. ZERO LEGACY REACT-ROUTER IN APP ROUTER DIRECTORY
  runTest('Isolation Boundary', 'Verify zero react-router-dom imports in src/user directory', () => {
    const checkDir = (dir: string) => {
      const files = readdirSync(dir, { withFileTypes: true });
      for (const f of files) {
        const full = resolve(dir, f.name);
        if (f.isDirectory()) {
          checkDir(full);
        } else if (f.name.endsWith('.tsx') || f.name.endsWith('.ts')) {
          const text = readFileSync(full, 'utf8');
          if (text.includes("from 'react-router-dom'") || text.includes('from "react-router-dom"')) {
            throw new Error(`Found react-router-dom import in App Router file: ${full}`);
          }
        }
      }
    };
    checkDir(resolve(root, 'src/user'));
  });

  // 4. PUBLIC HEADER INTEGRATION
  const publicViews = [
    'src/user/page.tsx',
    'src/user/how-it-works/HowItWorksView.tsx',
    'src/user/pricing/PricingView.tsx',
    'src/user/free-tool/FreeToolView.tsx',
    'src/user/contact/ContactView.tsx',
    'src/user/privacy/page.tsx',
    'src/user/terms/page.tsx',
  ];

  for (const pv of publicViews) {
    runTest('Public Header', `Verify PublicHeader usage in ${pv}`, () => {
      const text = readFileSync(resolve(root, pv), 'utf8');
      if (!text.includes('PublicHeader') && !text.includes('<PublicHeader')) {
        throw new Error(`File ${pv} does not use PublicHeader`);
      }
    });
  }

  // 5. SERVER AUTHENTICATION MIDDLEWARE RULES
  runTest('Security Boundary', 'Verify Middleware static bypass & auth protection rules', () => {
    const mw = readFileSync(resolve(root, 'middleware.ts'), 'utf8');
    if (!mw.includes('_next/static') || !mw.includes('_next/image')) {
      throw new Error('middleware.ts missing static asset bypass matcher');
    }
    const supMw = readFileSync(resolve(root, 'src/lib/supabase/middleware.ts'), 'utf8');
    if (!supMw.includes('supabase.auth.getUser()')) {
      throw new Error('Middleware must use getUser() for server verification instead of getSession()');
    }
    if (!supMw.includes('private, no-cache, no-store, max-age=0, must-revalidate')) {
      throw new Error('Middleware must inject non-cacheable security headers on protected workspace routes');
    }
  });

  // Print Summary
  console.log('\nAudit Results:');
  let passCount = 0;
  for (const r of results) {
    if (r.passed) {
      passCount++;
      console.log(`[PASS] [${r.suite}] ${r.name} (${r.durationMs}ms)`);
    } else {
      console.error(`[FAIL] [${r.suite}] ${r.name}: ${r.error}`);
    }
  }

  console.log(`\n${passCount} / ${results.length} assertions passed.\n`);

  if (passCount !== results.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
