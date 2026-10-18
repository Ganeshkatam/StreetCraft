import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeCampaignDraft,
  saveCampaignDraftToStorage,
  loadCampaignDraftFromStorage,
  clearCampaignDraftFromStorage,
  getDraftStorageKey,
} from '../lib/domain/create/draftPersistence';

// In-memory mock storage implementing Web Storage API
class MockStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe('Create Campaign Domain: Draft Persistence & Recovery', () => {
  const businessId = '11111111-1111-1111-1111-111111111111';

  it('generates consistent storage keys scoped to business ID', () => {
    assert.strictEqual(getDraftStorageKey(businessId), `sc_draft_campaign_${businessId}`);
  });

  it('sanitizes and clamps campaign draft values safely without credentials', () => {
    const raw = {
      step: 3,
      type: 'WEEKEND_MAGNET' as const,
      objective: 'MORE_WALK_INS' as const,
      offerTitle: 'Delicious Croissant Promo',
      offerDesc: 'Special butter croissants baked fresh at 8 AM and 4 PM.',
      offerValue: 'Flat 20% Off',
      offerTerms: 'Dine-in only.',
      timingLabel: 'Sat-Sun 8 AM - 12 PM',
      audience: 'Morning bakery enthusiasts',
      customNotes: 'Highlight our French butter supplier.',
    };

    const sanitized = sanitizeCampaignDraft(raw);
    assert.strictEqual(sanitized.step, 3);
    assert.strictEqual(sanitized.type, 'WEEKEND_MAGNET');
    assert.strictEqual(sanitized.offerTitle, 'Delicious Croissant Promo');
    assert.strictEqual(sanitized.offerValue, 'Flat 20% Off');
    assert.ok(sanitized.savedAt);
  });

  it('clamps excessive text input lengths to prevent storage bloating', () => {
    const overlyLongTitle = 'A'.repeat(500);
    const overlyLongDesc = 'B'.repeat(1000);
    const sanitized = sanitizeCampaignDraft({
      offerTitle: overlyLongTitle,
      offerDesc: overlyLongDesc,
    });

    assert.strictEqual(sanitized.offerTitle.length, 120);
    assert.strictEqual(sanitized.offerDesc.length, 400);
  });

  it('saves and restores drafts through mock storage successfully', () => {
    const storage = new MockStorage();
    const draft = {
      step: 3,
      offerTitle: 'Flash Monsoon Chai Offer',
      offerDesc: 'Complimentary masala cookies with any cutting chai.',
      offerValue: 'Free Cookies',
      timingLabel: 'Rainy Afternoons',
    };

    const saved = saveCampaignDraftToStorage(storage, businessId, draft);
    assert.strictEqual(saved, true);

    const loaded = loadCampaignDraftFromStorage(storage, businessId);
    assert.ok(loaded);
    assert.strictEqual(loaded.offerTitle, 'Flash Monsoon Chai Offer');
    assert.strictEqual(loaded.offerValue, 'Free Cookies');
    assert.strictEqual(loaded.timingLabel, 'Rainy Afternoons');
  });

  it('clears drafts cleanly upon submission or reset', () => {
    const storage = new MockStorage();
    saveCampaignDraftToStorage(storage, businessId, {
      offerTitle: 'Test Offer',
      offerDesc: 'Test Description',
    });

    assert.ok(loadCampaignDraftFromStorage(storage, businessId));

    clearCampaignDraftFromStorage(storage, businessId);
    assert.strictEqual(loadCampaignDraftFromStorage(storage, businessId), null);
  });

  it('handles null storage or parsing corruption gracefully without crashing', () => {
    assert.strictEqual(loadCampaignDraftFromStorage(null, businessId), null);
    assert.strictEqual(saveCampaignDraftToStorage(null, businessId, {}), false);

    const storage = new MockStorage();
    storage.setItem(getDraftStorageKey(businessId), 'corrupted-non-json');
    assert.strictEqual(loadCampaignDraftFromStorage(storage, businessId), null);
  });
});
