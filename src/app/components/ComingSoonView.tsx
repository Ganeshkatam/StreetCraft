import React from 'react';
import Link from 'next/link';
import { PublicHeader } from './PublicHeader';
import { ServerFooter } from './ServerFooter';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';

interface ComingSoonViewProps {
  category: 'CUSTOMER TOUCHPOINT' | 'BUSINESS SOLUTION' | 'FEATURE';
  title: string;
  subtitle: string;
  description: string;
  highlights: Array<{ title: string; desc: string }>;
}

export function ComingSoonView({
  category,
  title,
  subtitle,
  description,
  highlights,
}: ComingSoonViewProps) {
  return (
    <div className="landing-container">
      <PublicHeader />

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '64px var(--space-gutter) 100px' }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary-border)', marginBottom: '20px' }}>
            <Clock size={14} color="var(--color-primary)" />
            <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '0.06em' }}>
              {category} &bull; COMING SOON
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', color: 'var(--color-ink)', lineHeight: '1.2', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            {title}
          </h1>

          <p style={{ fontSize: '18px', color: 'var(--color-primary)', fontWeight: 500, margin: '0 0 16px' }}>
            {subtitle}
          </p>

          <p style={{ fontSize: '15px', color: 'var(--color-ink-muted)', lineHeight: '1.65', margin: '0 0 32px' }}>
            {description}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              href="/free-tool"
              className="btn-primary"
              style={{ padding: '12px 26px', fontSize: '14px' }}
            >
              <Sparkles size={14} /> Try Free Campaign Tool
            </Link>
            <Link
              href="/how-it-works"
              className="btn-secondary"
              style={{ padding: '12px 22px', fontSize: '14px' }}
            >
              See How StreetCraft Works <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Planned Capabilities Grid */}
        <div style={{ marginTop: '48px', paddingTop: '40px', borderTop: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px', textAlign: 'center' }}>
            What We Are Preparing
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {highlights.map((h, i) => (
              <div
                key={i}
                className="card"
                style={{ padding: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '8px' }}>
                  {h.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.55', margin: 0 }}>
                  {h.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <ServerFooter />
    </div>
  );
}
