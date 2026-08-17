'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '../../components/Logo';
import { useAuth } from '../../hooks/useAuth';
import { ArrowRight, Sparkles } from 'lucide-react';

export function PublicHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAuth();

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
            <>
              <button
                className="btn-primary"
                onClick={() => router.push('/app/today')}
                style={{ padding: '8px 18px', fontSize: '13.5px' }}
              >
                Open Workspace <ArrowRight size={13} />
              </button>
            </>
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
                <Sparkles size={13} /> Try Free Tool &rarr;
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
