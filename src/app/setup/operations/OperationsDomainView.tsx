'use client';

import React, { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SetupContext } from '../../../lib/server/setup/getSetupContext';
import { saveSetupDomainAction, SetupDomainActionState } from '../../../lib/server/setup/saveSetupDomainAction';
import { SetupDomainHeader } from '../components/SetupDomainHeader';
import { SetupFooterNav } from '../components/SetupFooterNav';
import { toast } from 'sonner';

const initialSetupState: SetupDomainActionState = { success: false };

interface OperationsDomainViewProps {
  context: SetupContext;
}

export function OperationsDomainView({ context }: OperationsDomainViewProps) {
  const router = useRouter();
  const { business, profile } = context;

  const saveActionBound = business
    ? saveSetupDomainAction.bind(null, business.id, 'operations')
    : async (): Promise<SetupDomainActionState> => ({ success: false });
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Operating rhythm saved.');
        if (business) {
          router.push(`/setup/contact?biz=${encodeURIComponent(business.id)}`);
        }
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business, router]);

  const prevHref = business ? `/setup/brand?biz=${encodeURIComponent(business.id)}` : '/setup/brand';

  return (
    <div className="setup-workspace-grid">
      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="07"
          domainName="Operations"
          title="Operating Hours & Rhythm"
          subtitle="Tell StreetCraft when your business is busy and when there's room for more customers."
          businessId={business?.id}
        />

        <form action={saveAction}>
          <div className="workspace-grid-2col" style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="slow_hours">
                Usually Quiet Slump Hours <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="slow_hours"
                name="slow_hours"
                type="text"
                className="input-field"
                placeholder="e.g. 2:00 PM – 5:00 PM Weekdays"
                defaultValue={profile?.slow_hours || '2:00 PM – 5:00 PM Weekdays'}
                required
              />
              <span style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)', marginTop: '4px', display: 'block' }}>
                Primary target for flash deals and tactical promotions.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="peak_hours">
                Peak Operating Hours <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>(Optional)</span>
              </label>
              <input
                id="peak_hours"
                name="peak_hours"
                type="text"
                className="input-field"
                placeholder="e.g. 8:00 AM – 11:30 AM & 6:00 PM – 9:30 PM"
                defaultValue={profile?.peak_hours || '8:00 AM – 11:30 AM & 6:00 PM – 9:30 PM'}
              />
            </div>
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
