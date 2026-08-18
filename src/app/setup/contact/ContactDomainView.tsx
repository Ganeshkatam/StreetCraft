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

interface ContactDomainViewProps {
  context: SetupContext;
}

export function ContactDomainView({ context }: ContactDomainViewProps) {
  const router = useRouter();
  const { business, profile, progress } = context;

  const saveActionBound = business
    ? saveSetupDomainAction.bind(null, business.id, 'contact')
    : async (): Promise<SetupDomainActionState> => ({ success: false });
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Contact channels saved.');
        if (business) {
          router.push(`/setup/review?biz=${encodeURIComponent(business.id)}`);
        }
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business, router]);

  const prevHref = business ? `/setup/operations?biz=${encodeURIComponent(business.id)}` : '/setup/operations';

  return (
    <div className="setup-workspace-grid">
      <SetupRail
        businessId={business?.id}
        domainList={progress.domainList}
      />

      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="08"
          domainName="Contact"
          title="Contact &amp; Customer Channels"
          subtitle="Add your official customer care number or WhatsApp order line for campaign call-to-actions."
          businessId={business?.id}
        />

        <form action={saveAction}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="phone_whatsapp">
              WhatsApp &amp; Phone Number <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>(Optional)</span>
            </label>
            <input
              id="phone_whatsapp"
              name="phone_whatsapp"
              type="tel"
              className="input-field"
              placeholder="e.g. +91 98765 43210"
              defaultValue={profile?.phone_whatsapp || ''}
            />
            <span style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)', marginTop: '4px', display: 'block' }}>
              Embedded directly into generated WhatsApp broadcast links and customer flyers.
            </span>
          </div>

          <SetupFooterNav
            prevHref={prevHref}
            isSaving={isSaving}
            continueLabel="Review Store"
          />
        </form>
      </div>
    </div>
  );
}
