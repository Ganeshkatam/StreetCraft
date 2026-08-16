import React from 'react';
import { UsageSummary } from '../types/billing';
import { Zap, ArrowUpRight } from 'lucide-react';

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
        <span>{usage.planName} &bull; {usage.remainingPacks} packs left</span>
      </button>
    );
  }

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={14} color="var(--accent-emerald)" />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            MONTHLY QUOTA
          </span>
        </div>
        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: usage.canGenerate ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
          {usage.remainingPacks} remaining
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
        <span style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          {usage.usedPacks}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          of {usage.monthlyLimit} packs ({usage.percentUsed}%)
        </span>
      </div>

      <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', height: '6px', overflow: 'hidden', marginBottom: '16px' }}>
        <div
          style={{
            height: '100%',
            width: `${usage.percentUsed}%`,
            background: usage.percentUsed > 90 ? 'var(--accent-rose)' : 'var(--gradient-primary)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
        <span>Plan: <strong style={{ color: '#FFFFFF' }}>{usage.planName}</strong></span>
        {onUpgrade && (
          <button className="btn-ghost" style={{ fontSize: '12px', padding: '0', color: 'var(--accent-emerald)' }} onClick={onUpgrade}>
            Upgrade Tier <ArrowUpRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
