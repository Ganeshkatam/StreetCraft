import React from 'react';
import type { ReportInsightItem } from '../../../../../../lib/domain/report/reportTypes';
import Link from 'next/link';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface ReportInsightsProps {
  insights: ReportInsightItem[];
}

export function ReportInsights({ insights }: ReportInsightsProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '28px',
        marginBottom: '28px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
        <Lightbulb size={18} color="var(--color-primary)" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', margin: 0 }}>
          Operational Opportunities
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {insights.map((ins) => (
          <div
            key={ins.id}
            style={{
              background: 'var(--color-bg, #F9FAF7)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                {ins.badge}
              </span>

              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 6px' }}>
                {ins.title}
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.5', margin: 0 }}>
                {ins.description}
              </p>
            </div>

            {ins.actionHref && ins.actionLabel && (
              <Link
                href={ins.actionHref}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  marginTop: '6px',
                }}
              >
                <span>{ins.actionLabel}</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
