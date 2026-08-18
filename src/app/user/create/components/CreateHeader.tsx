'use client';

import React from 'react';
import { CreateCampaignBusinessSummary, CreateCampaignEntitlementSummary } from '../../../../lib/domain/create/createTypes';
import { Store, Zap } from 'lucide-react';

interface CreateHeaderProps {
  business: CreateCampaignBusinessSummary;
  entitlement: CreateCampaignEntitlementSummary;
  step: number;
}

export function CreateHeader({ business, entitlement, step }: CreateHeaderProps) {
  return (
    <div className="section-header" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span className="section-eyebrow">
          CAMPAIGN COMPOSER &bull; STEP {step} OF 4
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-ink)',
            }}
          >
            <Store size={13} color="var(--color-primary)" />
            <span>{business.name}</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-xs)',
              background: entitlement.isQuotaExceeded ? 'var(--color-danger-subtle)' : 'var(--color-primary-subtle)',
              border: `1px solid ${entitlement.isQuotaExceeded ? 'var(--color-danger)' : 'var(--color-primary-border)'}`,
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: entitlement.isQuotaExceeded ? 'var(--color-danger)' : 'var(--color-primary)',
              fontWeight: 600,
            }}
          >
            <Zap size={13} />
            <span>{entitlement.campaignsRemaining} of {entitlement.campaignLimit} left this month</span>
          </div>
        </div>
      </div>

      <h1 className="section-title" style={{ marginTop: '6px' }}>Compose Marketing Campaign</h1>
      <p className="section-subtitle">
        Turn your counter special into coordinated proofs across Google, Instagram, WhatsApp, and in-store QR poster.
      </p>
    </div>
  );
}
