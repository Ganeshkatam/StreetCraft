import React, { useState } from 'react';
import { useBusiness } from '../../hooks/useBusiness';
import { useUsage } from '../../hooks/useUsage';
import { api } from '../../lib/api';
import { DynamicOpportunity } from '../../engine/briefing/opportunityEngine';
import { CampaignType, CampaignObjective, FullCampaignPack } from '../../types/campaign';
import { CAMPAIGN_TYPES } from '../../config/campaignTypes';
import { ChannelCard } from '../../components/ChannelCard';
import { Sparkles, ArrowRight, ArrowLeft, Store, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    <div style={{ maxWidth: '1000px' }}>
      <div className="section-header">
        <span className="section-eyebrow">4-STEP TRANSACTIONAL GENERATOR</span>
        <h1 className="section-title">Create Coordinated Campaign Pack</h1>
        <p className="section-subtitle">
          Turn your offer into 4 synchronized channels with character-validated local copy.
        </p>
      </div>

      {isQuotaExceeded && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-rose)', fontSize: '14px', fontWeight: 600 }}>
            <AlertCircle size={18} /> You have reached your monthly limit of {usage?.monthlyLimit} campaign packs.
          </div>
          <button className="btn-primary" style={{ background: 'var(--accent-rose)' }} onClick={onOpenUpgrade}>
            Upgrade Quota &rarr;
          </button>
        </div>
      )}

      {generationError && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '24px', color: 'var(--accent-rose)', fontSize: '13px' }}>
          <strong>Generation Error:</strong> {generationError}
        </div>
      )}

      {/* Step Indicators */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        {[
          { num: 1, title: '1. Objective & Event' },
          { num: 2, title: '2. Offer & Timing' },
          { num: 3, title: '3. Audience & Review' },
          { num: 4, title: '4. 4-Channel Distribution' },
        ].map((s) => (
          <div
            key={s.num}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: step === s.num ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
              border: `1px solid ${step === s.num ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
              fontSize: '13px',
              fontWeight: step === s.num ? 700 : 500,
              color: step === s.num ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {s.title}
          </div>
        ))}
      </div>

      {/* STEP 1: Type Selection */}
      {step === 1 && (
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
            Select Campaign Trigger or Strategy
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '28px' }}>
            {Object.values(CAMPAIGN_TYPES).map((ct) => (
              <div
                key={ct.type}
                onClick={() => {
                  setType(ct.type);
                  setObjective(ct.defaultObjective);
                  if (!audience) setAudience(ct.recommendedAudience);
                }}
                style={{
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  background: type === ct.type ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  border: `2px solid ${type === ct.type ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {ct.label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {ct.description}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Next: Define Offer <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Offer & Timing */}
      {step === 2 && (
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
            Promotional Details & Timeframe
          </h3>

          <div className="form-group">
            <label className="form-label">Offer Headline / Title</label>
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
            <label className="form-label">Offer Description & Inclusions</label>
            <input
              type="text"
              className="form-input"
              value={offerDesc}
              onChange={(e) => setOfferDesc(e.target.value)}
              placeholder="e.g. 20% off all specialty single-origin pour-overs and bakery bakes"
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
                placeholder="e.g. 20% Off or Free Pairing"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Validity Window / Schedule</label>
              <input
                type="text"
                className="form-input"
                value={timingLabel}
                onChange={(e) => setTimingLabel(e.target.value)}
                placeholder="e.g. Mon-Thu from 3:00 PM to 6:00 PM"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Terms / Redemption Conditions</label>
            <input
              type="text"
              className="form-input"
              value={offerTerms}
              onChange={(e) => setOfferTerms(e.target.value)}
              placeholder="e.g. Show message at counter to redeem. Dine-in only."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button className="btn-secondary" onClick={() => setStep(1)}>
              <ArrowLeft size={14} /> Back
            </button>
            <button className="btn-primary" onClick={() => setStep(3)}>
              Next: Review & Generate <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Launch Generation */}
      {step === 3 && (
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>
            Review Store Parameters & Generate Pack
          </h3>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>STORE</small>
                <div style={{ fontSize: '15px', fontWeight: 700 }}>{profile?.name || 'Your Store'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{profile?.neighborhood}, {profile?.city}</div>
              </div>
              <div>
                <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>CAMPAIGN TYPE</small>
                <div style={{ fontSize: '15px', fontWeight: 700 }}>{CAMPAIGN_TYPES[type]?.label || type}</div>
              </div>
              <div>
                <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>SCHEDULE</small>
                <div style={{ fontSize: '15px', fontWeight: 700 }}>{timingLabel || 'This Week'}</div>
              </div>
            </div>

            <div>
              <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>OFFER</small>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '2px' }}>
                {offerTitle} &mdash; {offerDesc} ({offerValue})
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Custom Tone / Special Instructions (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Emphasize quiet vibe and fast Wi-Fi for remote workers"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <button className="btn-secondary" onClick={() => setStep(2)}>
              <ArrowLeft size={14} /> Back
            </button>
            <button
              className="btn-primary"
              onClick={handleGenerate}
              disabled={isGenerating || Boolean(isQuotaExceeded)}
            >
              {isGenerating ? 'Generating 4 Channels...' : 'Generate 4-Channel Pack'} <Sparkles size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Live Channel Outputs */}
      {step === 4 && generatedPack && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-elevated)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-emerald)' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="var(--accent-emerald)" /> Campaign Saved to Database Vault
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                All 4 channels are schema-validated and ready for distribution across your marketing touchpoints.
              </p>
            </div>
            <button className="btn-secondary" onClick={() => navigate('app/campaigns')}>
              View Campaign Vault &rarr;
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button className="btn-primary" onClick={() => navigate('app/campaigns')}>
              Open Vault &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
