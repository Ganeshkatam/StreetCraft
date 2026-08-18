import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getGreetingForHour,
  formatCurrentDate,
  formatRelativeTimeLabel,
  mapFestivalsToSummaries,
} from '../lib/domain/today/todayBriefing';
import { FestivalMoment } from '../lib/server/opportunities/getFestivalMoments';

describe('Today Domain: Greeting and Date Formatter', () => {
  it('returns appropriate greeting based on hour of day', () => {
    assert.strictEqual(getGreetingForHour(8), 'Good morning');
    assert.strictEqual(getGreetingForHour(13), 'Good afternoon');
    assert.strictEqual(getGreetingForHour(20), 'Good evening');
  });

  it('formats current date nicely', () => {
    const testDate = new Date('2026-08-18T10:00:00Z');
    const formatted = formatCurrentDate(testDate);
    assert.match(formatted, /Tuesday/);
    assert.match(formatted, /18/);
    assert.match(formatted, /Aug/);
    assert.match(formatted, /2026/);
  });
});

describe('Today Domain: Festival Relative Time Formatter', () => {
  const fixedNow = new Date('2026-08-18T12:00:00Z');

  it('formats today event correctly', () => {
    const res = formatRelativeTimeLabel('2026-08-18T18:00:00Z', fixedNow);
    assert.strictEqual(res.relativeTimeLabel, 'TODAY');
    assert.strictEqual(res.isTodayOrActive, true);
  });

  it('formats tomorrow event correctly', () => {
    const res = formatRelativeTimeLabel('2026-08-19T10:00:00Z', fixedNow);
    assert.strictEqual(res.relativeTimeLabel, 'TOMORROW');
    assert.strictEqual(res.isTodayOrActive, true);
  });

  it('formats future event in days', () => {
    const res = formatRelativeTimeLabel('2026-08-25T10:00:00Z', fixedNow);
    assert.strictEqual(res.relativeTimeLabel, 'IN 7 DAYS');
    assert.strictEqual(res.isTodayOrActive, false);
  });
});

describe('Today Domain: Festival Summaries Mapper', () => {
  const mockFestivals: FestivalMoment[] = [
    {
      id: 'fest-1',
      name: 'Raksha Bandhan',
      region: 'National',
      starts_at: '2026-08-28T00:00:00Z',
      ends_at: '2026-08-28T23:59:59Z',
      marketing_relevance: 'Family gifting & sweets rush',
      suggested_offer: 'Special Gift Hamper with complimentary greeting card',
    },
    {
      id: 'fest-2',
      name: 'Janmashtami',
      region: 'National',
      starts_at: '2026-09-04T00:00:00Z',
      ends_at: '2026-09-04T23:59:59Z',
      marketing_relevance: 'Festive treats and late evening walk-ins',
      suggested_offer: 'Traditional festive dessert combo',
    },
  ];

  it('maps festival models to summaries with relative badge labels', () => {
    const fixedNow = new Date('2026-08-18T12:00:00Z');
    const summaries = mapFestivalsToSummaries(mockFestivals, fixedNow, 2);
    assert.strictEqual(summaries.length, 2);
    assert.strictEqual(summaries[0].name, 'Raksha Bandhan');
    assert.strictEqual(summaries[0].relativeTimeLabel, 'IN 10 DAYS');
    assert.strictEqual(summaries[0].suggestedOffer, 'Special Gift Hamper with complimentary greeting card');
  });
});
