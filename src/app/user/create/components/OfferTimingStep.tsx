'use client';

import React from 'react';
import { CampaignType, CampaignObjective } from '../../../../types/campaign';
import { CreateCampaignProfileSummary, CreateCampaignEntitlementSummary } from '../../../../lib/domain/create/createTypes';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

interface OfferTimingStepProps {
  businessId: string;
  type: CampaignType;
  objective: CampaignObjective;
  profile: CreateCampaignProfileSummary | null;
  entitlement: CreateCampaignEntitlementSummary;
  offerTitle: string;
  setOfferTitle: (v: string) => void;
  offerDesc: string;
  setOfferDesc: (v: string) => void;
  offerValue: string;
  setOfferValue: (v: string) => void;
  offerTerms: string;
  setOfferTerms: (v: string) => void;
  timingLabel: string;
  setTimingLabel: (v: string) => void;
  audience: string;
  setAudience: (v: string) => void;
  customNotes: string;
  setCustomNotes: (v: string) => void;
  onBack: () => void;
  isSubmitting: boolean;
  onUpgradeClick?: () => void;
}

export function OfferTimingStep({
  businessId,
  type,
  objective,
  profile: _profile,
  entitlement,
  offerTitle,
  setOfferTitle,
  offerDesc,
  setOfferDesc,
  offerValue,
  setOfferValue,
  offerTerms,
  setOfferTerms,
  timingLabel,
  setTimingLabel,
  audience,
  setAudience: _setAudience,
  customNotes,
  setCustomNotes,
  onBack,
  isSubmitting,
  onUpgradeClick,
}: OfferTimingStepProps) {
  const generationRequestId = React.useMemo(() => crypto.randomUUID(), []);

  return (
    <div className="card" style={{ padding: '32px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)', marginBottom: '6px' }}>
        The Offer &amp; Timing
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '24px' }}>
        Specify what customers receive and when the promotion is valid at your counter.
      </p>

      {entitlement.isQuotaExceeded && (
        <div style={{ background: 'var(--color-danger-subtle)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-xs)', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontSize: '13.5px', fontWeight: 600 }}>
            <AlertCircle size={16} /> Monthly limit reached ({entitlement.campaignLimit} campaigns). Upgrade for additional quota.
          </div>
          {onUpgradeClick && (
            <button type="button" className="btn-secondary" onClick={onUpgradeClick}>
              Upgrade Tier
            </button>
          )}
        </div>
      )}

      {/* Hidden values for Server Action */}
      <input type="hidden" name="businessId" value={businessId} />
      <input type="hidden" name="generationRequestId" value={generationRequestId} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="objective" value={objective} />
      <input type="hidden" name="audience" value={audience} />

      <div className="workspace-grid-2col" style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="offerTitle">
            Offer Headline / Special Name <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            id="offerTitle"
            name="offerTitle"
            type="text"
            className="input-field"
            placeholder="e.g. Afternoon Roast &amp; Pastry Pairing"
            value={offerTitle}
            onChange={(e) => setOfferTitle(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="offerValue">
            Discount / Value Benefit <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>(Optional)</span>
          </label>
          <input
            id="offerValue"
            name="offerValue"
            type="text"
            className="input-field"
            placeholder="e.g. Flat 20% Off or Complimentary Dessert"
            value={offerValue}
            onChange={(e) => setOfferValue(e.target.value)}
            maxLength={100}
          />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label className="form-label" htmlFor="offerDesc">
          Offer Description &amp; Details <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <textarea
          id="offerDesc"
          name="offerDesc"
          className="input-field"
          rows={3}
          placeholder="e.g. Order any signature pour-over between 3 PM and 6 PM and get a freshly baked sourdough croissant on the house."
          value={offerDesc}
          onChange={(e) => setOfferDesc(e.target.value)}
          maxLength={300}
          required
        />
      </div>

      <div className="workspace-grid-2col" style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="timingLabel">
            Validity / Time Window
          </label>
          <input
            id="timingLabel"
            name="timingLabel"
            type="text"
            className="input-field"
            placeholder="e.g. Mon–Thu, 3 PM – 6 PM"
            value={timingLabel}
            onChange={(e) => setTimingLabel(e.target.value)}
            maxLength={80}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="offerTerms">
            Conditions / Terms <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>(Optional)</span>
          </label>
          <input
            id="offerTerms"
            name="offerTerms"
            type="text"
            className="input-field"
            placeholder="e.g. Valid on dine-in only. One per table."
            value={offerTerms}
            onChange={(e) => setOfferTerms(e.target.value)}
            maxLength={200}
          />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '28px' }}>
        <label className="form-label" htmlFor="customNotes">
          Custom Brand Instructions <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>(Optional)</span>
        </label>
        <input
          id="customNotes"
          name="customNotes"
          type="text"
          className="input-field"
          placeholder="e.g. Mention our dog-friendly patio and live acoustic jazz on Thursday"
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
          maxLength={500}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
        <button
          type="button"
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          onClick={onBack}
          disabled={isSubmitting}
        >
          <ArrowLeft size={15} />
          <span>Back to Primary Goal</span>
        </button>

        <button
          type="submit"
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          disabled={isSubmitting || entitlement.isQuotaExceeded || !offerTitle.trim() || !offerDesc.trim()}
        >
          <Sparkles size={15} />
          <span>{isSubmitting ? 'Generating 4-Channel Proofs...' : 'Generate & Coordinate Campaign'}</span>
        </button>
      </div>
    </div>
  );
}
