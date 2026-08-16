import React, { useState } from 'react';
import { api } from '../lib/api';
import { CampaignType, FullCampaignPack } from '../types/campaign';
import { BusinessProfile } from '../types/business';
import { ChannelCard } from '../components/ChannelCard';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface FreeToolPageProps {
  navigate: (route: string) => void;
  onOpenAuthWithClaim?: (claimToken: string) => void;
}

export const FreeToolPage: React.FC<FreeToolPageProps> = ({ navigate, onOpenAuthWithClaim }) => {
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('Artisanal Cafe & Bakery');
  const [type, setType] = useState<CampaignType>('WEEKDAY_BOOST');
  const [offerTitle, setOfferTitle] = useState('');
  const [timing, setTiming] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPack, setGeneratedPack] = useState<FullCampaignPack | null>(null);
  const [claimToken, setClaimToken] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !offerTitle) return;

    setIsGenerating(true);
    try {
      const ephemeralProfile: BusinessProfile = {
        businessId: 'ephemeral',
        name,
        category,
        neighborhood: neighborhood || 'our neighborhood',
        city: city || 'our city',
        landmarks: '',
        targetCustomer: 'Local residents, professionals, and food lovers',
        styleVoice: 'Warm, contemporary, artisanal yet unpretentious',
        signatureItems: 'Signature specials and fresh offerings',
        primaryGoal: 'Increase foot traffic',
        peakHours: 'Morning and evening',
        slowHours: timing || 'Afternoons',
        defaultOffer: offerTitle,
        avgTicketINR: 350,
        targetMonthlyCustomers: 30,
        phoneWhatsApp: '',
        updatedAt: new Date().toISOString(),
      };

      const result = await api.generateAnonymousCampaign(
        {
          type,
          objective: 'MORE_WALK_INS',
          audience: 'Local neighborhood customers',
          offer: {
            title: offerTitle,
            description: offerTitle,
            value: offerTitle,
            terms: 'Valid during promotional window',
          },
          schedule: {
            startsAt: new Date().toISOString(),
            endsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
            timingLabel: timing || 'This week',
          },
        },
        ephemeralProfile
      );

      setGeneratedPack(result.pack);
      setClaimToken(result.claimToken);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 32px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="section-eyebrow">NO SIGNUP REQUIRED &bull; INSTANT PROOFS</span>
        <h1 className="section-title">Free Campaign Refiner</h1>
        <p className="section-subtitle" style={{ margin: '8px auto 0' }}>
          Enter your offer and neighborhood to generate a coordinated 4-channel campaign proof in real time.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '32px' }}>
        {/* Input Parameters Form */}
        <form onSubmit={handleGenerate} className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '16px' }}>
            Store Details
          </h3>

          <div className="form-group">
            <label className="form-label">Shop / Business Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Roasted Bean"
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
              placeholder="e.g. Artisanal Cafe & Bakery"
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

          <div className="form-group">
            <label className="form-label">Campaign Type</label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value as CampaignType)}
            >
              <option value="WEEKDAY_BOOST">Slow Weekday Afternoon Boost</option>
              <option value="WEEKEND_MAGNET">Weekend Crowd & Brunch Magnet</option>
              <option value="MENU_LAUNCH">New Menu or Dish Drop</option>
              <option value="FESTIVAL_SPECIAL">Festival or Holiday Special</option>
              <option value="REVIEW_SPOTLIGHT">Customer Review Spotlight</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Offer / Promotion Details</label>
            <input
              type="text"
              className="form-input"
              value={offerTitle}
              onChange={(e) => setOfferTitle(e.target.value)}
              placeholder="e.g. 20% off pour-overs & bakery pairings"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Timing / Validity Window</label>
            <input
              type="text"
              className="form-input"
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              placeholder="e.g. Mon-Thu from 3:00 PM to 6:00 PM"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isGenerating}>
            {isGenerating ? 'Generating Proofs...' : 'Generate 4 Campaign Proofs'}
          </button>
        </form>

        {/* 4-Channel Proofs */}
        <div>
          {!generatedPack ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', minHeight: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)', marginBottom: '8px' }}>
                Your Campaign Proof Sheet
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-muted)', maxWidth: '380px' }}>
                Fill in your shop name and current promotion on the left to produce your verified multi-channel copy.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Claim Banner */}
              <div style={{ padding: '16px 20px', background: 'var(--color-primary-faint)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} /> Campaign Generated & Ready to Claim
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--color-muted)', marginTop: '2px' }}>
                    Sign up to save this campaign to your permanent database vault.
                  </p>
                </div>
                <button
                  className="btn-primary"
                  style={{ fontSize: '13px', padding: '7px 14px' }}
                  onClick={() => {
                    if (claimToken && onOpenAuthWithClaim) {
                      onOpenAuthWithClaim(claimToken);
                    } else {
                      navigate('login');
                    }
                  }}
                >
                  Save to Vault &rarr;
                </button>
              </div>

              {/* 4 Channels */}
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
          )}
        </div>
      </div>
    </div>
  );
};
