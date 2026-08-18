'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AccountStorefrontsViewModel } from '../../../../lib/server/account/getAccountStorefronts';
import { AccountProfileHeader } from '../components/AccountProfileHeader';
import { AccountSecurityFooter } from '../components/AccountSecurityFooter';
import { Store, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';

interface StorefrontsPanelViewProps {
  data: AccountStorefrontsViewModel;
}

export function StorefrontsPanelView({ data }: StorefrontsPanelViewProps) {
  const router = useRouter();
  const { storefronts, activeBusiness, totalStorefrontsCount } = data;

  const handleSwitch = (bizId: string) => {
    router.push(`/user/account/storefronts?biz=${encodeURIComponent(bizId)}`);
    router.refresh();
  };

  return (
    <div>
      <AccountProfileHeader
        eyebrow="STOREFRONTS"
        title="Connected Storefronts"
        subtitle={`You have access to ${totalStorefrontsCount} physical storefront ${totalStorefrontsCount === 1 ? 'profile' : 'profiles'}.`}
      />

      <div className="account-stage-content">
        {storefronts.length === 0 ? (
          <div className="card" style={{ padding: '36px 24px', textAlign: 'center', margin: '20px 0' }}>
            <Store size={32} color="var(--color-primary)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '6px' }}>
              No Storefronts Connected
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginBottom: '20px' }}>
              Complete the onboarding setup to connect your first physical storefront.
            </p>
            <Link href="/setup" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={15} />
              <span>Connect Storefront</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0 28px' }}>
            {storefronts.map((store) => {
              const isActive = store.id === activeBusiness?.id || store.isActive;

              return (
                <div
                  key={store.id}
                  style={{
                    padding: '18px 20px',
                    borderRadius: 'var(--radius-sm)',
                    border: isActive ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: isActive ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'var(--motion-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: isActive ? 'var(--color-primary)' : 'var(--color-surface-raised)',
                        color: isActive ? '#ffffff' : 'var(--color-ink-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Store size={20} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                          {store.name}
                        </h4>
                        {isActive && (
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              background: '#10b981',
                              color: '#ffffff',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <CheckCircle2 size={10} strokeWidth={3} /> ACTIVE CONTEXT
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                        {store.category} {store.neighborhood ? `• ${store.neighborhood}` : ''} {store.city ? `(${store.city})` : ''} • Role: {store.role}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isActive ? (
                      <Link
                        href={`/user/today?biz=${encodeURIComponent(store.id)}`}
                        className="btn-primary"
                        style={{ fontSize: '12.5px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <span>Open Workspace</span>
                        <ArrowRight size={13} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: '12.5px', padding: '6px 14px' }}
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <Link href="/setup" className="btn-secondary" style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} />
            <span>Connect Another Storefront</span>
          </Link>
        </div>

        <AccountSecurityFooter />
      </div>
    </div>
  );
}
