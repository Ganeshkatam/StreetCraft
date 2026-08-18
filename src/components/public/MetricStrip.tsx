import React from 'react';
import type { EditorialMetric } from '../../content/types';

interface MetricStripProps {
  metrics: EditorialMetric[];
}

export function MetricStrip({ metrics }: MetricStripProps) {
  return (
    <section
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '14px',
        padding: '28px 32px',
        marginBottom: '64px',
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
        gap: '24px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
      }}
    >
      {metrics.map((m, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--color-primary)',
              lineHeight: 1.1,
            }}
          >
            {m.value}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>
            {m.label}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: '1.45' }}>
            {m.sublabel}
          </div>
        </div>
      ))}
    </section>
  );
}
