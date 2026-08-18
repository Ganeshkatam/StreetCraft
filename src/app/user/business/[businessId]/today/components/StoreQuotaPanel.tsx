'use client';

import React from 'react';
import Link from 'next/link';
import { TodayQuotaSummary } from '../../../../../../lib/domain/today/todayTypes';
import { Zap, AlertCircle } from 'lucide-react';

interface StoreQuotaPanelProps {
  businessId: string;
  quota: TodayQuotaSummary | null;
  onUpgradeClick?: () => void;
}

export function StoreQuotaPanel({ businessId, quota, onUpgradeClick }: StoreQuotaPanelProps) {
  if (!quota) {
    return (
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>
          <AlertCircle size={16} /> Entitlement Unavailable
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', margin: '0 0 14px' }}>
          No active usage quota found for this period. Contact support or check plan settings.
        </p>
        <Link
          href={`/user/business/${encodeURIComponent(businessId)}/plan`}
          className="btn-secondary"
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          View Commercial Plan
        </Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
          CAMPAIGN QUOTA ({quota.planName})
        </span>
        <Link
          href={`/user/business/${encodeURIComponent(businessId)}/plan`}
          className="btn-ghost"
          style={{ fontSize: '12px', padding: 0, color: 'var(--color-primary)' }}
        >
          Manage
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-ink)' }}>
          {quota.campaignsRemaining}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--color-ink-muted)' }}>
          remaining of {quota.campaignLimit} this month
        </span>
      </div>

      <div
        style={{
          background: 'var(--color-surface-raised)',
          height: '6px',
          borderRadius: '3px',
          overflow: 'hidden',
          margin: '8px 0 14px',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${quota.percentUsed}%`,
            background: 'var(--color-primary)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {onUpgradeClick && (
        <button
          type="button"
          className="btn-secondary"
          style={{ width: '100%', fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          onClick={onUpgradeClick}
        >
          <Zap size={13} />
          <span>Upgrade Allowance</span>
        </button>
      )}
    </div>
  );
}
