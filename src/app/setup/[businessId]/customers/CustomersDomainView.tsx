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

interface CustomersDomainViewProps {
  context: SetupContext;
}

export function CustomersDomainView({ context }: CustomersDomainViewProps) {
  const router = useRouter();
  const { business, profile, progress } = context;

  const saveActionBound = saveSetupDomainAction.bind(null, business.id, 'customers');
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Customer profile saved.');
        router.push(`/setup/${encodeURIComponent(business.id)}/offer`);
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business.id, router]);

  const prevHref = `/setup/${encodeURIComponent(business.id)}/products`;
  const nextHref = `/setup/${encodeURIComponent(business.id)}/offer`;

  return (
    <SetupAmbientBackground domain="customers">
      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="04"
          stepIndex={4}
          domainName="Customers"
          title="Target Customer Base"
          subtitle="Who are you trying to attract? Specify the demographic and audience traits that describe your ideal regulars."
          businessId={business.id}
          completionPercentage={progress.completionPercentage}
        />

        <form action={saveAction}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="target_customer">
              Primary Audience &amp; Customer Persona <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <textarea
              id="target_customer"
              name="target_customer"
              className="input-field textarea-field"
              rows={3}
              placeholder="e.g. Remote tech professionals, college students, morning fitness crowd, and weekend families looking for specialty brunch"
              defaultValue={profile?.target_customer || ''}
              required
              disabled={isSaving}
            />
            {saveState.errors?.target_customer && (
              <span className="field-error">{saveState.errors.target_customer[0]}</span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="target_monthly_customers">
              Monthly Guest Footfall Target <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <input
              id="target_monthly_customers"
              name="target_monthly_customers"
              type="number"
              className="input-field"
              placeholder="e.g. 1500"
              defaultValue={profile?.target_monthly_customers || ''}
              disabled={isSaving}
            />
          </div>

          <SetupFooterNav
            prevHref={prevHref}
            nextHref={nextHref}
            isSaving={isSaving}
            saveButtonText="Save & Continue to Offer"
          />
        </form>
      </div>
    </SetupAmbientBackground>
  );
}
