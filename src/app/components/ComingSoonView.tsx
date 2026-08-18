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

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px var(--space-gutter) 100px' }}>
        
        {/* Big Prominent Coming Soon Banner */}
        <div className="big-coming-soon-banner">
          <div className="big-coming-soon-left">
            <div className="big-coming-soon-status-tag">
              <span className="coming-soon-pulse-dot" />
              <span>{category} &bull; IN ACTIVE DEVELOPMENT</span>
            </div>
            <h2 className="big-coming-soon-title">
              {title} &mdash; Coming Soon
            </h2>
            <p className="big-coming-soon-desc">
              This module is currently being finalized on our engineering roadmap. While we prepare full touchpoint integration, you can explore the architecture specifications below or generate instant live campaigns today.
            </p>
          </div>

          <div className="big-coming-soon-actions">
            <Link href="/free-tool" className="big-coming-soon-btn-primary">
              <Sparkles size={15} /> Try Live Campaign Tool
            </Link>
            <Link href="/user/today" className="big-coming-soon-btn-secondary">
              Open Workspace <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 60px' }}>
          <div className="coming-soon-badge">
            <span className="coming-soon-pulse-dot" />
            <Clock size={15} color="#B45309" />
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em' }}>
              {category} &bull; COMING SOON
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '44px', color: 'var(--color-ink)', lineHeight: '1.2', margin: '0 0 18px', letterSpacing: '-0.02em' }}>
            {title}
          </h1>

          <p style={{ fontSize: '19px', color: 'var(--color-primary)', fontWeight: 500, margin: '0 0 18px', lineHeight: '1.45' }}>
            {subtitle}
          </p>

          <p style={{ fontSize: '15.5px', color: 'var(--color-ink-muted)', lineHeight: '1.65', margin: '0 0 36px' }}>
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
            Specifications In Active Engineering
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {highlights.map((h, i) => (
              <div
                key={i}
                className="card"
                style={{ padding: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', position: 'relative' }}
              >
                <span className="coming-soon-roadmap-badge">Planned Capability</span>
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
