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

/**
 * Exchanges an OAuth/PKCE code or verifies an email OTP, then sets session cookies.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
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

  return NextResponse.redirect(new URL('/login?error=auth_exchange_failed', requestUrl.origin));
}
