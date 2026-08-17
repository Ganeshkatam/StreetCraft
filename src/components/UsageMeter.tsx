import React from 'react';
import { UsageSummary } from '../types/billing';
import { Zap } from 'lucide-react';

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
        <Zap size={12} />
        <span>{usage.planName} &bull; {usage.remainingPacks} remaining</span>
      </button>
    );
  }

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={14} color="var(--color-primary)" />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            MONTHLY QUOTA
          </span>
        </div>
        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: usage.canGenerate ? 'var(--color-primary)' : 'var(--color-danger)' }}>
          {usage.remainingPacks} remaining
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-ink)' }}>
          {usage.usedPacks}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--color-ink-muted)' }}>
          of {usage.monthlyLimit} campaigns ({usage.percentUsed}%)
        </span>
      </div>

      <div style={{ background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-full)', height: '6px', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--color-border-soft)' }}>
        <div
          style={{
            height: '100%',
            width: `${usage.percentUsed}%`,
            background: usage.percentUsed > 90 ? 'var(--color-danger)' : 'var(--color-primary)',
            borderRadius: 'var(--radius-full)',
            transition: 'width var(--motion-slow)',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>
        <span>Plan: <strong style={{ color: 'var(--color-ink)' }}>{usage.planName}</strong></span>
        {onUpgrade && (
          <button className="btn-ghost" style={{ fontSize: '12px', padding: '0', color: 'var(--color-primary)' }} onClick={onUpgrade}>
            Upgrade Tier
          </button>
        )}
      </div>
    </div>
  );
};
