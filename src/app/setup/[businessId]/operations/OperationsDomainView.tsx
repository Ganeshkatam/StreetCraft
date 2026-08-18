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

interface OperationsDomainViewProps {
  context: SetupContext;
}

export function OperationsDomainView({ context }: OperationsDomainViewProps) {
  const router = useRouter();
  const { business, profile, progress } = context;

  const saveActionBound = saveSetupDomainAction.bind(null, business.id, 'operations');
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Operating rhythm saved.');
        router.push(`/setup/${encodeURIComponent(business.id)}/contact`);
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business.id, router]);

  const prevHref = `/setup/${encodeURIComponent(business.id)}/brand`;
  const nextHref = `/setup/${encodeURIComponent(business.id)}/contact`;

  return (
    <SetupAmbientBackground domain="operations">
      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="07"
          stepIndex={7}
          domainName="Operations"
          title="Operating Hours & Rhythm"
          subtitle="Tell StreetCraft when your business experiences rushes and when there is room for more footfall."
          businessId={business.id}
          completionPercentage={progress.completionPercentage}
        />

        <form action={saveAction}>
          <div className="workspace-grid-2col" style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="peak_hours">
                Peak Hours / High Traffic Rush <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                id="peak_hours"
                name="peak_hours"
                type="text"
                className="input-field"
                placeholder="e.g. 8–11 AM Morning, 6–9 PM Evening"
                defaultValue={profile?.peak_hours || ''}
                disabled={isSaving}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="slow_hours">
                Slow Hours (Opportunity Windows) <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                id="slow_hours"
                name="slow_hours"
                type="text"
                className="input-field"
                placeholder="e.g. 2–5 PM Weekday Afternoons"
                defaultValue={profile?.slow_hours || ''}
                disabled={isSaving}
              />
            </div>
          </div>

          <SetupFooterNav
            prevHref={prevHref}
            nextHref={nextHref}
            isSaving={isSaving}
            saveButtonText="Save & Continue to Contact"
          />
        </form>
      </div>
    </SetupAmbientBackground>
  );
}
