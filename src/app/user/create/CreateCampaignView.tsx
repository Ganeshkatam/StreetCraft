'use client';

import React, { useState, useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
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
import { UpgradeModal } from '../../../components/UpgradeModal';
import { toast } from 'sonner';
import { Store, Plus } from 'lucide-react';
import Link from 'next/link';

interface CreateCampaignViewProps {
  context: CreateCampaignViewModel;
}

const initialState: CreateCampaignActionState = { success: false, message: '' };

export function CreateCampaignView({ context }: CreateCampaignViewProps) {
  const router = useRouter();
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Server Action Hook
  const [actionState, formAction, isPending] = useActionState(createCampaignAction, initialState);
  const [generatedPack, setGeneratedPack] = useState<any>(null);

  useEffect(() => {
    if (actionState.success && actionState.data && !isPending) {
      setGeneratedPack(actionState.data);
      setStep(4);
      setMaxAccessibleStep(4);
      toast.success(actionState.message);
    }
  }, [actionState, isPending]);

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
    setStep(1);
    setMaxAccessibleStep(1);
    setGeneratedPack(null);
    setOfferTitle('');
    setOfferDesc(profile.defaultOffer || '');
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
      <CreateHeader business={business} entitlement={entitlement} step={step} />

      <CreateStepIndicator
        currentStep={step}
        maxAccessibleStep={maxAccessibleStep}
        onSelectStep={(s) => setStep(s)}
      />

      {!actionState.success && actionState.message && (
        <CreateErrorState
          message={actionState.message}
          onFixInputs={() => setStep(3)}
        />
      )}

      {step === 1 && (
        <MomentStep
          selectedType={type}
          onSelectType={setType}
          onNext={handleNextFromMoment}
        />
      )}

      {step === 2 && (
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
            onUpgradeClick={() => setShowUpgradeModal(true)}
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

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
}
