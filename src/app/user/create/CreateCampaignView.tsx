'use client';

import React, { useState, useEffect, useActionState } from 'react';
import { CampaignType, CampaignObjective } from '../../../types/campaign';
import { CreateCampaignViewModel } from '../../../lib/domain/create/createTypes';
import { createCampaignAction, CreateCampaignActionState } from '../../../lib/server/create/createCampaignAction';
import { CreateHeader } from './components/CreateHeader';
import { CreateStepIndicator } from './components/CreateStepIndicator';
import { CreateErrorState } from './components/CreateErrorState';
import { MomentStep } from './components/MomentStep';
import { GoalStep } from './components/GoalStep';
import { OfferTimingStep } from './components/OfferTimingStep';
import { ProofsReviewStep } from './components/ProofsReviewStep';
import { useRouteModal } from '../../../hooks/useRouteModal';
import { toast } from 'sonner';
import { Store, Plus } from 'lucide-react';
import Link from 'next/link';

interface CreateCampaignViewProps {
  context: CreateCampaignViewModel;
}

const initialState: CreateCampaignActionState = { success: false, message: '' };

import {
  saveCampaignDraftToStorage,
  loadCampaignDraftFromStorage,
  clearCampaignDraftFromStorage,
} from '../../../lib/domain/create/draftPersistence';
import { RotateCcw, Sparkles } from 'lucide-react';

