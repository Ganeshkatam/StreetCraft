'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Activity, Plus } from 'lucide-react';

interface ReportHeaderProps {
  storeName: string;
  businessId: string;
  generatedAt: string;
}

export function ReportHeader({ storeName, businessId, generatedAt }: ReportHeaderProps) {
  const formattedDate = new Date(generatedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <header style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <Link
          href={`/user/today?biz=${businessId}`}
          className="btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13.5px' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Today Workspace</span>
        </Link>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handlePrint}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>

          <Link
            href={`/user/create?biz=${businessId}`}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
          >
            <Plus size={14} />
            <span>New Campaign</span>
          </Link>
        </div>
      </div>

      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-primary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            <Activity size={13} />
            <span>MARKETING OPERATIONS REPORT</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-ink)', margin: '0 0 6px' }}>
            {storeName}
          </h1>

          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', margin: 0 }}>
            Operational campaign activity, 4-channel distribution, and monthly quota ledger.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            GENERATED ON
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '2px' }}>
            {formattedDate}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-primary)', marginTop: '2px', fontWeight: 500 }}>
            Verified Tenant Data
          </div>
        </div>
      </div>
    </header>
  );
}
