import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { deriveCommercialEntitlementStatus } from '../lib/domain/plan/entitlementState';
import {
  RequestCancellationSchema,
  UpgradePlanSchema,
} from '../lib/domain/plan/planSchemas';

describe('Plan Domain: Entitlement Status Derivation', () => {
  it('derives active free tier when no subscription exists', () => {
    const res = deriveCommercialEntitlementStatus(null);
    assert.strictEqual(res.status, 'ACTIVE');
    assert.strictEqual(res.isCancellationScheduled, false);
    assert.strictEqual(res.isActive, true);
  });

  it('derives ACTIVE status for normal active paid subscription', () => {
    const res = deriveCommercialEntitlementStatus({
      status: 'ACTIVE',
      cancel_at_period_end: false,
    });
    assert.strictEqual(res.status, 'ACTIVE');
    assert.strictEqual(res.isCancellationScheduled, false);
    assert.strictEqual(res.isActive, true);
  });

  it('derives CANCEL_SCHEDULED when cancellation is requested but period end has not passed', () => {
    const futureDate = new Date(Date.now() + 15 * 86400000).toISOString();
    const res = deriveCommercialEntitlementStatus({
      status: 'ACTIVE',
      cancel_at_period_end: true,
      current_period_end: futureDate,
    });
    assert.strictEqual(res.status, 'CANCEL_SCHEDULED');
    assert.strictEqual(res.isCancellationScheduled, true);
    assert.strictEqual(res.isActive, true); // Still active until period end!
  });

  it('derives CANCELED when period end has passed after cancellation schedule', () => {
    const pastDate = new Date(Date.now() - 2 * 86400000).toISOString();
    const res = deriveCommercialEntitlementStatus({
      status: 'ACTIVE',
      cancel_at_period_end: true,
      current_period_end: pastDate,
    });
    assert.strictEqual(res.status, 'CANCELED');
    assert.strictEqual(res.isActive, false);
  });
});

describe('Plan Domain: Schemas Validation', () => {
  it('validates RequestCancellationSchema with valid UUID', () => {
    const res = RequestCancellationSchema.safeParse({
      subscriptionId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      reason: 'Downsizing storefront operations.',
    });
    assert.strictEqual(res.success, true);
  });

  it('rejects invalid UUID in RequestCancellationSchema', () => {
    const res = RequestCancellationSchema.safeParse({
      subscriptionId: 'invalid-uuid',
    });
    assert.strictEqual(res.success, false);
  });

  it('validates UpgradePlanSchema with valid target plan', () => {
    const res = UpgradePlanSchema.safeParse({
      targetPlanId: 'GROWTH',
      billingCycle: 'monthly',
    });
    assert.strictEqual(res.success, true);
  });
});
