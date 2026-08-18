'use client';

import React from 'react';
import Link from 'next/link';
import { TodayStorefrontSummary } from '../../../../../../lib/domain/today/todayTypes';

interface StorefrontContextPanelProps {
  storefront: TodayStorefrontSummary;
}

export function StorefrontContextPanel({ storefront }: StorefrontContextPanelProps) {
  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '14px',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
          STORE CONTEXT
        </span>
        <Link
          href={`/user/business/${encodeURIComponent(storefront.id)}/settings/identity`}
          className="btn-ghost"
          style={{ fontSize: '12px', padding: 0, color: 'var(--color-primary)' }}
        >
          Edit
        </Link>
      </div>

      <div style={{ fontSize: '18px', fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
        {storefront.name}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginTop: '2px', marginBottom: '14px' }}>
        {storefront.neighborhood ? `${storefront.neighborhood}${storefront.city ? `, ${storefront.city}` : ''}` : 'Location not configured'}
      </div>

      <div
        style={{
          background: 'var(--color-surface-raised)',
          padding: '12px',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid var(--color-border)',
          fontSize: '12.5px',
          color: 'var(--color-ink)',
          lineHeight: '1.5',
        }}
      >
        <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', marginBottom: '3px' }}>
          SPECIALTIES
        </div>
        {storefront.signatureItems}
      </div>
    </div>
  );
}
