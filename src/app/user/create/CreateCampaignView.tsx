'use client';

import React, { useState, useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { CampaignType, CampaignObjective } from '../../../types/campaign';
import { ChannelCard } from '../../../components/ChannelCard';
import { CalendarPicker } from '../../../components/CalendarPicker';
import { UpgradeModal } from '../../../components/UpgradeModal';
import { CheckCircle2, AlertCircle, Printer, FileText, Code, Store, Plus, Loader2 } from 'lucide-react';
import {
  downloadFullCampaignPackTxt,
  downloadFullCampaignPackMarkdown,
  downloadFullCampaignPackJson,
  triggerPrintPoster,
} from '../../../utils/exportUtils';
import { CreateContext } from '../../../lib/server/create/getCreateContext';
import { createCampaignAction, CreateCampaignActionState } from '../../../lib/server/create/createCampaignAction';
import { toast } from 'sonner';

interface CreateCampaignViewProps {
  context: CreateContext;
}

const initialState: CreateCampaignActionState = { success: false, message: '' };

export function CreateCampaignView({ context }: CreateCampaignViewProps) {
  const router = useRouter();
  const { business, profile, usagePeriod } = context;

  const [step, setStep] = useState<number>(1);
  const [type, setType] = useState<CampaignType>('WEEKDAY_BOOST');
  const [objective, setObjective] = useState<CampaignObjective>('MORE_WALK_INS');
  const [audience, setAudience] = useState<string>('');

  // Step 3 state
  const [offerTitle, setOfferTitle] = useState<string>('');
  const [offerDesc, setOfferDesc] = useState<string>('');
  const [offerValue, setOfferValue] = useState<string>('');
  const [offerTerms, setOfferTerms] = useState<string>('');
  const [timingLabel, setTimingLabel] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // React 19 Action State
  const [actionState, formAction, isPending] = useActionState(createCampaignAction, initialState);

  // Result state
  const [generatedPack, setGeneratedPack] = useState<any>(null);

  // Check for preset in sessionStorage
  useEffect(() => {
    const rawPreset = sessionStorage.getItem('sc_launched_preset');
    if (rawPreset) {
      try {
        const parsed = JSON.parse(rawPreset);
        if (parsed.type) setType(parsed.type);
        if (parsed.objective) setObjective(parsed.objective);
        if (parsed.offer?.title) setOfferTitle(parsed.offer.title);
        if (parsed.offer?.description) setOfferDesc(parsed.offer.description);
        if (parsed.offer?.value) setOfferValue(parsed.offer.value);
        if (parsed.offer?.terms) setOfferTerms(parsed.offer.terms);
        if (parsed.schedule?.timingLabel) setTimingLabel(parsed.schedule.timingLabel);
        if (parsed.customNotes) setCustomNotes(parsed.customNotes);
        setStep(3);
        sessionStorage.removeItem('sc_launched_preset');
      } catch (parseErr) {
        console.warn('Failed to parse pre-loaded opportunity preset from storage:', parseErr);
      }
    }
  }, []);

  useEffect(() => {
    if (profile) {
      if (!offerDesc) setOfferDesc(profile.default_offer || '');
      if (!timingLabel) setTimingLabel(profile.slow_hours || '');
      if (!audience) setAudience(profile.target_customer || '');
    }
  }, [profile]);

  // Handle action success transition
  useEffect(() => {
    if (actionState.success && actionState.data && !isPending) {
      setGeneratedPack(actionState.data);
      setStep(4);
      toast.success(actionState.message);
    }
  }, [actionState, isPending]);

  // Determine quota status strictly from server props
  const isQuotaExceeded = usagePeriod ? usagePeriod.campaigns_used >= usagePeriod.campaign_limit : true;

  if (!business || !profile) {
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
            You haven&apos;t set up a store profile yet. Complete the quick onboarding setup to configure your store before creating marketing campaigns.
          </p>
          <button
            onClick={() => router.push('/setup')}
            className="btn-primary"
            style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            Set Up Your Storefront
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
      <div className="section-header">
        <span className="section-eyebrow">CAMPAIGN COMPOSER &bull; STEP {step} OF 4</span>
        <h1 className="section-title">Compose Marketing Campaign</h1>
        <p className="section-subtitle">
          Turn your counter special into coordinated proofs across Google, Instagram, WhatsApp, and in-store QR poster.
        </p>
      </div>

      {!usagePeriod && (
        <div style={{ background: 'var(--color-danger-subtle)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-xs)', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontSize: '13.5px', fontWeight: 600 }}>
            <AlertCircle size={16} /> Entitlement unavailable. You do not have an active subscription or usage plan for this month.
          </div>
        </div>
      )}

      {usagePeriod && isQuotaExceeded && (
        <div style={{ background: 'var(--color-danger-subtle)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-xs)', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontSize: '13.5px', fontWeight: 600 }}>
            <AlertCircle size={16} /> Monthly limit reached ({usagePeriod.campaign_limit} campaigns). Upgrade for additional quota.
          </div>
          <button className="btn-secondary" onClick={() => setShowUpgradeModal(true)}>
            Upgrade Tier
          </button>
        </div>
      )}

      {!actionState.success && actionState.message && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-xs)', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', boxShadow: 'var(--shadow-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-ink)', fontSize: '13.5px' }}>
            <AlertCircle size={18} color="#C53030" style={{ flexShrink: 0 }} />
            <span>{actionState.message}</span>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setStep(3)} // Return to step 3 to fix errors
            style={{ fontSize: '12.5px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            Review Inputs
          </button>
        </div>
      )}

      {/* Step Indicator Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px', flexWrap: 'wrap' }}>
        {[
          { num: 1, title: '1. Store Moment' },
          { num: 2, title: '2. Primary Goal' },
          { num: 3, title: '3. The Offer & Timing' },
          { num: 4, title: '4. Campaign Proofs' },
        ].map((s) => (
          <span
            key={s.num}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12.5px',
              fontWeight: step === s.num ? 700 : 400,
              color: step === s.num ? 'var(--color-primary)' : 'var(--color-ink-muted)',
              background: step === s.num ? 'var(--color-primary-subtle)' : 'transparent',
              padding: '4px 12px',
              borderRadius: 'var(--radius-xs)',
              border: step === s.num ? '1px solid var(--color-primary-border)' : '1px solid transparent',
            }}
          >
            {s.title}
          </span>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)', marginBottom: '6px' }}>
            What is happening at your store?
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '24px' }}>
            Select the store trigger or moment you want to promote.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {[
              { type: 'WEEKDAY_BOOST' as CampaignType, title: 'Quiet Weekday Afternoon', desc: 'Promote slow 3–6 PM hours with special pairing perks' },
              { type: 'MENU_LAUNCH' as CampaignType, title: 'New Dish or Item Launch', desc: 'Introduce a single-origin brew, bakery drop, or seasonal special' },
              { type: 'WEEKEND_MAGNET' as CampaignType, title: 'Weekend Rush Special', desc: 'Capture brunch crowds, table reservations & unhurried dining' },
              { type: 'FESTIVAL_SPECIAL' as CampaignType, title: 'Holiday or Festival', desc: 'Seasonal festive celebration, gift bundles, and special menus' },
              { type: 'REVIEW_SPOTLIGHT' as CampaignType, title: 'Re-engage Inactive Regulars', desc: 'Spotlight 5-star neighborhood love to drive repeat visits' },
              { type: 'FLASH_OFFER' as CampaignType, title: 'Flash Counter Promotion', desc: 'Time-sensitive counter incentive for immediate walk-ins' },
            ].map((ct) => (
              <div
                key={ct.type}
                onClick={() => setType(ct.type)}
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-sm)',
                  background: type === ct.type ? 'var(--color-surface-raised)' : 'var(--color-surface)',
                  border: type === ct.type ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  boxShadow: type === ct.type ? 'var(--shadow-paper)' : 'none',
                  transition: 'var(--motion-fast)',
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  {ct.title}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>
                  {ct.desc}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Next: Define Goal
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)', marginBottom: '6px' }}>
            What is your primary goal?
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '24px' }}>
            This shapes the call-to-action on Google, Instagram, WhatsApp, and in-store poster.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {[
              { obj: 'MORE_WALK_INS' as CampaignObjective, label: 'More Counter Walk-ins', desc: 'Encourage neighbors and passersby to drop by your counter today' },
              { obj: 'MORE_ORDERS' as CampaignObjective, label: 'More Takeaway Orders', desc: 'Drive counter takeaways and direct parcel orders' },
              { obj: 'MORE_BOOKINGS' as CampaignObjective, label: 'Table Reservations', desc: 'Secure advance table bookings for lunch, dinner or brunch' },
              { obj: 'REPEAT_VISITS' as CampaignObjective, label: 'Bring Back Regulars', desc: 'Re-engage nearby customers who haven’t visited in 14+ days' },
              { obj: 'INCREASE_AWARENESS' as CampaignObjective, label: 'Neighborhood Discovery', desc: 'Introduce your store to new residents and office workers nearby' },
            ].map((o) => (
              <div
                key={o.obj}
                onClick={() => setObjective(o.obj)}
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-sm)',
                  background: objective === o.obj ? 'var(--color-surface-raised)' : 'var(--color-surface)',
                  border: objective === o.obj ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                  boxShadow: objective === o.obj ? 'var(--shadow-paper)' : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)' }}>{o.label}</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', marginTop: '4px', lineHeight: '1.5' }}>{o.desc}</div>
                </div>
                {objective === o.obj && <CheckCircle2 size={16} color="var(--color-primary)" />}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn-secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn-primary" onClick={() => setStep(3)}>
              Next: The Offer
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <form action={formAction} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', alignItems: 'start' }}>
          {/* Hidden inputs to pass state to server action */}
          <input type="hidden" name="businessId" value={business.id} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="objective" value={objective} />
          <input type="hidden" name="audience" value={audience} />
          <input type="hidden" name="timingLabel" value={timingLabel} />

          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)', marginBottom: '6px' }}>
              The Offer & Schedule
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', marginBottom: '24px' }}>
              Define the exact promotion parameters for {profile?.name || 'your store'}.
            </p>

            <div className="form-group">
              <label className="form-label">Offer Headline / Name</label>
              <input
                type="text"
                name="offerTitle"
                className={`form-input ${actionState.errors?.offerTitle ? 'error' : ''}`}
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
                placeholder="e.g. Afternoon Focus Hour Combo"
                required
              />
              {actionState.errors?.offerTitle && <div className="form-error">{actionState.errors.offerTitle[0]}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Offer Description</label>
              <input
                type="text"
                name="offerDesc"
                className={`form-input ${actionState.errors?.offerDesc ? 'error' : ''}`}
                value={offerDesc}
                onChange={(e) => setOfferDesc(e.target.value)}
                placeholder="e.g. 20% off all specialty pour-overs paired with warm artisanal bakes"
                required
              />
              {actionState.errors?.offerDesc && <div className="form-error">{actionState.errors.offerDesc[0]}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Promotional Value</label>
                <input
                  type="text"
                  name="offerValue"
                  className={`form-input ${actionState.errors?.offerValue ? 'error' : ''}`}
                  value={offerValue}
                  onChange={(e) => setOfferValue(e.target.value)}
                  placeholder="e.g. 20% Off or ₹299 Combo"
                />
                {actionState.errors?.offerValue && <div className="form-error">{actionState.errors.offerValue[0]}</div>}
              </div>

              <CalendarPicker
                label="Target Time Window"
                value={timingLabel}
                onChange={(newTiming) => setTimingLabel(newTiming)}
                placeholder="e.g. Monday–Thursday, 3:00 PM – 6:00 PM"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Redemption Terms</label>
              <input
                type="text"
                name="offerTerms"
                className={`form-input ${actionState.errors?.offerTerms ? 'error' : ''}`}
                value={offerTerms}
                onChange={(e) => setOfferTerms(e.target.value)}
                placeholder="e.g. Flash message at counter to redeem. Dine-in only."
              />
              {actionState.errors?.offerTerms && <div className="form-error">{actionState.errors.offerTerms[0]}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Custom Notes (Optional)</label>
              <input
                type="text"
                name="customNotes"
                className={`form-input ${actionState.errors?.customNotes ? 'error' : ''}`}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Any special instructions for the AI..."
              />
              {actionState.errors?.customNotes && <div className="form-error">{actionState.errors.customNotes[0]}</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
              <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isPending || isQuotaExceeded || !usagePeriod}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {isPending && <Loader2 size={16} className="spin" />}
                {isPending ? 'Generating proofs...' : 'Generate 4 Campaign Proofs'}
              </button>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--color-surface-raised)' }}>
            <span className="section-eyebrow">DRAFT PARAMETERS</span>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', marginTop: '4px' }}>
              {profile?.name || 'Your Store'}
            </h4>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', marginBottom: '16px' }}>
              {profile?.neighborhood ? `${profile.neighborhood}${profile.city ? `, ${profile.city}` : ''}` : 'Location configured in preferences'}
            </div>

            <div style={{ padding: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)' }}>
                {offerTitle || 'Afternoon Promotion'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
                {offerDesc || 'Special promotional pairing for neighborhood visitors.'}
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', marginTop: '10px' }}>
                {timingLabel || 'Valid during specified window'} &bull; {offerValue || 'Special Perk'}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-ink-subtle)', lineHeight: '1.5' }}>
              Clicking generate will simultaneously create coordinated Google, Instagram, WhatsApp, and in-store poster copy securely on the server.
            </div>
          </div>
        </form>
      )}

      {/* STEP 4 */}
      {step === 4 && generatedPack && (
        <div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '20px 24px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-eyebrow">CAMPAIGN PROOFS READY &bull; SAVED TO VAULT</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginTop: '2px' }}>
                {generatedPack.campaign.offer.title || generatedPack.campaign.offer.description}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="btn-secondary"
                style={{ fontSize: '12.5px', padding: '6px 12px' }}
                onClick={() => downloadFullCampaignPackTxt(generatedPack, profile?.name)}
                title="Download all proofs as text file"
              >
                <FileText size={13} /> Text (.txt)
              </button>
              <button
                className="btn-secondary"
                style={{ fontSize: '12.5px', padding: '6px 12px' }}
                onClick={() => downloadFullCampaignPackMarkdown(generatedPack, profile?.name)}
                title="Download all proofs as markdown"
              >
                <FileText size={13} /> Markdown (.md)
              </button>
              <button
                className="btn-secondary"
                style={{ fontSize: '12.5px', padding: '6px 12px' }}
                onClick={() => downloadFullCampaignPackJson(generatedPack)}
                title="Download JSON data"
              >
                <Code size={13} /> JSON (.json)
              </button>
              {generatedPack.outputs.poster && (
                <button
                  className="btn-secondary"
                  style={{ fontSize: '12.5px', padding: '6px 12px' }}
                  onClick={triggerPrintPoster}
                  title="Print counter card or save as PDF"
                >
                  <Printer size={13} /> Print
                </button>
              )}
              <button className="btn-primary" style={{ fontSize: '12.5px', padding: '6px 14px' }} onClick={() => router.push('/user/campaigns')}>
                Open Vault
              </button>
            </div>
          </div>

          <div className="proofs-grid-2x2">
            <ChannelCard
              channel="GOOGLE_BUSINESS"
              status="ready"
              content={generatedPack.outputs.googleBusiness as unknown as Record<string, unknown>}
            />

            <ChannelCard
              channel="INSTAGRAM"
              status="ready"
              content={generatedPack.outputs.instagram as unknown as Record<string, unknown>}
            />

            <ChannelCard
              channel="WHATSAPP"
              status="ready"
              content={generatedPack.outputs.whatsapp as unknown as Record<string, unknown>}
            />

            {generatedPack.outputs.poster && (
              <ChannelCard
                channel="IN_STORE_POSTER"
                status="ready"
                content={generatedPack.outputs.poster as unknown as Record<string, unknown>}
              />
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button className="btn-primary" onClick={() => router.push('/user/campaigns')}>
              Open Campaign Vault
            </button>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          currentPlanId={usagePeriod?.plan || 'FREE'}
          onClose={() => setShowUpgradeModal(false)}
          onPlanUpdated={() => router.refresh()}
        />
      )}
    </div>
  );
}
