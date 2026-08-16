import React, { useState } from 'react';
import { Sparkles, ArrowRight, Store, Check, Copy, TrendingUp, ShieldCheck, MapPin, Zap, MessageSquare, Newspaper, Image, Send } from 'lucide-react';

interface LandingPageProps {
  navigate: (route: string) => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const [weeklyCampaigns, setWeeklyCampaigns] = useState<number>(3);
  const [avgTicket, setAvgTicket] = useState<number>(350);
  const [activeChannelTab, setActiveChannelTab] = useState<'GOOGLE' | 'INSTAGRAM' | 'WHATSAPP' | 'POSTER'>('GOOGLE');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const hoursSavedPerMonth = Math.round(weeklyCampaigns * 4 * 2.5);
  const estimatedRevenueGainINR = weeklyCampaigns * 4 * 12 * avgTicket;

  const handleCopySample = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const channelSamples = {
    GOOGLE: {
      title: 'Google Business Profile Post',
      badge: 'Local Search & Maps',
      headline: 'Afternoon Pour-Over Special in Indiranagar',
      body: 'Beat the afternoon slump at The Roasted Bean. Enjoy 20% off all freshly brewed single-origin pour-overs paired with warm artisanal bakes near 12th Main (3 PM - 6 PM, Mon-Thu). Fast Wi-Fi and power outlets ready.',
      cta: 'Visit Us',
      tag: 'Rank in Local Pack',
    },
    INSTAGRAM: {
      title: 'Instagram Caption & Hook',
      badge: 'Visual Discovery & Reels',
      headline: '"Your 3:30 PM coffee run just found its new home."',
      body: 'Unwind this weekday afternoon at The Roasted Bean in Indiranagar. Single-origin roasts, quiet corner tables, and warm cinnamon rolls fresh from our oven.\n\nTag your work buddy who needs a change of scenery today.',
      cta: '#IndiranagarCafe #BangaloreCoffee #BengaluruEats',
      tag: '0:03 Hook + Tags',
    },
    WHATSAPP: {
      title: 'WhatsApp Broadcast Message',
      badge: 'Direct Customer VIP Push',
      headline: 'VIP Community Update',
      body: 'Hi from The Roasted Bean! Beat the afternoon slump with our weekday perk: 20% off all specialty pour-overs & fresh bakery bakes from 3:00 PM to 6:00 PM (Mon-Thu).\n\nShow this text at the counter to redeem. See you soon!',
      cta: 'Show message at counter',
      tag: '98% Open Rate',
    },
    POSTER: {
      title: 'In-Store Table Tent & Poster',
      badge: 'Point-of-Sale Upsell',
      headline: 'AFTERNOON FOCUS HOUR / 3 PM - 6 PM',
      body: 'Pair any signature single-origin brew with fresh artisanal bakes for 20% off.\n\nAsk our barista at the counter to redeem.',
      cta: 'Dine-In Promotion',
      tag: 'A5 Counter Ready',
    },
  };

  const currentSample = channelSamples[activeChannelTab];

