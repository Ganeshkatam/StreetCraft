import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, join, extname } from 'path';

interface AuditCheck {
  id: string;
  description: string;
  passed: boolean;
  details?: string;
}

const checks: AuditCheck[] = [];

function recordCheck(id: string, description: string, passed: boolean, details?: string) {
  checks.push({ id, description, passed, details });
}

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  if (!existsSync(dir)) return fileList;
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.next' && item !== '.git') {
        getAllFiles(fullPath, fileList);
      }
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

async function runAudit() {
  console.log('====================================================');
  console.log('PHASE 3: LEGACY SPA & APP ROUTER CONSOLIDATION AUDIT');
  console.log('====================================================\n');

  const root = resolve(process.cwd());

  // 1. Filesystem Deletion Verification
  const forbiddenPaths = [
    join(root, 'index.html'),
    join(root, 'dist'),
    join(root, 'src', 'main.tsx'),
    join(root, 'src', 'views'),
    join(root, 'src', 'components', 'Navigation.tsx'),
    join(root, 'src', 'components', 'ProtectedRoute.tsx'),
    join(root, 'src', 'components', 'Footer.tsx'),
  ];

  for (const forbidden of forbiddenPaths) {
    const relativePath = forbidden.replace(root + '\\', '').replace(root + '/', '');
    const exists = existsSync(forbidden);
    recordCheck(
      `ABSENCE_${relativePath.replace(/[^a-zA-Z0-9]/g, '_')}`,
      `Forbidden legacy path '${relativePath}' is absent from repository`,
      !exists,
      exists ? `Path still exists at ${forbidden}` : 'Verified absent'
    );
  }

  // 2. package.json Dependency Assertion
  const packageJsonPath = join(root, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const allDeps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };

  const hasReactRouter = Boolean(allDeps['react-router-dom'] || allDeps['react-router']);
  recordCheck(
    'DEP_REACT_ROUTER_ABSENT',
    'react-router-dom is completely removed from package.json dependencies',
    !hasReactRouter,
    hasReactRouter ? 'react-router-dom found in package.json' : 'Verified absent from dependencies'
  );

  // 3. Static Code Reference Scan
  const srcFiles = getAllFiles(join(root, 'src')).filter((f) =>
    ['.ts', '.tsx', '.js', '.mjs', '.jsx'].includes(extname(f))
  );
  srcFiles.push(join(root, 'middleware.ts'));
  srcFiles.push(join(root, 'next.config.mjs'));

  const forbiddenPatterns = [
    { pattern: /from\s+['"]react-router-dom['"]/, label: "import from 'react-router-dom'" },
    { pattern: /from\s+['"]react-router['"]/, label: "import from 'react-router'" },
    { pattern: /<BrowserRouter/, label: 'BrowserRouter JSX' },
    { pattern: /<Routes[\s>]/, label: 'Routes JSX element' },
    { pattern: /from\s+['"].*\/views\/.*['"]/, label: 'Import from legacy src/views/' },
    { pattern: /from\s+['"].*components\/Navigation['"]/, label: 'Import from legacy Navigation component' },
    { pattern: /from\s+['"].*components\/ProtectedRoute['"]/, label: 'Import from legacy ProtectedRoute component' },
    { pattern: /from\s+['"].*components\/Footer['"]/, label: 'Import from legacy Footer component' },
  ];

  for (const { pattern, label } of forbiddenPatterns) {
    let violationCount = 0;
    const violations: string[] = [];

    for (const filePath of srcFiles) {
      const content = readFileSync(filePath, 'utf8');
      if (pattern.test(content)) {
        violationCount++;
        violations.push(filePath.replace(root + '\\', '').replace(root + '/', ''));
      }
    }

    recordCheck(
      `PATTERN_${label.replace(/[^a-zA-Z0-9]/g, '_')}`,
      `Zero occurrences of ${label} across all production source files`,
      violationCount === 0,
      violationCount === 0 ? 'Zero references detected' : `Found in: ${violations.join(', ')}`
    );
  }

  // 4. Print Results
  let passedCount = 0;
  let failedCount = 0;

  for (const check of checks) {
    if (check.passed) {
      passedCount++;
      console.log(`[PASS] ${check.description}`);
    } else {
      failedCount++;
      console.log(`[FAIL] ${check.description}`);
      if (check.details) {
        console.log(`       Details: ${check.details}`);
      }
    }
  }

  console.log('\n----------------------------------------------------');
  console.log(`Audit Summary: ${passedCount} Passed, ${failedCount} Failed`);
  console.log('----------------------------------------------------\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
