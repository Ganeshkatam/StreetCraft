'use client';

import React, { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SetupContext } from '../../../lib/server/setup/getSetupContext';
import { saveSetupDomainAction, SetupDomainActionState } from '../../../lib/server/setup/saveSetupDomainAction';
import { SetupDomainHeader } from '../components/SetupDomainHeader';
import { SetupFooterNav } from '../components/SetupFooterNav';
import { toast } from 'sonner';

const initialSetupState: SetupDomainActionState = { success: false };

interface LocationDomainViewProps {
  context: SetupContext;
}

export function LocationDomainView({ context }: LocationDomainViewProps) {
  const router = useRouter();
  const { business, profile } = context;

  const saveActionBound = business
    ? saveSetupDomainAction.bind(null, business.id, 'location')
    : async (): Promise<SetupDomainActionState> => ({ success: false });
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Location saved.');
        if (business) {
          router.push(`/setup/products?biz=${encodeURIComponent(business.id)}`);
        }
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business, router]);

  const prevHref = business ? `/setup/identity?biz=${encodeURIComponent(business.id)}` : '/setup/identity';

  return (
    <div className="setup-workspace-grid">
      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="02"
          domainName="Location"
          title="Physical Location & Area"
          subtitle="Tell StreetCraft where your physical business operates to ground local marketing campaigns."
          businessId={business?.id}
        />

        <form action={saveAction}>
          <div className="workspace-grid-2col" style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="neighborhood">
                Neighborhood / High Street <span style={{ color: 'var(--color-danger)' }}>*</span>
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
              {saveState.errors?.neighborhood && (
                <span className="field-error">{saveState.errors.neighborhood[0]}</span>
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
              {saveState.errors?.city && (
                <span className="field-error">{saveState.errors.city[0]}</span>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="landmarks">
              Local Landmarks &amp; Proximity <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>(Optional)</span>
            </label>
            <input
              id="landmarks"
              name="landmarks"
              type="text"
              className="input-field"
              placeholder="e.g. Opposite Metro Pillar 42, Near Corner House"
              defaultValue={profile?.landmarks || ''}
            />
            <span style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)', marginTop: '4px', display: 'block' }}>
              Used in local opportunity triggers to anchor footfall directions.
            </span>
          </div>

          <SetupFooterNav
            prevHref={prevHref}
            isSaving={isSaving}
            continueLabel="Continue"
          />
        </form>
      </div>
    </div>
  );
}
