/**
 * StreetCraft MPA Server-Rendering Verification Suite
 *
 * Starts the production Next.js server and tests raw HTTP responses
 * for server provenance, complete semantic HTML, SEO meta tags, and 404 boundaries.
 */

import http from 'http';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 3005;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function fetchRaw(urlPath: string): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}${urlPath}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode || 0,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(5000, () => {
      req.destroy(new Error('HTTP request timed out'));
    });
  });
}

async function waitForServer(retries = 30, delayMs = 500): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await fetchRaw('/');
      return;
    } catch {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error(`Next.js server failed to respond on ${BASE_URL} after ${retries * delayMs}ms`);
}

async function runMpaVerification() {
  console.log('================================================================');
  console.log('STREETCRAFT PHASE 2 — MPA SERVER-RENDERING PROVENANCE SUITE');
  console.log('================================================================\n');

  console.log(`[STAGE 1] Starting production Next.js server on port ${PORT}...`);
  
  // Start production next start
  const serverProcess: ChildProcess = spawn(
    'npx',
    ['next', 'start', '-p', String(PORT)],
    {
      cwd: ROOT_DIR,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PORT: String(PORT) },
    }
  );

  let serverOutput = '';
  serverProcess.stdout?.on('data', (d) => (serverOutput += d.toString()));
  serverProcess.stderr?.on('data', (d) => (serverOutput += d.toString()));

  const cleanup = () => {
    try {
      serverProcess.kill();
    } catch {}
  };

  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  try {
    await waitForServer();
    console.log(`PASS: Next.js production server listening at ${BASE_URL}\n`);

    let passed = 0;
    let failed = 0;

    // -------------------------------------------------------------
    // TEST 1: Server-Rendered GET / Route Provenance
    // -------------------------------------------------------------
    console.log('[TEST 1] Fetching raw HTTP response for GET /...');
    const rootRes = await fetchRaw('/');

    if (rootRes.status === 200) {
      console.log('PASS [1.1]: HTTP Status Code is 200 OK');
      passed++;
    } else {
      console.error(`FAIL [1.1]: Expected 200, got status ${rootRes.status}`);
      failed++;
    }

    // Assert SEO title and meta description exist in raw HTML
    const titleMatch = rootRes.body.includes('StreetCraft — A Growth Engine for Physical Businesses');
    if (titleMatch) {
      console.log('PASS [1.2]: Canonical SEO <title> rendered server-side in raw HTML');
      passed++;
    } else {
      console.error('FAIL [1.2]: Missing canonical <title> tag in raw server response');
      failed++;
    }

    const descMatch = rootRes.body.includes('Turn one business opportunity into everything customers need to see');
    if (descMatch) {
      console.log('PASS [1.3]: Meta description & primary narrative rendered in raw HTML');
      passed++;
    } else {
      console.error('FAIL [1.3]: Meta description or narrative missing in raw server response');
      failed++;
    }

    // Assert 4 Touchpoints are present in server-rendered document
    const gmbMatch = rootRes.body.includes('Google Business Update');
    const igMatch = rootRes.body.includes('Instagram Proof');
    const waMatch = rootRes.body.includes('WhatsApp VIP Broadcast');
    const printMatch = rootRes.body.includes('In-Store Counter Card');

    if (gmbMatch && igMatch && waMatch && printMatch) {
      console.log('PASS [1.4]: All 4 customer touchpoints rendered server-side in HTML');
      passed++;
    } else {
      console.error('FAIL [1.4]: Missing 4 touchpoints in raw server response');
      failed++;
    }

    // Assert Editorial Footer is present in server-rendered document
    const footerMatch = rootRes.body.includes('editorial-footer');
    if (footerMatch) {
      console.log('PASS [1.5]: Editorial footer rendered server-side');
      passed++;
    } else {
      console.error('FAIL [1.5]: Editorial footer missing in raw server response');
      failed++;
    }

    // -------------------------------------------------------------
    // TEST 2: Global 404 Not-Found Boundary
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Fetching raw HTTP response for invalid path GET /invalid-test-path-404...');
    const notFoundRes = await fetchRaw('/invalid-test-path-404');

    if (notFoundRes.status === 404) {
      console.log('PASS [2.1]: HTTP Status Code is 404 Not Found');
      passed++;
    } else {
      console.error(`FAIL [2.1]: Expected 404, got status ${notFoundRes.status}`);
      failed++;
    }

    if (notFoundRes.body.includes('Page not found')) {
      console.log('PASS [2.2]: Global 404 recovery boundary rendered in raw HTML');
      passed++;
    } else {
      console.error('FAIL [2.2]: 404 recovery copy missing in raw server response');
      failed++;
    }

    console.log('\n================================================================');
    console.log(`MPA PROVENANCE SUITE: ${passed} PASSED, ${failed} FAILED out of 7 assertions`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    cleanup();
  }
}

runMpaVerification().catch((err) => {
  console.error('Unhandled MPA verification failure:', err);
  process.exit(1);
});
