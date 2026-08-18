import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { ConversionContent } from '../../content/types';

interface ConversionLaunchpadProps {
  content: ConversionContent;
}

export function ConversionLaunchpad({ content }: ConversionLaunchpadProps) {
  return (
    <section
      style={{
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '56px 40px',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-primary)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: '12px',
          fontWeight: 700,
        }}
      >
        {content.eyebrow}
      </span>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '36px',
          color: 'var(--color-ink)',
          lineHeight: '1.2',
          margin: '0 auto 16px',
          maxWidth: '680px',
          letterSpacing: '-0.02em',
        }}
      >
        {content.title}
      </h2>
      <p
        style={{
          fontSize: '16px',
          color: 'var(--color-ink-muted)',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 32px',
        }}
      >
        {content.description}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <Link
          href={content.primaryCta.href}
          className="btn-primary"
          style={{ padding: '13px 28px', fontSize: '14.5px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Sparkles size={15} />
          <span>{content.primaryCta.label}</span>
        </Link>
        <Link
          href={content.secondaryCta.href}
          className="btn-secondary"
          style={{ padding: '13px 24px', fontSize: '14.5px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <span>{content.secondaryCta.label}</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
