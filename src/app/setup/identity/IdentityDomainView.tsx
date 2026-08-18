'use client';

import React, { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SetupContext } from '../../../lib/server/setup/getSetupContext';
import { createBusinessSetupAction, SetupActionState } from '../../../lib/server/setup/createBusinessSetupAction';
import { saveSetupDomainAction, SetupDomainActionState } from '../../../lib/server/setup/saveSetupDomainAction';
import { SetupDomainHeader } from '../components/SetupDomainHeader';
import { SetupFooterNav } from '../components/SetupFooterNav';
import { toast } from 'sonner';

const initialSetupState: SetupDomainActionState = { success: false };
const initialCreateState: SetupActionState = { success: false };

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
  claimToken?: string;
}

export function IdentityDomainView({ context, claimToken }: IdentityDomainViewProps) {
  const router = useRouter();
  const { business, profile } = context;
  const isNewStore = !business;

  // If new store -> createBusinessSetupAction, else saveSetupDomainAction
  const [createState, createAction, isCreating] = useActionState(createBusinessSetupAction, initialCreateState);
  
  const saveActionBound = business
    ? saveSetupDomainAction.bind(null, business.id, 'identity')
    : async (): Promise<SetupDomainActionState> => ({ success: false });
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (createState && !createState.success && createState.message) {
      toast.error(createState.message);
    }
  }, [createState]);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Identity saved.');
        if (business) {
          router.push(`/setup/location?biz=${encodeURIComponent(business.id)}`);
        }
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business, router]);

  const nextHref = business ? `/setup/location?biz=${encodeURIComponent(business.id)}` : undefined;

  return (
    <div className="setup-workspace-grid">
      {/* Canvas Editor */}
      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="01"
          domainName="Identity"
          title="Store Identity"
          subtitle="Define what this storefront is called and the core category it represents."
          businessId={business?.id}
        />

        {isNewStore ? (
          <form action={createAction}>
            {claimToken && <input type="hidden" name="claimToken" value={claimToken} />}

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
                defaultValue={profile?.name || ''}
                required
              />
              {createState.errors?.name && (
                <span className="field-error">{createState.errors.name[0]}</span>
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
                defaultValue={profile?.category || 'Cafe & Coffee Bar'}
                required
              >
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {createState.errors?.category && (
                <span className="field-error">{createState.errors.category[0]}</span>
              )}
            </div>

            <div className="workspace-grid-2col" style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="neighborhood">
                  Neighborhood / Area <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="neighborhood"
                  name="neighborhood"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Indiranagar 100ft Road"
                  defaultValue={profile?.neighborhood || ''}
                  required
                />
                {createState.errors?.neighborhood && (
                  <span className="field-error">{createState.errors.neighborhood[0]}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="city">
                  City <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Bengaluru"
                  defaultValue={profile?.city || 'Bengaluru'}
                  required
                />
                {createState.errors?.city && (
                  <span className="field-error">{createState.errors.city[0]}</span>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="phone">
                Contact Phone / WhatsApp <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>(Optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input-field"
                placeholder="e.g. +91 98765 43210"
                defaultValue={profile?.phone_whatsapp || ''}
              />
            </div>

            <SetupFooterNav
              isSaving={isCreating}
              continueLabel="Create & Continue"
            />
          </form>
        ) : (
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
                defaultValue={profile?.name || ''}
                required
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
                defaultValue={profile?.category || 'Cafe & Coffee Bar'}
                required
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
              isSaving={isSaving}
              continueLabel="Continue"
            />
          </form>
        )}
      </div>
    </div>
  );
}
