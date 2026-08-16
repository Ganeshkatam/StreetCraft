import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserSession } from '../types/business';
import { UsageSummary } from '../types/billing';
import { ArrowRight, LogOut, ChevronDown, Plus, Store } from 'lucide-react';

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
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session.isAuthenticated) {
      getMyBusinesses().then(setBusinesses);
      getAccountLimits().then((res) => setAccountLimit(res.limit));
    }
  }, [session.isAuthenticated, session.activeBusinessId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setShowSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeBizName = businesses.find(b => b.id === session.activeBusinessId)?.name || 'Loading...';

  return (
    <header className="main-header">
      <div className="header-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div
            className="brand-wrapper"
            onClick={() => navigate(session.isAuthenticated ? '/app/dashboard' : '/')}
          >
            <span className="brand-wordmark">
              STREETCRAFT
            </span>
          </div>

          {isAppView && session.isAuthenticated && (
            <div className="workspace-switcher" ref={switcherRef} style={{ position: 'relative' }}>
              <button 
                className="btn-ghost" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)' }}
                onClick={() => setShowSwitcher(!showSwitcher)}
              >
                <Store size={14} color="var(--color-ink-muted)" />
                {activeBizName}
                <ChevronDown size={14} color="var(--color-ink-muted)" />
              </button>

              {showSwitcher && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', width: '220px', boxShadow: 'var(--shadow-md)', zIndex: 100 }}>
                  <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {businesses.map(biz => (
                      <button
                        key={biz.id}
                        className="btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', fontSize: '13.5px', color: biz.id === session.activeBusinessId ? 'var(--color-primary)' : 'var(--color-ink)', background: biz.id === session.activeBusinessId ? 'var(--color-primary-subtle)' : 'transparent', fontWeight: biz.id === session.activeBusinessId ? 600 : 400 }}
                        onClick={() => {
                          switchBusiness(biz.id);
                          setShowSwitcher(false);
                        }}
                      >
                        {biz.name}
                      </button>
                    ))}
                    
                    <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />
                    
                    <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--color-ink-muted)', textAlign: 'center' }}>
                      {businesses.length} of {accountLimit} businesses used
                    </div>

                    {businesses.length < accountLimit ? (
                      <button
                        className="btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', fontSize: '13.5px', color: 'var(--color-ink-muted)' }}
                        onClick={() => {
                          setShowSwitcher(false);
                          navigate('/login', { state: { intent: 'setup' } });
                        }}
                      >
                        <Plus size={14} style={{ marginRight: '6px' }} />
                        Add another business
                      </button>
                    ) : (
                      <button
                        className="btn-ghost"
                        style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: '13px', color: 'var(--color-primary)', fontWeight: 500 }}
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
                className={`nav-item ${currentPath === '/' ? 'active' : ''}`}
                onClick={() => navigate('/')}
              >
                How it works
              </button>
              <button
                className={`nav-item ${currentPath === '/free-tool' ? 'active' : ''}`}
                onClick={() => navigate('/free-tool')}
              >
                Free tool
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
                className={`nav-item ${currentPath === '/app/dashboard' ? 'active' : ''}`}
                onClick={() => navigate('/app/dashboard')}
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
                className={`nav-item ${currentPath === '/app/campaigns' ? 'active' : ''}`}
                onClick={() => navigate('/app/campaigns')}
              >
                Campaigns
              </button>
              <button
                className={`nav-item ${currentPath === '/app/business' ? 'active' : ''}`}
                onClick={() => navigate('/app/business')}
              >
                Store Memory
              </button>
            </>
          )}
        </nav>

        <div className="header-actions">
          {session.isAuthenticated ? (
            <>
              {usage && (
                <button className="usage-pill" onClick={onOpenUpgrade} title="View quota and subscription">
                  <span><strong>{usage.remainingPacks}</strong> packs left</span>
                </button>
              )}

              {!isAppView ? (
                <button className="btn-primary" onClick={() => navigate('/app/dashboard')}>
                  Open Workspace <ArrowRight size={13} />
                </button>
              ) : (
                <button className="btn-ghost" onClick={onSignOut}>
                  <LogOut size={13} /> Sign out
                </button>
              )}
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => navigate('/login')}>
                Sign In
              </button>
              <button className="btn-primary" onClick={() => navigate('/free-tool')}>
                Start creating &rarr;
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
