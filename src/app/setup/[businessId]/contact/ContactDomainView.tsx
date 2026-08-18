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

interface ContactDomainViewProps {
  context: SetupContext;
}

export function ContactDomainView({ context }: ContactDomainViewProps) {
  const router = useRouter();
  const { business, profile, progress } = context;

  const saveActionBound = saveSetupDomainAction.bind(null, business.id, 'contact');
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Contact channels saved.');
        router.push(`/setup/${encodeURIComponent(business.id)}/review`);
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business.id, router]);

  const prevHref = `/setup/${encodeURIComponent(business.id)}/operations`;
  const nextHref = `/setup/${encodeURIComponent(business.id)}/review`;

  return (
    <SetupAmbientBackground domain="contact">
      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="08"
          stepIndex={8}
          domainName="Contact"
          title="Contact & Customer Channels"
          subtitle="Add your official customer contact number or WhatsApp order line for marketing call-to-actions."
          businessId={business.id}
          completionPercentage={progress.completionPercentage}
        />

        <form action={saveAction}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="phone_whatsapp">
              Phone / WhatsApp Order Line <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <input
              id="phone_whatsapp"
              name="phone_whatsapp"
              type="tel"
              className="input-field"
              placeholder="e.g. +91 98765 43210"
              defaultValue={profile?.phone_whatsapp || ''}
              disabled={isSaving}
            />
            {saveState.errors?.phone_whatsapp && (
              <span className="field-error">{saveState.errors.phone_whatsapp[0]}</span>
            )}
            <span style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)', marginTop: '4px', display: 'block' }}>
              Used in generated WhatsApp broadcasts and in-store poster direct inquiry tags.
            </span>
          </div>

          <SetupFooterNav
            prevHref={prevHref}
            nextHref={nextHref}
            isSaving={isSaving}
            saveButtonText="Save & Continue to Review"
          />
        </form>
      </div>
    </SetupAmbientBackground>
  );
}
