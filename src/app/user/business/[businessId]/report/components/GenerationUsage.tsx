import React from 'react';
import type { GenerationUsageViewModel } from '../../../../../../lib/domain/report/reportTypes';
import { Zap, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface GenerationUsageProps {
  usage: GenerationUsageViewModel;
  businessId: string;
}

export function GenerationUsage({ usage, businessId }: GenerationUsageProps) {
  const formattedEnd = usage.periodEnd
    ? new Date(usage.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '28px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color="var(--color-primary)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', margin: 0 }}>
            Monthly Quota Utilization
          </h2>
        </div>

        <Link
          href={`/user/business/${businessId}/plan`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
        >
          <span>Manage Plan</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
            Current Tier
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)', marginTop: '2px' }}>
            {usage.planName}
          </div>
          {formattedEnd && (
            <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
              Cycle resets: {formattedEnd}
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-ink-muted)' }}>Packs Consumed</span>
            <span style={{ fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)' }}>
              {usage.packsUsed} / {usage.packLimit} ({usage.utilizationPercentage}%)
            </span>
          </div>

          <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${usage.utilizationPercentage}%`,
                height: '100%',
                background: usage.utilizationPercentage > 85 ? '#DC2626' : 'var(--color-primary)',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
            Remaining Allotment
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: usage.packsRemaining > 0 ? 'var(--color-primary)' : '#DC2626', marginTop: '2px' }}>
            {usage.packsRemaining}
          </div>
        </div>
      </div>
    </div>
  );
}
