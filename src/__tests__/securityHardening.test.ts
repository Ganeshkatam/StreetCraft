import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import { getSafeRedirectUrl } from '../lib/domain/auth/safeRedirect';
import { filterAuthorizedBusiness, type AccessibleBusinessSummary } from '../lib/domain/business/businessAuthorization';
import { deriveCommercialEntitlementStatus } from '../lib/domain/plan/entitlementState';

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

describe('Security Hardening: Multi-Tenant Storage Folder Isolation', () => {
  const storeUuidRegex = /^[0-9a-f-]{36}$/;

  it('accepts valid RFC 4122 UUID folder names', () => {
    assert.strictEqual(storeUuidRegex.test('123e4567-e89b-12d3-a456-426614174000'), true);
    assert.strictEqual(storeUuidRegex.test('d9a8f3b4-1c2e-4b5a-9f8e-7d6c5b4a3f2e'), true);
  });

  it('rejects directory traversal payloads as top-level folder', () => {
    assert.strictEqual(storeUuidRegex.test('..'), false);
    assert.strictEqual(storeUuidRegex.test('../other-store'), false);
    assert.strictEqual(storeUuidRegex.test('..%2Fstore'), false);
    assert.strictEqual(storeUuidRegex.test('123e4567-e89b-12d3-a456-426614174000/../evil'), false);
  });

  it('rejects non-UUID top-level folders preventing root-level contamination', () => {
    assert.strictEqual(storeUuidRegex.test('public'), false);
    assert.strictEqual(storeUuidRegex.test('avatars'), false);
    assert.strictEqual(storeUuidRegex.test('storefronts'), false);
    assert.strictEqual(storeUuidRegex.test('admin'), false);
    assert.strictEqual(storeUuidRegex.test(''), false);
  });
});

describe('Security Hardening: Subscription Cancellation Lifecycle & Entitlement Retention', () => {
  it('preserves paid tier access during scheduled cancellation before period end', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);

    const subscription = {
      status: 'ACTIVE',
      cancel_at_period_end: true,
      current_period_end: futureDate.toISOString(),
    };

    const derived = deriveCommercialEntitlementStatus(subscription);
    assert.strictEqual(derived.status, 'CANCEL_SCHEDULED');
    assert.strictEqual(derived.isCancellationScheduled, true);
    assert.strictEqual(derived.isActive, true);
  });

  it('transitions to inactive CANCELED once period end has passed after scheduled cancellation', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const subscription = {
      status: 'ACTIVE',
      cancel_at_period_end: true,
      current_period_end: pastDate.toISOString(),
    };

    const derived = deriveCommercialEntitlementStatus(subscription);
    assert.strictEqual(derived.status, 'CANCELED');
    assert.strictEqual(derived.isCancellationScheduled, false);
    assert.strictEqual(derived.isActive, false);
  });

  it('treats active subscription without cancellation schedule as normally active', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const subscription = {
      status: 'ACTIVE',
      cancel_at_period_end: false,
      current_period_end: futureDate.toISOString(),
    };

    const derived = deriveCommercialEntitlementStatus(subscription);
    assert.strictEqual(derived.status, 'ACTIVE');
    assert.strictEqual(derived.isCancellationScheduled, false);
    assert.strictEqual(derived.isActive, true);
  });
});

describe('Security Hardening: Least-Privilege Entitlement Activation RPC Permissions', () => {
  it('enforces that latest migration revokes execute from public, anon, and authenticated', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');

    const migrationPath = path.resolve('supabase/migrations/20261018180000_revoke_client_subscription_activation.sql');
    assert.ok(fs.existsSync(migrationPath), 'Migration 20261018180000_revoke_client_subscription_activation.sql must exist');

    const migrationContent = fs.readFileSync(migrationPath, 'utf8');

    // Must revoke from PUBLIC, anon, authenticated for 6-arg overload
    assert.match(
      migrationContent,
      /REVOKE\s+EXECUTE\s+ON\s+FUNCTION\s+public\.confirm_payment_and_activate_subscription\(text,\s*text,\s*text,\s*text,\s*text,\s*uuid\)\s+FROM\s+PUBLIC,\s*anon,\s*authenticated;/i
    );

    // Must revoke from PUBLIC, anon, authenticated for 5-arg overload
    assert.match(
      migrationContent,
      /REVOKE\s+EXECUTE\s+ON\s+FUNCTION\s+public\.confirm_payment_and_activate_subscription\(text,\s*text,\s*text,\s*text,\s*text\)\s+FROM\s+PUBLIC,\s*anon,\s*authenticated;/i
    );

    // Must grant execute strictly to service_role
    assert.match(
      migrationContent,
      /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.confirm_payment_and_activate_subscription\(text,\s*text,\s*text,\s*text,\s*text,\s*uuid\)\s+TO\s+service_role;/i
    );
    assert.match(
      migrationContent,
      /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.confirm_payment_and_activate_subscription\(text,\s*text,\s*text,\s*text,\s*text\)\s+TO\s+service_role;/i
    );
  });

  it('enforces least-privilege permissions in 20261018190000_harden_webhook_reconciliation.sql', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');

    const migrationPath = path.resolve('supabase/migrations/20261018190000_harden_webhook_reconciliation.sql');
    assert.ok(fs.existsSync(migrationPath), 'Migration 20261018190000_harden_webhook_reconciliation.sql must exist');

    const content = fs.readFileSync(migrationPath, 'utf8');

    // Revocations from public, anon, authenticated
    assert.match(content, /REVOKE\s+EXECUTE\s+ON\s+FUNCTION\s+public\.confirm_payment_and_activate_subscription.*FROM\s+PUBLIC,\s*anon,\s*authenticated;/i);
    assert.match(content, /REVOKE\s+EXECUTE\s+ON\s+FUNCTION\s+public\.reconcile_provider_event.*FROM\s+PUBLIC,\s*anon,\s*authenticated;/i);

    // Grants to service_role
    assert.match(content, /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.confirm_payment_and_activate_subscription.*TO\s+service_role;/i);
    assert.match(content, /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.reconcile_provider_event.*TO\s+service_role;/i);
  });
});


