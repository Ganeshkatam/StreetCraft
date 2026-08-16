import React from 'react';
import { UsageSummary } from '../types/billing';
import { CreditCard, Sparkles } from 'lucide-react';

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
        <CreditCard size={13} />
        <span>
          Plan: <strong>{usage.planName}</strong> ({usage.usedPacks}/{usage.monthlyLimit} packs)
        </span>
      </button>
    );
  }

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Monthly Campaign Quota
        </small>
        <span style={{ fontSize: '12px', fontWeight: 700, color: usage.canGenerate ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
          {usage.remainingPacks} packs left
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
          {usage.usedPacks}
        </span>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          / {usage.monthlyLimit} packs used ({usage.percentUsed}%)
        </span>
      </div>

      <div className="progress-bar-bg" style={{ marginBottom: '12px', height: '6px' }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${usage.percentUsed}%`,
            background: usage.percentUsed > 90 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <span>Current Tier: <strong>{usage.planName}</strong></span>
        {onUpgrade && (
          <button className="btn-ghost" style={{ fontSize: '12px', padding: '2px 0', color: 'var(--accent-emerald)' }} onClick={onUpgrade}>
            Upgrade Quota &rarr;
          </button>
        )}
      </div>
    </div>
  );
};
