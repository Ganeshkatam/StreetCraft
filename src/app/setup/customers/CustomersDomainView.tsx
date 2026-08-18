'use client';

import React, { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SetupContext } from '../../../lib/server/setup/getSetupContext';
import { saveSetupDomainAction, SetupDomainActionState } from '../../../lib/server/setup/saveSetupDomainAction';
import { SetupRail } from '../components/SetupRail';
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

  const saveActionBound = business
    ? saveSetupDomainAction.bind(null, business.id, 'customers')
    : async (): Promise<SetupDomainActionState> => ({ success: false });
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Customers saved.');
        if (business) {
          router.push(`/setup/offer?biz=${encodeURIComponent(business.id)}`);
        }
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business, router]);

  const prevHref = business ? `/setup/products?biz=${encodeURIComponent(business.id)}` : '/setup/products';

  return (
    <div className="setup-workspace-grid">
      <SetupRail
        businessId={business?.id}
        domainList={progress.domainList}
      />

      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="04"
          domainName="Customers"
          title="Target Customers"
          subtitle="Who are you trying to attract? Specify the demographic and audience traits that match your regulars."
          businessId={business?.id}
        />

        <form action={saveAction}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="target_customer">
              Target Audience Description <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="target_customer"
              name="target_customer"
              type="text"
              className="input-field"
              placeholder="e.g. Remote tech workers, weekend brunch groups, local residential families"
              defaultValue={profile?.target_customer || ''}
              required
            />
            {saveState.errors?.target_customer && (
              <span className="field-error">{saveState.errors.target_customer[0]}</span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="target_monthly_customers">
              Target Monthly Footfall Goal <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>(Optional)</span>
            </label>
            <input
              id="target_monthly_customers"
              name="target_monthly_customers"
              type="number"
              className="input-field"
              placeholder="e.g. 500"
              defaultValue={profile?.target_monthly_customers || ''}
            />
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
