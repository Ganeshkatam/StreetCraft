import { createClient } from '../../../lib/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Auth Confirmation Route Handler (/auth/confirm)
 * Handles token_hash OTP verification from Supabase confirmation emails.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const code = requestUrl.searchParams.get('code');
  const claim = requestUrl.searchParams.get('claim');
  const next = requestUrl.searchParams.get('next');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    const errorMsg = encodeURIComponent(errorDescription || 'Email confirmation failed.');
    return NextResponse.redirect(new URL(`/login?error=${errorMsg}`, requestUrl.origin));
  }

  const supabase = await createClient();

  // 1. Verify via token_hash (Supabase standard email template)
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

  // 2. Verify via code if forwarded with PKCE code
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

  return NextResponse.redirect(
    new URL('/login?error=email_confirmation_failed', requestUrl.origin)
  );
}
