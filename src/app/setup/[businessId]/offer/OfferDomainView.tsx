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

interface OfferDomainViewProps {
  context: SetupContext;
}

export function OfferDomainView({ context }: OfferDomainViewProps) {
  const router = useRouter();
  const { business, profile, progress } = context;

  const saveActionBound = saveSetupDomainAction.bind(null, business.id, 'offer');
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Offer settings saved.');
        router.push(`/setup/${encodeURIComponent(business.id)}/brand`);
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business.id, router]);

  const prevHref = `/setup/${encodeURIComponent(business.id)}/customers`;
  const nextHref = `/setup/${encodeURIComponent(business.id)}/brand`;

  return (
    <SetupAmbientBackground domain="offer">
      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="05"
          stepIndex={5}
          domainName="Offer"
          title="Core Promotion & Commercial Goal"
          subtitle="Define your baseline promotional hook and commercial ticket size."
          businessId={business.id}
          completionPercentage={progress.completionPercentage}
        />

        <form action={saveAction}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="default_offer">
              Default Promotional Offer / Incentive <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="default_offer"
              name="default_offer"
              type="text"
              className="input-field"
              placeholder="e.g. Complimentary beverage with any specialty sourdough combo"
              defaultValue={profile?.default_offer || ''}
              required
              disabled={isSaving}
            />
            {saveState.errors?.default_offer && (
              <span className="field-error">{saveState.errors.default_offer[0]}</span>
            )}
          </div>

          <div className="workspace-grid-2col" style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="primary_goal">
                Primary Marketing Objective <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                id="primary_goal"
                name="primary_goal"
                type="text"
                className="input-field"
                placeholder="e.g. Afternoon table occupancy, Signature item trial"
                defaultValue={profile?.primary_goal || ''}
                disabled={isSaving}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="avg_ticket_inr">
                Average Ticket Size (INR) <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                id="avg_ticket_inr"
                name="avg_ticket_inr"
                type="number"
                className="input-field"
                placeholder="e.g. 450"
                defaultValue={profile?.avg_ticket_inr || ''}
                disabled={isSaving}
              />
            </div>
          </div>

          <SetupFooterNav
            prevHref={prevHref}
            nextHref={nextHref}
            isSaving={isSaving}
            saveButtonText="Save & Continue to Brand"
          />
        </form>
      </div>
    </SetupAmbientBackground>
  );
}
