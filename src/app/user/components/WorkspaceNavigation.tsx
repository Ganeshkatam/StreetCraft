'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useUsage } from '../../../hooks/useUsage';
import { Logo } from '../../../components/Logo';
import { UpgradeModal } from '../../../components/UpgradeModal';
import { LogOut, ChevronDown, Plus, Store, User, CreditCard } from 'lucide-react';

export const WorkspaceNavigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { session, getMyBusinesses, getAccountLimits, switchBusiness, signOut } = useAuth();
  const { usage } = useUsage(session.activeBusinessId || '');

  const [businesses, setBusinesses] = useState<Array<{ id: string; name: string }>>([]);
  const [accountLimit, setAccountLimit] = useState(2);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [liveAvatarUrl, setLiveAvatarUrl] = useState<string | null>(null);
  const [liveName, setLiveName] = useState<string | null>(null);
  const switcherRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session.isAuthenticated) {
      getMyBusinesses().then((res) => setBusinesses(Array.isArray(res) ? res : []));
      getAccountLimits().then((res) => setAccountLimit(res?.limit || 2));
    }
  }, [session.isAuthenticated, session.activeBusinessId]);

  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ avatarUrl?: string | null; fullName?: string }>;
      if (customEvent.detail) {
        if (customEvent.detail.avatarUrl !== undefined) {
          setLiveAvatarUrl(customEvent.detail.avatarUrl || null);
        }
        if (customEvent.detail.fullName !== undefined) {
          setLiveName(customEvent.detail.fullName || null);
        }
      }
    };

    window.addEventListener('streetcraft:profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('streetcraft:profile-updated', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setShowSwitcher(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const effectiveAvatarUrl = liveAvatarUrl !== null ? liveAvatarUrl : session.avatarUrl;
  const effectiveName = liveName !== null ? liveName : session.name;

  const safeBusinesses = Array.isArray(businesses) ? businesses : [];
  const activeBiz = safeBusinesses.find((b) => b && b.id === session.activeBusinessId) || (safeBusinesses.length > 0 ? safeBusinesses[0] : null);
  const activeBizName = activeBiz ? activeBiz.name : 'No Store Selected';
  const activeBizId = activeBiz ? activeBiz.id : null;
  const userInitial = (effectiveName || session.email || 'U').charAt(0).toUpperCase();

  const getBizHref = (section: 'today' | 'create' | 'campaigns' | 'settings' | 'plan') => {
    if (!activeBizId) {
      if (section === 'settings') return '/user/business';
      if (section === 'plan') return '/user/account/plan';
      return `/user/${section}`;
    }
    return `/user/business/${encodeURIComponent(activeBizId)}/${section}`;
  };

  return (
    <>
      <header className="main-header">
        <div className="header-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href={getBizHref('today')} className="brand-wrapper">
              <Logo size="md" />
            </Link>

            <div className="workspace-switcher" ref={switcherRef}>
              <button
                className="switcher-trigger"
                onClick={() => setShowSwitcher(!showSwitcher)}
                title="Switch Storefront"
              >
                <Store size={15} color="var(--color-primary)" />
                <span className="switcher-name">{activeBizName}</span>
                <ChevronDown size={14} className={`switcher-arrow ${showSwitcher ? 'open' : ''}`} />
              </button>

              {showSwitcher && (
                <div className="switcher-dropdown">
                  <div className="switcher-header">CONNECTED STOREFRONTS</div>
                  <div className="switcher-list">
                    {safeBusinesses.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        className={`switcher-item ${b.id === activeBizId ? 'active' : ''}`}
                        onClick={async () => {
                          await switchBusiness(b.id);
                          setShowSwitcher(false);
                          router.push(`/user/business/${encodeURIComponent(b.id)}/today`);
                        }}
                      >
                        <Store size={14} />
                        <span className="switcher-item-name">{b.name}</span>
                        {b.id === activeBizId && <span className="switcher-badge">ACTIVE</span>}
                      </button>
                    ))}
                  </div>

                  {safeBusinesses.length < accountLimit ? (
                    <Link
                      href="/setup"
                      className="switcher-action-btn"
                      onClick={() => setShowSwitcher(false)}
                    >
                      <Plus size={13} />
                      <span>Add new storefront</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => {
                        setShowSwitcher(false);
                        setShowUpgradeModal(true);
                      }}
                    >
                      <span>Upgrade to add more</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <nav className="header-nav-links">
            <Link
              href={getBizHref('today')}
              className={`nav-item ${pathname.includes('/today') ? 'active' : ''}`}
            >
              Today
            </Link>
            <Link
              href={getBizHref('create')}
              className={`nav-item ${pathname.includes('/create') ? 'active' : ''}`}
            >
              Create
            </Link>
            <Link
              href={getBizHref('campaigns')}
              className={`nav-item ${pathname.includes('/campaigns') ? 'active' : ''}`}
            >
              Campaigns
            </Link>
            <Link
              href={getBizHref('settings')}
              className={`nav-item ${pathname.includes('/settings') || pathname === '/user/business' ? 'active' : ''}`}
            >
              Store Settings
            </Link>
            <Link
              href={getBizHref('plan')}
              className={`nav-item ${pathname.includes('/plan') || pathname === '/user/myplan' ? 'active' : ''}`}
            >
              Plan &amp; Usage
            </Link>
          </nav>

          <div className="header-actions">
            {usage && (
              <button
                className="usage-pill"
                onClick={() => setShowUpgradeModal(true)}
                title="View quota and subscription"
              >
                <span><strong>{usage.remainingPacks}</strong> remaining</span>
              </button>
            )}

            {/* User Account Menu */}
            <div className="user-menu-container" ref={userMenuRef}>
              <button
                className="user-badge-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                title="Account Menu"
              >
                <div className="user-avatar">
                  {effectiveAvatarUrl ? (
                    <img
                      src={effectiveAvatarUrl}
                      alt={effectiveName || 'User'}
                      className="user-avatar-img"
                    />
                  ) : (
                    userInitial
                  )}
                </div>
                <span className="user-badge-name">
                  {effectiveName || 'Account'}
                </span>
                <ChevronDown size={13} color="var(--color-ink-muted)" />
              </button>

              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-name">{effectiveName || 'Account User'}</div>
                    <div className="user-dropdown-email">{session.email}</div>
                  </div>

                  <Link
                    href="/user/account/identity"
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={14} color="var(--color-primary)" />
                    <span>Account Settings</span>
                  </Link>

                  <Link
                    href={getBizHref('settings')}
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Store size={14} color="var(--color-ink-muted)" />
                    <span>Store Settings</span>
                  </Link>

                  <Link
                    href={getBizHref('plan')}
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <CreditCard size={14} color="var(--color-ink-muted)" />
                    <span>Plan &amp; Usage</span>
                  </Link>

                  <div className="user-dropdown-divider" />

                  <button
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
        </div>
      </header>

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          currentPlanId={usage?.plan || 'FREE'}
          onClose={() => setShowUpgradeModal(false)}
          onPlanUpdated={() => router.refresh()}
        />
      )}
    </>
  );
};
