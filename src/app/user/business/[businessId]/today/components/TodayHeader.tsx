'use client';

import React from 'react';
import Link from 'next/link';
import { TodayBriefingSummary } from '../../../../../../lib/domain/today/todayTypes';
import { Plus } from 'lucide-react';

interface TodayHeaderProps {
  businessId: string;
  briefing: TodayBriefingSummary;
  vaultCount: number;
}

export function TodayHeader({ businessId, briefing, vaultCount }: TodayHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--color-border)',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-primary)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          DAILY WORKSPACE &bull; {briefing.dateString.toUpperCase()}
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px',
            color: 'var(--color-ink)',
            marginTop: '2px',
          }}
        >
          {briefing.greeting}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--color-ink-muted)', margin: '4px 0 0' }}>
          {briefing.subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Link
          href={`/user/business/${encodeURIComponent(businessId)}/campaigns`}
          className="btn-secondary"
        >
          Vault ({vaultCount})
        </Link>
        <Link
          href={`/user/business/${encodeURIComponent(businessId)}/create`}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          <span>Create promotion</span>
        </Link>
      </div>
    </div>
  );
}
