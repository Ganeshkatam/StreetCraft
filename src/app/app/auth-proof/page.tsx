import React from 'react';
import { requireAuth, getUserClaims } from '../../../lib/supabase/auth';
import { Logo } from '../../../components/Logo';
import { ShieldCheck, UserCheck, Key, Lock } from 'lucide-react';
import Link from 'next/link';

// Strict: Prevent any static or ISR caching on authenticated routes
export const dynamic = 'force-dynamic';

export default async function AuthProofPage() {
  const user = await requireAuth('/app/auth-proof');
  const claims = await getUserClaims();

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-page)',
        padding: 'var(--space-section) var(--space-gutter)',
      }}
    >
      <div style={{ maxWidth: 'var(--layout-page-max)', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-8)',
          }}
        >
          <Logo size="md" />
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* Content Card */}
        <div
          style={{
            maxWidth: 'var(--layout-reading-max)',
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
            <ShieldCheck size={14} />
            SERVER AUTHENTICATION BOUNDARY CERTIFIED
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--type-heading-size)',
              color: 'var(--color-ink)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Authenticated Workspace Session
          </h1>

          <p
            style={{
              fontSize: 'var(--type-body-small-size)',
              color: 'var(--color-ink-muted)',
              lineHeight: 1.6,
              marginBottom: 'var(--space-6)',
            }}
          >
            This route is server-rendered inside Next.js App Router and strictly protected by the
            request-scoped Supabase SSR authentication boundary.
          </p>

          <div
            style={{
              background: 'var(--color-page)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12.5px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: 'var(--space-6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={14} color="var(--color-primary)" />
              <span><strong>User ID:</strong> <span id="auth-user-id">{user.id}</span></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={14} color="var(--color-primary)" />
              <span><strong>Email:</strong> <span id="auth-email">{user.email || 'N/A'}</span></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={14} color="var(--color-primary)" />
              <span><strong>Role:</strong> {claims?.role || 'authenticated'}</span>
            </div>
          </div>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Return to Public Home
          </Link>
        </div>
      </div>
    </div>
  );
}
