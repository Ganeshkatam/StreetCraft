import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  deriveCampaignStatusCounts,
  deriveChannelCoverage,
  deriveGenerationUsage,
  deriveTimelineItems,
  deriveReportInsights,
} from '../lib/domain/report/reportMetrics';
import { StoreReportQuerySchema } from '../lib/domain/report/reportSchemas';

describe('Report Domain: Campaign Status Derivation', () => {
  it('correctly calculates status breakdowns across multiple campaigns', () => {
    const rawCampaigns = [
      { id: '1', type: 'COFFEE_DROP', status: 'DRAFT', created_at: '2026-08-01', updated_at: '2026-08-01' },
      { id: '2', type: 'BAKERY_SPECIAL', status: 'READY', created_at: '2026-08-02', updated_at: '2026-08-02' },
      { id: '3', type: 'WEEKEND_BRUNCH', status: 'PUBLISHED', created_at: '2026-08-03', updated_at: '2026-08-03' },
      { id: '4', type: 'FLASH_SALE', status: 'COMPLETED', created_at: '2026-08-04', updated_at: '2026-08-04' },
      { id: '5', type: 'CLEARANCE', status: 'ARCHIVED', created_at: '2026-08-05', updated_at: '2026-08-05' },
    ];

    const result = deriveCampaignStatusCounts(rawCampaigns);
    assert.strictEqual(result.total, 5);
    assert.strictEqual(result.draft, 1);
    assert.strictEqual(result.ready, 1);
    assert.strictEqual(result.published, 1);
    assert.strictEqual(result.completed, 1);
    assert.strictEqual(result.archived, 1);
  });

  it('handles empty campaigns list gracefully', () => {
    const result = deriveCampaignStatusCounts([]);
    assert.strictEqual(result.total, 0);
    assert.strictEqual(result.draft, 0);
    assert.strictEqual(result.published, 0);
  });
});

describe('Report Domain: Channel Coverage Derivation', () => {
  it('calculates channel presence and percentages correctly', () => {
    const rawOutputs = [
      { id: 'o1', campaign_id: 'c1', channel: 'GOOGLE_BUSINESS' },
      { id: 'o2', campaign_id: 'c1', channel: 'INSTAGRAM' },
      { id: 'o3', campaign_id: 'c1', channel: 'WHATSAPP' },
      { id: 'o4', campaign_id: 'c1', channel: 'IN_STORE_POSTER' },
      { id: 'o5', campaign_id: 'c2', channel: 'GOOGLE_BUSINESS' },
      { id: 'o6', campaign_id: 'c2', channel: 'INSTAGRAM' },
    ];

    const result = deriveChannelCoverage(rawOutputs, 2);
    assert.strictEqual(result.totalOutputs, 6);
    assert.strictEqual(result.averageOutputsPerCampaign, 3.0);
    assert.strictEqual(result.googleBusiness.count, 2);
    assert.strictEqual(result.googleBusiness.percentage, 100);
    assert.strictEqual(result.whatsapp.count, 1);
    assert.strictEqual(result.whatsapp.percentage, 50);
  });
});

describe('Report Domain: Generation Usage Derivation', () => {
  it('calculates quota utilization percentage and remaining packs', () => {
    const rawUsage = {
      plan: 'STARTER',
      pack_limit: 10,
      packs_used: 4,
      period_start: '2026-08-01',
      period_end: '2026-08-31',
    };

    const result = deriveGenerationUsage(rawUsage, 'Starter Plan');
    assert.strictEqual(result.planTier, 'STARTER');
    assert.strictEqual(result.packLimit, 10);
    assert.strictEqual(result.packsUsed, 4);
    assert.strictEqual(result.packsRemaining, 6);
    assert.strictEqual(result.utilizationPercentage, 40);
  });

  it('handles null usage period with default fallback', () => {
    const result = deriveGenerationUsage(null);
    assert.strictEqual(result.planTier, 'FREE');
    assert.strictEqual(result.packLimit, 3);
    assert.strictEqual(result.packsUsed, 0);
    assert.strictEqual(result.packsRemaining, 3);
  });
});

describe('Report Domain: Timeline & Insights Derivation', () => {
  it('formats timeline items and notes accurately', () => {
    const rawCampaigns = [
      {
        id: 'c1',
        type: 'AFTERNOON_RESET',
        status: 'PUBLISHED',
        created_at: '2026-08-10T12:00:00Z',
        updated_at: '2026-08-10T14:00:00Z',
        offer: { title: '3 PM Pour-Over & Croissant Pairing' },
        performance_notes: 'Sold out 14 almond croissants in 90 minutes.',
      },
    ];

    const timeline = deriveTimelineItems(rawCampaigns);
    assert.strictEqual(timeline.length, 1);
    assert.strictEqual(timeline[0].title, '3 PM Pour-Over & Croissant Pairing');
    assert.strictEqual(timeline[0].hasPerformanceNotes, true);
    assert.strictEqual(timeline[0].notesSnippet, 'Sold out 14 almond croissants in 90 minutes.');
  });

  it('generates defensible operational insights without fabricating claims', () => {
    const activity = { draft: 1, ready: 0, published: 0, completed: 0, archived: 0, total: 1 };
    const coverage = {
      googleBusiness: { channel: 'GOOGLE_BUSINESS', label: 'Google', count: 1, percentage: 100 },
      instagram: { channel: 'INSTAGRAM', label: 'Instagram', count: 1, percentage: 100 },
      whatsapp: { channel: 'WHATSAPP', label: 'WhatsApp', count: 0, percentage: 0 },
      inStorePoster: { channel: 'IN_STORE_POSTER', label: 'Poster', count: 0, percentage: 0 },
      totalOutputs: 2,
      averageOutputsPerCampaign: 2.0,
    };
    const usage = {
      planTier: 'STARTER',
      planName: 'Starter Plan',
      packLimit: 5,
      packsUsed: 1,
      packsRemaining: 4,
      utilizationPercentage: 20,
      periodStart: null,
      periodEnd: null,
    };
    const snapshot = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Cafe Test',
      category: 'CAFE',
      neighborhood: 'Koramangala',
      city: 'Bengaluru',
      landmarks: 'Near Water Tank',
      signatureItems: 'Cold Brew',
      phoneWhatsapp: null,
    };

    const insights = deriveReportInsights(activity, coverage, usage, [], snapshot);
    assert.ok(insights.length > 0);
    // Should flag channel completeness (average < 4)
    assert.ok(insights.some((i) => i.type === 'COVERAGE'));
    // Should highlight remaining quota
    assert.ok(insights.some((i) => i.type === 'OPPORTUNITY'));
  });
});

describe('Report Domain: Schema Validation', () => {
  it('validates a valid UUID business ID', () => {
    const res = StoreReportQuerySchema.safeParse({ businessId: 'e8b7c3d2-4f1a-4c9e-8b5d-3a2c1e0f9a8b' });
    assert.strictEqual(res.success, true);
  });

  it('rejects an invalid business ID string', () => {
    const res = StoreReportQuerySchema.safeParse({ businessId: 'not-a-uuid' });
    assert.strictEqual(res.success, false);
  });
});
