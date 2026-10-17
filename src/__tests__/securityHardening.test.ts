import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import { getSafeRedirectUrl } from '../lib/domain/auth/safeRedirect';
import { filterAuthorizedBusiness, type AccessibleBusinessSummary } from '../lib/domain/business/businessAuthorization';

describe('Security Hardening: Safe Redirect Validation', () => {
  const origin = 'https://streetcraft.in';

  it('allows safe, relative internal application paths', () => {
    assert.strictEqual(getSafeRedirectUrl('/setup', origin), '/setup');
    assert.strictEqual(getSafeRedirectUrl('/user/today', origin), '/user/today');
    assert.strictEqual(
      getSafeRedirectUrl('/user/business/123e4567-e89b-12d3-a456-426614174000/campaigns?filter=ready#section', origin),
      '/user/business/123e4567-e89b-12d3-a456-426614174000/campaigns?filter=ready#section'
    );
  });

  it('rejects external destination URLs', () => {
    assert.strictEqual(getSafeRedirectUrl('https://evil.com', origin), '/setup');
    assert.strictEqual(getSafeRedirectUrl('http://evil.com/phishing', origin), '/setup');
    assert.strictEqual(getSafeRedirectUrl('https://attacker.com/setup', origin), '/setup');
  });

  it('rejects protocol-relative URL bypasses (//evil.com)', () => {
    assert.strictEqual(getSafeRedirectUrl('//evil.com', origin), '/setup');
    assert.strictEqual(getSafeRedirectUrl('//attacker.org/test', origin), '/setup');
  });

  it('rejects backslash normalization attacks (/\\evil.com and \\\\evil.com)', () => {
    assert.strictEqual(getSafeRedirectUrl('/\\evil.com', origin), '/setup');
    assert.strictEqual(getSafeRedirectUrl('\\evil.com', origin), '/setup');
    assert.strictEqual(getSafeRedirectUrl('/user/today\\test', origin), '/setup');
  });

  it('rejects whitespace and control-character bypasses', () => {
    assert.strictEqual(getSafeRedirectUrl('/\tevil.com', origin), '/setup');
    assert.strictEqual(getSafeRedirectUrl('/\nevil.com', origin), '/setup');
    assert.strictEqual(getSafeRedirectUrl('/\r\nevil.com', origin), '/setup');
    assert.strictEqual(getSafeRedirectUrl('/test\x00path', origin), '/setup');
  });

  it('rejects javascript: and data: pseudo-protocols', () => {
    assert.strictEqual(getSafeRedirectUrl('javascript:alert(1)', origin), '/setup');
    assert.strictEqual(getSafeRedirectUrl('data:text/html,<script>alert(1)</script>', origin), '/setup');
  });

  it('uses custom default fallback when target is missing or invalid', () => {
    assert.strictEqual(getSafeRedirectUrl(null, origin, '/user/today'), '/user/today');
    assert.strictEqual(getSafeRedirectUrl(undefined, origin, '/user/today'), '/user/today');
    assert.strictEqual(getSafeRedirectUrl('', origin, '/user/today'), '/user/today');
    assert.strictEqual(getSafeRedirectUrl('https://evil.com', origin, '/user/today'), '/user/today');
  });
});

describe('Security Hardening: Business Candidate Authorization', () => {
  const sampleBusinesses: AccessibleBusinessSummary[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Alpha Bakery',
      category: 'Bakery',
      role: 'owner',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Beta Cafe',
      category: 'Cafe',
      role: 'member',
    },
  ];

  it('resolves requested store when present in user memberships', () => {
    const result = filterAuthorizedBusiness(sampleBusinesses, '22222222-2222-2222-2222-222222222222');
    assert.strictEqual(result?.name, 'Beta Cafe');
  });

  it('returns null and does NOT silently fall back when candidate is unauthorized', () => {
    const unauthorizedCandidate = '99999999-9999-9999-9999-999999999999';
    const result = filterAuthorizedBusiness(sampleBusinesses, unauthorizedCandidate);
    assert.strictEqual(result, null);
  });

  it('returns null and does NOT silently fall back when candidate is malformed', () => {
    const malformedCandidate = 'not-a-valid-uuid';
    const result = filterAuthorizedBusiness(sampleBusinesses, malformedCandidate);
    assert.strictEqual(result, null);
  });

  it('falls back to deterministic primary business when no candidate was requested', () => {
    const resultNull = filterAuthorizedBusiness(sampleBusinesses, null);
    assert.strictEqual(resultNull?.id, '11111111-1111-1111-1111-111111111111');

    const resultUndefined = filterAuthorizedBusiness(sampleBusinesses, undefined);
    assert.strictEqual(resultUndefined?.id, '11111111-1111-1111-1111-111111111111');

    const resultEmpty = filterAuthorizedBusiness(sampleBusinesses, '   ');
    assert.strictEqual(resultEmpty?.id, '11111111-1111-1111-1111-111111111111');
  });

  it('returns null when user has zero accessible businesses', () => {
    assert.strictEqual(filterAuthorizedBusiness([], '11111111-1111-1111-1111-111111111111'), null);
    assert.strictEqual(filterAuthorizedBusiness([], null), null);
  });
});

describe('Security Hardening: Webhook Signature Verification Logic', () => {
  const secret = 'whsec_test_secret_12345';
  const rawPayload = JSON.stringify({ event: 'payment.captured', event_id: 'evt_1001' });

  it('verifies valid HMAC-SHA256 signature using timingSafeEqual', () => {
    const validSignature = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');
    const sigBuffer = Buffer.from(validSignature, 'utf8');
    const expectedBuffer = Buffer.from(validSignature, 'utf8');

    const isValid = sigBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    assert.strictEqual(isValid, true);
  });

  it('rejects tampered signature', () => {
    const validSignature = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');
    const tamperedSignature = validSignature.slice(0, -1) + (validSignature.slice(-1) === 'a' ? 'b' : 'a');

    const sigBuffer = Buffer.from(tamperedSignature, 'utf8');
    const expectedBuffer = Buffer.from(validSignature, 'utf8');

    const isValid = sigBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    assert.strictEqual(isValid, false);
  });

  it('rejects signature of different length safely without throw', () => {
    const shortSignature = 'short_sig';
    const validSignature = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');

    const sigBuffer = Buffer.from(shortSignature, 'utf8');
    const expectedBuffer = Buffer.from(validSignature, 'utf8');

    const isValid = sigBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    assert.strictEqual(isValid, false);
  });
});
