'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useUsage } from '../../../hooks/useUsage';
import { Logo } from '../../../components/Logo';
import { UpgradeModal } from '../../../components/UpgradeModal';
import { LogOut, ChevronDown, Plus, Store } from 'lucide-react';

export const WorkspaceNavigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { session, getMyBusinesses, getAccountLimits, switchBusiness, signOut } = useAuth();
  const { usage } = useUsage(session.activeBusinessId || '');

  const [businesses, setBusinesses] = useState<Array<{ id: string; name: string }>>([]);
  const [accountLimit, setAccountLimit] = useState(2);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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

  const activeBizName = businesses.find(b => b.id === session.activeBusinessId)?.name || 'My Store';

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
                          router.push('/setup');
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

            <button
              className="btn-ghost"
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
            >
              <LogOut size={13} /> Sign out
            </button>
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
