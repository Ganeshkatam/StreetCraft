import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * StreetCraft Next.js Middleware Session Synchronizer
 *
 * Enforces request-scoped session validation, cookie synchronization across
 * request and response, and server-side route boundary enforcement.
 *
 * Strict Rules:
 * 1. Client is created per-request (never shared in global/module scope).
 * 2. Uses supabase.auth.getUser() to validate tokens against Supabase Auth server.
 * 3. Enforces open-redirect protection on return paths.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  // Fast bypass for static chunks, dev HMR, CSS, images, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  // Request-scoped Supabase client with cookie synchronization
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options as any)
        );
      },
    },
  });

  // IMPORTANT: Do NOT use supabase.auth.getSession() for server authorization.
  // getUser() sends a request to the Supabase Auth server to revalidate the auth token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAppRoute = pathname.startsWith('/app');
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  // 1. Protected Route Boundary: Redirect unauthenticated users to /login
  if (isAppRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    // Store requested destination with open-redirect protection (relative paths only)
    const target = pathname + (request.nextUrl.search || '');
    if (target.startsWith('/') && !target.startsWith('//')) {
      redirectUrl.searchParams.set('redirect', target);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Anonymous Route Boundary: Redirect authenticated users away from auth forms to /app/today
  if (isAuthRoute && user) {
    const destinationUrl = request.nextUrl.clone();
    destinationUrl.pathname = '/app/today';
    destinationUrl.search = '';
    return NextResponse.redirect(destinationUrl);
  }

  // 3. Security Header: Ensure authenticated routes prevent caching of sensitive sessions
  if (isAppRoute) {
    supabaseResponse.headers.set(
      'Cache-Control',
      'private, no-cache, no-store, max-age=0, must-revalidate'
    );
  }

  return supabaseResponse;
}
