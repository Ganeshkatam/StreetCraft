'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StorefrontsViewModel } from '../../../../lib/domain/account/accountTypes';
import { Store, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';

interface StorefrontsPanelViewProps {
  data: StorefrontsViewModel;
}

export function StorefrontsPanelView({ data }: StorefrontsPanelViewProps) {
  const router = useRouter();
  const { storefronts, activeBusinessId, totalCount } = data;

  const handleSwitch = (bizId: string) => {
    router.push(`/user/account/storefronts?biz=${encodeURIComponent(bizId)}`);
    router.refresh();
  };

  return (
    <div className="account-pane">
      <div className="account-pane-header">
        <span className="account-pane-tag">STOREFRONTS</span>
        <h1 className="account-pane-title">Connected Storefronts</h1>
        <p className="account-pane-subtitle">
          You have access to {totalCount} physical storefront {totalCount === 1 ? 'profile' : 'profiles'}.
        </p>
      </div>

      <div className="account-pane-fields">
        {storefronts.length === 0 ? (
          <div className="account-field-card locked" style={{ padding: '36px 24px', textAlign: 'center', margin: '14px 0' }}>
            <Store size={32} color="var(--color-primary)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
              No Storefronts Connected
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', marginBottom: '16px' }}>
              Complete the onboarding setup to connect your first physical storefront.
            </p>
            <Link href="/new/store" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', padding: '6px 14px' }}>
              <Plus size={14} />
              <span>Connect Storefront</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '8px 0 16px' }}>
            {storefronts.map((store) => {
              const isActive = store.isActive || store.id === activeBusinessId;

              return (
                <div
                  key={store.id}
                  className="account-field-card locked"
                  style={{
                    padding: '14px 18px',
                    borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                    background: isActive ? 'rgba(23, 107, 77, 0.04)' : '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: isActive ? 'var(--color-primary)' : 'var(--color-surface-raised)',
                        color: isActive ? '#ffffff' : 'var(--color-ink-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Store size={18} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>
                          {store.name}
                        </span>
                        {isActive && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              background: '#10b981',
                              color: '#ffffff',
                              padding: '1px 6px',
                              borderRadius: '3px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <CheckCircle2 size={9} strokeWidth={3} /> ACTIVE CONTEXT
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                        {store.category} {store.neighborhood ? `• ${store.neighborhood}` : ''} {store.city ? `(${store.city})` : ''} • Role: {store.role}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isActive ? (
                      <Link
                        href={`/user/today?biz=${encodeURIComponent(store.id)}`}
                        className="btn-primary"
                        style={{ fontSize: '12px', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <span>Open Workspace</span>
                        <ArrowRight size={12} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: '12px', padding: '5px 12px' }}
                        onClick={() => handleSwitch(store.id)}
                      >
                        Switch to Store
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
          <Link href="/new/store" className="btn-secondary" style={{ fontSize: '12.5px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Plus size={13} />
            <span>Connect Another Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
