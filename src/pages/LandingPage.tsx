import React, { useState } from 'react';
import { Sparkles, ArrowRight, Store, Check, Copy } from 'lucide-react';

interface LandingPageProps {
  navigate: (route: string) => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const [weeklyCampaigns, setWeeklyCampaigns] = useState<number>(3);
  const [avgTicket, setAvgTicket] = useState<number>(350);
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);

  const hoursSavedPerMonth = Math.round(weeklyCampaigns * 4 * 2.5);
  const estimatedRevenueGainINR = weeklyCampaigns * 4 * 12 * avgTicket;

  const handleCopySample = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChannel(id);
    setTimeout(() => setCopiedChannel(null), 2000);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-pill">
          <Store size={14} />
          <span>BUILT FOR CAFES, RESTAURANTS & NEIGHBORHOOD STORES</span>
        </div>

        <h1 className="hero-title">
          Turn one offer into <em>everything</em> your local customers need to see.
        </h1>

        <p className="hero-subtitle">
          StreetCraft converts a single business event or slow weekday into an integrated 4-channel campaign pack: Google Business post, Instagram caption & reel hook, WhatsApp broadcast, and printable in-store poster.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }} onClick={() => navigate('free-tool')}>
            <Sparkles size={16} /> Try Free Campaign Refiner
          </button>
          <button className="btn-secondary" style={{ padding: '14px 24px', fontSize: '15px' }} onClick={() => navigate('app/dashboard')}>
            Explore App Studio <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Comparison Widget */}
      <section className="comparison-section">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="section-eyebrow">LOCALIZED INTENT VS GENERIC AI</span>
          <h2 className="section-title">Why Generic AI Prompts Fail Local Businesses</h2>
          <p className="section-subtitle" style={{ margin: '8px auto 0' }}>
            StreetCraft injects verified neighborhood cues, character constraints, and dining behaviors directly into structured output schemas.
          </p>
        </div>

        <div className="comparison-grid">
          <div className="comp-card-bad">
            <span className="comp-label bad">Generic AI Output (Vague & Generic)</span>
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
                {copiedChannel === 'comp_good' ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                {copiedChannel === 'comp_good' ? 'Copied' : 'Copy'}
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
      <section style={{ padding: '60px 32px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span className="section-eyebrow">MEASURE THE IMPACT</span>
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
