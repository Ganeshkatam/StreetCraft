import React from 'react';
import type { CopyAnatomyContent } from '../../content/types';
import { CheckCircle2, Code2 } from 'lucide-react';

interface CopyAnatomyProps {
  content: CopyAnatomyContent;
}

export function CopyAnatomy({ content }: CopyAnatomyProps) {
  return (
    <section style={{ marginBottom: '80px' }}>
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 36px' }}>
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
          {content.eyebrow}
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
          {content.title}
        </h2>
        <p style={{ fontSize: '15.5px', color: 'var(--color-ink-muted)', lineHeight: '1.6', margin: 0 }}>
          {content.description}
        </p>
      </div>

      {/* Anatomy Card Preview */}
      <div
        className="card"
        style={{
          padding: '0',
          overflow: 'hidden',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            background: 'var(--color-surface-raised)',
            padding: '14px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code2 size={16} color="var(--color-primary)" />
            <span style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-ink)' }}>
              {content.previewTitle}
            </span>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Structured Output
          </span>
        </div>

        {/* Breakdown Rows */}
        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {content.items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(140px, 180px) 1fr',
                gap: '24px',
                paddingBottom: idx === content.items.length - 1 ? 0 : '20px',
                borderBottom: idx === content.items.length - 1 ? 'none' : '1px solid var(--color-border)',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '10.5px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'var(--color-surface-raised)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-ink-muted)',
                    marginBottom: '6px',
                  }}
                >
                  {item.badge}
                </span>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)' }}>
                  {item.label}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '14.5px',
                    color: 'var(--color-ink)',
                    lineHeight: '1.6',
                    fontFamily: 'inherit',
                    marginBottom: '6px',
                    background: 'var(--color-surface-raised)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {item.text}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--color-primary)', fontWeight: 500 }}>
                  <CheckCircle2 size={13} />
                  <span>{item.note}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
