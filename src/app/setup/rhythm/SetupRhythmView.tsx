'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { Loader2, X } from 'lucide-react';
import { CustomSelect } from '../../../components/CustomSelect';
import { AccessibleBusiness } from '../../../lib/server/business/getAccessibleBusinesses';
import { BusinessProfile } from '../../../lib/server/business/getBusinessProfile';
import { completeBusinessSetupAction, SetupActionState } from '../../../lib/server/setup/completeBusinessSetupAction';
import {
  getOfferOptionsForCategory,
  getSlowHoursOptionsForCategory,
  getTargetCustomerOptionsForCategory,
  getSignatureItemsPlaceholder,
} from '../../../config/storeOptions';

interface SetupRhythmViewProps {
  business: AccessibleBusiness;
  profile: BusinessProfile | null;
  claimToken?: string;
}

const initialState: SetupActionState = {
  success: false,
};

export const SetupRhythmView: React.FC<SetupRhythmViewProps> = ({
  business,
  profile,
  claimToken,
}) => {
  const [state, formAction, isPending] = useActionState(
    (prev: SetupActionState, formData: FormData) =>
      completeBusinessSetupAction(business.id, prev, formData),
    initialState
  );

  const offerOptions = getOfferOptionsForCategory(business.category);
  const slowHoursOptions = getSlowHoursOptionsForCategory(business.category);
  const targetCustomerOptions = getTargetCustomerOptionsForCategory(business.category);
  const signatureItemsPlaceholder = getSignatureItemsPlaceholder(business.category);

  const [selectedOffer, setSelectedOffer] = React.useState(profile?.default_offer || '');
  const [selectedSlowHours, setSelectedSlowHours] = React.useState(profile?.slow_hours || '');
  const [selectedCustomer, setSelectedCustomer] = React.useState(profile?.target_customer || '');

  return (
    <div>
      <div className="setup-canvas-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-primary)',
                letterSpacing: '0.06em',
                fontWeight: 700,
              }}
            >
              {business.name.toUpperCase()}
            </span>
          </div>

          <h2 className="auth-card-title" style={{ margin: 0, fontSize: '22px' }}>
            Operating Rhythm & Offers
          </h2>
          <p className="auth-card-subtitle" style={{ margin: '4px 0 0', fontSize: '13px' }}>
            Define your quiet windows, bestseller heroes, and default customer promotions.
          </p>
        </div>

        <Link
          href="/user/today"
          className="setup-exit-pill"
          title="Exit setup and return to workspace"
        >
          <X size={14} />
          <span>Exit</span>
        </Link>
      </div>

      {state.message && !state.success && (
        <div className="auth-error-banner" role="alert" style={{ marginBottom: '16px' }}>
          {state.message}
        </div>
      )}

      <form action={formAction} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {claimToken && (
          <input type="hidden" name="claimToken" value={claimToken} />
        )}
        <input type="hidden" name="default_offer" value={selectedOffer} />
        <input type="hidden" name="slow_hours" value={selectedSlowHours} />
        <input type="hidden" name="target_customer" value={selectedCustomer} />

        <div className="auth-form-field">
          <label className="auth-form-label" htmlFor="signature-items-input">
            Signature Menu Items / Bestsellers
          </label>
          <input
            id="signature-items-input"
            name="signature_items"
            type="text"
            defaultValue={profile?.signature_items || ''}
            placeholder={signatureItemsPlaceholder}
            className="form-input"
            autoFocus
          />
        </div>

        <div className="auth-form-field">
          <label className="auth-form-label">
            Who are your typical customers?
          </label>
          <CustomSelect
            options={targetCustomerOptions}
            value={selectedCustomer}
            onChange={setSelectedCustomer}
            placeholder="Select target demographic"
          />
        </div>

        <div className="auth-form-field">
          <label className="auth-form-label">
            When does the business usually get quiet? (Slow Hours)
          </label>
          <CustomSelect
            options={slowHoursOptions}
            value={selectedSlowHours}
            onChange={setSelectedSlowHours}
            placeholder="Select slow / slump hours"
          />
        </div>

        <div className="auth-form-field">
          <label className="auth-form-label">
            Default Promotional Offer / Special
          </label>
          <CustomSelect
            options={offerOptions}
            value={selectedOffer}
            onChange={setSelectedOffer}
            placeholder="Select default promotion or write-in"
          />
        </div>

        <div className="auth-form-field" style={{ marginBottom: '8px' }}>
          <label className="auth-form-label" htmlFor="phone-whatsapp-input">
            Counter WhatsApp / Direct Orders (optional)
          </label>
          <input
            id="phone-whatsapp-input"
            name="phone_whatsapp"
            type="text"
            defaultValue={profile?.phone_whatsapp || ''}
            placeholder="e.g. +91 98765 43210"
            className="form-input"
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <Link
            href="/setup"
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '13.5px', display: 'inline-flex', alignItems: 'center' }}
          >
            Back
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="auth-submit-btn"
            style={{ flex: 1 }}
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Done</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
