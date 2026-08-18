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

interface BrandDomainViewProps {
  context: SetupContext;
}

export function BrandDomainView({ context }: BrandDomainViewProps) {
  const router = useRouter();
  const { business, profile, progress } = context;

  const saveActionBound = saveSetupDomainAction.bind(null, business.id, 'brand');
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Brand style saved.');
        router.push(`/setup/${encodeURIComponent(business.id)}/operations`);
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business.id, router]);

  const prevHref = `/setup/${encodeURIComponent(business.id)}/offer`;
  const nextHref = `/setup/${encodeURIComponent(business.id)}/operations`;

  return (
    <SetupAmbientBackground domain="brand">
      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="06"
          stepIndex={6}
          domainName="Brand"
          title="Brand Personality & Tone"
          subtitle="How should your promotional messages sound? Choose a voice that reflects your shop's vibe."
          businessId={business.id}
          completionPercentage={progress.completionPercentage}
        />

        <form action={saveAction}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="style_voice">
              Brand Voice Style <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <textarea
              id="style_voice"
              name="style_voice"
              className="input-field textarea-field"
              rows={3}
              placeholder="e.g. Warm, inviting, artisanal, neighborhood-focused, and slightly cheeky with local slang"
              defaultValue={profile?.style_voice || ''}
              disabled={isSaving}
            />
            {saveState.errors?.style_voice && (
              <span className="field-error">{saveState.errors.style_voice[0]}</span>
            )}
            <span style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)', marginTop: '4px', display: 'block' }}>
              This guides the AI copywriter in formulating headlines, captions, and WhatsApp broadcasts.
            </span>
          </div>

          <SetupFooterNav
            prevHref={prevHref}
            nextHref={nextHref}
            isSaving={isSaving}
            saveButtonText="Save & Continue to Operations"
          />
        </form>
      </div>
    </SetupAmbientBackground>
  );
}
