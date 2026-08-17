import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { CampaignType, FullCampaignPack } from '../types/campaign';
import { BusinessProfile } from '../types/business';
import { ChannelCard } from '../components/ChannelCard';
import { CustomSelect, SelectOption } from '../components/CustomSelect';
import { CalendarPicker } from '../components/CalendarPicker';
import { ErrorStateCard } from '../components/ErrorStateCard';
import { getUserFacingErrorMessage } from '../lib/userFacingError';
import {
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface FreeToolPageProps {
  onOpenAuthWithClaim?: (claimToken: string) => void;
}

export const FreeToolPage: React.FC<FreeToolPageProps> = ({ onOpenAuthWithClaim }) => {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('The Roasted Bean');
  const [neighborhood, setNeighborhood] = useState('Indiranagar');
  const [city, setCity] = useState('Bengaluru');
  const [category, setCategory] = useState('Specialty Cafe & Bakery');
  const [type, setType] = useState<CampaignType>('WEEKDAY_BOOST');
  const [offerTitle, setOfferTitle] = useState('20% off single-origin pour-overs & fresh sourdough bakes');
  const [timing, setTiming] = useState('Monday–Thursday, 3:00 PM – 6:00 PM');

  // Generation & View State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedPack, setGeneratedPack] = useState<FullCampaignPack | null>(null);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [activeChannelView, setActiveChannelView] = useState<'ALL' | 'GOOGLE_BUSINESS' | 'INSTAGRAM' | 'WHATSAPP' | 'IN_STORE_POSTER'>('ALL');

  const presets = [
    {
      label: 'Indiranagar Cafe (Slow 3–6 PM)',
      name: 'The Roasted Bean',
      neighborhood: 'Indiranagar',
      city: 'Bengaluru',
      category: 'Specialty Cafe & Bakery',
      type: 'WEEKDAY_BOOST' as CampaignType,
      offerTitle: '20% off single-origin pour-overs & fresh sourdough bakes',
      timing: 'Monday–Thursday, 3:00 PM – 6:00 PM',
    },
    {
      label: 'Bandra Bistro (Weekend Brunch)',
      name: 'Artisan Table',
      neighborhood: 'Bandra West',
      city: 'Mumbai',
      category: 'Artisanal Bistro & Dining',
      type: 'WEEKEND_MAGNET' as CampaignType,
      offerTitle: 'Chef’s Limited Weekend Tasting Menu & Flat White Pairing',
      timing: 'Saturday & Sunday, 9:00 AM – 2:00 PM',
    },
    {
      label: 'T. Nagar Sweets (Festival Hampers)',
      name: 'Heritage Sweets',
      neighborhood: 'T. Nagar',
      city: 'Chennai',
      category: 'Heritage Sweets & Savouries',
      type: 'FESTIVAL_SPECIAL' as CampaignType,
      offerTitle: 'Handcrafted pure ghee festive gift boxes with advance booking',
      timing: 'Festival Week Special Window',
    },
  ];

  const triggerOptions: SelectOption<CampaignType>[] = [
    {
      value: 'WEEKDAY_BOOST',
      label: 'Weekday Slow Hours Slump',
      description: 'Promote slow 3–6 PM hours with special pairing perks',
    },
    {
      value: 'WEEKEND_MAGNET',
      label: 'Weekend Rush Magnet',
      description: 'Capture brunch crowds, table reservations & weekend walk-ins',
    },
    {
      value: 'MENU_LAUNCH',
      label: 'New Item / Signature Dish Drop',
      description: 'Spotlight a fresh roast, bakery drop, or seasonal special',
    },
    {
      value: 'FESTIVAL_SPECIAL',
      label: 'Holiday / Festival Special',
      description: 'Festive celebrations, gift boxes & advance bookings',
    },
    {
      value: 'REVIEW_SPOTLIGHT',
      label: 'Community & Regulars Spotlight',
      description: 'Highlight customer love and 5-star neighborhood reputation',
    },
    {
      value: 'WIN_BACK_REGULARS',
      label: 'Win-Back Regulars Special',
      description: 'Time-sensitive incentive to re-engage past store customers',
    },
  ];

  const handleExecuteGeneration = async (
    customName?: string,
    customOffer?: string,
    customNeighborhood?: string,
    customCity?: string,
    customCategory?: string,
    customType?: CampaignType,
    customTiming?: string
  ) => {
    const targetName = customName || name;
    const targetOffer = customOffer || offerTitle;
    const targetNeighborhood = customNeighborhood || neighborhood;
    const targetCity = customCity || city;
    const targetCategory = customCategory || category;
    const targetType = customType || type;
    const targetTiming = customTiming || timing;

    if (!targetName || !targetOffer) {
      setGenerationError("Please provide both a business name and promotional offer to generate campaign proofs.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    try {
      const ephemeralProfile: BusinessProfile = {
        businessId: '00000000-0000-0000-0000-000000000000',
        name: targetName,
        category: targetCategory || 'Retail Store',
        neighborhood: targetNeighborhood || '',
        city: targetCity || '',
        landmarks: '',
        targetCustomer: '',
        styleVoice: '',
        signatureItems: '',
        primaryGoal: '',
        peakHours: '',
        slowHours: targetTiming || '',
        defaultOffer: targetOffer,
        avgTicketINR: 0,
        targetMonthlyCustomers: 0,
        phoneWhatsApp: '',
        updatedAt: new Date().toISOString(),
      };

      const result = await api.generateAnonymousCampaign(
        {
          type: targetType,
          objective: 'MORE_WALK_INS',
          audience: targetNeighborhood ? `Nearby customers in ${targetNeighborhood}` : 'Local neighborhood customers',
          offer: {
            title: targetOffer,
            description: targetOffer,
            value: targetOffer,
            terms: 'Show message at counter to redeem.',
          },
          schedule: {
            startsAt: new Date().toISOString(),
            endsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
            timingLabel: targetTiming || 'Valid this week',
          },
        },
        ephemeralProfile
      );

      setGeneratedPack(result.pack);
      if (result.claimToken) {
        setClaimToken(result.claimToken);
      }
    } catch (err: unknown) {
      setGenerationError(getUserFacingErrorMessage(err, "Failed to generate campaign proofs. Please check your inputs and try again."));
    } finally {
      setIsGenerating(false);
    }
  };

  // Run initial preview generation on mount
  useEffect(() => {
    handleExecuteGeneration();
  }, []);

  const handleApplyPreset = (p: typeof presets[0]) => {
    setName(p.name);
    setNeighborhood(p.neighborhood);
    setCity(p.city);
    setCategory(p.category);
    setType(p.type);
    setOfferTitle(p.offerTitle);
    setTiming(p.timing);
    handleExecuteGeneration(p.name, p.offerTitle, p.neighborhood, p.city, p.category, p.type, p.timing);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteGeneration();
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '48px 32px 96px' }}>

      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '12px', fontWeight: 600 }}>
          NO SIGNUP REQUIRED &bull; FREE DEMONSTRATION TOOL
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '46px', color: 'var(--color-ink)', lineHeight: '1.15', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
          Free Campaign Proof Generator
        </h1>
        <p style={{ fontSize: '16.5px', color: 'var(--color-ink-muted)', lineHeight: '1.6', maxWidth: '680px', margin: '0 auto' }}>
          Enter your shop details and promotional offer to generate a coordinated campaign across Google, Instagram, WhatsApp, and in-store print.
        </p>
      </div>

      {/* Sticky Presets Bar */}
      <div
        style={{
          position: 'sticky',
          top: 'var(--layout-header-height, 68px)',
          zIndex: 40,
          display: 'flex',
          justifyContent: 'center',
          padding: '14px 0 18px',
          marginBottom: '28px',
          background: 'linear-gradient(to bottom, var(--color-page) 75%, transparent)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            gap: '8px',
            background: 'var(--color-surface)',
            padding: '6px 8px',
            borderRadius: '32px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-paper)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '11.5px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-primary)',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '0 8px',
            }}
          >
            Try Sample:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              style={{
                padding: '7px 16px',
                fontSize: '12.5px',
                fontWeight: name === p.name ? 600 : 500,
                color: name === p.name ? '#FFFFFF' : 'var(--color-ink-muted)',
                background: name === p.name ? 'var(--color-ink)' : 'transparent',
                border: 'none',
                borderRadius: '24px',
                cursor: 'pointer',
                transition: 'var(--motion-fast)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          MAIN WORKBENCH: FORM ON LEFT, PROOFS ON RIGHT
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 400px) 1fr', gap: '32px', alignItems: 'start' }}>

        {/* Input Parameters Card (Sticky Workbench) */}
        <form
          onSubmit={handleSubmit}
          className="card"
          style={{
            padding: '28px',
            background: 'var(--color-surface)',
            position: 'sticky',
            top: 'calc(var(--layout-header-height, 68px) + 72px)',
          }}
        >
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)', marginBottom: '18px' }}>
            Store Parameters
          </div>

          <div className="form-group">
            <label className="form-label">Shop / Business Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Blue Door Cafe"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Business Category</label>
            <input
              type="text"
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Specialty Coffee & Bakery"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Neighborhood</label>
              <input
                type="text"
                className="form-input"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g. Indiranagar"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru"
                required
              />
            </div>
          </div>

          <CustomSelect<CampaignType>
            label="Promotion Trigger"
            value={type}
            onChange={(newType) => setType(newType)}
            options={triggerOptions}
          />

          <div className="form-group">
            <label className="form-label">Offer / Special Headline</label>
            <input
              type="text"
              className="form-input"
              value={offerTitle}
              onChange={(e) => setOfferTitle(e.target.value)}
              placeholder="e.g. 20% off pour-overs & fresh bakes"
              required
            />
          </div>

          <CalendarPicker
            label="Target Time Window"
            value={timing}
            onChange={(newTiming) => setTiming(newTiming)}
            placeholder="e.g. Monday–Thursday, 3:00 PM – 6:00 PM"
          />

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '12px 18px', fontSize: '14px', justifyContent: 'center', marginTop: '10px' }}
            disabled={isGenerating}
          >
            {isGenerating ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />}
            {isGenerating ? 'Generating campaign...' : 'Generate Campaign Proofs'}
          </button>
        </form>

        {/* Output Section */}
        <div>
          {/* Claim / Workspace Callout Bar */}
          {claimToken && generatedPack && (
            <div style={{ background: 'var(--color-surface)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-xs)', padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: 'var(--shadow-subtle)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 600, fontSize: '14.5px' }}>
                  <CheckCircle2 size={17} /> Campaign Proofs Generated Successfully
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginTop: '4px', margin: 0 }}>
                  Claim this campaign to save it to your permanent Store Preferences and open your workspace.
                </p>
              </div>
              <button
                className="btn-primary"
                style={{ fontSize: '13.5px', padding: '8px 18px' }}
                onClick={() => {
                  if (claimToken && onOpenAuthWithClaim) {
                    onOpenAuthWithClaim(claimToken);
                  } else {
                    navigate('/login');
                  }
                }}
              >
                Save to Workspace
              </button>
            </div>
          )}

          {/* Channel View Filter Tabs */}
          {generatedPack && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-ink)' }}>
                <strong>Generated Campaign:</strong> <span style={{ color: 'var(--color-ink-muted)' }}>{name} &bull; {neighborhood}</span>
              </div>

              <div style={{ display: 'flex', gap: '6px', background: 'var(--color-surface-raised)', padding: '4px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                {[
                  { id: 'ALL', label: 'All Proofs' },
                  { id: 'GOOGLE_BUSINESS', label: 'Google' },
                  { id: 'INSTAGRAM', label: 'Instagram' },
                  { id: 'WHATSAPP', label: 'WhatsApp' },
                  { id: 'IN_STORE_POSTER', label: 'Counter Card' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChannelView(tab.id as any)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '12px',
                      fontWeight: activeChannelView === tab.id ? 600 : 400,
                      color: activeChannelView === tab.id ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                      background: activeChannelView === tab.id ? 'var(--color-surface)' : 'transparent',
                      border: activeChannelView === tab.id ? '1px solid var(--color-border)' : '1px solid transparent',
                      boxShadow: activeChannelView === tab.id ? 'var(--shadow-subtle)' : 'none',
                      cursor: 'pointer',
                      transition: 'var(--motion-fast)',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render Proofs */}
          {generationError ? (
            <ErrorStateCard
              title="Unable to generate campaign proofs"
              message={generationError}
              onRetry={() => handleExecuteGeneration()}
              actionLabel="Retry Generation"
            />
          ) : generatedPack ? (
            <div>
              {activeChannelView === 'ALL' ? (
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
              ) : (
                <div style={{ maxWidth: '640px' }}>
                  <ChannelCard
                    channel={activeChannelView}
                    status="ready"
                    content={
                      activeChannelView === 'GOOGLE_BUSINESS'
                        ? (generatedPack.outputs.googleBusiness as unknown as Record<string, unknown>)
                        : activeChannelView === 'INSTAGRAM'
                          ? (generatedPack.outputs.instagram as unknown as Record<string, unknown>)
                          : activeChannelView === 'WHATSAPP'
                            ? (generatedPack.outputs.whatsapp as unknown as Record<string, unknown>)
                            : ((generatedPack.outputs.poster || {}) as unknown as Record<string, unknown>)
                    }
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-surface)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '8px' }}>
                Ready to Generate
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', maxWidth: '420px', margin: '0 auto' }}>
                Fill in your store details and offer to preview live Google, Instagram, WhatsApp, and in-store poster proofs.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
