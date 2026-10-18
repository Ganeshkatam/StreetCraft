'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useUsage } from '../../../hooks/useUsage';
import { Logo } from '../../../components/Logo';
import { UpgradeModal } from '../../../components/UpgradeModal';
import { useRouteModal } from '../../../hooks/useRouteModal';
import { LogOut, ChevronDown, Plus, Store, User, CreditCard, ExternalLink } from 'lucide-react';
import { extractBusinessIdFromPathname, resolveActiveBusiness, getWorkspaceHref, WorkspaceSection } from '../../../lib/domain/workspace/workspaceRouting';

export interface WorkspaceNavigationProps {
  initialBusinesses?: Array<{ id: string; name: string; category?: string }>;
  initialAccountLimit?: number;
  initialUserEmail?: string;
  initialUserName?: string;
  initialAvatarUrl?: string | null;
}

export const WorkspaceNavigation: React.FC<WorkspaceNavigationProps> = ({
  initialBusinesses = [],
  initialAccountLimit = 2,
  initialUserEmail,
  initialUserName,
  initialAvatarUrl = null,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { session, getMyBusinesses, getAccountLimits, switchBusiness, signOut } = useAuth();
  const { usage } = useUsage(session.activeBusinessId || '');

  const [businesses, setBusinesses] = useState<Array<{ id: string; name: string }>>(initialBusinesses);
  const [accountLimit, setAccountLimit] = useState(initialAccountLimit);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const {
    isOpen: showUpgradeModal,
    open: openUpgradeModal,
    close: closeUpgradeModal,
  } = useRouteModal('upgrade', { legacyParam: 'upgrade' });
  const [liveAvatarUrl, setLiveAvatarUrl] = useState<string | null>(null);
  const [liveName, setLiveName] = useState<string | null>(null);
  const switcherRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session.isAuthenticated) {
      getMyBusinesses().then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setBusinesses(res);
        }
      });
      getAccountLimits().then((res) => {
        if (res?.limit) {
          setAccountLimit(res.limit);
        }
      });
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

  const effectiveAvatarUrl = liveAvatarUrl !== null ? liveAvatarUrl : (session.avatarUrl || initialAvatarUrl);
  const effectiveName = liveName !== null ? liveName : (session.name || initialUserName);

  const routeBizId = extractBusinessIdFromPathname(pathname);
  const safeBusinesses = Array.isArray(businesses) && businesses.length > 0 ? businesses : initialBusinesses;
  const { activeBiz, activeBizId, activeBizName } = resolveActiveBusiness(
    routeBizId,
    session.activeBusinessId,
    safeBusinesses
  );
  const userInitial = (effectiveName || session.email || initialUserEmail || 'U').charAt(0).toUpperCase();

  const getBizHref = (section: WorkspaceSection) => getWorkspaceHref(activeBizId, section);

  const isAccountSpace = pathname ? pathname.startsWith('/user/account') : false;

  return (
    <>
      <header className="main-header">
        <div className="header-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href={getBizHref('today')} className="brand-wrapper">
              <Logo size="md" />
            </Link>

            {isAccountSpace ? (
              <Link
                href={activeBizId ? `/user/business/${encodeURIComponent(activeBizId)}/today` : '/user/today'}
                className="btn-ghost"
                style={{
                  fontSize: '12.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-ink-muted)',
                  padding: '4px 10px',
                }}
              >
                <span>&larr;</span>
                <span>Back to Store Workspace</span>
              </Link>
            ) : (
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
                        href="/new/store"
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
                          openUpgradeModal();
                        }}
                      >
                        <span>Upgrade to add more</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {!isAccountSpace && (
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
          )}

          <div className="header-actions">
            {usage && (
              <button
                className="usage-pill"
                onClick={openUpgradeModal}
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

                  <a
                    href="/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <ExternalLink size={14} color="var(--color-ink-muted)" />
                    <span>See All Plans</span>
                  </a>

                  <Link
                    href={activeBizId ? `/user/business/${encodeURIComponent(activeBizId)}/payments` : '/payments'}
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <CreditCard size={14} color="var(--color-primary)" />
                    <span>Payments &amp; Billing</span>
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
          businessId={activeBizId || undefined}
          onClose={closeUpgradeModal}
          onPlanUpdated={() => router.refresh()}
        />
      )}
    </>
  );
};
