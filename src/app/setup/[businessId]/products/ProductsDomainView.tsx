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

interface ProductsDomainViewProps {
  context: SetupContext;
}

export function ProductsDomainView({ context }: ProductsDomainViewProps) {
  const router = useRouter();
  const { business, profile, progress } = context;

  const saveActionBound = saveSetupDomainAction.bind(null, business.id, 'products');
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Products saved.');
        router.push(`/setup/${encodeURIComponent(business.id)}/customers`);
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business.id, router]);

  const prevHref = `/setup/${encodeURIComponent(business.id)}/location`;
  const nextHref = `/setup/${encodeURIComponent(business.id)}/customers`;

  return (
    <SetupAmbientBackground domain="products">
      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="03"
          stepIndex={3}
          domainName="Products"
          title="Signature Products & Items"
          subtitle="What does your store sell? List the hero products, signature brews, or specialties that bring customers through the door."
          businessId={business.id}
          completionPercentage={progress.completionPercentage}
        />

        <form action={saveAction}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="signature_items">
              Hero Items &amp; Specialties <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <textarea
              id="signature_items"
              name="signature_items"
              className="input-field textarea-field"
              rows={3}
              placeholder="e.g. Artisanal Sourdough Croissants, Cold Brew Nitro, Belgian Waffles, Cardamom Chai"
              defaultValue={profile?.signature_items || ''}
              required
              disabled={isSaving}
            />
            {saveState.errors?.signature_items && (
              <span className="field-error">{saveState.errors.signature_items[0]}</span>
            )}
            <span style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)', marginTop: '4px', display: 'block' }}>
              Separate multiple items with commas. These will be highlighted in promotional marketing copy.
            </span>
          </div>

          <SetupFooterNav
            prevHref={prevHref}
            nextHref={nextHref}
            isSaving={isSaving}
            saveButtonText="Save & Continue to Customers"
          />
        </form>
      </div>
    </SetupAmbientBackground>
  );
}
