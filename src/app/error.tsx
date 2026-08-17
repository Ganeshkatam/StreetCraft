'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Logo } from '../components/Logo';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error securely
    console.error('StreetCraft Runtime Error Boundary caught:', error);
  }, [error]);

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
            background: 'var(--color-error-highlight, rgba(180, 40, 40, 0.1))',
            color: 'var(--color-error, #b42828)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <AlertCircle size={24} />
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--type-heading-size)',
            color: 'var(--color-ink)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            fontSize: 'var(--type-body-small-size)',
            color: 'var(--color-ink-muted)',
            lineHeight: 1.6,
            marginBottom: 'var(--space-6)',
          }}
        >
          An unexpected error occurred while rendering this view. Your store data remains secure.
        </p>

        <button
          onClick={() => reset()}
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
          <RotateCcw size={16} />
          Retry action
        </button>
      </div>
    </div>
  );
}
