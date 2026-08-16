import React, { useState } from 'react';
import { api } from '../lib/api';
import { CampaignType, FullCampaignPack } from '../types/campaign';
import { BusinessProfile } from '../types/business';
import { ChannelCard } from '../components/ChannelCard';
import { Store, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

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
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '48px 32px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="section-eyebrow">NO SIGNUP REQUIRED &bull; INSTANT GENERATION</span>
        <h1 className="section-title">Free Local Campaign Refiner</h1>
        <p className="section-subtitle" style={{ margin: '8px auto 0' }}>
          Enter your offer and neighborhood to generate a coordinated 4-channel pack in real time.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '32px' }}>
        {/* Input Parameters Form */}
        <form onSubmit={handleGenerate} className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={18} color="var(--accent-emerald)" /> Campaign Parameters
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
              <option value="WIN_BACK_REGULARS">Win-Back Inactive Regulars</option>
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
            {isGenerating ? 'Generating Pack...' : 'Generate 4-Channel Pack'} <Sparkles size={14} />
          </button>
        </form>

        {/* 4-Channel Live View */}
        <div>
          {!generatedPack ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', minHeight: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={32} color="var(--accent-emerald)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
                Enter Your Store & Offer
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '420px' }}>
                Fill in your shop name and current promotion in the left panel to produce your real 4-channel copy instantly.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Option B: Claim Banner */}
              <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #18221d 0%, #151a24 100%)', border: '1px solid var(--accent-emerald)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="var(--accent-emerald)" /> Campaign Generated & Ready to Claim
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Sign up to save this campaign to your permanent database vault and receive daily morning briefings.
                  </p>
                </div>
                <button
                  className="btn-primary"
                  style={{ fontSize: '13px', padding: '8px 16px' }}
                  onClick={() => {
                    if (claimToken && onOpenAuthWithClaim) {
                      onOpenAuthWithClaim(claimToken);
                    } else {
                      navigate('login');
                    }
                  }}
                >
                  Save to My Vault <ArrowRight size={14} />
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
