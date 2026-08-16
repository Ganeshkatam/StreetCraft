import React, { useState } from 'react';
import { useBusiness } from '../../hooks/useBusiness';
import { useUsage } from '../../hooks/useUsage';
import { api } from '../../lib/api';
import { DynamicOpportunity } from '../../engine/briefing/opportunityEngine';
import { CampaignType, CampaignObjective, FullCampaignPack } from '../../types/campaign';
import { CAMPAIGN_TYPES } from '../../config/campaignTypes';
import { ChannelCard } from '../../components/ChannelCard';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface CreateCampaignPageProps {
  businessId: string;
  initialPreset?: DynamicOpportunity | null;
  navigate: (route: string) => void;
  onOpenUpgrade: () => void;
}

export const CreateCampaignPage: React.FC<CreateCampaignPageProps> = ({
  businessId,
  initialPreset,
  navigate,
  onOpenUpgrade,
}) => {
  const { profile } = useBusiness(businessId);
  const { usage, refreshUsage } = useUsage(businessId);

  const [step, setStep] = useState<number>(initialPreset ? 3 : 1);
  const [type, setType] = useState<CampaignType>(initialPreset?.preset.type || 'WEEKDAY_BOOST');
  const [objective, setObjective] = useState<CampaignObjective>(initialPreset?.preset.objective || 'MORE_WALK_INS');
  const [audience, setAudience] = useState<string>(
    initialPreset ? 'Local customers and neighborhood residents' : profile?.targetCustomer || ''
  );
  const [offerTitle, setOfferTitle] = useState<string>(initialPreset?.preset.offer.title || '');
  const [offerDesc, setOfferDesc] = useState<string>(
    initialPreset?.preset.offer.description || profile?.defaultOffer || ''
  );
  const [offerValue, setOfferValue] = useState<string>(initialPreset?.preset.offer.value || '');
  const [offerTerms, setOfferTerms] = useState<string>(initialPreset?.preset.offer.terms || '');
  const [timingLabel, setTimingLabel] = useState<string>(
    initialPreset?.preset.schedule.timingLabel || profile?.slowHours || ''
  );
  const [customNotes, setCustomNotes] = useState<string>(initialPreset?.preset.customNotes || '');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPack, setGeneratedPack] = useState<FullCampaignPack | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [channelProgress, setChannelProgress] = useState<Record<string, 'pending' | 'generating' | 'ready' | 'failed'>>({
    GOOGLE_BUSINESS: 'pending',
    INSTAGRAM: 'pending',
    WHATSAPP: 'pending',
    IN_STORE_POSTER: 'pending',
  });

  const handleGenerate = async () => {
    if (!businessId) return;
    setIsGenerating(true);
    setGenerationError(null);

    setChannelProgress({
      GOOGLE_BUSINESS: 'generating',
      INSTAGRAM: 'pending',
      WHATSAPP: 'pending',
      IN_STORE_POSTER: 'pending',
    });

    try {
      const result = await api.generateAndSaveCampaign(
        businessId,
        {
          type,
          objective,
          audience,
          offer: {
            title: offerTitle || offerDesc,
            description: offerDesc || offerTitle,
            value: offerValue || 'Special Promotion',
            terms: offerTerms || 'Valid during specified window',
          },
          schedule: {
            startsAt: new Date().toISOString(),
            endsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
            timingLabel: timingLabel || 'This week',
          },
          customNotes,
        },
        (channel, status) => {
          setChannelProgress((prev) => ({
            ...prev,
            [channel]: status,
          }));
        }
      );

      setGeneratedPack(result);
      setStep(4);
      await refreshUsage();
    } catch (err) {
      setGenerationError((err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const isQuotaExceeded = usage && !usage.canGenerate;

  return (
    <div style={{ maxWidth: '820px' }}>
      {/* Editorial Header */}
      <div className="section-header">
        <span className="section-eyebrow">CAMPAIGN CREATOR</span>
        <h1 className="section-title">Create a promotion</h1>
        <p className="section-subtitle">
          Turn your counter special into coordinated proofs across all 4 store channels.
        </p>
      </div>

      {isQuotaExceeded && (
        <div style={{ background: 'var(--color-terracotta-faint)', border: '1px solid var(--color-terracotta)', borderRadius: 'var(--radius-xs)', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-terracotta)', fontSize: '13.5px', fontWeight: 600 }}>
            <AlertCircle size={16} /> You have reached your monthly limit of {usage?.monthlyLimit} campaign packs.
          </div>
          <button className="btn-secondary" onClick={onOpenUpgrade}>
            Upgrade quota &rarr;
          </button>
        </div>
      )}

      {generationError && (
        <div style={{ background: 'var(--color-terracotta-faint)', border: '1px solid var(--color-terracotta)', borderRadius: 'var(--radius-xs)', padding: '16px 20px', marginBottom: '24px', color: 'var(--color-terracotta)', fontSize: '13px' }}>
          <strong>Error:</strong> {generationError}
        </div>
      )}

      {/* Step Numbers */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--border-editorial)', paddingBottom: '14px' }}>
        {[
          { num: 1, title: '01 Event' },
          { num: 2, title: '02 Goal' },
          { num: 3, title: '03 The Offer' },
          { num: 4, title: '04 Campaign Proofs' },
        ].map((s) => (
          <span
            key={s.num}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: step === s.num ? 600 : 400,
              color: step === s.num ? 'var(--color-ink)' : 'var(--color-muted)',
              borderBottom: step === s.num ? '2px solid var(--color-primary)' : 'none',
              paddingBottom: '4px',
            }}
          >
            {s.title}
          </span>
        ))}
      </div>

      {/* STEP 1: What's Happening? */}
      {step === 1 && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-ink)', marginBottom: '8px' }}>
            What is happening at your store?
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '24px' }}>
            Select the local trigger or moment you want to promote.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '32px' }}>
            {[
              { type: 'WEEKDAY_BOOST' as CampaignType, title: 'Quiet weekday', desc: 'Promote slow afternoon or morning hours' },
              { type: 'MENU_LAUNCH' as CampaignType, title: 'New dish or menu item', desc: 'Introduce a signature drink, bake, or special' },
              { type: 'WEEKEND_MAGNET' as CampaignType, title: 'Weekend special', desc: 'Capture brunch crowds & table reservations' },
              { type: 'FESTIVAL_SPECIAL' as CampaignType, title: 'Holiday or festival', desc: 'Local festival gift box or celebration' },
              { type: 'REVIEW_SPOTLIGHT' as CampaignType, title: 'Bring customers back', desc: 'Celebrate regulars & community love' },
              { type: 'FLASH_OFFER' as CampaignType, title: 'Flash promotion', desc: 'Time-sensitive counter incentive' },
            ].map((ct) => (
              <div
                key={ct.type}
                onClick={() => setType(ct.type)}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-xs)',
                  background: type === ct.type ? 'var(--bg-paper-dark)' : 'var(--bg-elevated)',
                  border: type === ct.type ? '1.5px solid var(--color-ink)' : '1px solid var(--border-editorial)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)' }}>
                  {ct.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                  {ct.desc}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Next: Define Goal &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: What Do You Want? */}
      {step === 2 && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-ink)', marginBottom: '8px' }}>
            What is your primary goal?
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '24px' }}>
            This shapes the call-to-action on Google, Instagram, and WhatsApp.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {[
              { obj: 'MORE_WALK_INS' as CampaignObjective, label: 'More walk-ins', desc: 'Encourage locals to drop by your counter today' },
              { obj: 'MORE_ORDERS' as CampaignObjective, label: 'More takeaway & takeaway orders', desc: 'Drive counter takeaways and direct orders' },
              { obj: 'MORE_BOOKINGS' as CampaignObjective, label: 'More table reservations', desc: 'Secure advance table bookings for lunch or brunch' },
              { obj: 'REPEAT_VISITS' as CampaignObjective, label: 'Bring back regulars', desc: 'Re-engage nearby customers who haven’t visited recently' },
              { obj: 'INCREASE_AWARENESS' as CampaignObjective, label: 'Neighborhood discovery', desc: 'Introduce your store to residents and workers nearby' },
            ].map((o) => (
              <div
                key={o.obj}
                onClick={() => setObjective(o.obj)}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-xs)',
                  background: objective === o.obj ? 'var(--bg-paper-dark)' : 'var(--bg-elevated)',
                  border: objective === o.obj ? '1.5px solid var(--color-ink)' : '1px solid var(--border-editorial)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)' }}>{o.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{o.desc}</div>
                </div>
                {objective === o.obj && <CheckCircle2 size={16} color="var(--color-primary)" />}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn-secondary" onClick={() => setStep(1)}>
              &larr; Back
            </button>
            <button className="btn-primary" onClick={() => setStep(3)}>
              Next: The Offer &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: The Offer */}
      {step === 3 && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-ink)', marginBottom: '8px' }}>
            The counter offer & timing
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '24px' }}>
            Define the exact promotion for {profile?.name || 'your store'}.
          </p>

          <div className="form-group">
            <label className="form-label">Offer Headline / Name</label>
            <input
              type="text"
              className="form-input"
              value={offerTitle}
              onChange={(e) => setOfferTitle(e.target.value)}
              placeholder="e.g. Afternoon Focus Hour Combo"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Offer Description</label>
            <input
              type="text"
              className="form-input"
              value={offerDesc}
              onChange={(e) => setOfferDesc(e.target.value)}
              placeholder="e.g. 20% off all specialty pour-overs paired with warm artisanal bakes"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Promotional Value</label>
              <input
                type="text"
                className="form-input"
                value={offerValue}
                onChange={(e) => setOfferValue(e.target.value)}
                placeholder="e.g. 20% Off or ₹299 Combo"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Schedule / Time Window</label>
              <input
                type="text"
                className="form-input"
                value={timingLabel}
                onChange={(e) => setTimingLabel(e.target.value)}
                placeholder="e.g. Monday–Thursday, 3 PM – 6 PM"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Redemption Instruction</label>
            <input
              type="text"
              className="form-input"
              value={offerTerms}
              onChange={(e) => setOfferTerms(e.target.value)}
              placeholder="e.g. Show message at counter to redeem. Dine-in only."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
            <button className="btn-secondary" onClick={() => setStep(2)}>
              &larr; Back
            </button>
            <button
              className="btn-primary"
              onClick={handleGenerate}
              disabled={isGenerating || Boolean(isQuotaExceeded)}
            >
              {isGenerating ? 'Generating Proofs...' : 'Generate 4 Campaign Proofs'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Campaign Proofs */}
      {step === 4 && generatedPack && (
        <div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dark)', padding: '20px 24px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                CAMPAIGN PROOF READY &bull; SAVED TO VAULT
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginTop: '2px' }}>
                {generatedPack.campaign.offer.title || generatedPack.campaign.offer.description}
              </h3>
            </div>
            <button className="btn-secondary" onClick={() => navigate('app/campaigns')}>
              Open vault &rarr;
            </button>
          </div>

          <ChannelCard
            channel="GOOGLE_BUSINESS"
            status={channelProgress.GOOGLE_BUSINESS}
            content={generatedPack.outputs.googleBusiness as unknown as Record<string, unknown>}
          />

          <ChannelCard
            channel="INSTAGRAM"
            status={channelProgress.INSTAGRAM}
            content={generatedPack.outputs.instagram as unknown as Record<string, unknown>}
          />

          <ChannelCard
            channel="WHATSAPP"
            status={channelProgress.WHATSAPP}
            content={generatedPack.outputs.whatsapp as unknown as Record<string, unknown>}
          />

          {generatedPack.outputs.poster && (
            <ChannelCard
              channel="IN_STORE_POSTER"
              status={channelProgress.IN_STORE_POSTER}
              content={generatedPack.outputs.poster as unknown as Record<string, unknown>}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button className="btn-primary" onClick={() => navigate('app/campaigns')}>
              Open Campaign Vault &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