  return (
    <div>
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-pill">
          <Store size={14} />
          <span>BUILT FOR HIGH-STREET CAFES, RESTAURANTS & NEIGHBORHOOD STORES</span>
        </div>

        <h1 className="hero-title">
          Turn one offer into <em>everything</em> your local customers need to see.
        </h1>

        <p className="hero-subtitle">
          StreetCraft converts a single business event or slow weekday into an integrated 4-channel campaign pack: Google Business post, Instagram caption & reel hook, WhatsApp broadcast, and printable in-store poster.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" style={{ padding: '15px 32px', fontSize: '15px' }} onClick={() => navigate('free-tool')}>
            <Sparkles size={16} /> Try Free Campaign Refiner
          </button>
          <button className="btn-secondary" style={{ padding: '15px 26px', fontSize: '15px' }} onClick={() => navigate('app/dashboard')}>
            Explore App Studio <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 4-Channel Live Interactive Studio Preview */}
      <section style={{ maxWidth: '1080px', margin: '0 auto 60px', padding: '0 24px' }}>
        <div style={{ background: 'var(--bg-surface-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xl)', padding: '36px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-eyebrow">COORDINATED 4-CHANNEL PACK</span>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Live Pack Preview: "Afternoon Focus Hour"
              </h3>
            </div>

            {/* Segmented Channel Switcher */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
              {[
                { key: 'GOOGLE', label: 'Google Business', icon: <Newspaper size={13} /> },
                { key: 'INSTAGRAM', label: 'Instagram', icon: <Image size={13} /> },
                { key: 'WHATSAPP', label: 'WhatsApp', icon: <MessageSquare size={13} /> },
                { key: 'POSTER', label: 'In-Store Poster', icon: <Send size={13} /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveChannelTab(tab.key as any)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: activeChannelTab === tab.key ? '#ffffff' : 'var(--text-secondary)',
                    background: activeChannelTab === tab.key ? 'var(--bg-surface-elevated)' : 'transparent',
                    border: activeChannelTab === tab.key ? '1px solid var(--accent-emerald)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Preview Showcase */}
          <div style={{ background: 'rgba(14, 17, 24, 0.95)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '28px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-emerald)', background: 'var(--accent-emerald-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
                  {currentSample.badge}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentSample.title}
                </span>
              </div>

              <button
                className="btn-ghost"
                style={{ fontSize: '12px' }}
                onClick={() => handleCopySample(`${currentSample.headline}\n\n${currentSample.body}`, 'preview_sample')}
              >
                {copiedId === 'preview_sample' ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                {copiedId === 'preview_sample' ? 'Copied' : 'Copy Sample'}
              </button>
            </div>

            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
              {currentSample.headline}
            </div>

            <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
              {currentSample.body}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                <strong>Formatted for:</strong> {currentSample.tag}
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
                Zod Schema Validated
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Widget */}
      <section className="comparison-section">
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="section-eyebrow">LOCALIZED INTENT VS GENERIC AI</span>
          <h2 className="section-title">Why Generic Prompts Fail Local Businesses</h2>
          <p className="section-subtitle" style={{ margin: '8px auto 0' }}>
            StreetCraft injects verified neighborhood landmarks, character constraints, and dining behaviors directly into structured output schemas.
          </p>
        </div>

        <div className="comparison-grid">
          <div className="comp-card-bad">
            <span className="comp-label bad">Generic AI Output (Vague & Fluffy)</span>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {`"Hey foodies! Looking for a delicious coffee and yummy snacks? Come on down to our lovely cafe today and enjoy our amazing special discounts on all items! Don't miss out on this fantastic treat. See you all soon! #foodie #cafe #coffee #delicious #yum"`}
            </div>
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(244,63,94,0.2)', fontSize: '12px', color: 'var(--accent-rose)' }}>
              Lacks neighborhood landmarks, specific time-bound window, structured call-to-action, or channel formatting.
            </div>
          </div>

          <div className="comp-card-good">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="comp-label good">StreetCraft Coordinated Pack (Indiranagar Cafe)</span>
              <button
                className="btn-ghost"
                style={{ fontSize: '11px', padding: '2px 8px' }}
                onClick={() =>
                  handleCopySample(
                    'Beat the 3:30 PM slump in Indiranagar. 20% off specialty pour-overs & bakes at The Roasted Bean near 12th Main.',
                    'comp_good'
                  )
                }
              >
                {copiedId === 'comp_good' ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                {copiedId === 'comp_good' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {`GOOGLE BUSINESS: Beat the afternoon slump in Indiranagar at The Roasted Bean. Enjoy 20% off all freshly brewed single-origin pour-overs paired with warm artisanal bakes near 12th Main (3 PM - 6 PM, Mon-Thu). Fast Wi-Fi and power outlets ready.\n\nINSTAGRAM: Your 3:30 PM coffee run just found its new home. Tag your work buddy who needs a quiet Indiranagar workspace.`}
            </div>
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(16,185,129,0.2)', fontSize: '12px', color: 'var(--accent-emerald)' }}>
              Includes local landmark, exact slow-hour window (3 PM - 6 PM), validated character limits, and actionable copy.
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section style={{ padding: '70px 32px', background: 'var(--bg-surface-glass)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="section-eyebrow">MEASURE THE REVENUE IMPACT</span>
            <h2 className="section-title">ROI & Time-Saved Calculator</h2>
            <p className="section-subtitle" style={{ margin: '8px auto 0' }}>
              See how many hours and estimated walk-in revenue StreetCraft unlocks for your location.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '36px', alignItems: 'center' }}>
            <div className="card">
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="form-label">Weekly Campaign Drops</label>
                  <span style={{ fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                    {weeklyCampaigns} packs / week
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  step="1"
                  value={weeklyCampaigns}
                  onChange={(e) => setWeeklyCampaigns(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="form-label">Average Customer Ticket Size (INR)</label>
                  <span style={{ fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                    ₹{avgTicket}
                  </span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="1500"
                  step="50"
                  value={avgTicket}
                  onChange={(e) => setAvgTicket(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
                <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>ESTIMATED TIME SAVED / MONTH</small>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {hoursSavedPerMonth} hours
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Replaces manual drafting across 4 separate marketing channels
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--accent-indigo)' }}>
                <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>ESTIMATED MONTHLY WALK-IN VALUE</small>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                  ₹{estimatedRevenueGainINR.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Based on ~12 incremental walk-ins generated per campaign drop
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
