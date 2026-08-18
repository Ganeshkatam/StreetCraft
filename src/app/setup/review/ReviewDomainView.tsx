'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SetupContext } from '../../../lib/server/setup/getSetupContext';
import { SetupRail } from '../components/SetupRail';
import { SetupDomainHeader } from '../components/SetupDomainHeader';
import { CheckCircle2, AlertCircle, Edit3, ArrowRight } from 'lucide-react';

interface ReviewDomainViewProps {
  context: SetupContext;
}

export function ReviewDomainView({ context }: ReviewDomainViewProps) {
  const router = useRouter();
  const { business, profile, progress } = context;

  const bizId = business?.id;
  const launchHref = bizId ? `/user/today?biz=${encodeURIComponent(bizId)}` : '/user/today';
  const getDomainEditHref = (route: string) => (bizId ? `${route}?biz=${encodeURIComponent(bizId)}` : route);

  return (
    <div className="setup-workspace-grid">
      <SetupRail
        businessId={business?.id}
        domainList={progress.domainList}
      />

      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="09"
          domainName="Review"
          title="Review &amp; Launch Store"
          subtitle="Confirm your storefront configuration before entering the daily marketing workspace."
          businessId={business?.id}
        />

        {/* Completion Status Notice */}
        {progress.requiredComplete ? (
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} color="#10b981" />
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#065f46', margin: 0 }}>
                  Store Profile Complete
                </h4>
                <span style={{ fontSize: '12.5px', color: '#047857' }}>
                  All required setup information is configured. You are ready to generate campaigns.
                </span>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ fontSize: '13px', padding: '8px 18px' }}
              onClick={() => router.push(launchHref)}
            >
              <span>Launch Store</span>
              <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: '16px 20px',
              background: 'var(--color-danger-subtle)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <AlertCircle size={20} color="var(--color-danger)" />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-danger)', margin: 0 }}>
                Required Information Missing
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--color-danger)', opacity: 0.9, margin: '2px 0 0' }}>
                Please complete the required Identity and Location sections before launching.
              </p>
            </div>
          </div>
        )}

        {/* 2-Column Domain Aggregate Grid */}
        <div className="setup-review-grid">
          
          {/* 01 Identity */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <span className="setup-review-domain-title">01 Identity</span>
              <Link href={getDomainEditHref('/setup/identity')} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '11.5px' }}>
                <Edit3 size={12} /> Edit
              </Link>
            </div>
            <p className="setup-review-domain-value">
              <strong>{profile?.name || 'Not specified'}</strong>
              <br />
              <span style={{ fontSize: '12px', color: 'var(--color-ink-muted)' }}>{profile?.category || 'No category'}</span>
            </p>
          </div>

          {/* 02 Location */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <span className="setup-review-domain-title">02 Location</span>
              <Link href={getDomainEditHref('/setup/location')} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '11.5px' }}>
                <Edit3 size={12} /> Edit
              </Link>
            </div>
            <p className="setup-review-domain-value">
              {profile?.neighborhood ? `${profile.neighborhood}, ${profile.city}` : 'Not specified'}
              {profile?.landmarks && (
                <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                  Landmarks: {profile.landmarks}
                </span>
              )}
            </p>
          </div>

          {/* 03 Products */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <span className="setup-review-domain-title">03 Products</span>
              <Link href={getDomainEditHref('/setup/products')} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '11.5px' }}>
                <Edit3 size={12} /> Edit
              </Link>
            </div>
            <p className="setup-review-domain-value">
              {profile?.signature_items || <em style={{ color: 'var(--color-ink-muted)' }}>No signature products added yet</em>}
            </p>
          </div>

          {/* 04 Customers */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <span className="setup-review-domain-title">04 Customers</span>
              <Link href={getDomainEditHref('/setup/customers')} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '11.5px' }}>
                <Edit3 size={12} /> Edit
              </Link>
            </div>
            <p className="setup-review-domain-value">
              {profile?.target_customer || <em style={{ color: 'var(--color-ink-muted)' }}>No audience traits specified</em>}
            </p>
          </div>

          {/* 05 Offer */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <span className="setup-review-domain-title">05 Offer</span>
              <Link href={getDomainEditHref('/setup/offer')} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '11.5px' }}>
                <Edit3 size={12} /> Edit
              </Link>
            </div>
            <p className="setup-review-domain-value">
              {profile?.default_offer || <em style={{ color: 'var(--color-ink-muted)' }}>No default offer added</em>}
              {profile?.avg_ticket_inr && (
                <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                  Avg bill: INR {profile.avg_ticket_inr}
                </span>
              )}
            </p>
          </div>

          {/* 06 Brand */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <span className="setup-review-domain-title">06 Brand</span>
              <Link href={getDomainEditHref('/setup/brand')} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '11.5px' }}>
                <Edit3 size={12} /> Edit
              </Link>
            </div>
            <p className="setup-review-domain-value">
              {profile?.style_voice || 'Warm & Welcoming (Default)'}
            </p>
          </div>

          {/* 07 Operations */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <span className="setup-review-domain-title">07 Operations</span>
              <Link href={getDomainEditHref('/setup/operations')} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '11.5px' }}>
                <Edit3 size={12} /> Edit
              </Link>
            </div>
            <p className="setup-review-domain-value">
              Quiet hours: {profile?.slow_hours || 'Not set'}
              <br />
              <span style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)' }}>
                Peak hours: {profile?.peak_hours || 'Not set'}
              </span>
            </p>
          </div>

          {/* 08 Contact */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <span className="setup-review-domain-title">08 Contact</span>
              <Link href={getDomainEditHref('/setup/contact')} className="btn-ghost" style={{ padding: '2px 6px', fontSize: '11.5px' }}>
                <Edit3 size={12} /> Edit
              </Link>
            </div>
            <p className="setup-review-domain-value">
              {profile?.phone_whatsapp || <em style={{ color: 'var(--color-ink-muted)' }}>No phone/WhatsApp provided</em>}
            </p>
          </div>

        </div>

        {/* Footer Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
          <Link href={getDomainEditHref('/setup/contact')} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 18px' }}>
            Back to Contact
          </Link>

          <button
            className="btn-primary"
            style={{ fontSize: '13px', padding: '8px 22px' }}
            disabled={!progress.requiredComplete}
            onClick={() => router.push(launchHref)}
          >
            <span>Launch StreetCraft</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
