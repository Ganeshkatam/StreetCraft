import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserSession } from '../types/business';
import { UsageSummary } from '../types/billing';
import { Logo } from './Logo';
import { LogOut, ChevronDown, Plus, Store, User, CreditCard, ShieldCheck } from 'lucide-react';

interface NavigationProps {
  session: UserSession;
  usage: UsageSummary | null;
  onOpenUpgrade: () => void;
  onSignOut: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  session,
  usage,
  onOpenUpgrade,
  onSignOut,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getMyBusinesses, getAccountLimits, switchBusiness } = useAuth();
  const currentPath = location.pathname;
  const isAppView = currentPath.startsWith('/app');

  const [businesses, setBusinesses] = useState<Array<{ id: string; name: string }>>([]);
  const [accountLimit, setAccountLimit] = useState(2);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
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
    <header className="main-header">
      <div className="header-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div
            className="brand-wrapper"
            onClick={() => navigate(session.isAuthenticated ? '/app/today' : '/')}
          >
            <Logo size="sm" />
          </div>

          {isAppView && session.isAuthenticated && (
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
                          navigate('/setup');
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
                          onOpenUpgrade();
                        }}
                      >
                        Upgrade to add more
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="header-nav-links">
          {!isAppView ? (
            <>
              <button
                className={`nav-item ${currentPath === '/how-it-works' ? 'active' : ''}`}
                onClick={() => navigate('/how-it-works')}
              >
                How it works
              </button>
              <button
                className={`nav-item ${currentPath === '/pricing' ? 'active' : ''}`}
                onClick={() => navigate('/pricing')}
              >
                Pricing
              </button>
            </>
          ) : (
            <>
              <button
                className={`nav-item ${currentPath === '/app/today' || currentPath === '/app/dashboard' ? 'active' : ''}`}
                onClick={() => navigate('/app/today')}
              >
                Today
              </button>
              <button
                className={`nav-item ${currentPath === '/app/create' ? 'active' : ''}`}
                onClick={() => navigate('/app/create')}
              >
                Create
              </button>
              <button
                className={`nav-item ${currentPath.startsWith('/app/campaigns') ? 'active' : ''}`}
                onClick={() => navigate('/app/campaigns')}
              >
                Campaigns
              </button>
              <button
                className={`nav-item ${currentPath === '/app/business' ? 'active' : ''}`}
                onClick={() => navigate('/app/business')}
              >
                Business
              </button>
              <button
                className={`nav-item ${currentPath === '/app/billing' || currentPath === '/app/settings/billing' ? 'active' : ''}`}
                onClick={() => navigate('/app/billing')}
              >
                Billing
              </button>
              <button
                className={`nav-item ${currentPath === '/app/account' || currentPath === '/app/settings/account' ? 'active' : ''}`}
                onClick={() => navigate('/app/account')}
              >
                Account
              </button>
            </>
          )}
        </nav>

        <div className="header-actions">
          {session.isAuthenticated ? (
            <>
              {usage && (
                <button className="usage-pill" onClick={onOpenUpgrade} title="View quota and subscription">
                  <span><strong>{usage.remainingPacks}</strong> remaining</span>
                </button>
              )}

              {!isAppView ? (
                <button className="btn-primary" onClick={() => navigate('/app/today')}>
                  Open Workspace
                </button>
              ) : (
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

                      <button
                        className="user-dropdown-item"
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/app/account');
                        }}
                      >
                        <User size={14} color="var(--color-primary)" />
                        <span>Account Settings</span>
                      </button>

                      <button
                        className="user-dropdown-item"
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/app/business');
                        }}
                      >
                        <Store size={14} color="var(--color-ink-muted)" />
                        <span>Store Preferences</span>
                      </button>

                      <button
                        className="user-dropdown-item"
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/app/billing');
                        }}
                      >
                        <CreditCard size={14} color="var(--color-ink-muted)" />
                        <span>Billing &amp; Subscription</span>
                      </button>

                      <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />

                      <button
                        className="user-dropdown-item danger"
                        onClick={() => {
                          setShowUserMenu(false);
                          onSignOut();
                        }}
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => navigate('/login')}>
                Sign in
              </button>
              <button className="btn-primary" onClick={() => navigate('/free-tool')}>
                Try StreetCraft
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
