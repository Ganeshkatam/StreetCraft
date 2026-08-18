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

interface LocationDomainViewProps {
  context: SetupContext;
}

export function LocationDomainView({ context }: LocationDomainViewProps) {
  const router = useRouter();
  const { business, profile, progress } = context;

  const saveActionBound = saveSetupDomainAction.bind(null, business.id, 'location');
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Location saved.');
        router.push(`/setup/${encodeURIComponent(business.id)}/products`);
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business.id, router]);

  const prevHref = `/setup/${encodeURIComponent(business.id)}/identity`;
  const nextHref = `/setup/${encodeURIComponent(business.id)}/products`;

  return (
    <SetupAmbientBackground domain="location">
      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="02"
          stepIndex={2}
          domainName="Location"
          title="Physical Location & Area"
          subtitle="Tell StreetCraft where your physical storefront operates to ground local neighborhood marketing campaigns."
          businessId={business.id}
          completionPercentage={progress.completionPercentage}
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
                disabled={isSaving}
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
                defaultValue={profile?.city || ''}
                required
                disabled={isSaving}
              />
              {saveState.errors?.city && (
                <span className="field-error">{saveState.errors.city[0]}</span>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="landmarks">
              Prominent Landmarks <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <input
              id="landmarks"
              name="landmarks"
              type="text"
              className="input-field"
              placeholder="e.g. Near Metro Station, Opposite Central Library"
              defaultValue={profile?.landmarks || ''}
              disabled={isSaving}
            />
          </div>

          <SetupFooterNav
            prevHref={prevHref}
            nextHref={nextHref}
            isSaving={isSaving}
            saveButtonText="Save & Continue to Products"
          />
        </form>
      </div>
    </SetupAmbientBackground>
  );
}
