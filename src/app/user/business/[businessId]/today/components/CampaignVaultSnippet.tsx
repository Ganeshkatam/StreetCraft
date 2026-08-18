'use client';

import React from 'react';
import Link from 'next/link';
import { TodayVaultSummary } from '../../../../../../lib/domain/today/todayTypes';
import { CampaignStatusBadge } from '../../../../../../components/CampaignStatusBadge';

interface CampaignVaultSnippetProps {
  businessId: string;
  vault: TodayVaultSummary[];
}

export function CampaignVaultSnippet({ businessId, vault }: CampaignVaultSnippetProps) {
  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '18px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)' }}>
          Campaign Vault
        </h3>
        <Link
          href={`/user/business/${encodeURIComponent(businessId)}/campaigns`}
          className="btn-ghost"
          style={{ fontSize: '12px' }}
        >
          View all in vault ({vault.length})
        </Link>
      </div>

      {vault.length === 0 ? (
        <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', padding: '16px 0' }}>
          No campaign drops yet. Click &apos;Create promotion&apos; to draft your first campaign.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {vault.map((c) => (
            <div
              key={c.id}
              style={{
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xs)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                    {c.type.replace(/_/g, ' ')}
                  </span>
                  <CampaignStatusBadge status={c.status} size="sm" />
                </div>
                <h4 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-ink)', lineHeight: '1.4' }}>
                  {c.offerTitle}
                </h4>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11.5px',
                  color: 'var(--color-ink-muted)',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <span>{c.timingLabel}</span>
                <Link
                  href={`/user/business/${encodeURIComponent(businessId)}/campaigns/${c.id}`}
                  className="btn-ghost"
                  style={{ padding: '0', fontSize: '11.5px', color: 'var(--color-primary)' }}
                >
                  Proofs
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
