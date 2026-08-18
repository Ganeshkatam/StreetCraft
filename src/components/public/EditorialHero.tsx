import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { EditorialCta } from '../../content/types';

interface EditorialHeroProps {
  category: string;
  eyebrow: string;
  title: string;
  tagline: string;
  description: string;
  heroCta: EditorialCta;
}

export function EditorialHero({
  category,
  eyebrow,
  title,
  tagline,
  description,
  heroCta,
}: EditorialHeroProps) {
  return (
    <section style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 56px', paddingTop: '48px' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary-subtle)',
          border: '1px solid var(--color-primary-border)',
          marginBottom: '20px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-primary)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {category} &bull; {eyebrow}
        </span>
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '44px',
          color: 'var(--color-ink)',
          lineHeight: '1.18',
          margin: '0 0 16px',
          letterSpacing: '-0.025em',
        }}
      >
        {title}
      </h1>

      <p
        style={{
          fontSize: '20px',
          color: 'var(--color-primary)',
          fontWeight: 500,
          lineHeight: '1.4',
          margin: '0 0 16px',
        }}
      >
        {tagline}
      </p>

      <p
        style={{
          fontSize: '16px',
          color: 'var(--color-ink-muted)',
          lineHeight: '1.65',
          maxWidth: '720px',
          margin: '0 auto 36px',
        }}
      >
        {description}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <Link
          href={heroCta.primary.href}
          className="btn-primary"
          style={{ padding: '13px 28px', fontSize: '14.5px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Sparkles size={15} />
          <span>{heroCta.primary.label}</span>
        </Link>
        <Link
          href={heroCta.secondary.href}
          className="btn-secondary"
          style={{ padding: '13px 24px', fontSize: '14.5px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <span>{heroCta.secondary.label}</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
