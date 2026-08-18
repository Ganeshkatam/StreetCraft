'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SetupContext } from '../../../../lib/server/setup/getSetupContext';
import { SetupAmbientBackground } from '../components/SetupAmbientBackground';
import { SetupDomainHeader } from '../components/SetupDomainHeader';
import { CheckCircle2, AlertCircle, Edit3, ArrowRight, ArrowLeft } from 'lucide-react';

interface ReviewDomainViewProps {
  context: SetupContext;
}

export function ReviewDomainView({ context }: ReviewDomainViewProps) {
  const router = useRouter();
  const { business, profile, progress } = context;

  const bizId = business.id;
  const launchHref = `/user/business/${encodeURIComponent(bizId)}/today`;
  const prevHref = `/setup/${encodeURIComponent(bizId)}/contact`;
  const getDomainEditHref = (route: string) => route;

  return (
    <SetupAmbientBackground domain="review">
      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="09"
          stepIndex={9}
          domainName="Review"
          title="Review & Launch Storefront"
          subtitle="Confirm your storefront configuration before entering the daily marketing workspace."
          businessId={business.id}
          completionPercentage={progress.completionPercentage}
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
                  All required setup information is configured. You are ready to generate marketing campaigns.
                </span>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ fontSize: '13px', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => router.push(launchHref)}
            >
              <span>Finish Setup &amp; Launch</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={20} color="#ef4444" />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#991b1b', margin: 0 }}>
                Required Information Missing
              </h4>
              <span style={{ fontSize: '12.5px', color: '#b91c1c' }}>
                Please configure the required steps (Identity &amp; Location) before entering the workspace.
              </span>
            </div>
          </div>
        )}

        {/* 8-Domain Review Grid */}
        <div className="setup-review-grid">
          {/* 01 Identity */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="setup-review-step-tag">01</span>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, margin: 0, color: 'var(--color-ink)' }}>
                  Identity
                </h4>
                <span className={`setup-status-badge ${progress.domains.identity.status.toLowerCase()}`}>
                  {progress.domains.identity.status === 'COMPLETE' ? '✓' : '!'}
                </span>
              </div>
              <Link href={getDomainEditHref(progress.domains.identity.route)} className="setup-review-edit-btn">
                <Edit3 size={11} /> Edit
              </Link>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>
              <div><strong>Name:</strong> {profile?.name || business.name || 'Not configured'}</div>
              <div><strong>Category:</strong> {profile?.category || business.category || 'Not configured'}</div>
            </div>
          </div>

          {/* 02 Location */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="setup-review-step-tag">02</span>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, margin: 0, color: 'var(--color-ink)' }}>
                  Location
                </h4>
                <span className={`setup-status-badge ${progress.domains.location.status.toLowerCase()}`}>
                  {progress.domains.location.status === 'COMPLETE' ? '✓' : '!'}
                </span>
              </div>
              <Link href={getDomainEditHref(progress.domains.location.route)} className="setup-review-edit-btn">
                <Edit3 size={11} /> Edit
              </Link>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>
              <div><strong>Area:</strong> {profile?.neighborhood || 'Not configured'}</div>
              <div><strong>City:</strong> {profile?.city || 'Not configured'}</div>
            </div>
          </div>

          {/* 03 Products */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="setup-review-step-tag">03</span>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, margin: 0, color: 'var(--color-ink)' }}>
                  Products
                </h4>
                <span className={`setup-status-badge ${progress.domains.products.status.toLowerCase()}`}>
                  {progress.domains.products.status === 'COMPLETE' ? '✓' : '○'}
                </span>
              </div>
              <Link href={getDomainEditHref(progress.domains.products.route)} className="setup-review-edit-btn">
                <Edit3 size={11} /> Edit
              </Link>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <strong>Items:</strong> {profile?.signature_items || 'No signature items added'}
            </div>
          </div>

          {/* 04 Customers */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="setup-review-step-tag">04</span>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, margin: 0, color: 'var(--color-ink)' }}>
                  Customers
                </h4>
                <span className={`setup-status-badge ${progress.domains.customers.status.toLowerCase()}`}>
                  {progress.domains.customers.status === 'COMPLETE' ? '✓' : '○'}
                </span>
              </div>
              <Link href={getDomainEditHref(progress.domains.customers.route)} className="setup-review-edit-btn">
                <Edit3 size={11} /> Edit
              </Link>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <strong>Audience:</strong> {profile?.target_customer || 'Default local footfall'}
            </div>
          </div>

          {/* 05 Offer */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="setup-review-step-tag">05</span>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, margin: 0, color: 'var(--color-ink)' }}>
                  Offer
                </h4>
                <span className={`setup-status-badge ${progress.domains.offer.status.toLowerCase()}`}>
                  {progress.domains.offer.status === 'COMPLETE' ? '✓' : '○'}
                </span>
              </div>
              <Link href={getDomainEditHref(progress.domains.offer.route)} className="setup-review-edit-btn">
                <Edit3 size={11} /> Edit
              </Link>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <strong>Offer:</strong> {profile?.default_offer || 'No baseline offer set'}
            </div>
          </div>

          {/* 06 Brand */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="setup-review-step-tag">06</span>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, margin: 0, color: 'var(--color-ink)' }}>
                  Brand
                </h4>
                <span className={`setup-status-badge ${progress.domains.brand.status.toLowerCase()}`}>
                  {progress.domains.brand.status === 'COMPLETE' ? '✓' : '○'}
                </span>
              </div>
              <Link href={getDomainEditHref(progress.domains.brand.route)} className="setup-review-edit-btn">
                <Edit3 size={11} /> Edit
              </Link>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <strong>Voice:</strong> {profile?.style_voice || 'Standard friendly local shop'}
            </div>
          </div>

          {/* 07 Operations */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="setup-review-step-tag">07</span>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, margin: 0, color: 'var(--color-ink)' }}>
                  Operations
                </h4>
                <span className={`setup-status-badge ${progress.domains.operations.status.toLowerCase()}`}>
                  {progress.domains.operations.status === 'COMPLETE' ? '✓' : '○'}
                </span>
              </div>
              <Link href={getDomainEditHref(progress.domains.operations.route)} className="setup-review-edit-btn">
                <Edit3 size={11} /> Edit
              </Link>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>
              <div><strong>Slow Hours:</strong> {profile?.slow_hours || 'Not set'}</div>
              <div><strong>Peak Hours:</strong> {profile?.peak_hours || 'Not set'}</div>
            </div>
          </div>

          {/* 08 Contact */}
          <div className="setup-review-domain-card">
            <div className="setup-review-domain-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="setup-review-step-tag">08</span>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, margin: 0, color: 'var(--color-ink)' }}>
                  Contact
                </h4>
                <span className={`setup-status-badge ${progress.domains.contact.status.toLowerCase()}`}>
                  {progress.domains.contact.status === 'COMPLETE' ? '✓' : '○'}
                </span>
              </div>
              <Link href={getDomainEditHref(progress.domains.contact.route)} className="setup-review-edit-btn">
                <Edit3 size={11} /> Edit
              </Link>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>
              <strong>Phone / WhatsApp:</strong> {profile?.phone_whatsapp || 'Not set'}
            </div>
          </div>
        </div>

        <div className="setup-footer-nav" style={{ marginTop: '24px' }}>
          <Link href={prevHref} className="btn-secondary setup-footer-back">
            <ArrowLeft size={14} />
            <span>Back to Contact</span>
          </Link>

          {progress.requiredComplete ? (
            <button
              type="button"
              className="btn-primary setup-footer-next"
              onClick={() => router.push(launchHref)}
            >
              <span>Finish Setup &amp; Open Workspace</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <Link
              href={progress.domains.identity.status !== 'COMPLETE' ? progress.domains.identity.route : progress.domains.location.route}
              className="btn-secondary setup-footer-next"
            >
              <span>Complete Required Fields</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </SetupAmbientBackground>
  );
}
