import React from 'react';
import type { CapabilityContent } from '../../content/types';
import { Check } from 'lucide-react';

interface FeatureGridProps {
  eyebrow?: string;
  title?: string;
  capabilities: CapabilityContent[];
}

export function FeatureGrid({
  eyebrow = 'CAPABILITIES',
  title = 'Engineered for Walk-In Business Operations',
  capabilities,
}: FeatureGridProps) {
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
            margin: 0,
            letterSpacing: '-0.015em',
          }}
        >
          {title}
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        {capabilities.map((cap, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: '32px 28px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                fontSize: '10.5px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--color-primary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              {cap.tag}
            </span>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '19px',
                color: 'var(--color-ink)',
                margin: '0 0 10px',
              }}
            >
              {cap.title}
            </h3>
            <p
              style={{
                fontSize: '14.5px',
                color: 'var(--color-ink-muted)',
                lineHeight: '1.6',
                margin: '0 0 20px',
              }}
            >
              {cap.description}
            </p>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 'auto 0 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '16px',
              }}
            >
              {cap.bulletPoints.map((bp, bIdx) => (
                <li
                  key={bIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--color-ink)',
                    lineHeight: '1.45',
                  }}
                >
                  <Check size={14} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
