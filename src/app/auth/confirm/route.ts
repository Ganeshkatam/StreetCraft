import { createClient } from '../../../lib/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

function safeInternalDestination(target: string | null, origin: string, fallback = '/setup'): string {
  if (
    !target ||
    !target.startsWith('/') ||
    target.startsWith('//') ||
    target.includes('\\') ||
    /[\u0000-\u001f\u007f]/.test(target)
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(target, origin);
    if (parsed.origin !== origin || !['http:', 'https:'].includes(parsed.protocol)) {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

/** Handles token_hash OTP verification from Supabase confirmation emails. */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get('token_hash');
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

  if (tokenHash && type) {
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
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

      const defaultTarget = members && members.length > 0
        ? '/user/today'
        : (claim ? `/setup?claim=${encodeURIComponent(claim)}` : '/setup');

      return NextResponse.redirect(
        new URL(safeInternalDestination(next ?? defaultTarget, requestUrl.origin), requestUrl.origin)
      );
    }
  }

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

      const defaultTarget = members && members.length > 0
        ? '/user/today'
        : (claim ? `/setup?claim=${encodeURIComponent(claim)}` : '/setup');

      return NextResponse.redirect(
        new URL(safeInternalDestination(next ?? defaultTarget, requestUrl.origin), requestUrl.origin)
      );
    }
  }

  return NextResponse.redirect(new URL('/login?error=email_confirmation_failed', requestUrl.origin));
}
