'use client';

import React, { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SetupContext } from '../../../../lib/server/setup/getSetupContext';
import { saveSetupDomainAction, SetupDomainActionState } from '../../../../lib/server/setup/saveSetupDomainAction';
import { SetupAmbientBackground } from '../components/SetupAmbientBackground';
import { SetupDomainHeader } from '../components/SetupDomainHeader';
import { SetupFooterNav } from '../components/SetupFooterNav';
import { toast } from 'sonner';

const initialSetupState: SetupDomainActionState = { success: false };

const BUSINESS_CATEGORIES = [
  'Bakery & Pastry',
  'Cafe & Coffee Bar',
  'Restaurant & Dining',
  'Retail & Boutique',
  'Sweets & Mithai',
  'Grocery & Gourmet',
  'Salon & Personal Care',
  'Fitness & Wellness',
  'Bookstore & Stationery',
  'Other Local Business',
];

interface IdentityDomainViewProps {
  context: SetupContext;
}

export function IdentityDomainView({ context }: IdentityDomainViewProps) {
  const router = useRouter();
  const { business, profile, progress } = context;

  const saveActionBound = saveSetupDomainAction.bind(null, business.id, 'identity');
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Identity saved.');
        router.push(`/setup/${encodeURIComponent(business.id)}/location`);
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business.id, router]);

  const nextHref = `/setup/${encodeURIComponent(business.id)}/location`;

  return (
    <SetupAmbientBackground domain="identity">
      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="01"
          stepIndex={1}
          domainName="Identity"
          title="Store Identity"
          subtitle="Define what this storefront is called and the core category it represents across marketing channels."
          businessId={business.id}
          completionPercentage={progress.completionPercentage}
        />

        <form action={saveAction}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="name">
              Storefront Name <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="input-field"
              placeholder="e.g. Saffron Street Artisanal Cafe"
              defaultValue={profile?.name || business.name || ''}
              required
              disabled={isSaving}
            />
            {saveState.errors?.name && (
              <span className="field-error">{saveState.errors.name[0]}</span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="category">
              Storefront Category <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <select
              id="category"
              name="category"
              className="input-field select-field"
              defaultValue={profile?.category || business.category || 'Cafe & Coffee Bar'}
              required
              disabled={isSaving}
            >
              {BUSINESS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {saveState.errors?.category && (
              <span className="field-error">{saveState.errors.category[0]}</span>
            )}
          </div>

          <SetupFooterNav
            nextHref={nextHref}
            isSaving={isSaving}
            saveButtonText="Save & Continue to Location"
          />
        </form>
      </div>
    </SetupAmbientBackground>
  );
}
