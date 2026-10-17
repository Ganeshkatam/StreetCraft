/**
 * Safe Redirect Destination Resolver
 * Validates untrusted redirect targets to prevent open redirect vulnerabilities.
 * Strictly guarantees that destination resolves to an internal path on the same origin,
 * rejecting external schemes, backslash bypasses, protocol-relative paths, and control characters.
 */
export function getSafeRedirectUrl(
  target: string | null | undefined,
  origin: string,
  defaultPath: string = '/setup'
): string {
  if (!target || typeof target !== 'string') {
    return defaultPath;
  }

  const trimmed = target.trim();
  if (!trimmed) {
    return defaultPath;
  }

  // Reject targets containing backslashes, whitespace control characters, or null bytes
  // which WHATWG URL parsers can normalize to alternate hosts or schemes
  if (/[\\|\x00-\x1F\x7F]/.test(trimmed)) {
    return defaultPath;
  }

  try {
    const parsed = new URL(trimmed, origin);

    // Enforce origin equality strictly
    if (parsed.origin !== origin) {
      return defaultPath;
    }

    // Enforce internal pathname and reject protocol-relative leading slashes
    if (!parsed.pathname.startsWith('/') || parsed.pathname.startsWith('//')) {
      return defaultPath;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return defaultPath;
  }
}
