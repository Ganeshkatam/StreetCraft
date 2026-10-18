import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getTodayIST } from '../lib/server/usage/getCurrentUsagePeriod';

describe('Brief 1: IST Date Calculation & Boundary Rules', () => {
  it('formats current IST date in deterministic YYYY-MM-DD format', () => {
    const today = getTodayIST();
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('correctly maps 31 Oct 2026 23:59 IST to October boundary', () => {
    // 23:59:00 IST (+05:30) is 18:29:00 UTC
    const dateOct31Night = new Date('2026-10-31T18:29:00.000Z');
    assert.strictEqual(getTodayIST(dateOct31Night), '2026-10-31');
  });

  it('correctly maps 1 Nov 2026 00:01 IST to November boundary', () => {
    // 00:01:00 IST (+05:30) is 18:31:00 UTC on 31 Oct
    const dateNov1Morning = new Date('2026-10-31T18:31:00.000Z');
    assert.strictEqual(getTodayIST(dateNov1Morning), '2026-11-01');
  });

  it('handles leap year and end-of-month transitions deterministically in IST', () => {
    // 28 Feb 2024 23:59:59 IST (2024 is leap year)
    const leapEve = new Date('2024-02-28T18:29:59.000Z');
    assert.strictEqual(getTodayIST(leapEve), '2024-02-28');

    // 29 Feb 2024 00:00:01 IST
    const leapDay = new Date('2024-02-28T18:30:01.000Z');
    assert.strictEqual(getTodayIST(leapDay), '2024-02-29');

    // 1 Mar 2024 00:00:01 IST
    const marchFirst = new Date('2024-02-29T18:30:01.000Z');
    assert.strictEqual(getTodayIST(marchFirst), '2024-03-01');
  });
});
