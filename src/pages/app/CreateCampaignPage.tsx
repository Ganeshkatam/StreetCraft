import React, { useState } from 'react';
import { useBusiness } from '../../hooks/useBusiness';
import { useUsage } from '../../hooks/useUsage';
import { api } from '../../lib/api';
import { DynamicOpportunity } from '../../engine/briefing/opportunityEngine';
import { CampaignType, CampaignObjective, FullCampaignPack } from '../../types/campaign';
import { ChannelCard } from '../../components/ChannelCard';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

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
        <span className="section-eyebrow">CAMPAIGN COMPOSER &bull; STEP {step} OF 4</span>
        <h1 className="section-title">Compose Multi-Channel Campaign</h1>
        <p className="section-subtitle">
          Turn your counter special into synchronized proofs across Google, Instagram, WhatsApp, and in-store QR poster.
        </p>
      </div>

      {isQuotaExceeded && (
        <div style={{ background: 'var(--color-danger-subtle)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-xs)', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontSize: '13.5px', fontWeight: 600 }}>
            <AlertCircle size={16} /> Monthly limit reached ({usage?.monthlyLimit} packs). Upgrade for additional quota.
          </div>
          <button className="btn-secondary" onClick={onOpenUpgrade}>
            Upgrade Tier &rarr;
          </button>
        </div>
      )}

      {generationError && (
        <div style={{ background: 'var(--color-danger-subtle)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-xs)', padding: '16px 20px', marginBottom: '24px', color: 'var(--color-danger)', fontSize: '13px' }}>
          <strong>Error:</strong> {generationError}
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

      {/* STEP 1: What's Happening? */}
      {step === 1 && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)', marginBottom: '6px' }}>
            What is happening at your store?
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '24px' }}>
            Select the local trigger or moment you want to promote.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {[
              { type: 'WEEKDAY_BOOST' as CampaignType, title: 'Quiet Weekday Afternoon', desc: 'Promote slow 3–6 PM hours with special pairing perks' },
              { type: 'MENU_LAUNCH' as CampaignType, title: 'New Dish or Item Launch', desc: 'Introduce a single-origin brew, bakery drop, or seasonal special' },
              { type: 'WEEKEND_MAGNET' as CampaignType, title: 'Weekend Rush Special', desc: 'Capture brunch crowds, table reservations & unhurried dining' },
              { type: 'FESTIVAL_SPECIAL' as CampaignType, title: 'Holiday or Local Festival', desc: 'Seasonal festive celebration, gift packs, and special menus' },
              { type: 'REVIEW_SPOTLIGHT' as CampaignType, title: 'Re-engage Inactive Regulars', desc: 'Spotlight 5-star neighborhood love to drive repeat visits' },
              { type: 'FLASH_OFFER' as CampaignType, title: 'Flash Counter Promotion', desc: 'Time-sensitive counter incentive for immediate local walk-ins' },
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
              Next: Define Goal <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: What Do You Want? */}
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
              { obj: 'MORE_WALK_INS' as CampaignObjective, label: 'More Counter Walk-ins', desc: 'Encourage locals and neighbors to drop by your counter today' },
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
              <ArrowLeft size={14} /> Back
            </button>
            <button className="btn-primary" onClick={() => setStep(3)}>
              Next: The Offer <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: The Offer Form */}
      {step === 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Left: Input Form */}
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
                <label className="form-label">Schedule / Timing</label>
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
              <label className="form-label">Redemption Terms</label>
              <input
                type="text"
                className="form-input"
                value={offerTerms}
                onChange={(e) => setOfferTerms(e.target.value)}
                placeholder="e.g. Flash message at counter to redeem. Dine-in only."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>
                <ArrowLeft size={14} /> Back
              </button>
              <button
                className="btn-primary"
                onClick={handleGenerate}
                disabled={isGenerating || Boolean(isQuotaExceeded)}
              >
                {isGenerating ? 'Generating proofs...' : 'Generate 4 Campaign Proofs'}
              </button>
            </div>
          </div>

          {/* Right: Live Draft Preview */}
          <div className="card" style={{ background: 'var(--color-surface-raised)' }}>
            <span className="section-eyebrow">DRAFT PARAMETERS</span>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', marginTop: '4px' }}>
              {profile?.name || 'The Roasted Bean'}
            </h4>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', marginBottom: '16px' }}>
              {profile?.neighborhood || 'Indiranagar'}, {profile?.city || 'Bengaluru'}
            </div>

            <div style={{ padding: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)' }}>
                {offerTitle || 'Afternoon Promotion'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
                {offerDesc || 'Special promotional pairing for local neighborhood visitors.'}
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', marginTop: '10px' }}>
                {timingLabel || 'Valid during specified window'} &bull; {offerValue || 'Special Perk'}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-ink-subtle)', lineHeight: '1.5' }}>
              Clicking generate will simultaneously create synchronized Google, Instagram, WhatsApp, and in-store poster copy.
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: 2x2 Simultaneous Multi-Channel Proofs */}
      {step === 4 && generatedPack && (
        <div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '20px 24px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-eyebrow">CAMPAIGN PROOFS READY &bull; SAVED TO VAULT</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginTop: '2px' }}>
                {generatedPack.campaign.offer.title || generatedPack.campaign.offer.description}
              </h3>
            </div>
            <button className="btn-secondary" onClick={() => navigate('app/campaigns')}>
              Open Vault &rarr;
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
