import { createClient } from '../../../lib/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Auth Callback Route Handler
 * Exchanges authorization code (OAuth, PKCE) or verifies token_hash (Email OTP confirmation)
 * and sets session cookies.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const claim = requestUrl.searchParams.get('claim');
  const next = requestUrl.searchParams.get('next');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    const errorMsg = encodeURIComponent(errorDescription || 'Authentication failed.');
    return NextResponse.redirect(new URL(`/login?error=${errorMsg}`, requestUrl.origin));
  }

  const supabase = await createClient();

  // 1. PKCE / OAuth Code Exchange
  if (code) {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError && data.user) {
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/reset-password', requestUrl.origin));
      }

      const { data: members } = await supabase
        .from('business_members')
        .select('business_id')
        .eq('user_id', data.user.id);

      let target = next;
      if (!target) {
        target = members && members.length > 0
          ? '/user/today'
          : (claim ? `/setup?claim=${encodeURIComponent(claim)}` : '/setup');
      }

      const safeDestination =
        target.startsWith('/') && !target.startsWith('//') ? target : '/setup';

      return NextResponse.redirect(new URL(safeDestination, requestUrl.origin));
    }
  }

  // 2. Token Hash / Email Confirmation Link (verifyOtp)
  if (token_hash && type) {
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (!verifyError && data.user) {
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/reset-password', requestUrl.origin));
      }

      const { data: members } = await supabase
        .from('business_members')
        .select('business_id')
        .eq('user_id', data.user.id);

      let target = next;
      if (!target) {
        target = members && members.length > 0
          ? '/user/today'
          : (claim ? `/setup?claim=${encodeURIComponent(claim)}` : '/setup');
      }

      const safeDestination =
        target.startsWith('/') && !target.startsWith('//') ? target : '/setup';

      return NextResponse.redirect(new URL(safeDestination, requestUrl.origin));
    }
  }

  // Auth exchange failed: redirect to login with informative error indicator
  return NextResponse.redirect(
    new URL('/login?error=auth_exchange_failed', requestUrl.origin)
  );
}