export function CreateCampaignView({ context }: CreateCampaignViewProps) {
  const { business, profile, entitlement, preset } = context;

  // Initialize step & parameters based on preset
  const initialStep = preset?.offerTitle || preset?.offerDescription ? 3 : 1;
  const [step, setStep] = useState<number>(initialStep);
  const [maxAccessibleStep, setMaxAccessibleStep] = useState<number>(initialStep);

  const [type, setType] = useState<CampaignType>(preset?.type || 'WEEKDAY_BOOST');
  const [objective, setObjective] = useState<CampaignObjective>(preset?.objective || 'MORE_WALK_INS');
  const [audience, setAudience] = useState<string>(profile?.targetCustomer || '');

  const [offerTitle, setOfferTitle] = useState<string>(preset?.offerTitle || '');
  const [offerDesc, setOfferDesc] = useState<string>(preset?.offerDescription || profile?.defaultOffer || '');
  const [offerValue, setOfferValue] = useState<string>(preset?.offerValue || '');
  const [offerTerms, setOfferTerms] = useState<string>(preset?.offerTerms || '');
  const [timingLabel, setTimingLabel] = useState<string>(preset?.timingLabel || profile?.slowHours || '');
  const [customNotes, setCustomNotes] = useState<string>(preset?.customNotes || '');
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);
  const { open: openUpgradeModal } = useRouteModal('upgrade', { legacyParam: 'upgrade' });

  // Server Action Hook
  const [actionState, formAction, isPending] = useActionState(createCampaignAction, initialState);
  const [generatedPack, setGeneratedPack] = useState<any>(null);

  // Restore draft on mount if no preset was explicitly passed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasPreset = Boolean(preset?.offerTitle || preset?.offerDescription || preset?.type);
    if (hasPreset) return;

    const draft = loadCampaignDraftFromStorage(window.localStorage, business.id);
    if (draft && (draft.offerTitle || draft.offerDesc || draft.step > 1)) {
      setStep(draft.step);
      setMaxAccessibleStep(Math.max(draft.step, 1));
      setType(draft.type);
      setObjective(draft.objective);
      if (draft.offerTitle) setOfferTitle(draft.offerTitle);
      if (draft.offerDesc) setOfferDesc(draft.offerDesc);
      if (draft.offerValue) setOfferValue(draft.offerValue);
      if (draft.offerTerms) setOfferTerms(draft.offerTerms);
      if (draft.timingLabel) setTimingLabel(draft.timingLabel);
      if (draft.audience) setAudience(draft.audience);
      if (draft.customNotes) setCustomNotes(draft.customNotes);
      setHasRestoredDraft(true);
    }
  }, [business.id, preset]);

  // Debounced auto-save draft to local storage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (step === 4) return; // Do not save on review step

    const timer = setTimeout(() => {
      saveCampaignDraftToStorage(window.localStorage, business.id, {
        step,
        type,
        objective,
        offerTitle,
        offerDesc,
        offerValue,
        offerTerms,
        timingLabel,
        audience,
        customNotes,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [business.id, step, type, objective, offerTitle, offerDesc, offerValue, offerTerms, timingLabel, audience, customNotes]);

  // Clear draft on successful generation
  useEffect(() => {
    if (actionState.success && actionState.data && !isPending) {
      if (typeof window !== 'undefined') {
        clearCampaignDraftFromStorage(window.localStorage, business.id);
      }
      setHasRestoredDraft(false);
      setGeneratedPack(actionState.data);
      setStep(4);
      setMaxAccessibleStep(4);
      toast.success(actionState.message);
    }
  }, [actionState, isPending, business.id]);

  if (!profile) {
    return (
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
        <div className="card" style={{ maxWidth: '560px', margin: '60px auto', textAlign: 'center', padding: '48px 36px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Store size={26} />
          </div>
          <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', marginBottom: '8px', color: 'var(--color-ink)' }}>
            No Storefront Profile
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
            You have not completed store profile setup yet. Configure your store before creating marketing campaigns.
          </p>
          <Link
            href="/setup"
            className="btn-primary"
            style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            Set Up Your Storefront
          </Link>
        </div>
      </div>
    );
  }

  const handleNextFromMoment = () => {
    setStep(2);
    setMaxAccessibleStep((prev) => Math.max(prev, 2));
  };

  const handleNextFromGoal = () => {
    setStep(3);
    setMaxAccessibleStep((prev) => Math.max(prev, 3));
  };

  const handleReset = () => {
    if (typeof window !== 'undefined') {
      clearCampaignDraftFromStorage(window.localStorage, business.id);
    }
    setHasRestoredDraft(false);
    setStep(1);
    setMaxAccessibleStep(1);
    setGeneratedPack(null);
    setOfferTitle('');
    setOfferDesc(profile.defaultOffer || '');
    setOfferValue('');
    setOfferTerms('');
    setCustomNotes('');
  };

  const handleDiscardDraft = () => {
    handleReset();
    toast.info('Draft discarded.');
  };

  const handleApplyOpportunity = (opp: any) => {
    if (opp.preset.type) setType(opp.preset.type);
    if (opp.preset.objective) setObjective(opp.preset.objective);
    if (opp.preset.offerTitle) setOfferTitle(opp.preset.offerTitle);
    if (opp.preset.offerDescription) setOfferDesc(opp.preset.offerDescription);
    if (opp.preset.timingLabel) setTimingLabel(opp.preset.timingLabel);
    if (opp.preset.customNotes) setCustomNotes(opp.preset.customNotes);
    setStep(3);
    setMaxAccessibleStep((prev) => Math.max(prev, 3));
    toast.info(`Applied recommendation: ${opp.title}`);
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
      <CreateHeader business={business} entitlement={entitlement} step={step} />

      <CreateStepIndicator
        currentStep={step}
        maxAccessibleStep={maxAccessibleStep}
        onSelectStep={(s) => !isPending && setStep(s)}
        disabled={isPending}
      />

      {hasRestoredDraft && step < 4 && (
        <div
          role="status"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-primary-subtle)',
            border: '1px solid var(--color-primary-border)',
            borderRadius: 'var(--radius-xs)',
            padding: '10px 16px',
            marginBottom: '20px',
            fontSize: '13px',
            color: 'var(--color-ink)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={14} color="var(--color-primary)" />
            <span>Restored your in-progress campaign draft for this storefront.</span>
          </div>
          <button
            type="button"
            onClick={handleDiscardDraft}
            className="btn-ghost"
            style={{ fontSize: '12px', padding: '4px 8px', color: 'var(--color-danger)' }}
          >
            Discard Draft
          </button>
        </div>
      )}

      {!actionState.success && actionState.message && (
        <CreateErrorState
          message={actionState.message}
          onFixInputs={() => setStep(3)}
        />
      )}

      {isPending && (
        <div
          role="status"
          aria-live="polite"
          className="card"
          style={{
            padding: '36px 24px',
            textAlign: 'center',
            marginBottom: '24px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-primary-border)',
          }}
        >
          <div
            className="spin-animate"
            style={{
              display: 'inline-block',
              width: '32px',
              height: '32px',
              border: '3px solid var(--color-border)',
              borderTopColor: 'var(--color-primary)',
              borderRadius: '50%',
              marginBottom: '16px',
            }}
          />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '8px' }}>
            Generating 4-Channel Coordinated Proofs
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', maxWidth: '520px', margin: '0 auto', lineHeight: '1.5' }}>
            Crafting tailored copy for Google Business Profile, Instagram, WhatsApp Broadcast, and Counter Poster aligned with your storefront identity.
          </p>
        </div>
      )}

      {step === 1 && !isPending && (
        <MomentStep
          selectedType={type}
          onSelectType={setType}
          onNext={handleNextFromMoment}
          radarOpportunities={context.radarOpportunities}
          onApplyOpportunity={handleApplyOpportunity}
        />
      )}

      {step === 2 && !isPending && (
        <GoalStep
          selectedObjective={objective}
          onSelectObjective={setObjective}
          onBack={() => setStep(1)}
          onNext={handleNextFromGoal}
        />
      )}

      {step === 3 && (
        <form action={formAction}>
          <OfferTimingStep
            businessId={business.id}
            type={type}
            objective={objective}
            profile={profile}
            entitlement={entitlement}
            offerTitle={offerTitle}
            setOfferTitle={setOfferTitle}
            offerDesc={offerDesc}
            setOfferDesc={setOfferDesc}
            offerValue={offerValue}
            setOfferValue={setOfferValue}
            offerTerms={offerTerms}
            setOfferTerms={setOfferTerms}
            timingLabel={timingLabel}
            setTimingLabel={setTimingLabel}
            audience={audience}
            setAudience={setAudience}
            customNotes={customNotes}
            setCustomNotes={setCustomNotes}
            onBack={() => setStep(2)}
            isSubmitting={isPending}
            onUpgradeClick={openUpgradeModal}
          />
        </form>
      )}

      {step === 4 && generatedPack && (
        <ProofsReviewStep
          campaignId={generatedPack.campaignId}
          businessId={business.id}
          storeName={business.name}
          campaign={generatedPack.campaign}
          outputs={generatedPack.outputs}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
