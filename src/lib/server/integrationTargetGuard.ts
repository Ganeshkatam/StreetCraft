/**
 * Integration Target Guard
 * Validates database target URLs for integration testing.
 * Enforces production protection, exact IPv4/IPv6 localhost allowlists,
 * HTTPS requirement for remote targets, and project reference matching.
 */

export const PRODUCTION_PROJECT_REF = 'iodwiyfjwzdvqtrczttb';

export const APPROVED_LOCAL_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0',
]);

export interface TargetValidationResult {
  valid: boolean;
  classification: 'LOCAL_DISPOSABLE' | 'REMOTE_DISPOSABLE' | 'PRODUCTION_VIOLATION' | 'INVALID_CONFIGURATION';
  hostname?: string;
  projectRef?: string;
  errorMessage?: string;
}

export function normalizeHostname(rawHostname: string): string {
  const lower = rawHostname.toLowerCase().trim();
  // Strip IPv6 brackets, e.g. "[::1]" -> "::1"
  if (lower.startsWith('[') && lower.endsWith(']')) {
    return lower.slice(1, -1);
  }
  return lower;
}

export function extractProjectRef(urlObj: URL): string {
  const hostname = normalizeHostname(urlObj.hostname);
  if (hostname.endsWith('.supabase.co')) {
    return hostname.split('.')[0];
  }
  return hostname;
}

export function validateIntegrationTarget(
  targetUrl: string,
  options?: {
    expectedProjectRef?: string;
    confirmIsolated?: boolean;
    allowLocal?: boolean;
  }
): TargetValidationResult {
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      valid: false,
      classification: 'INVALID_CONFIGURATION',
      errorMessage: `Invalid URL format: ${message}`,
    };
  }

  const normalizedHost = normalizeHostname(parsed.hostname);
  const isLocal = APPROVED_LOCAL_HOSTNAMES.has(normalizedHost);
  const projectRef = extractProjectRef(parsed);

  // Check production project safety violation
  if (targetUrl.includes(PRODUCTION_PROJECT_REF) || projectRef === PRODUCTION_PROJECT_REF) {
    return {
      valid: false,
      classification: 'PRODUCTION_VIOLATION',
      hostname: normalizedHost,
      projectRef,
      errorMessage: `SAFETY VIOLATION: Target URL matches production project ref (${PRODUCTION_PROJECT_REF}).`,
    };
  }

  if (isLocal) {
    const isConfirmed = options?.allowLocal === true || options?.confirmIsolated === true;
    if (!isConfirmed) {
      return {
        valid: false,
        classification: 'INVALID_CONFIGURATION',
        hostname: normalizedHost,
        projectRef,
        errorMessage: `Local target detected (${normalizedHost}) but unconfirmed. Set ALLOW_LOCAL_TEST_TARGET=true or CONFIRM_ISOLATED_TEST_DATABASE=true.`,
      };
    }
    return {
      valid: true,
      classification: 'LOCAL_DISPOSABLE',
      hostname: normalizedHost,
      projectRef,
    };
  }

  // Remote Target: must require HTTPS
  if (parsed.protocol !== 'https:') {
    return {
      valid: false,
      classification: 'INVALID_CONFIGURATION',
      hostname: normalizedHost,
      projectRef,
      errorMessage: `Insecure HTTP protocol is not permitted for remote target '${parsed.origin}'. Remote targets must use HTTPS.`,
    };
  }

  if (!options?.expectedProjectRef) {
    return {
      valid: false,
      classification: 'INVALID_CONFIGURATION',
      hostname: normalizedHost,
      projectRef,
      errorMessage: `Remote cloud target detected with project ref '${projectRef}'. Explicit verification requires setting SUPABASE_INTEGRATION_PROJECT_REF=${projectRef}.`,
    };
  }

  if (options.expectedProjectRef !== projectRef) {
    return {
      valid: false,
      classification: 'INVALID_CONFIGURATION',
      hostname: normalizedHost,
      projectRef,
      errorMessage: `Target project ref mismatch! URL project ref is '${projectRef}', expected '${options.expectedProjectRef}'.`,
    };
  }

  if (options.confirmIsolated !== true) {
    return {
      valid: false,
      classification: 'INVALID_CONFIGURATION',
      hostname: normalizedHost,
      projectRef,
      errorMessage: `Project ref '${projectRef}' verified, but explicit confirmation is missing. Set CONFIRM_ISOLATED_TEST_DATABASE=true.`,
    };
  }

  return {
    valid: true,
    classification: 'REMOTE_DISPOSABLE',
    hostname: normalizedHost,
    projectRef,
  };
}
