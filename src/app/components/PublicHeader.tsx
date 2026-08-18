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
        <Link href="/" className="brand-wrapper">
          <Logo size="sm" />
        </Link>

        <nav className="header-nav-links">
          {session.isAuthenticated ? (
            <>
              <Link
                href="/user/today"
                className={`nav-item ${pathname === '/user/today' ? 'active' : ''}`}
              >
                Today
              </Link>
              <Link
                href="/user/create"
                className={`nav-item ${pathname === '/user/create' ? 'active' : ''}`}
              >
                Create
              </Link>
              <Link
                href="/user/campaigns"
                className={`nav-item ${pathname.startsWith('/user/campaigns') ? 'active' : ''}`}
              >
                Campaigns
              </Link>
              <Link
                href="/user/business"
                className={`nav-item ${pathname === '/user/business' ? 'active' : ''}`}
              >
                Business
              </Link>
              <Link
                href="/user/myplan"
                className={`nav-item ${pathname === '/user/myplan' || pathname === '/user/usage' || pathname === '/user/billing' ? 'active' : ''}`}
              >
                My Plan
              </Link>
            </>
          ) : (
            <>
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
            </>
          )}
        </nav>

        <div className="header-actions">
          {session.isAuthenticated ? (
            <div className="header-auth-actions">
              <Link
                href="/user/today"
                className="btn-primary header-open-workspace-btn"
              >
                Open Workspace
              </Link>

              <Link
                href="/user/account"
                className="header-account-pill"
                title="Operator Account Settings"
              >
                <div className="header-account-avatar">
                  {userInitial}
                </div>
                <span className="header-account-name">
                  {session.name || 'Account'}
                </span>
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-ghost header-signin-btn"
              >
                Sign In
              </Link>
              <Link
                href="/free-tool"
                className="btn-primary header-try-btn"
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
