import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { FullCampaignPack, CampaignType } from '../types/campaign';
import { BusinessProfile } from '../types/business';
import { DatabasePlan } from '../types/billing';
import { ChannelCard } from '../components/ChannelCard';
import { ArrowRight, Store, Layers, Sparkles, Database, CheckCircle2, Clock, MapPin, Calendar, HelpCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Real-time Database State
  const [plans, setPlans] = useState<DatabasePlan[]>([]);
  const [festivals, setFestivals] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Real-time Campaign Engine State
  const [selectedCategory, setSelectedCategory] = useState('Specialty Cafe & Bakery');
  const [storeName, setStoreName] = useState('The Roasted Bean');
  const [neighborhood, setNeighborhood] = useState('Indiranagar');
  const [city, setCity] = useState('Bengaluru');
  const [landmarks, setLandmarks] = useState('Near 12th Main & Defence Colony Park');
  const [campaignType, setCampaignType] = useState<CampaignType>('WEEKDAY_BOOST');
  const [offerTitle, setOfferTitle] = useState('20% off single-origin pour-overs & fresh bakes');
  const [timingLabel, setTimingLabel] = useState('Monday–Thursday, 3:00 PM – 6:00 PM');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [livePack, setLivePack] = useState<FullCampaignPack | null>(null);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<'GOOGLE_BUSINESS' | 'INSTAGRAM' | 'WHATSAPP' | 'IN_STORE_POSTER'>('GOOGLE_BUSINESS');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Time & Day Radar
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDayStr, setCurrentDayStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      setCurrentDayStr(now.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Real-time Database Assets (Plans & Festival Calendar)
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.getPlans(),
      api.getFestivalCalendar(),
    ]).then(([plansData, festivalData]) => {
      if (isMounted) {
        setPlans(plansData);
        setFestivals(festivalData || []);
        setLoadingData(false);
      }
    }).catch(() => {
      if (isMounted) setLoadingData(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initial Real-time Generation
  const executeRealtimeGeneration = async (
    customType?: CampaignType,
    customOffer?: string,
    customStore?: string,
    customNeighborhood?: string
  ) => {
    setIsGenerating(true);
    try {
      const targetStore = customStore || storeName;
      const targetArea = customNeighborhood || neighborhood;
      const targetType = customType || campaignType;
      const targetOffer = customOffer || offerTitle;

      const liveProfile: BusinessProfile = {
        businessId: 'live_preview',
        name: targetStore,
        category: selectedCategory,
        neighborhood: targetArea,
        city,
        landmarks,
        targetCustomer: 'Working professionals, freelancers, and neighborhood residents',
        styleVoice: 'Warm, contemporary, artisanal yet unpretentious',
        signatureItems: 'Single-origin pour-overs, artisanal sourdough bakes',
        primaryGoal: 'Increase foot traffic and walk-ins',
        peakHours: '8:00 AM – 11:30 AM',
        slowHours: timingLabel,
        defaultOffer: targetOffer,
        avgTicketINR: 350,
        targetMonthlyCustomers: 40,
        phoneWhatsApp: '',
        updatedAt: new Date().toISOString(),
      };

      const result = await api.generateAnonymousCampaign(
        {
          type: targetType,
          objective: 'MORE_WALK_INS',
          audience: 'Local neighborhood residents and nearby office workers',
          offer: {
            title: targetOffer,
            description: targetOffer,
            value: 'Special Promotional Perk',
            terms: 'Flash message at counter to redeem.',
          },
          schedule: {
            startsAt: new Date().toISOString(),
            endsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
            timingLabel,
          },
        },
        liveProfile
      );

      setLivePack(result.pack);
      setClaimToken(result.claimToken);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run real-time generation on mount
  useEffect(() => {
    executeRealtimeGeneration();
  }, []);

  const handlePresetSelect = (preset: {
    category: string;
    store: string;
    neighborhood: string;
    type: CampaignType;
    offer: string;
    timing: string;
  }) => {
    setSelectedCategory(preset.category);
    setStoreName(preset.store);
    setNeighborhood(preset.neighborhood);
    setCampaignType(preset.type);
    setOfferTitle(preset.offer);
    setTimingLabel(preset.timing);
    executeRealtimeGeneration(preset.type, preset.offer, preset.store, preset.neighborhood);
  };

  const faqs = [
    {
      q: 'How does the Store Memory Engine actually work?',
      a: 'During setup, you enter your store location, closest neighborhood landmarks, signature items, and slow-hour windows. StreetCraft permanently retains this context. Every single generated promotion automatically incorporates these specific anchors without needing repetitive prompt writing.',
    },
    {
      q: 'What channels does StreetCraft support?',
      a: 'Every campaign generates 4 simultaneous, character-compliant proofs: Google Business Profile Updates (for Google Search & Maps Local Pack), Instagram (Reel hook + 3 Story frames + caption + local hashtags), WhatsApp Broadcasts (with bold formatting and counter flash redemption instructions), and printable In-Store Posters / Table Tent Cards.',
    },
    {
      q: 'Do I need design skills or marketing experience?',
      a: 'No. StreetCraft is engineered specifically for store owners and operators. You only need to pick an opportunity or enter your counter offer. StreetCraft structures the copy, formats character limits, and provides 1-click clipboard copy or text downloads.',
    },
    {
      q: 'How does StreetCraft differ from food delivery aggregator apps?',
      a: 'Delivery aggregator apps charge 25% to 30% commission on every order, and you never own your customer data. StreetCraft drives direct, in-person foot traffic to your physical counter. You keep 100% of your walk-in sales with zero commission fees.',
    },
    {
      q: 'What is included in the Free tier?',
      a: 'The Free tier gives you 3 complete 4-channel campaign packs every month, full access to Store Memory, and the Daily Opportunity Radar. No credit card is required to start.',
    },
  ];

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px 100px' }}>
      
      {/* Real-time Time & Context Ticker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', marginTop: '24px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--color-ink)' }}>
          <Clock size={14} color="var(--color-primary)" />
          <span><strong>Local Window:</strong> {currentDayStr} &bull; {currentTimeStr}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
          <span>DATABASE: LIVE</span>
          <span>4 CHANNELS: SYNCHRONIZED</span>
        </div>
      </div>

      {/* Editorial Hero Section */}
      <section style={{ padding: '56px 0 48px', textAlign: 'center' }}>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: '14px', fontWeight: 600 }}>
          STREETCRAFT &bull; REALTIME LOCAL MARKETING INSTRUMENT
        </span>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', color: 'var(--color-ink)', lineHeight: '1.15', maxWidth: '860px', margin: '0 auto 20px', letterSpacing: '-0.02em' }}>
          Turn a quiet Tuesday into a reason to visit.
        </h1>

        <p style={{ fontSize: '16.5px', color: 'var(--color-ink-muted)', lineHeight: '1.65', maxWidth: '660px', margin: '0 auto 32px' }}>
          Your slow hours are predictable. Your regulars are two blocks away. StreetCraft turns counter specials and neighborhood moments into real-time campaign proofs across Google, Instagram, WhatsApp, and your counter.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '12px 28px', fontSize: '14.5px' }} onClick={() => navigate('/free-tool')}>
            Try free campaign tool &rarr;
          </button>
          <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: '14.5px' }} onClick={() => navigate('/login')}>
            Sign in to store
          </button>
        </div>
      </section>

      {/* Real-time Interactive Campaign Engine Demo */}
      <section style={{ margin: '0 auto 80px' }}>
        <div className="card" style={{ padding: '36px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-eyebrow">LIVE ENGINE &bull; REALTIME GENERATION DEMO</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--color-ink)', marginTop: '2px' }}>
                Test the Multi-Channel Engine in Real Time
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
                Select a business scenario or customize parameters to run the live campaign generator.
              </p>
            </div>

            {/* Quick Scenario Preset Selectors */}
            <div style={{ display: 'flex', gap: '8px', background: 'var(--color-surface-raised)', padding: '4px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
              {[
                {
                  label: 'Indiranagar Cafe (Slow 3–6 PM)',
                  category: 'Specialty Cafe & Bakery',
                  store: 'The Roasted Bean',
                  neighborhood: 'Indiranagar',
                  type: 'WEEKDAY_BOOST' as CampaignType,
                  offer: '20% off single-origin pour-overs & fresh sourdough bakes',
                  timing: 'Monday–Thursday, 3:00 PM – 6:00 PM',
                },
                {
                  label: 'Bandra Bistro (Weekend Brunch)',
                  category: 'Artisanal Bistro & Dining',
                  store: 'Artisan Table',
                  neighborhood: 'Bandra West',
                  type: 'WEEKEND_MAGNET' as CampaignType,
                  offer: 'Limited Chef’s Weekend Tasting Menu & flat white pairing',
                  timing: 'Saturday & Sunday, 9:00 AM – 2:00 PM',
                },
                {
                  label: 'Chennai Sweets (Festival Hampers)',
                  category: 'Heritage Sweets & Savouries',
                  store: 'Heritage Sweets',
                  neighborhood: 'T. Nagar',
                  type: 'FESTIVAL_SPECIAL' as CampaignType,
                  offer: 'Handcrafted pure ghee festive gift hampers with advance booking',
                  timing: 'Festival Week Special Window',
                },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(p)}
                  style={{
                    padding: '7px 12px',
                    fontSize: '12px',
                    fontWeight: storeName === p.store ? 600 : 400,
                    color: storeName === p.store ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                    background: storeName === p.store ? 'var(--color-surface)' : 'transparent',
                    border: storeName === p.store ? '1px solid var(--color-border)' : '1px solid transparent',
                    borderRadius: 'var(--radius-xs)',
                    boxShadow: storeName === p.store ? 'var(--shadow-subtle)' : 'none',
                    transition: 'var(--motion-fast)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Parameter Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', background: 'var(--color-surface-raised)', padding: '16px 20px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', display: 'block', marginBottom: '4px' }}>STORE NAME</label>
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '13px' }}
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', display: 'block', marginBottom: '4px' }}>NEIGHBORHOOD</label>
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '13px' }}
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', display: 'block', marginBottom: '4px' }}>PROMOTION OFFER</label>
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '13px' }}
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '8px 14px', fontSize: '13px', justifyContent: 'center' }}
                disabled={isGenerating}
                onClick={() => executeRealtimeGeneration()}
              >
                {isGenerating ? <RefreshCw size={13} className="spin" /> : <RefreshCw size={13} />}
                {isGenerating ? 'Generating...' : 'Run Live Engine'}
              </button>
            </div>
          </div>

          {/* Channel Selector Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '12.5px', color: 'var(--color-ink)' }}>
              <strong>Real-time Proof Output:</strong> <span style={{ color: 'var(--color-ink-muted)' }}>{storeName} &bull; {neighborhood}</span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'GOOGLE_BUSINESS', label: 'Google Business' },
                { id: 'INSTAGRAM', label: 'Instagram' },
                { id: 'WHATSAPP', label: 'WhatsApp' },
                { id: 'IN_STORE_POSTER', label: 'In-Store Poster' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveChannel(tab.id as any)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '12px',
                    fontWeight: activeChannel === tab.id ? 600 : 400,
                    color: activeChannel === tab.id ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                    background: activeChannel === tab.id ? 'var(--color-surface-raised)' : 'transparent',
                    border: activeChannel === tab.id ? '1px solid var(--color-border)' : '1px solid transparent',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Live Proof Render */}
          {livePack && (
            <div>
              <ChannelCard
                channel={activeChannel}
                status="ready"
                content={
                  activeChannel === 'GOOGLE_BUSINESS'
                    ? (livePack.outputs.googleBusiness as unknown as Record<string, unknown>)
                    : activeChannel === 'INSTAGRAM'
                    ? (livePack.outputs.instagram as unknown as Record<string, unknown>)
                    : activeChannel === 'WHATSAPP'
                    ? (livePack.outputs.whatsapp as unknown as Record<string, unknown>)
                    : ((livePack.outputs.poster || {}) as unknown as Record<string, unknown>)
                }
              />

              {claimToken && (
                <div style={{ marginTop: '20px', padding: '14px 18px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--color-ink)' }}>
                    <CheckCircle2 size={15} color="var(--color-primary)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                    This live campaign is generated and ready to be claimed into your permanent store vault.
                  </div>
                  <button
                    className="btn-primary"
                    style={{ fontSize: '12.5px', padding: '6px 14px' }}
                    onClick={() => navigate('/login')}
                  >
                    Save to Store Memory &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Real-time Festival Calendar Feed */}
      {festivals.length > 0 && (
        <section style={{ margin: '0 auto 80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span className="section-eyebrow">REALTIME EVENT RADAR</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-ink)' }}>
              Upcoming Local Calendar Triggers
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
              StreetCraft monitors regional events and festive seasons to prepare high-converting counter offers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {festivals.slice(0, 3).map((f) => (
              <div key={f.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600 }}>
                    {new Date(f.starts_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                  <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                    OPPORTUNITY
                  </span>
                </div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', marginBottom: '6px' }}>
                  {f.name}
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5', marginBottom: '12px' }}>
                  {f.marketing_relevance}
                </p>
                <div style={{ fontSize: '12px', background: 'var(--color-surface-raised)', padding: '8px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', color: 'var(--color-ink)' }}>
                  <strong>Suggested Drop:</strong> {f.suggested_offer}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Live Plans from Database */}
      <section style={{ margin: '0 auto 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="section-eyebrow">STRAIGHTFORWARD RATES</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-ink)' }}>
            Transparent Plans for Local Storefronts
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
            No commissions, no agency lock-in contracts.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {plans.map((p) => {
            const isPro = p.id === 'PRO';
            return (
              <div
                key={p.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isPro ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: isPro ? 'var(--color-surface-raised)' : 'var(--color-surface)',
                  position: 'relative',
                  padding: '28px',
                }}
              >
                <div>
                  {isPro && (
                    <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary)', color: '#FFFFFF', fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 600, padding: '2px 10px', borderRadius: 'var(--radius-xs)', textTransform: 'uppercase' }}>
                      MOST POPULAR
                    </div>
                  )}
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginTop: isPro ? '4px' : 0 }}>
                    {p.name}
                  </h3>
                  <div style={{ fontSize: '32px', fontFamily: 'var(--font-display)', color: 'var(--color-ink)', margin: '12px 0 4px' }}>
                    ₹{p.monthly_inr}
                    <span style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--color-ink-muted)' }}> / month</span>
                  </div>
                  <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', marginBottom: '20px' }}>
                    {p.monthly_pack_limit} campaign packs / month
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                    {p.features.map((feat, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--color-ink-soft)' }}>
                        <CheckCircle2 size={13} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className={isPro ? 'btn-primary' : 'btn-secondary'}
                  style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}
                  onClick={() => navigate(p.monthly_inr === 0 ? '/free-tool' : '/login')}
                >
                  {p.monthly_inr === 0 ? 'Start Free' : `Select ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Operator FAQ Accordion */}
      <section style={{ maxWidth: '820px', margin: '0 auto 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="section-eyebrow">COMMON QUESTIONS</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-ink)' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="card"
                style={{ padding: '18px 22px', cursor: 'pointer' }}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)' }}>
                    {item.q}
                  </h3>
                  {isOpen ? <ChevronUp size={16} color="var(--color-primary)" /> : <ChevronDown size={16} color="var(--color-ink-muted)" />}
                </div>
                {isOpen && (
                  <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', marginTop: '12px', lineHeight: '1.6', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-ink)', marginBottom: '10px' }}>
          Ready to turn slow hours into walk-in foot traffic?
        </h2>
        <p style={{ fontSize: '14.5px', color: 'var(--color-ink-muted)', maxWidth: '520px', margin: '0 auto 24px', lineHeight: '1.5' }}>
          Try the free tool without creating an account, or sign up to begin building your store memory.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }} onClick={() => navigate('/free-tool')}>
            Generate Free Campaign Pack &rarr;
          </button>
          <button className="btn-secondary" style={{ padding: '12px 20px', fontSize: '14px' }} onClick={() => navigate('/login')}>
            Sign In to Store
          </button>
        </div>
      </section>

    </div>
  );
};
