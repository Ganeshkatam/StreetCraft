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

interface ProductsDomainViewProps {
  context: SetupContext;
}

export function ProductsDomainView({ context }: ProductsDomainViewProps) {
  const router = useRouter();
  const { business, profile, progress } = context;

  const saveActionBound = business
    ? saveSetupDomainAction.bind(null, business.id, 'products')
    : async (): Promise<SetupDomainActionState> => ({ success: false });
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Products saved.');
        if (business) {
          router.push(`/setup/customers?biz=${encodeURIComponent(business.id)}`);
        }
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business, router]);

  const prevHref = business ? `/setup/location?biz=${encodeURIComponent(business.id)}` : '/setup/location';

  return (
    <div className="setup-workspace-grid">
      <SetupRail
        businessId={business?.id}
        domainList={progress.domainList}
      />

      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="03"
          domainName="Products"
          title="Signature Products &amp; Items"
          subtitle="What does your store sell? List the hero products and specialties that bring customers through the door."
          businessId={business?.id}
        />

        <form action={saveAction}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="signature_items">
              Signature Items &amp; Bestsellers <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <textarea
              id="signature_items"
              name="signature_items"
              className="input-field"
              rows={4}
              placeholder="e.g. Sourdough Croissants, Cold Brew Nitro, Artisanal Cinnamon Rolls, Avocado Toast"
              defaultValue={profile?.signature_items || ''}
              required
            />
            <span style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)', marginTop: '4px', display: 'block' }}>
              Separate items with commas. The AI engine automatically pulls these into targeted product packs.
            </span>
            {saveState.errors?.signature_items && (
              <span className="field-error">{saveState.errors.signature_items[0]}</span>
            )}
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
