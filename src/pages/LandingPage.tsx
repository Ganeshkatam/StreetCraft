import React, { useState } from 'react';
import { ArrowRight, Copy, Check } from 'lucide-react';

interface LandingPageProps {
  navigate: (route: string) => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<'google' | 'instagram' | 'whatsapp' | 'poster'>('google');
  const [copied, setCopied] = useState(false);

  const proofOutputs = {
    google: {
      channel: 'Google Business Profile',
      meta: 'Local Search & Maps update',
      content:
        'Beat the afternoon slump in Indiranagar. Enjoy 20% off all specialty single-origin pour-overs paired with warm artisanal bakes near 12th Main (3 PM - 6 PM, Mon-Thu). Fast Wi-Fi and quiet window tables ready.',
      action: 'Action: Visit Us',
    },
    instagram: {
      channel: 'Instagram Post & Story',
      meta: 'Visual feed + 0:03 reel hook',
      content:
        'Your 3:30 PM coffee run just found its new home.\n\nWe are serving freshly brewed single-origin roasts and warm sourdough bakes all afternoon in Indiranagar. Tag your work buddy who needs a quiet workspace today.\n\n#IndiranagarCafe #BengaluruCoffee #BangaloreEats',
      action: 'Hook: "Weekday afternoons shouldn\'t be quiet."',
    },
    whatsapp: {
      channel: 'WhatsApp Broadcast',
      meta: 'VIP regular customer push',
      content:
        'Hi from The Roasted Bean! Make your weekday afternoon unhurried with our neighborhood perk: 20% off all specialty pour-overs & fresh bakes from 3:00 PM to 6:00 PM (Mon-Thu).\n\nShow this message at the counter to redeem. See you soon!',
      action: 'Redemption: Show text at counter',
    },
    poster: {
      channel: 'In-Store Table Tent',
      meta: 'Point-of-sale printed card',
      content:
        'AFTERNOON FOCUS HOUR / 3 PM – 6 PM\n\nPair any signature pour-over with fresh artisanal bakery bakes for 20% off.\n\nAsk our barista at the counter to redeem.',
      action: 'Format: A5 Table Card',
    },
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Editorial Hero Section */}
      <section className="editorial-hero">
        <span className="editorial-eyebrow">A MARKETING TOOL FOR INDEPENDENT STORES</span>
        
        <h1 className="editorial-headline">
          Turn one local moment<br />into a reason to visit.
        </h1>

        <p className="editorial-lead">
          Your Tuesday afternoon is quiet. Your customers don't have to know that. StreetCraft turns a single store event into a coordinated campaign pack across Google, Instagram, WhatsApp, and your counter.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center' }}>
          <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '14.5px' }} onClick={() => navigate('free-tool')}>
            Create a promotion &rarr;
          </button>
          <button className="btn-secondary" style={{ padding: '11px 20px', fontSize: '14px' }} onClick={() => navigate('pricing')}>
            View plans
          </button>
        </div>
      </section>

      {/* Real Local Photography */}
      <section className="photo-grid">
        <div className="photo-card" style={{ height: '320px' }}>
          <img
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80"
            alt="Artisanal cafe counter and warm interior"
          />
          <div className="photo-caption">The Roasted Bean &bull; Indiranagar, Bengaluru</div>
        </div>

        <div className="photo-card" style={{ height: '320px' }}>
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80"
            alt="Fresh pour-over coffee brewing"
          />
          <div className="photo-caption">Single-origin pour-overs</div>
        </div>

        <div className="photo-card" style={{ height: '320px' }}>
          <img
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80"
            alt="Neighborhood cafe seating area"
          />
          <div className="photo-caption">Quiet afternoon tables</div>
        </div>

        <div className="photo-card" style={{ height: '320px' }}>
          <img
            src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"
            alt="Warm artisanal bakes and sourdough pastries"
          />
          <div className="photo-caption">Fresh bakery counter</div>
        </div>
      </section>

      {/* Physical Campaign Proof Card */}
      <section style={{ padding: '0 32px' }}>
        <div className="proof-sheet">
          <div className="proof-header">
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              CAMPAIGN PROOF &bull; PROMOTION 004
            </span>
            <h2 className="proof-store-title" style={{ marginTop: '8px' }}>
              The Roasted Bean
            </h2>
            <div className="proof-store-loc">
              Indiranagar, Bengaluru &bull; Weekday Afternoon Campaign
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', color: 'var(--color-ink)', marginTop: '12px' }}>
              "Coffee + bakery bake, together for ₹299."
            </p>
          </div>

          {/* Channel Selector */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-editorial)', paddingBottom: '16px' }}>
            {[
              { id: 'google', label: 'Google Business' },
              { id: 'instagram', label: 'Instagram' },
              { id: 'whatsapp', label: 'WhatsApp' },
              { id: 'poster', label: 'In-Store Poster' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: activeTab === t.id ? 600 : 400,
                  color: activeTab === t.id ? 'var(--color-ink)' : 'var(--color-muted)',
                  background: activeTab === t.id ? 'var(--bg-paper-dark)' : 'transparent',
                  border: activeTab === t.id ? '1px solid var(--border-dark)' : '1px solid transparent',
                  transition: 'var(--transition-fast)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Proof Body */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-editorial)', borderRadius: 'var(--radius-xs)', padding: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid var(--border-editorial)' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)' }}>
                  {proofOutputs[activeTab].channel}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-muted)', marginLeft: '8px', fontFamily: 'var(--font-mono)' }}>
                  {proofOutputs[activeTab].meta}
                </span>
              </div>

              <button
                className="btn-ghost"
                style={{ fontSize: '12px' }}
                onClick={() => handleCopy(proofOutputs[activeTab].content)}
              >
                {copied ? <Check size={12} color="var(--color-primary)" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div style={{ fontSize: '14.5px', color: 'var(--color-ink)', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
              {proofOutputs[activeTab].content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', paddingTop: '10px', borderTop: '1px solid var(--border-editorial)' }}>
              <span>{proofOutputs[activeTab].action}</span>
              <span style={{ color: 'var(--color-primary)' }}>Character limit verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Comparison */}
      <section style={{ maxWidth: '880px', margin: '0 auto 80px', padding: '0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="editorial-eyebrow">THE DIFFERENCE</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-ink)' }}>
            Why generic AI prompts sound wrong for local stores
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-editorial)', padding: '24px', borderRadius: 'var(--radius-xs)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-terracotta)', display: 'block', marginBottom: '8px' }}>
              GENERIC AI OUTPUT
            </span>
            <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', lineHeight: '1.6', fontStyle: 'italic' }}>
              "Hey foodies! Looking for a delicious coffee and yummy snacks? Come on down to our cafe today for amazing discounts on all items! #foodie #yummy #coffee"
            </p>
            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-editorial)', fontSize: '11.5px', color: 'var(--color-subtle)' }}>
              Lacks neighborhood landmarks, specific hours, and authentic voice.
            </div>
          </div>

          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--color-primary)', padding: '24px', borderRadius: 'var(--radius-xs)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', display: 'block', marginBottom: '8px' }}>
              STREETCRAFT PROOF
            </span>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink)', lineHeight: '1.6' }}>
              "Beat the 3:30 PM slump in Indiranagar. 20% off specialty pour-overs & fresh bakes at The Roasted Bean near 12th Main (3–6 PM, Mon–Thu)."
            </p>
            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-editorial)', fontSize: '11.5px', color: 'var(--color-primary-dark)' }}>
              Anchored to your street cues, verified hours, and exact counter offer.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
