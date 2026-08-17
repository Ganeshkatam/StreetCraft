/**
 * StreetCraft Layout Routing Verification
 *
 * Statically verifies that getFooterVariant() and navigation visibility
 * produce the correct result for every route in the application.
 */

// Replicate the exact logic from main.tsx
function getFooterVariant(pathname: string): 'full' | 'compact' | 'legal' | null {
  const isAppView = pathname.startsWith('/app');
  const isAuthView =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/setup' ||
    pathname === '/onboarding' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';
  const isSystemView =
    pathname === '/unauthorized' ||
    pathname === '/not-found' ||
    pathname === '/error';

  if (isAppView || isAuthView || isSystemView) return null;
  if (pathname === '/privacy' || pathname === '/terms') return 'legal';
  if (pathname === '/free-tool' || pathname === '/contact') return 'compact';
  if (pathname === '/' || pathname === '/how-it-works' || pathname === '/pricing') return 'full';
  return null;
}

function getShowsNavigation(pathname: string): boolean {
  const isAuthView =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/setup' ||
    pathname === '/onboarding' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';
  const isSystemView =
    pathname === '/unauthorized' ||
    pathname === '/not-found' ||
    pathname === '/error';
  return !isAuthView && !isSystemView;
}

function getLayoutType(pathname: string): 'public' | 'workspace' {
  return pathname.startsWith('/app') ? 'workspace' : 'public';
}

// Complete route matrix
const ROUTE_EXPECTATIONS: Array<{
  route: string;
  expectedFooter: 'full' | 'compact' | 'legal' | null;
  expectedNav: boolean;
  expectedLayout: 'public' | 'workspace';
  description: string;
}> = [
  // Public marketing routes - FULL footer + navigation
  { route: '/', expectedFooter: 'full', expectedNav: true, expectedLayout: 'public', description: 'Landing page' },
  { route: '/how-it-works', expectedFooter: 'full', expectedNav: true, expectedLayout: 'public', description: 'How it works' },
  { route: '/pricing', expectedFooter: 'full', expectedNav: true, expectedLayout: 'public', description: 'Pricing' },

  // Public marketing routes - COMPACT footer + navigation
  { route: '/free-tool', expectedFooter: 'compact', expectedNav: true, expectedLayout: 'public', description: 'Free tool' },
  { route: '/contact', expectedFooter: 'compact', expectedNav: true, expectedLayout: 'public', description: 'Contact' },

  // Legal pages - LEGAL footer + navigation
  { route: '/privacy', expectedFooter: 'legal', expectedNav: true, expectedLayout: 'public', description: 'Privacy policy' },
  { route: '/terms', expectedFooter: 'legal', expectedNav: true, expectedLayout: 'public', description: 'Terms of service' },

  // Authentication routes - NO footer, NO navigation
  { route: '/login', expectedFooter: null, expectedNav: false, expectedLayout: 'public', description: 'Login (auth flow)' },
  { route: '/signup', expectedFooter: null, expectedNav: false, expectedLayout: 'public', description: 'Signup (auth flow)' },
  { route: '/forgot-password', expectedFooter: null, expectedNav: false, expectedLayout: 'public', description: 'Forgot password (auth flow)' },
  { route: '/reset-password', expectedFooter: null, expectedNav: false, expectedLayout: 'public', description: 'Reset password (auth flow)' },

  // Onboarding routes - NO footer, NO navigation
  { route: '/setup', expectedFooter: null, expectedNav: false, expectedLayout: 'public', description: 'Setup/onboarding' },
  { route: '/onboarding', expectedFooter: null, expectedNav: false, expectedLayout: 'public', description: 'Onboarding redirect' },

  // Workspace routes - NO footer, workspace sidebar navigation (not public nav)
  { route: '/app/today', expectedFooter: null, expectedNav: true, expectedLayout: 'workspace', description: 'Today dashboard' },
  { route: '/app/create', expectedFooter: null, expectedNav: true, expectedLayout: 'workspace', description: 'Create campaign' },
  { route: '/app/campaigns', expectedFooter: null, expectedNav: true, expectedLayout: 'workspace', description: 'Campaign vault' },
  { route: '/app/campaigns/some-uuid', expectedFooter: null, expectedNav: true, expectedLayout: 'workspace', description: 'Campaign detail' },
  { route: '/app/business', expectedFooter: null, expectedNav: true, expectedLayout: 'workspace', description: 'Business profile' },
  { route: '/app/settings/billing', expectedFooter: null, expectedNav: true, expectedLayout: 'workspace', description: 'Billing settings' },
  { route: '/app/settings/account', expectedFooter: null, expectedNav: true, expectedLayout: 'workspace', description: 'Account settings' },

  // System/error routes - NO footer, NO navigation
  { route: '/unauthorized', expectedFooter: null, expectedNav: false, expectedLayout: 'public', description: 'Unauthorized' },
  { route: '/not-found', expectedFooter: null, expectedNav: false, expectedLayout: 'public', description: 'Not found' },
  { route: '/error', expectedFooter: null, expectedNav: false, expectedLayout: 'public', description: 'Error recovery' },

  // Unknown routes - NO footer, navigation visible
  { route: '/random-unknown-page', expectedFooter: null, expectedNav: true, expectedLayout: 'public', description: 'Unknown route' },
];

console.log('================================================================');
console.log('STREETCRAFT LAYOUT ROUTING VERIFICATION');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

const formatFooter = (v: string | null) => v === null ? 'NONE' : v;

for (const { route, expectedFooter, expectedNav, expectedLayout, description } of ROUTE_EXPECTATIONS) {
  const actualFooter = getFooterVariant(route);
  const actualNav = getShowsNavigation(route);
  const actualLayout = getLayoutType(route);

  const footerOk = actualFooter === expectedFooter;
  const navOk = actualNav === expectedNav;
  const layoutOk = actualLayout === expectedLayout;
  const allOk = footerOk && navOk && layoutOk;

  if (allOk) {
    const footerLabel = formatFooter(actualFooter).padEnd(7);
    const navLabel = actualNav ? 'YES' : 'NO ';
    const layoutLabel = actualLayout.padEnd(9);
    console.log(`[PASS] ${route.padEnd(32)} footer=${footerLabel} nav=${navLabel} layout=${layoutLabel}  ${description}`);
    passed++;
  } else {
    const parts: string[] = [];
    if (!footerOk) parts.push(`footer: expected=${formatFooter(expectedFooter)} actual=${formatFooter(actualFooter)}`);
    if (!navOk) parts.push(`nav: expected=${expectedNav} actual=${actualNav}`);
    if (!layoutOk) parts.push(`layout: expected=${expectedLayout} actual=${actualLayout}`);
    console.log(`[FAIL] ${route.padEnd(32)} ${parts.join(', ')}  ${description}`);
    failed++;
  }
}

console.log(`\n================================================================`);
console.log(`LAYOUT ROUTING: ${passed} PASSED, ${failed} FAILED out of ${ROUTE_EXPECTATIONS.length} routes`);
console.log(`================================================================\n`);

if (failed > 0) {
  process.exit(1);
}
