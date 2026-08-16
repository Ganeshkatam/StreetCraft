import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Layers, Zap } from 'lucide-react';
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
      <section className="hero-section">
        <span className="hero-eyebrow">
          LOCAL BUSINESS MARKETING INSTRUMENT
        </span>

        <h1 className="hero-headline">
          Turn one local moment into a reason to visit.
        </h1>

        <p className="hero-description">
          Your Tuesday afternoon is quiet. Your customers don't have to know that. StreetCraft turns your slow hours and counter specials into coordinated campaign proofs across Google, Instagram, WhatsApp, and in-store.
        </p>

        <div className="hero-cta-group">
          <button className="btn-primary" style={{ padding: '12px 28px', fontSize: '14.5px' }} onClick={() => navigate('/free-tool')}>
            Try free tool &rarr;
          </button>
          <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: '14.5px' }} onClick={() => navigate('/login')}>
            Sign in
          </button>
        </div>
      </section>

      {/* Interactive Multi-Channel Proof Engine */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 80px', padding: '0 var(--space-6)' }}>
        <div className="card" style={{ padding: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-eyebrow">CAMPAIGN PROOF &bull; PROMOTION 004</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-ink)' }}>
                The Roasted Bean &bull; Indiranagar, Bengaluru
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)' }}>
                Targeting: Weekday 3–6 PM Slow Hours &bull; Offer: 20% Off Pour-Overs
              </p>
            </div>

            {/* Platform Selector Buttons */}
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

      {/* Feature Compositions */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto 80px', padding: '0 var(--space-6)' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Store size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-ink)' }}>Store Memory Engine</h3>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
            Persistent store context, micro-neighborhood landmarks, signature items, and slow-hour windows are injected into every promotion.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Layers size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-ink)' }}>Multi-Channel in 1 Click</h3>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
            Generates compliant character-limited copy for Google Business, Instagram Reels, WhatsApp Broadcasts, and table tent cards simultaneously.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Zap size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-ink)' }}>Daily Opportunity Radar</h3>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
            Timezone-aware briefing engine monitors your slow time-slots, upcoming festivals, and weekend rushes to recommend high-impact drops.
          </p>
        </div>
      </section>
    </div>
  );
};
