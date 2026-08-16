import React from 'react';
import { UsageSummary } from '../types/billing';

interface UsageMeterProps {
  usage: UsageSummary | null;
  onUpgrade?: () => void;
  compact?: boolean;
}

export const UsageMeter: React.FC<UsageMeterProps> = ({ usage, onUpgrade, compact = false }) => {
  if (!usage) return null;

  if (compact) {
    return (
      <button className="usage-pill" onClick={onUpgrade} title="View quota and subscription">
        <span>
          {usage.planName} &bull; {usage.remainingPacks} packs left
        </span>
      </button>
    );
  }

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
          MONTHLY CAMPAIGN QUOTA
        </span>
        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: usage.canGenerate ? 'var(--color-primary)' : 'var(--color-terracotta)' }}>
          {usage.remainingPacks} remaining
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-ink)' }}>
          {usage.usedPacks}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
          of {usage.monthlyLimit} packs used ({usage.percentUsed}%)
        </span>
      </div>

      <div className="progress-bar-bg" style={{ marginBottom: '16px' }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${usage.percentUsed}%`,
            background: usage.percentUsed > 90 ? 'var(--color-terracotta)' : 'var(--color-primary)',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--color-muted)' }}>
        <span>Plan: <strong style={{ color: 'var(--color-ink)' }}>{usage.planName}</strong></span>
        {onUpgrade && (
          <button className="btn-ghost" style={{ fontSize: '12px', padding: '0', color: 'var(--color-primary)' }} onClick={onUpgrade}>
            Manage plan &rarr;
          </button>
        )}
      </div>
    </div>
  );
};
