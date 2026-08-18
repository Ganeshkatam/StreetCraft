'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '../../components/Logo';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles } from 'lucide-react';

export function PublicHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAuth();

  const userInitial = (session.name || session.email || 'U').charAt(0).toUpperCase();

  return (
    <header className="main-header">
      <div className="header-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <Link href="/" className="brand-wrapper">
            <Logo size="sm" />
          </Link>

          <nav className="header-nav-links">
            <Link
              href="/how-it-works"
              className={`nav-item ${pathname === '/how-it-works' ? 'active' : ''}`}
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              className={`nav-item ${pathname === '/pricing' ? 'active' : ''}`}
            >
              Pricing
            </Link>
            <Link
              href="/free-tool"
              className={`nav-item ${pathname === '/free-tool' ? 'active' : ''}`}
            >
              Free Tool
            </Link>
            <Link
              href="/contact"
              className={`nav-item ${pathname === '/contact' ? 'active' : ''}`}
            >
              Contact
            </Link>
          </nav>
        </div>

        <div className="header-actions">
          {session.isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                href="/user/today"
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '13.5px' }}
              >
                Open Workspace
              </Link>

              <Link
                href="/user/account"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-ink)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                }}
                title="Operator Account Settings"
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}
                >
                  {userInitial}
                </div>
                <span
                  style={{
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {session.name || 'Account'}
                </span>
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-ghost"
                style={{ fontSize: '13.5px', padding: '8px 14px' }}
              >
                Sign In
              </Link>
              <Link
                href="/free-tool"
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '13.5px' }}
              >
                <Sparkles size={13} /> Try Free Tool
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
