/**
 * StreetCraft Centralized User-Facing Error Sanitizer
 * Translates raw API, Supabase, database, network, and runtime errors into clean,
 * actionable, non-technical messages without leaking stack traces or SQL codes.
 */

export function getUserFacingErrorMessage(
  error: unknown,
  fallbackMessage = 'Something went wrong. Please try again in a moment.'
): string {
  if (!error) return fallbackMessage;

  // Log raw technical details to browser console for developer debugging
  if (typeof window !== 'undefined') {
    console.error('[StreetCraft Error Logger]:', error);
  }

  let raw = '';
  if (typeof error === 'string') {
    raw = error;
  } else if (error instanceof Error) {
    raw = error.message;
  } else if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, any>;
    raw = obj.message || obj.error_description || obj.error || obj.details || obj.hint || '';
    if (!raw && typeof obj === 'object') {
      try {
        raw = JSON.stringify(error);
      } catch (jsonErr) {
        console.warn('Failed to stringify error object:', jsonErr);
        raw = '';
      }
    }
  }

  const normalized = raw.trim();
  const lower = normalized.toLowerCase();

  // 1. Authentication & Account Errors
  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant') || lower.includes('invalid password')) {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }

  if (lower.includes('email not confirmed') || lower.includes('unconfirmed email') || lower.includes('unconfirmed_user')) {
    return 'Please verify your email address via the confirmation link sent to your inbox.';
  }

  if (lower.includes('user already registered') || lower.includes('already exists') || lower.includes('already registered')) {
    return 'Account already exists. Please sign in instead.';
  }

  if (lower.includes('password should be at least') || lower.includes('password must be at least')) {
    return 'Password must be at least 6 characters long.';
  }

  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('429')) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }

  if (lower.includes('jwt expired') || lower.includes('session expired') || lower.includes('token is expired')) {
    return 'Your session has expired. Please sign in again to continue.';
  }

  if (lower.includes('unauthorized') || lower.includes('permission denied') || lower.includes('not authenticated')) {
    return 'You do not have permission to perform this action. Please sign in to continue.';
  }

  // 2. Commercial Limits & Entitlements
  if (normalized.includes('BUSINESS_LIMIT_REACHED') || lower.includes('business limit') || lower.includes('store limit')) {
    return 'You have reached your plan’s store limit. Upgrade your subscription to add more physical storefronts.';
  }

  if (normalized.includes('Usage quota reached') || normalized.includes('Quota Exceeded') || lower.includes('quota reached')) {
    return 'You have used all available campaigns for this billing period. Upgrade your plan to generate more.';
  }

  // 3. Founder Tier Claims
  if (normalized.includes('FOUNDER_ALREADY_CLAIMED') || lower.includes('already claimed')) {
    return 'Your account has already claimed the Founder lifetime pass.';
  }

  if (normalized.includes('FOUNDER_SOLD_OUT') || lower.includes('sold out')) {
    return 'All Founder slots have been claimed.';
  }

  // 4. Payment & Gateway Verification
  if (normalized.includes('PAYMENT_ALREADY_CLAIMED')) {
    return 'This payment transaction has already been processed and attached to an account.';
  }

  if (normalized.includes('PAYMENT_ALREADY_EXPIRED')) {
    return 'This payment reference belongs to a past cancelled period and cannot be reused.';
  }

  if (normalized.includes('INVALID_PAYMENT') || lower.includes('payment verification failed')) {
    return 'Payment could not be verified. Please try again or use a different payment method.';
  }

  // 5. Network & Connection Failures
  if (
    lower.includes('failed to fetch') ||
    lower.includes('network error') ||
    lower.includes('err_connection') ||
    lower.includes('networkrequestfailed') ||
    lower.includes('timeout')
  ) {
    return 'Unable to reach the server. Please check your internet connection and try again.';
  }

  // 6. Catch & Block ANY Technical, Database, SQL, JSON, or Stack Trace Leakage
  const isTechnicalLeak =
    lower.includes('column ') ||
    lower.includes('relation ') ||
    lower.includes('table ') ||
    lower.includes('does not exist') ||
    lower.includes('syntax error') ||
    lower.includes('schema') ||
    lower.includes('postgres') ||
    lower.includes('plpgsql') ||
    lower.includes('violates') ||
    lower.includes('foreign key') ||
    lower.includes('unique constraint') ||
    lower.includes('check constraint') ||
    lower.includes('function public.') ||
    lower.includes('set search_path') ||
    lower.includes('typeerror') ||
    lower.includes('cannot read properties') ||
    lower.includes('null value in column') ||
    lower.includes('undefined') ||
    lower.includes('referenceerror') ||
    lower.includes('internal server error') ||
    lower.includes('postgrest') ||
    lower.includes('rpc') ||
    lower.includes('sql') ||
    lower.includes('json') ||
    lower.includes('at ') ||
    lower.includes('stack') ||
    normalized.startsWith('{') ||
    normalized.startsWith('[') ||
    /^[0-9A-Z_]+:/.test(normalized);

  if (isTechnicalLeak) {
    return fallbackMessage;
  }

  // 7. If the message is clean, conversational, and user-safe, pass it through
  if (normalized.length > 0 && normalized.length < 120 && !normalized.includes('\n') && !normalized.includes('\\')) {
    return normalized;
  }

  return fallbackMessage;
}
