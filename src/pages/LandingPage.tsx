import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Store, Layers, Zap, Clock, ShieldCheck, Check } from 'lucide-react';
import { ChannelCard } from '../components/ChannelCard';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'google' | 'instagram' | 'whatsapp' | 'poster'>('google');

  const sampleProofs = {
    google: {
      headline: 'Beat the 3:30 PM Slump in Indiranagar | The Roasted Bean',
      body: 'Need an afternoon energy boost? Enjoy 20% off all single-origin pour-overs paired with warm sourdough pastries between 3:00 PM and 6:00 PM (Mon–Thu) at 12th Main, Indiranagar.',
      ctaType: 'Visit Us',
      offerSummary: '20% Off Pour-Overs & Pastries (3–6 PM)',
    },
    instagram: {
      reelHook: 'POV: Finding the quietest coffee corner in Indiranagar at 3:30 PM',
      storyFrames: [
        '3:30 PM slump hitting hard?',
        'Fresh single-origin roast just brewed at 12th Main',
        '20% off pour-overs + sourdough bakes today (3–6 PM)',
      ],
      caption: 'The afternoon slump is real, but so is our fresh single-origin brew. Drop by between 3–6 PM for 20% off your pour-over when paired with any artisanal bake. Table by the window is ready for you.',
      localTags: ['#IndiranagarEats', '#BangaloreCafes', '#IndiranagarCoffee', '#BangaloreFoodies', '#BengaluruAfternoon'],
    },
    whatsapp: {
      broadcastMessage: `*Afternoon Perk at The Roasted Bean, Indiranagar*\n\nHey neighbor! Beat the 3:30 PM slump with *20% off* all single-origin pour-overs and artisanal sourdough bakes today between *3:00 PM – 6:00 PM*.\n\n📍 12th Main, Indiranagar (near Defence Colony Playground)\n⚡ Flash this message at counter to redeem!`,
      cta: 'Show message at counter',
    },
    poster: {
      headline: 'AFTERNOON FOCUS HOURS',
      subheading: '20% Off Specialty Pour-Overs & Bakes',
      body: 'Recharge your afternoon with freshly roasted single-origin coffees and warm sourdough pastries.',
      cta: 'Scan to view today’s single-origin origins',
    },
  };

  return (
    <div>
      {/* Editorial Hero Section */}
      <section className="hero-section" style={{ padding: '64px 24px 72px' }}>
        <span className="hero-eyebrow">
          STREETCRAFT &bull; LOCAL BUSINESS MARKETING INSTRUMENT
        </span>

        <h1 className="hero-headline" style={{ maxWidth: '880px', fontSize: '46px', lineHeight: '1.15', marginBottom: '20px' }}>
          Turn a quiet Tuesday into a reason to visit.
        </h1>

        <p className="hero-description" style={{ maxWidth: '640px', fontSize: '16.5px', lineHeight: '1.65', marginBottom: '32px' }}>
          Your afternoon is slow. Your regulars are two blocks away. StreetCraft turns counter specials and neighborhood moments into coordinated campaign proofs across Google, Instagram, WhatsApp, and your counter.
        </p>

        <div className="hero-cta-group">
          <button className="btn-primary" style={{ padding: '12px 28px', fontSize: '14.5px' }} onClick={() => navigate('/free-tool')}>
            Try free campaign tool &rarr;
          </button>
          <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: '14.5px' }} onClick={() => navigate('/login')}>
            Sign in to store
          </button>
        </div>
      </section>

      {/* The Local Marketing Contrast */}
      <section style={{ maxWidth: '1040px', margin: '0 auto 72px', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ background: 'var(--color-surface-raised)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-danger)', fontWeight: 600, textTransform: 'uppercase' }}>
              THE DELIVERY APPS
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', margin: '8px 0 6px' }}>
              30% commission on regulars
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>
              Delivery aggregators charge steep margins on customers who live within walking distance of your counter.
            </p>
          </div>

          <div className="card" style={{ background: 'var(--color-surface-raised)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              THE MARKETING AGENCIES
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', margin: '8px 0 6px' }}>
              ₹40,000/mo retainers
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>
              Social agencies post generic stock graphics that look disconnected from your real counter specials.
            </p>
          </div>

          <div className="card" style={{ border: '2px solid var(--color-primary)', background: 'var(--color-surface)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase' }}>
              STREETCRAFT
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', margin: '8px 0 6px' }}>
              100% of walk-in sales
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>
              Drop coordinated local campaigns in 60 seconds. Drive direct counter walk-ins with zero commissions.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Multi-Channel Proof Suite */}
      <section style={{ maxWidth: '1040px', margin: '0 auto 80px', padding: '0 24px' }}>
        <div className="card" style={{ padding: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-eyebrow">COORDINATED PROOFS &bull; REAL PROMOTION EXAMPLE</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-ink)' }}>
                The Roasted Bean &bull; Indiranagar, Bengaluru
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)' }}>
                Targeting: Weekday 3:00–6:00 PM &bull; Offer: 20% Off Pour-Overs
              </p>
            </div>

            {/* Platform Selector Tabs */}
            <div style={{ display: 'flex', gap: '6px', background: 'var(--color-surface-raised)', padding: '4px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              {[
                { id: 'google', label: 'Google Business' },
                { id: 'instagram', label: 'Instagram' },
                { id: 'whatsapp', label: 'WhatsApp' },
                { id: 'poster', label: 'In-Store Poster' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '12.5px',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    color: activeTab === tab.id ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                    background: activeTab === tab.id ? 'var(--color-surface)' : 'transparent',
                    border: activeTab === tab.id ? '1px solid var(--color-border)' : '1px solid transparent',
                    boxShadow: activeTab === tab.id ? 'var(--shadow-subtle)' : 'none',
                    transition: 'var(--motion-fast)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'google' && (
            <ChannelCard
              channel="GOOGLE_BUSINESS"
              status="ready"
              content={sampleProofs.google}
            />
          )}

          {activeTab === 'instagram' && (
            <ChannelCard
              channel="INSTAGRAM"
              status="ready"
              content={sampleProofs.instagram}
            />
          )}

          {activeTab === 'whatsapp' && (
            <ChannelCard
              channel="WHATSAPP"
              status="ready"
              content={sampleProofs.whatsapp}
            />
          )}

          {activeTab === 'poster' && (
            <ChannelCard
              channel="IN_STORE_POSTER"
              status="ready"
              content={sampleProofs.poster}
            />
          )}
        </div>
      </section>

      {/* The 3-Step Store Rhythm */}
      <section style={{ maxWidth: '1040px', margin: '0 auto 96px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-eyebrow">HOW IT WORKS</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-ink)' }}>
            The 3-Step Store Rhythm
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="card">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-primary)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              01
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '8px' }}>
              Store Memory
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              StreetCraft remembers your neighborhood landmarks, signature items, and slow 3–6 PM windows so you never have to re-explain your store context.
            </p>
          </div>

          <div className="card">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-primary)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              02
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '8px' }}>
              Coordinated Proofs
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              Generates compliant, character-limited copy for Google Maps Updates, Instagram Reels & Stories, WhatsApp Broadcasts, and printable QR cards simultaneously.
            </p>
          </div>

          <div className="card">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-primary)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              03
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '8px' }}>
              Direct Walk-ins
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              Customers flash the message at your counter or scan the table tent card. No aggregator fees, no third-party cuts.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <button className="btn-primary" style={{ padding: '12px 28px', fontSize: '14.5px' }} onClick={() => navigate('/free-tool')}>
            Start your first promotion &rarr;
          </button>
        </div>
      </section>
    </div>
  );
};
