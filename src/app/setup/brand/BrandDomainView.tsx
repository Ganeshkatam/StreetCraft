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

interface BrandDomainViewProps {
  context: SetupContext;
}

export function BrandDomainView({ context }: BrandDomainViewProps) {
  const router = useRouter();
  const { business, profile, progress } = context;

  const saveActionBound = business
    ? saveSetupDomainAction.bind(null, business.id, 'brand')
    : async (): Promise<SetupDomainActionState> => ({ success: false });
  const [saveState, saveAction, isSaving] = useActionState(saveActionBound, initialSetupState);

  useEffect(() => {
    if (saveState) {
      if (saveState.success) {
        toast.success('Brand style saved.');
        if (business) {
          router.push(`/setup/operations?biz=${encodeURIComponent(business.id)}`);
        }
      } else if (saveState.message) {
        toast.error(saveState.message);
      }
    }
  }, [saveState, business, router]);

  const prevHref = business ? `/setup/offer?biz=${encodeURIComponent(business.id)}` : '/setup/offer';

  return (
    <div className="setup-workspace-grid">
      <SetupRail
        businessId={business?.id}
        domainList={progress.domainList}
      />

      <div className="setup-editor-card">
        <SetupDomainHeader
          stepNumber="06"
          domainName="Brand"
          title="Brand Personality &amp; Tone"
          subtitle="How should your promotional messages sound? Choose a voice that reflects your shop's vibe."
          businessId={business?.id}
        />

        <form action={saveAction}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="style_voice">
              Brand Voice / Tone <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>(Optional)</span>
            </label>
            <select
              id="style_voice"
              name="style_voice"
              className="input-field select-field"
              defaultValue={profile?.style_voice || 'Warm & Welcoming'}
            >
              <option value="Warm & Welcoming">Warm &amp; Welcoming (Friendly, neighborhood vibe)</option>
              <option value="Artisanal & Premium">Artisanal &amp; Premium (Craft-focused, refined)</option>
              <option value="Energetic & Direct">Energetic &amp; Direct (Fast-paced, action-oriented)</option>
              <option value="Playful & Quirky">Playful &amp; Quirky (Fun, witty, memorable)</option>
              <option value="Minimalist & Clean">Minimalist &amp; Clean (Simple, uncluttered)</option>
            </select>
            <span style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)', marginTop: '4px', display: 'block' }}>
              Guides AI copy generation across WhatsApp blasts, Instagram captions, and store displays.
            </span>
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
