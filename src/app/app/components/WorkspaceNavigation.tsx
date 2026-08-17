'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useUsage } from '../../../hooks/useUsage';
import { Logo } from '../../../components/Logo';
import { UpgradeModal } from '../../../components/UpgradeModal';
import { LogOut, ChevronDown, Plus, Store, User, Settings, CreditCard, ShieldCheck } from 'lucide-react';

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
  const switcherRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session.isAuthenticated) {
      getMyBusinesses().then((res) => setBusinesses(Array.isArray(res) ? res : []));
      getAccountLimits().then((res) => setAccountLimit(res?.limit || 2));
    }
  }, [session.isAuthenticated, session.activeBusinessId]);

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

  const safeBusinesses = Array.isArray(businesses) ? businesses : [];
  const activeBizName =
    safeBusinesses.find((b) => b && b.id === session.activeBusinessId)?.name ||
    (safeBusinesses.length > 0 ? safeBusinesses[0].name : 'No Store Selected');
  const userInitial = (session.name || session.email || 'U').charAt(0).toUpperCase();

  return (
    <>
      <header className="main-header">
        <div className="header-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/app/today" className="brand-wrapper">
              <Logo size="sm" />
            </Link>

            <div className="workspace-switcher" ref={switcherRef} style={{ position: 'relative' }}>
              <button 
                className="btn-ghost" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)' }}
                onClick={() => setShowSwitcher(!showSwitcher)}
              >
                <Store size={14} color="var(--color-ink-muted)" />
                <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeBizName}
                </span>
                <ChevronDown size={14} color="var(--color-ink-muted)" />
              </button>

              {showSwitcher && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', width: '230px', boxShadow: 'var(--shadow-md)', zIndex: 100 }}>
                  <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ padding: '4px 8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Storefronts
                    </div>

                    {safeBusinesses.length === 0 ? (
                      <div style={{ padding: '6px 8px', fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>
                        No storefronts created
                      </div>
                    ) : (
                      safeBusinesses.map(biz => (
                        <button
                          key={biz.id}
                          className="btn-ghost"
                          style={{ width: '100%', justifyContent: 'space-between', padding: '8px 10px', fontSize: '13px', color: biz.id === session.activeBusinessId ? 'var(--color-primary)' : 'var(--color-ink)', background: biz.id === session.activeBusinessId ? 'var(--color-primary-subtle)' : 'transparent', fontWeight: biz.id === session.activeBusinessId ? 600 : 400, borderRadius: 'var(--radius-xs)' }}
                          onClick={() => {
                            switchBusiness(biz.id);
                            setShowSwitcher(false);
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                            {biz.name}
                          </span>
                          {biz.id === session.activeBusinessId && (
                            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-primary)', background: 'var(--color-surface)', padding: '1px 6px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-primary-border)' }}>
                              Active
                            </span>
                          )}
                        </button>
                      ))
                    )}
                    
                    <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />
                    
                    <div style={{ padding: '4px 8px', fontSize: '11.5px', color: 'var(--color-ink-muted)', textAlign: 'center' }}>
                      {safeBusinesses.length} of {accountLimit} storefronts used
                    </div>

                    {safeBusinesses.length < accountLimit ? (
                      <button
                        className="btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 8px', fontSize: '12.5px', color: 'var(--color-primary)', fontWeight: 500 }}
                        onClick={() => {
                          setShowSwitcher(false);
                          router.push('/setup');
                        }}
                      >
                        <Plus size={13} style={{ marginRight: '6px' }} />
                        {safeBusinesses.length === 0 ? 'Create first storefront' : 'Add another storefront'}
                      </button>
                    ) : (
                      <button
                        className="btn-ghost"
                        style={{ width: '100%', justifyContent: 'center', padding: '6px 8px', fontSize: '12px', color: 'var(--color-primary)', fontWeight: 500 }}
                        onClick={() => {
                          setShowSwitcher(false);
                          setShowUpgradeModal(true);
                        }}
                      >
                        Upgrade to add more
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <nav className="header-nav-links">
            <Link
              href="/app/today"
              className={`nav-item ${pathname === '/app/today' ? 'active' : ''}`}
            >
              Today
            </Link>
            <Link
              href="/app/create"
              className={`nav-item ${pathname === '/app/create' ? 'active' : ''}`}
            >
              Create
            </Link>
            <Link
              href="/app/campaigns"
              className={`nav-item ${pathname.startsWith('/app/campaigns') ? 'active' : ''}`}
            >
              Campaigns
            </Link>
            <Link
              href="/app/business"
              className={`nav-item ${pathname === '/app/business' ? 'active' : ''}`}
            >
              Business
            </Link>
            <Link
              href="/app/billing"
              className={`nav-item ${pathname === '/app/billing' ? 'active' : ''}`}
            >
              Billing
            </Link>
            <Link
              href="/app/account"
              className={`nav-item ${pathname === '/app/account' ? 'active' : ''}`}
            >
              Account
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

            {/* Operator User Account Menu */}
            <div className="user-menu-container" ref={userMenuRef}>
              <button
                className="user-badge-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                title="Operator Account Menu"
              >
                <div className="user-avatar">{userInitial}</div>
                <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session.name || 'Account'}
                </span>
                <ChevronDown size={13} color="var(--color-ink-muted)" />
              </button>

              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-name">{session.name || 'Store Operator'}</div>
                    <div className="user-dropdown-email">{session.email}</div>
                    <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-primary)', background: 'var(--color-primary-subtle)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', fontWeight: 600 }}>
                      <ShieldCheck size={12} /> Verified Operator
                    </div>
                  </div>

                  <Link
                    href="/app/account"
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={14} color="var(--color-primary)" />
                    <span>Account Settings</span>
                  </Link>

                  <Link
                    href="/app/business"
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Store size={14} color="var(--color-ink-muted)" />
                    <span>Store Preferences</span>
                  </Link>

                  <Link
                    href="/app/billing"
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <CreditCard size={14} color="var(--color-ink-muted)" />
                    <span>Billing &amp; Subscription</span>
                  </Link>

                  <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />

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
