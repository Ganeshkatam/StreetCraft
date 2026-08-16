import React, { useState } from 'react';
import { useBusiness } from '../../hooks/useBusiness';
import { useUsage } from '../../hooks/useUsage';
import { api } from '../../lib/api';
import { DynamicOpportunity } from '../../engine/briefing/opportunityEngine';
import { CampaignType, CampaignObjective, FullCampaignPack } from '../../types/campaign';
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
    <div>
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

      {/* Step Numbers Bar */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', borderBottom: '1px solid var(--border-editorial)', paddingBottom: '14px' }}>
        {[
          { num: 1, title: '01 Store Moment' },
          { num: 2, title: '02 Primary Goal' },
          { num: 3, title: '03 The Offer' },
          { num: 4, title: '04 4-Channel Proofs' },
        ].map((s) => (
          <span
            key={s.num}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12.5px',
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

      {/* STEP 1: What's Happening? (Expansive 3-Column Grid) */}
      {step === 1 && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--color-ink)', marginBottom: '8px' }}>
            What is happening at your store?
          </h3>
          <p style={{ fontSize: '14.5px', color: 'var(--color-muted)', marginBottom: '28px' }}>
            Select the local trigger or moment you want to promote.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '36px' }}>
            {[
              { type: 'WEEKDAY_BOOST' as CampaignType, title: 'Quiet weekday', desc: 'Promote slow afternoon or morning hours with special pairing perks' },
              { type: 'MENU_LAUNCH' as CampaignType, title: 'New dish or menu item', desc: 'Introduce a fresh single-origin brew, bakery drop, or chef special' },
              { type: 'WEEKEND_MAGNET' as CampaignType, title: 'Weekend special', desc: 'Capture brunch crowds, family table reservations & unhurried dining' },
              { type: 'FESTIVAL_SPECIAL' as CampaignType, title: 'Holiday or festival', desc: 'Local festival celebration, gift boxes, and seasonal menus' },
              { type: 'REVIEW_SPOTLIGHT' as CampaignType, title: 'Bring customers back', desc: 'Spotlight 5-star neighborhood love & win back inactive regulars' },
              { type: 'FLASH_OFFER' as CampaignType, title: 'Flash promotion', desc: 'Time-sensitive counter incentive for immediate walk-ins' },
            ].map((ct) => (
              <div
                key={ct.type}
                onClick={() => setType(ct.type)}
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-xs)',
                  background: type === ct.type ? 'var(--bg-paper-dark)' : 'var(--bg-elevated)',
                  border: type === ct.type ? '1.5px solid var(--color-ink)' : '1px solid var(--border-editorial)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  {ct.title}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', lineHeight: '1.5' }}>
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

      {/* STEP 2: What Do You Want? (Expansive 3-Column Grid) */}
      {step === 2 && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--color-ink)', marginBottom: '8px' }}>
            What is your primary goal?
          </h3>
          <p style={{ fontSize: '14.5px', color: 'var(--color-muted)', marginBottom: '28px' }}>
            This shapes the call-to-action on Google, Instagram, WhatsApp, and in-store poster.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '36px' }}>
            {[
              { obj: 'MORE_WALK_INS' as CampaignObjective, label: 'More walk-ins', desc: 'Encourage locals and neighbors to drop by your counter today' },
              { obj: 'MORE_ORDERS' as CampaignObjective, label: 'More takeaway orders', desc: 'Drive counter takeaways and direct parcel orders' },
              { obj: 'MORE_BOOKINGS' as CampaignObjective, label: 'More table reservations', desc: 'Secure advance table bookings for lunch, dinner or brunch' },
              { obj: 'REPEAT_VISITS' as CampaignObjective, label: 'Bring back regulars', desc: 'Re-engage nearby customers who haven’t visited in 14+ days' },
              { obj: 'INCREASE_AWARENESS' as CampaignObjective, label: 'Neighborhood discovery', desc: 'Introduce your store to new residents and office workers nearby' },
            ].map((o) => (
              <div
                key={o.obj}
                onClick={() => setObjective(o.obj)}
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-xs)',
                  background: objective === o.obj ? 'var(--bg-paper-dark)' : 'var(--bg-elevated)',
                  border: objective === o.obj ? '1.5px solid var(--color-ink)' : '1px solid var(--border-editorial)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>{o.label}</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', marginTop: '4px', lineHeight: '1.5' }}>{o.desc}</div>
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

      {/* STEP 3: The Offer (Expansive 2-Column Split Layout) */}
      {step === 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Left: Input Form */}
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

          {/* Right: Live Draft Proof Preview */}
          <div className="card" style={{ background: 'var(--bg-elevated)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              LIVE PROMOTION DRAFT
            </span>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginTop: '8px' }}>
              {profile?.name || 'The Roasted Bean'}
            </h4>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', marginBottom: '16px' }}>
              {profile?.neighborhood || 'Indiranagar'}, {profile?.city || 'Bengaluru'}
            </div>

            <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-editorial)', borderRadius: 'var(--radius-xs)', marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)' }}>
                {offerTitle || 'Afternoon Promotion'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '4px' }}>
                {offerDesc || 'Special promotional pairing for local neighborhood visitors.'}
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', marginTop: '10px' }}>
                {timingLabel || 'Valid during specified window'} &bull; {offerValue || 'Special Perk'}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: '1.5' }}>
              Clicking generate will simultaneously produce synchronized Google, Instagram, WhatsApp, and in-store poster copy.
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Campaign Proofs (Expansive 2x2 Simultaneous Grid) */}
      {step === 4 && generatedPack && (
        <div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dark)', padding: '20px 24px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                CAMPAIGN PROOFS READY &bull; SAVED TO VAULT
              </span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)', marginTop: '2px' }}>
                {generatedPack.campaign.offer.title || generatedPack.campaign.offer.description}
              </h3>
            </div>
            <button className="btn-secondary" onClick={() => navigate('app/campaigns')}>
              Open vault archive &rarr;
            </button>
          </div>

          <div className="proofs-grid-2x2">
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
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button className="btn-primary" onClick={() => navigate('app/campaigns')}>
              Open Campaign Vault &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
