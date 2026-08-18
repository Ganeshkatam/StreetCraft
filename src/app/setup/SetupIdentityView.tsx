'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { CustomSelect } from '../../components/CustomSelect';
import { STORE_CATEGORIES } from '../../config/categories';
import { createBusinessSetupAction, SetupActionState } from '../../lib/server/setup/createBusinessSetupAction';

interface SetupIdentityViewProps {
  claimToken?: string;
}

const initialState: SetupActionState = {
  success: false,
};

export const SetupIdentityView: React.FC<SetupIdentityViewProps> = ({ claimToken }) => {
  const [state, formAction, isPending] = useActionState(createBusinessSetupAction, initialState);
  const [selectedCategory, setSelectedCategory] = React.useState('');

  return (
    <div>
      <h2 className="auth-card-title">Store Identity & Location</h2>
      <p className="auth-card-subtitle">
        Name your storefront and anchor your physical neighborhood presence.
      </p>

      {state.message && !state.success && (
        <div className="auth-error-banner" role="alert" style={{ marginBottom: '16px' }}>
          {state.message}
        </div>
      )}

      <form action={formAction} className="auth-form">
        {claimToken && (
          <input type="hidden" name="claimToken" value={claimToken} />
        )}
        <input type="hidden" name="category" value={selectedCategory} />

        <div className="auth-form-field">
          <label className="auth-form-label" htmlFor="store-name-input">
            Store Name <span className="auth-required-mark">*</span>
          </label>
          <input
            id="store-name-input"
            name="name"
            type="text"
            required
            placeholder="e.g. Copper Roast Cafe, Velvet Loom Boutique"
            className="form-input"
            autoFocus
          />
          {state.errors?.name && (
            <span className="auth-field-error">{state.errors.name[0]}</span>
          )}
        </div>

        <div className="auth-form-field">
          <label className="auth-form-label">
            Category & Concept <span className="auth-required-mark">*</span>
          </label>
          <CustomSelect
            options={STORE_CATEGORIES}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Select your business category"
          />
          {state.errors?.category && (
            <span className="auth-field-error">{state.errors.category[0]}</span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="auth-form-field">
            <label className="auth-form-label" htmlFor="neighborhood-input">
              Neighborhood / Area <span className="auth-required-mark">*</span>
            </label>
            <input
              id="neighborhood-input"
              name="neighborhood"
              type="text"
              required
              placeholder="e.g. Indiranagar, Bandra West"
              className="form-input"
            />
            {state.errors?.neighborhood && (
              <span className="auth-field-error">{state.errors.neighborhood[0]}</span>
            )}
          </div>

          <div className="auth-form-field">
            <label className="auth-form-label" htmlFor="city-input">
              City <span className="auth-required-mark">*</span>
            </label>
            <input
              id="city-input"
              name="city"
              type="text"
              required
              placeholder="e.g. Bangalore, Mumbai"
              className="form-input"
            />
            {state.errors?.city && (
              <span className="auth-field-error">{state.errors.city[0]}</span>
            )}
          </div>
        </div>

        <div className="auth-form-field">
          <label className="auth-form-label" htmlFor="landmarks-input">
            Local Landmarks (optional)
          </label>
          <input
            id="landmarks-input"
            name="landmarks"
            type="text"
            placeholder="e.g. Opposite Metro Pillar 42, Near Town Square"
            className="form-input"
          />
          {state.errors?.landmarks && (
            <span className="auth-field-error">{state.errors.landmarks[0]}</span>
          )}
        </div>

        <div className="auth-form-field" style={{ marginBottom: '20px' }}>
          <label className="auth-form-label" htmlFor="phone-input">
            Store WhatsApp / Phone (optional)
          </label>
          <input
            id="phone-input"
            name="phone"
            type="text"
            placeholder="e.g. +91 98765 43210"
            className="form-input"
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            href="/user/today"
            className="btn-secondary"
            style={{ padding: '10px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center' }}
          >
            Set up later
          </Link>
          <button
            type="submit"
            disabled={isPending || !selectedCategory}
            className="auth-submit-btn"
            style={{ flex: 1 }}
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="spin" />
                <span>Creating store...</span>
              </>
            ) : (
              <span>Continue to Operating Rhythm</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
