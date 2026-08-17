import React from 'react';
import Link from 'next/link';
import { Logo } from '../components/Logo';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-gutter)',
        background: 'var(--color-page)',
        textAlign: 'center',
      }}
    >
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Logo size="lg" />
      </div>

      <div
        style={{
          maxWidth: '480px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-card)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--color-primary-highlight)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <Compass size={24} />
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--type-heading-size)',
            color: 'var(--color-ink)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Page not found
        </h1>

        <p
          style={{
            fontSize: 'var(--type-body-small-size)',
            color: 'var(--color-ink-muted)',
            lineHeight: 1.6,
            marginBottom: 'var(--space-6)',
          }}
        >
          The page or opportunity you are looking for does not exist or may have been moved.
        </p>

        <Link
          href="/"
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={16} />
          Return to Home
        </Link>
      </div>
    </div>
  );
}
