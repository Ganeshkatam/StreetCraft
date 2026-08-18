import React from 'react';
import type { PlaybookStep } from '../../content/types';

interface StorePlaybookProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  steps: PlaybookStep[];
}

export function StorePlaybook({
  eyebrow = 'OPERATING WORKFLOW',
  title = 'How It Runs in Your Actual Store Rhythm',
  subtitle = 'From identifying a quiet hour or new arrival to customer footfall in 4 coordinated steps.',
  steps,
}: StorePlaybookProps) {
  return (
    <section style={{ marginBottom: '80px' }}>
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px' }}>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-primary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '8px',
            fontWeight: 700,
          }}
        >
          {eyebrow}
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            color: 'var(--color-ink)',
            lineHeight: '1.25',
            margin: '0 0 12px',
            letterSpacing: '-0.015em',
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: '15.5px', color: 'var(--color-ink-muted)', lineHeight: '1.6', margin: 0 }}>
          {subtitle}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}
      >
        {steps.map((s) => (
          <div
            key={s.step}
            className="card"
            style={{
              padding: '28px 24px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                marginBottom: '10px',
              }}
            >
              STEP {String(s.step).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '8px' }}>
              {s.trigger}
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.55', margin: '0 0 14px' }}>
              {s.action}
            </p>
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '12px',
                borderTop: '1px solid var(--color-border)',
                fontSize: '12.5px',
                fontWeight: 500,
                color: 'var(--color-primary)',
              }}
            >
              Outcome: {s.outcome}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
