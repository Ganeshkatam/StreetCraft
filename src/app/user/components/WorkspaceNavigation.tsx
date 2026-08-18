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
  const activeBizName =
    safeBusinesses.find((b) => b && b.id === session.activeBusinessId)?.name ||
    (safeBusinesses.length > 0 ? safeBusinesses[0].name : 'No Store Selected');
  const userInitial = (effectiveName || session.email || 'U').charAt(0).toUpperCase();

  return (
    <>
      <header className="main-header">
        <div className="header-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/user/today" className="brand-wrapper">
              <Logo size="md" />
            </Link>

            <div className="workspace-switcher" ref={switcherRef}>
              <button 
                className="workspace-switcher-btn"
                onClick={() => setShowSwitcher(!showSwitcher)}
                title="Select Active Storefront"
              >
                <Store size={15} color="var(--color-primary)" />
                <span className="workspace-switcher-name">
                  {activeBizName}
                </span>
                <ChevronDown size={14} color="var(--color-ink-muted)" />
              </button>

              {showSwitcher && (
                <div className="workspace-switcher-menu">
                  <div className="workspace-switcher-header-label">
                    STOREFRONTS
                  </div>

                  <div className="workspace-switcher-list">
                    {safeBusinesses.length === 0 ? (
                      <div className="workspace-switcher-quota">
                        No storefronts created
                      </div>
                    ) : (
                      safeBusinesses.map((biz) => {
                        const isActive = biz.id === session.activeBusinessId;
                        return (
                          <button
                            key={biz.id}
                            type="button"
                            className={`workspace-switcher-item ${isActive ? 'active' : ''}`}
                            onClick={() => {
                              switchBusiness(biz.id);
                              setShowSwitcher(false);
                            }}
                          >
                            <span className="workspace-switcher-item-name">
                              {biz.name}
                            </span>
                            {isActive && (
                              <span className="workspace-switcher-active-tag">
                                ACTIVE
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                  
                  <div className="user-dropdown-divider" />
                  
                  <div className="workspace-switcher-quota">
                    {safeBusinesses.length} of {accountLimit} storefronts used
                  </div>

                  {safeBusinesses.length < accountLimit ? (
                    <button
                      type="button"
                      className="workspace-switcher-add-btn"
                      onClick={() => {
                        setShowSwitcher(false);
                        router.push('/setup');
                      }}
                    >
                      <Plus size={14} />
                      <span>{safeBusinesses.length === 0 ? 'Create first storefront' : 'Add another storefront'}</span>
                    </button>
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
              href="/user/billing"
              className={`nav-item ${pathname === '/user/billing' ? 'active' : ''}`}
            >
              Billing
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
                    href="/user/account"
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={14} color="var(--color-primary)" />
                    <span>Account Settings</span>
                  </Link>

                  <Link
                    href="/user/business"
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Store size={14} color="var(--color-ink-muted)" />
                    <span>Store Preferences</span>
                  </Link>

                  <Link
                    href="/user/billing"
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <CreditCard size={14} color="var(--color-ink-muted)" />
                    <span>Billing &amp; Subscription</span>
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
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </>
  );
};
