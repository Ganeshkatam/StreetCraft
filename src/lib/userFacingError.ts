/**
 * StreetCraft Centralized User-Facing Error Sanitizer
 * Translates raw API, Supabase, database, and network errors into clean,
 * actionable, non-technical messages without leaking stack traces or SQL codes.
 */

export function getUserFacingErrorMessage(error: unknown, fallbackMessage = 'An unexpected error occurred. Please try again.'): string {
  if (!error) return fallbackMessage;

  let raw = '';
  if (typeof error === 'string') {
    raw = error;
  } else if (error instanceof Error) {
    raw = error.message;
  } else if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, any>;
    raw = obj.message || obj.error_description || obj.error || JSON.stringify(error);
  }

  const normalized = raw.trim();
  const lower = normalized.toLowerCase();

  // 1. Authentication & Account Errors
  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant') || lower.includes('invalid password')) {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }

  if (lower.includes('email not confirmed') || lower.includes('unconfirmed email')) {
    return 'Please confirm your email address via the link sent to your inbox.';
  }

  if (lower.includes('user already registered') || lower.includes('already exists') || lower.includes('already registered')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }

  if (lower.includes('password should be at least') || lower.includes('password must be at least')) {
    return 'Password must be at least 6 characters long.';
  }

  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('429')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  if (lower.includes('jwt expired') || lower.includes('session expired') || lower.includes('token is expired')) {
    return 'Your session has expired. Please sign in again to continue.';
  }

  if (lower.includes('unauthorized') || lower.includes('permission denied')) {
    return 'You do not have permission to perform this action.';
  }

  // 2. Commercial Limits & Entitlements
  if (normalized.includes('BUSINESS_LIMIT_REACHED') || lower.includes('business limit')) {
    return 'You have reached your plan’s store limit. Upgrade your subscription to add more physical stores.';
  }

  if (normalized.includes('Usage quota reached') || normalized.includes('Quota Exceeded') || lower.includes('quota reached')) {
    return 'You have used all available campaigns for this billing period. Upgrade your plan to generate more.';
  }

  // 3. Founder Tier Claims
  if (normalized.includes('FOUNDER_ALREADY_CLAIMED') || lower.includes('already claimed')) {
    return 'Your account has already claimed the Founder lifetime pass.';
  }

  if (normalized.includes('FOUNDER_SOLD_OUT') || lower.includes('sold out')) {
    return 'All 100 Founder slots have been claimed.';
  }

  // 4. Payment & Gateway Verification
  if (normalized.includes('PAYMENT_ALREADY_CLAIMED')) {
    return 'This payment transaction has already been registered.';
  }

  if (normalized.includes('PAYMENT_ALREADY_EXPIRED')) {
    return 'This payment reference belongs to a past cancelled period and cannot be reused.';
  }

  if (normalized.includes('INVALID_PAYMENT') || lower.includes('payment verification failed')) {
    return 'Payment could not be verified. Please try again or use a different payment method.';
  }

  // 5. Network & Connection
  if (lower.includes('failed to fetch') || lower.includes('network error') || lower.includes('err_connection')) {
    return 'Unable to reach the server. Please check your internet connection and try again.';
  }

  // 6. Filter out raw database / SQL / JSON / Code artifacts
  if (
    normalized.includes('ERROR:') ||
    normalized.includes('PostgrestError') ||
    normalized.includes('violates foreign key') ||
    normalized.includes('violates unique constraint') ||
    normalized.includes('function public.') ||
    normalized.includes('SET search_path') ||
    /^[0-9A-Z_]+:/.test(normalized) || // e.g. "INTERNAL_ERROR: ..."
    normalized.startsWith('{')
  ) {
    return fallbackMessage;
  }

  // 7. If the message is reasonably clean and short human text, return it
  if (normalized.length > 0 && normalized.length < 160 && !normalized.includes('\n')) {
    return normalized;
  }

  return fallbackMessage;
}
