import React, { useState } from 'react';
import { ArrowRight, Sparkles, Zap, MapPin, CheckCircle2, Store, MessageSquare, Globe, Layers } from 'lucide-react';
import { ChannelCard } from '../components/ChannelCard';

interface LandingPageProps {
  navigate: (route: string) => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate, onOpenAuth }) => {
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
      {/* Modern Hero Section */}
      <section className="hero-section">
        <div className="hero-pill-badge">
          <Sparkles size={14} color="var(--accent-emerald)" />
          <span>The Modern AI Content Studio for <strong>Local Businesses</strong></span>
        </div>

        <h1 className="hero-headline">
          Turn One Local Moment Into <br />
          <span className="hero-gradient-text">High-Converting Campaigns</span>
        </h1>

        <p className="hero-description">
          Generate perfectly formatted, neighborhood-anchored promotions across Google Business, Instagram Reels & Stories, WhatsApp Broadcasts, and Table QR Cards in seconds.
        </p>

        <div className="hero-cta-group">
          <button className="btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }} onClick={() => navigate('free-tool')}>
            Try Free Generator <ArrowRight size={16} />
          </button>
          <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: '15px' }} onClick={onOpenAuth}>
            Sign In to Studio
          </button>
        </div>
      </section>

      {/* Interactive Multi-Channel Proof Engine */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 80px', padding: '0 24px' }}>
        <div className="card" style={{ padding: '36px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-eyebrow">LIVE INTERACTIVE PROOF</span>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>
                The Roasted Bean &bull; Indiranagar, Bengaluru
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                Targeting: Weekday 3–6 PM Slow Hours &bull; Offer: 20% Off Pour-Overs
              </p>
            </div>

            {/* Platform Selector Buttons */}
            <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-input)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              {[
                { id: 'google', label: 'Google Business' },
                { id: 'instagram', label: 'Instagram' },
                { id: 'whatsapp', label: 'WhatsApp' },
                { id: 'poster', label: 'In-Store QR' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '12.5px',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                    background: activeTab === tab.id ? 'var(--bg-surface-elevated)' : 'transparent',
                    border: activeTab === tab.id ? '1px solid var(--border-medium)' : '1px solid transparent',
                    transition: 'var(--transition-fast)',
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

      {/* Feature Grid */}
      <section className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon-wrapper" style={{ background: 'var(--accent-emerald-subtle)', color: 'var(--accent-emerald)' }}>
            <Store size={22} />
          </div>
          <h3 className="feature-title">Store Memory Engine</h3>
          <p className="feature-desc">
            Persistent store context, micro-neighborhood landmarks, signature items, and slow-hour windows are baked into every campaign.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper" style={{ background: 'var(--accent-indigo-subtle)', color: 'var(--accent-indigo)' }}>
            <Layers size={22} />
          </div>
          <h3 className="feature-title">Multi-Channel In 1 Click</h3>
          <p className="feature-desc">
            Generates compliant character-limited copy for Google Business, Instagram Reels, WhatsApp Broadcasts, and In-Store Table Cards simultaneously.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper" style={{ background: 'var(--accent-sky-subtle)', color: 'var(--accent-sky)' }}>
            <Zap size={22} />
          </div>
          <h3 className="feature-title">Daily Opportunity Radar</h3>
          <p className="feature-desc">
            Realtime briefing engine monitors your slow time-slots, upcoming festivals, and weekend rushes to recommend high-impact drops.
          </p>
        </div>
      </section>
    </div>
  );
};
