'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '48px 36px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-overlay)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--color-ink-muted)',
          }}
        >
          <AlertCircle size={28} />
        </div>

        <span className="section-eyebrow" style={{ marginBottom: '8px' }}>
          SYSTEM &bull; UNEXPECTED STATE
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '26px',
            color: 'var(--color-ink)',
            marginBottom: '12px',
          }}
        >
          Something Went Wrong
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-ink-muted)',
            lineHeight: '1.6',
            marginBottom: '28px',
          }}
        >
          {error.message || 'An unexpected error occurred while loading this workspace view. Your data is safe.'}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn-secondary" onClick={() => reset()}>
            <RefreshCw size={14} /> Try Again
          </button>
          <Link href="/user/today" className="btn-primary">
            <LayoutDashboard size={14} /> Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
