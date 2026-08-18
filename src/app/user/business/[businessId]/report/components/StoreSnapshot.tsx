import React from 'react';
import type { StoreSnapshotViewModel } from '../../../../../../lib/domain/report/reportTypes';
import { Store, MapPin, Tag, Phone } from 'lucide-react';
import Link from 'next/link';

interface StoreSnapshotProps {
  snapshot: StoreSnapshotViewModel;
}

export function StoreSnapshot({ snapshot }: StoreSnapshotProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '28px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', margin: 0 }}>
          Storefront Context
        </h2>
        <Link
          href={`/user/business/${snapshot.id}`}
          style={{ fontSize: '12.5px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
        >
          Edit Profile &rarr;
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <Store size={16} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
              Category
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '2px' }}>
              {snapshot.category.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <MapPin size={16} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
              Location &amp; Landmark
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '2px' }}>
              {snapshot.neighborhood ? `${snapshot.neighborhood}, ${snapshot.city}` : snapshot.city || 'Location unconfigured'}
            </div>
            {snapshot.landmarks && (
              <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                Near {snapshot.landmarks}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <Tag size={16} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
              Signature Offerings
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '2px' }}>
              {snapshot.signatureItems || 'Not configured'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <Phone size={16} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
              WhatsApp / Contact
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '2px' }}>
              {snapshot.phoneWhatsapp || 'Not configured'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
