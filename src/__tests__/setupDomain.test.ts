import { describe, it } from 'node:test';
import assert from 'node:assert';
import { deriveSetupProgress } from '../lib/domain/setup/deriveSetupProgress';
import {
  CreateStoreSchema,
  IdentityDomainSchema,
  LocationDomainSchema,
  ProductsDomainSchema,
  CustomersDomainSchema,
  OfferDomainSchema,
} from '../lib/domain/setup/setupSchemas';
import { BusinessProfile } from '../lib/server/business/getBusinessProfile';

describe('Setup Domain: Progress Derivation', () => {
  it('derives all empty statuses and 0% completion when profile is null', () => {
    const progress = deriveSetupProgress(null, 'test-biz-123');

    assert.strictEqual(progress.requiredComplete, false);
    assert.strictEqual(progress.recommendedComplete, false);
    assert.strictEqual(progress.completionPercentage, 0);
    assert.strictEqual(progress.totalCompletedCount, 0);
    assert.strictEqual(progress.nextIncompleteDomain, 'identity');
    assert.strictEqual(progress.domains.identity.status, 'EMPTY');
    assert.strictEqual(progress.domains.identity.route, '/setup/test-biz-123/identity');
    assert.strictEqual(progress.domains.location.route, '/setup/test-biz-123/location');
  });

  it('derives PARTIAL for identity when only store name is present', () => {
    const partialProfile: Partial<BusinessProfile> = {
      name: 'Artisan Cafe',
      category: '',
    };
    const progress = deriveSetupProgress(partialProfile as BusinessProfile, 'test-biz-123');

    assert.strictEqual(progress.domains.identity.status, 'PARTIAL');
    assert.strictEqual(progress.requiredComplete, false);
    assert.strictEqual(progress.completionPercentage, 0);
  });

  it('derives requiredComplete=true and 50% completion when only required domains are complete', () => {
    const profile: Partial<BusinessProfile> = {
      name: 'Artisan Cafe',
      category: 'Cafe & Coffee Bar',
      neighborhood: 'Indiranagar',
      city: 'Bengaluru',
    };
    const progress = deriveSetupProgress(profile as BusinessProfile, 'test-biz-123');

    assert.strictEqual(progress.domains.identity.status, 'COMPLETE');
    assert.strictEqual(progress.domains.location.status, 'COMPLETE');
    assert.strictEqual(progress.requiredComplete, true);
    assert.strictEqual(progress.recommendedComplete, false);
    assert.strictEqual(progress.completionPercentage, 50);
    assert.strictEqual(progress.nextIncompleteDomain, 'products');
  });

  it('derives 100% completion when all required, recommended, and optional domains are satisfied', () => {
    const fullProfile: Partial<BusinessProfile> = {
      name: 'Artisan Cafe',
      category: 'Cafe & Coffee Bar',
      neighborhood: 'Indiranagar',
      city: 'Bengaluru',
      signature_items: 'Cold Brew Nitro, Sourdough',
      target_customer: 'Tech workers & locals',
      default_offer: '10% off specialty brew combos',
      peak_hours: '8-11 AM',
      slow_hours: '2-5 PM',
      style_voice: 'Warm and friendly',
      phone_whatsapp: '+91 98765 43210',
    };
    const progress = deriveSetupProgress(fullProfile as BusinessProfile, 'test-biz-123');

    assert.strictEqual(progress.requiredComplete, true);
    assert.strictEqual(progress.recommendedComplete, true);
    assert.strictEqual(progress.completionPercentage, 100);
    assert.strictEqual(progress.totalCompletedCount, 9);
    assert.strictEqual(progress.domains.brand.status, 'COMPLETE');
    assert.strictEqual(progress.domains.contact.status, 'COMPLETE');
  });
});

describe('Setup Domain: Schemas Validation', () => {
  it('validates CreateStoreSchema with valid minimal inputs', () => {
    const valid = CreateStoreSchema.safeParse({
      name: 'Saffron Bakery',
      category: 'Bakery & Pastry',
    });
    assert.strictEqual(valid.success, true);
    if (valid.success) {
      assert.strictEqual(valid.data.name, 'Saffron Bakery');
      assert.strictEqual(valid.data.category, 'Bakery & Pastry');
    }
  });

  it('rejects short or empty store name in CreateStoreSchema', () => {
    const invalid = CreateStoreSchema.safeParse({
      name: ' ',
      category: 'Bakery & Pastry',
    });
    assert.strictEqual(invalid.success, false);
  });

  it('rejects oversized store name (> 60 characters)', () => {
    const invalid = CreateStoreSchema.safeParse({
      name: 'A'.repeat(61),
      category: 'Bakery & Pastry',
    });
    assert.strictEqual(invalid.success, false);
  });

  it('validates LocationDomainSchema properly', () => {
    const valid = LocationDomainSchema.safeParse({
      neighborhood: 'Koramangala 4th Block',
      city: 'Bengaluru',
      landmarks: 'Near Sony World Signal',
    });
    assert.strictEqual(valid.success, true);
  });

  it('rejects missing neighborhood in LocationDomainSchema', () => {
    const invalid = LocationDomainSchema.safeParse({
      neighborhood: ' ',
      city: 'Bengaluru',
    });
    assert.strictEqual(invalid.success, false);
  });

  it('validates ProductsDomainSchema signature items', () => {
    const valid = ProductsDomainSchema.safeParse({
      signature_items: 'Matcha Latte, Croissant',
    });
    assert.strictEqual(valid.success, true);
  });

  it('validates CustomersDomainSchema target customer', () => {
    const valid = CustomersDomainSchema.safeParse({
      target_customer: 'Local families & morning runners',
      target_monthly_customers: 2500,
    });
    assert.strictEqual(valid.success, true);
  });

  it('validates OfferDomainSchema promotional offer', () => {
    const valid = OfferDomainSchema.safeParse({
      default_offer: 'Free beverage with gourmet toast',
      avg_ticket_inr: 550,
    });
    assert.strictEqual(valid.success, true);
  });
});
