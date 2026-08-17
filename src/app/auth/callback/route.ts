import { createClient } from '../../../lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Auth Callback Route Handler
 * Exchanges authorization code (OAuth, PKCE, Email confirmation) for session cookies.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/app/today';

  // Open-redirect protection: destination must be a local relative path
  const safeDestination =
    next.startsWith('/') && !next.startsWith('//') ? next : '/app/today';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeDestination, requestUrl.origin));
    }
  }

  // Auth exchange failed: redirect to login with error indicator
  return NextResponse.redirect(
    new URL('/login?error=auth_exchange_failed', requestUrl.origin)
  );
}
