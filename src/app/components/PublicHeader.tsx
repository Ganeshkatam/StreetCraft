'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '../../components/Logo';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles, ChevronDown, User, Store, Bell, Shield, LogOut } from 'lucide-react';

export function PublicHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userInitial = (session.name || session.email || 'U').charAt(0).toUpperCase();
  const effectiveName = session.name || session.email?.split('@')[0] || 'Account';
  const effectiveAvatarUrl = session.avatarUrl;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

              <div className="user-menu-container" ref={userMenuRef}>
                <button
                  type="button"
                  className="user-badge-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  title="Account Menu"
                >
                  <div className="user-avatar">
                    {effectiveAvatarUrl ? (
                      <img
                        src={effectiveAvatarUrl}
                        alt={effectiveName}
                        className="user-avatar-img"
                      />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <span className="user-badge-name">
                    {effectiveName}
                  </span>
                  <ChevronDown size={13} color="var(--color-ink-muted)" />
                </button>

                {showUserMenu && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <div className="user-dropdown-name">{effectiveName}</div>
                      <div className="user-dropdown-email">{session.email}</div>
                    </div>

                    <Link
                      href="/user/account/identity"
                      className="user-dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={14} color="var(--color-primary)" />
                      <span>Account Profile</span>
                    </Link>

                    <Link
                      href="/user/account/storefronts"
                      className="user-dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Store size={14} color="var(--color-ink-muted)" />
                      <span>My Storefronts</span>
                    </Link>

                    <Link
                      href="/user/account/notifications"
                      className="user-dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Bell size={14} color="var(--color-ink-muted)" />
                      <span>Notifications</span>
                    </Link>

                    <Link
                      href="/user/account/security"
                      className="user-dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Shield size={14} color="var(--color-ink-muted)" />
                      <span>Security</span>
                    </Link>

                    <div className="user-dropdown-divider" />

                    <button
                      type="button"
                      className="user-dropdown-item danger"
                      onClick={async () => {
                        setShowUserMenu(false);
                        await signOut();
                        router.push('/login');
                      }}
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
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
