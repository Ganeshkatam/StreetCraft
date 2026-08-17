import React from 'react';
import Link from 'next/link';
import { Logo } from '../components/Logo';
import { ServerFooter } from './components/ServerFooter';
import { Sparkles, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* Public Header */}
      <header className="main-header">
        <div className="header-container">
          <Link href="/" className="brand-wrapper">
            <Logo size="md" />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <Link href="/how-it-works" className="btn-ghost" style={{ fontSize: '13.5px' }}>
              How It Works
            </Link>
            <Link href="/pricing" className="btn-ghost" style={{ fontSize: '13.5px' }}>
              Pricing
            </Link>
            <Link href="/login" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13.5px' }}>
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Server-Rendered Content */}
      <main style={{ flex: 1, padding: 'var(--space-section) var(--space-gutter)' }}>
        <div style={{ maxWidth: 'var(--layout-page-max)', margin: '0 auto' }}>
          {/* Hero Section */}
          <div style={{ maxWidth: 'var(--layout-reading-max)', marginBottom: 'var(--space-8)' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-primary-highlight)',
                color: 'var(--color-primary)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                marginBottom: 'var(--space-4)',
              }}
            >
              <MapPin size={13} />
              A GROWTH ENGINE FOR PHYSICAL BUSINESSES
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--type-display-xl-size)',
                lineHeight: 'var(--type-display-xl-leading)',
                letterSpacing: 'var(--type-display-xl-tracking)',
                color: 'var(--color-ink)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Turn one business opportunity into everything customers need to see.
            </h1>

            <p
              style={{
                fontSize: 'var(--type-body-size)',
                lineHeight: 'var(--type-body-leading)',
                color: 'var(--color-ink-muted)',
                marginBottom: 'var(--space-6)',
              }}
            >
              Google Business, Instagram, WhatsApp, and your counter &mdash; prepared together.
              Built for cafes, bakeries, salons, studios, and boutiques that want more foot traffic
              without more marketing work.
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <Link
                href="/free-tool"
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  fontSize: '15px',
                }}
              >
                <Sparkles size={16} />
                Try Free Campaign Tool
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/pricing"
                className="btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '14px 24px',
                  fontSize: '15px',
                }}
              >
                View Plans & Pricing
              </Link>
            </div>
          </div>

          {/* 4 Touchpoints Server Grid */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <div
              style={{
                fontSize: 'var(--type-caption-size)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-primary)',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-3)',
              }}
            >
              Four Coordinated Outputs &bull; One Action
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--type-display-lg-size)',
                lineHeight: 'var(--type-display-lg-leading)',
                color: 'var(--color-ink)',
                marginBottom: 'var(--space-6)',
              }}
            >
              One opportunity. Four publication-ready customer touchpoints.
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-stack)',
              }}
            >
              {/* Proof 1: Google */}
              <div
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-card)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <CheckCircle2 size={16} color="var(--color-primary)" />
                  <strong style={{ fontSize: '14px', fontFamily: 'var(--font-display)' }}>
                    Google Business Update
                  </strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.6', margin: 0 }}>
                  Local SEO-optimized update with operating hours, exact terms, and clear call-to-action for nearby searchers.
                </p>
              </div>

              {/* Proof 2: Instagram */}
              <div
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-card)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <CheckCircle2 size={16} color="var(--color-primary)" />
                  <strong style={{ fontSize: '14px', fontFamily: 'var(--font-display)' }}>
                    Instagram Proof & Caption
                  </strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.6', margin: 0 }}>
                  Scroll-stopping hook, body narrative, offer mechanics, and category-aware neighborhood hashtags.
                </p>
              </div>

              {/* Proof 3: WhatsApp */}
              <div
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-card)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <CheckCircle2 size={16} color="var(--color-primary)" />
                  <strong style={{ fontSize: '14px', fontFamily: 'var(--font-display)' }}>
                    WhatsApp VIP Broadcast
                  </strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.6', margin: 0 }}>
                  Direct conversational broadcast structured for customer groups with urgency and bold formatting.
                </p>
              </div>

              {/* Proof 4: Print */}
              <div
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-card)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <CheckCircle2 size={16} color="var(--color-primary)" />
                  <strong style={{ fontSize: '14px', fontFamily: 'var(--font-display)' }}>
                    In-Store Counter Card
                  </strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.6', margin: 0 }}>
                  Clean typography poster layout prepared for counter tent cards, registers, and sidewalk chalkboards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Full Editorial Footer */}
      <ServerFooter variant="full" />
    </>
  );
}
