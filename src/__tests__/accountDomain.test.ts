import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeNotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '../lib/domain/account/notificationPreferences';
import {
  UpdateProfileSchema,
  UpdatePreferencesSchema,
  UpdatePasswordSchema,
  SwitchStorefrontSchema,
} from '../lib/domain/account/accountSchemas';
import { determineActiveStorefront } from '../lib/domain/account/storefrontContext';
import type { StorefrontSummary } from '../lib/domain/account/accountTypes';

describe('Account Domain: Notification Preferences', () => {
  it('returns default preferences when input is null or undefined', () => {
    assert.deepStrictEqual(normalizeNotificationPreferences(null), DEFAULT_NOTIFICATION_PREFERENCES);
    assert.deepStrictEqual(normalizeNotificationPreferences(undefined), DEFAULT_NOTIFICATION_PREFERENCES);
  });

  it('correctly maps boolean and string boolean values', () => {
    const raw = {
      email: 'true',
      whatsapp: true,
      weekly_digest: 'false',
    };
    const normalized = normalizeNotificationPreferences(raw);
    assert.strictEqual(normalized.email, true);
    assert.strictEqual(normalized.whatsapp, true);
    assert.strictEqual(normalized.weeklyDigest, false);
  });

  it('handles camelCase weeklyDigest fallback', () => {
    const raw = {
      email: false,
      whatsapp: true,
      weeklyDigest: true,
    };
    const normalized = normalizeNotificationPreferences(raw);
    assert.strictEqual(normalized.weeklyDigest, true);
  });
});

describe('Account Domain: Schemas Validation', () => {
  it('validates UpdateProfileSchema correctly', () => {
    const valid = UpdateProfileSchema.safeParse({
      fullName: 'Vikram Seth',
      phone: '+91 9876543210',
    });
    assert.strictEqual(valid.success, true);

    const invalidShortName = UpdateProfileSchema.safeParse({
      fullName: 'A',
      phone: null,
    });
    assert.strictEqual(invalidShortName.success, false);

    const emptyPhoneTransformsToNull = UpdateProfileSchema.safeParse({
      fullName: 'Vikram Seth',
      phone: '',
    });
    assert.strictEqual(emptyPhoneTransformsToNull.success, true);
    if (emptyPhoneTransformsToNull.success) {
      assert.strictEqual(emptyPhoneTransformsToNull.data.phone, null);
    }
  });

  it('validates UpdatePreferencesSchema correctly', () => {
    const valid = UpdatePreferencesSchema.safeParse({
      email: true,
      whatsapp: false,
      weeklyDigest: true,
    });
    assert.strictEqual(valid.success, true);
  });

  it('validates UpdatePasswordSchema correctly', () => {
    const valid = UpdatePasswordSchema.safeParse({
      newPassword: 'SuperSecret123!',
      confirmPassword: 'SuperSecret123!',
    });
    assert.strictEqual(valid.success, true);

    const mismatched = UpdatePasswordSchema.safeParse({
      newPassword: 'SuperSecret123!',
      confirmPassword: 'DifferentPassword123!',
    });
    assert.strictEqual(mismatched.success, false);

    const tooShort = UpdatePasswordSchema.safeParse({
      newPassword: 'short',
      confirmPassword: 'short',
    });
    assert.strictEqual(tooShort.success, false);
  });

  it('validates SwitchStorefrontSchema correctly', () => {
    const valid = SwitchStorefrontSchema.safeParse({
      businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    });
    assert.strictEqual(valid.success, true);

    const invalidUuid = SwitchStorefrontSchema.safeParse({
      businessId: 'not-a-uuid',
    });
    assert.strictEqual(invalidUuid.success, false);
  });
});

describe('Account Domain: Storefront Context', () => {
  const sampleStorefronts: StorefrontSummary[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Cafe Blue',
      category: 'Cafe',
      role: 'Owner',
      isActive: false,
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Bake House',
      category: 'Bakery',
      role: 'Member',
      isActive: false,
    },
  ];

  it('returns null for empty storefronts array', () => {
    assert.strictEqual(determineActiveStorefront([]), null);
  });

  it('resolves requested candidate business when present in memberships', () => {
    const active = determineActiveStorefront(sampleStorefronts, '22222222-2222-2222-2222-222222222222');
    assert.strictEqual(active?.name, 'Bake House');
  });

  it('falls back to first accessible storefront when candidate is not found or not provided', () => {
    const fallbackUnmatched = determineActiveStorefront(sampleStorefronts, '99999999-9999-9999-9999-999999999999');
    assert.strictEqual(fallbackUnmatched?.name, 'Cafe Blue');

    const fallbackNoCandidate = determineActiveStorefront(sampleStorefronts);
    assert.strictEqual(fallbackNoCandidate?.name, 'Cafe Blue');
  });
});
