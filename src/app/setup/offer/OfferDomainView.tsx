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

interface OfferDomainViewProps {
  context: SetupContext;
}

export function OfferDomainView({ context }: OfferDomainViewProps) {
  const router = useRouter();
  const { business, profile, progress } = context;

  const saveActionBound = business
    ? saveSetupDomainAction.bind(null, business.id, 'offer')
    : async (): Promise<SetupDomainActionState> => ({ success: false });
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Offer settings saved.');
        if (business) {
          router.push(`/setup/brand?biz=${encodeURIComponent(business.id)}`);
        }
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business, router]);

  const prevHref = business ? `/setup/customers?biz=${encodeURIComponent(business.id)}` : '/setup/customers';

  return (
    <div className="setup-workspace-grid">
      <SetupRail
        businessId={business?.id}
        domainList={progress.domainList}
      />

      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="05"
          domainName="Offer"
          title="Promotions &amp; Commercial Goal"
          subtitle="Define your baseline promotional hook and commercial ticket size."
          businessId={business?.id}
        />

        <form action={saveAction}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="default_offer">
              Default Promotional Offer / Hook <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="default_offer"
              name="default_offer"
              type="text"
              className="input-field"
              placeholder="e.g. Free Artisanal Cookie with any Large Pour-Over Coffee"
              defaultValue={profile?.default_offer || ''}
              required
            />
            {saveState.errors?.default_offer && (
              <span className="field-error">{saveState.errors.default_offer[0]}</span>
            )}
          </div>

          <div className="workspace-grid-2col" style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="primary_goal">
                Primary Business Goal <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>(Optional)</span>
              </label>
              <select
                id="primary_goal"
                name="primary_goal"
                className="input-field select-field"
                defaultValue={profile?.primary_goal || 'Fill Slow Slump Hours'}
              >
                <option value="Fill Slow Slump Hours">Fill Slow Slump Hours</option>
                <option value="Increase Weekend Footfall">Increase Weekend Footfall</option>
                <option value="Promote Signature Items">Promote Signature Items</option>
                <option value="Build Local Brand Awareness">Build Local Brand Awareness</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="avg_ticket_inr">
                Average Bill Size (INR) <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>(Optional)</span>
              </label>
              <input
                id="avg_ticket_inr"
                name="avg_ticket_inr"
                type="number"
                className="input-field"
                placeholder="e.g. 450"
                defaultValue={profile?.avg_ticket_inr || ''}
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
