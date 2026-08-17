import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Layers,
  Sparkles,
  MapPin,
  Clock,
  Send,
  Printer,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  Sliders
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [activeChannelTab, setActiveChannelTab] = useState<'google' | 'instagram' | 'whatsapp' | 'poster'>('google');

  const steps = [
    {
      step: 1,
      tag: 'PERSISTENT CONTEXT',
      title: 'Store Preferences',
      summary: 'Enter your physical store parameters once. StreetCraft saves your neighborhood anchors, signature bakes or dishes, style voice, and quiet hours permanently.',
      details: [
        'Isolated business profiles with neighborhood landmarks',
        'Signature dishes, products, and price anchors',
        'Pre-configured slow-hour windows (e.g. Tuesday 3:00 PM – 6:00 PM)',
        'Automatic injection into every generated campaign proof'
      ],
      icon: Store,
    },
    {
      step: 2,
      tag: 'OPPORTUNITY DETECTION',
      title: 'Opportunity Radar',
      summary: 'Every campaign begins with a tangible business trigger rather than a blank prompt. Choose slow-hour boosts, weekend rushes, seasonal items, or calendar triggers.',
      details: [
        'Store opportunity trigger library',
        'Live regional calendar triggers with contextual relevance',
        'Custom promotional windows',
        'Objective-driven campaign structuring'
      ],
      icon: Clock,
    },
    {
      step: 3,
      tag: 'COORDINATED GENERATION',
      title: 'Coordinated Campaign Formats',
      summary: 'StreetCraft transforms your opportunity into production-ready, character-compliant marketing assets simultaneously—not disconnected generic text.',
      details: [
        'Google Business: Search & Maps update with neighborhood landmarks',
        'Instagram: 3-second Reel hook, 3 Story frames, caption, and discovery tags',
        'WhatsApp: Broadcast-ready message with counter redemption callout',
        'In-Store: Printable table tent and counter card'
      ],
      icon: Layers,
    },
    {
      step: 4,
      tag: 'QUALITY & COMPLIANCE',
      title: 'Formatting Rules & Verification',
      summary: 'Every output passes through strict format-specific character limits, hashtag budgets, and structured layout rules before you see it.',
      details: [
        'Format and character-limit verification',
        'Exact character boundary enforcement per platform',
        'Zero generic hallucinations or irrelevant buzzwords',
        'One-click clipboard copying and text file export'
      ],
      icon: ShieldCheck,
    },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px 96px' }}>

      {/* =========================================================================
          HERO & METHODOLOGY FRAMING
          ========================================================================= */}
      <section style={{ padding: '64px 0 48px', textAlign: 'center' }}>
        <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '14px', fontWeight: 600 }}>
          THE STREETCRAFT METHODOLOGY
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '50px', color: 'var(--color-ink)', lineHeight: '1.15', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
          From store opportunity to coordinated foot traffic.
        </h1>
        <p style={{ fontSize: '17px', color: 'var(--color-ink-muted)', lineHeight: '1.65', maxWidth: '720px', margin: '0 auto 36px' }}>
          StreetCraft is a growth engine for physical businesses, turning one business opportunity into everything customers need to see across Google, Instagram, WhatsApp, and your counter.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '13px 28px', fontSize: '14.5px' }} onClick={() => navigate('/free-tool')}>
            Try Free Campaign Tool &rarr;
          </button>
          <button className="btn-secondary" style={{ padding: '13px 24px', fontSize: '14.5px' }} onClick={() => navigate('/pricing')}>
            View Rates &amp; Pricing
          </button>
        </div>
      </section>

      {/* =========================================================================
          CORE ENGINE STORY DIAGRAM
          ========================================================================= */}
      <section style={{ margin: '0 auto 64px' }}>
        <div
          className="card"
          style={{
            padding: '36px 40px',
            background: 'var(--color-surface)',
            border: '2px solid var(--color-border)',
            boxShadow: 'var(--shadow-paper)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
              THE STOREFRONT PIPELINE
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-ink)', marginTop: '4px' }}>
              One Store Opportunity &rarr; Coordinated Storefront Touchpoints
            </h3>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            {/* Box 1: Input */}
            <div
              style={{
                flex: '1 1 240px',
                maxWidth: '320px',
                background: 'var(--color-surface-raised)',
                padding: '24px 20px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--color-border)',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                  letterSpacing: '0.06em',
                }}
              >
                INPUT &bull; STAGE 01
              </span>
              <strong style={{ fontSize: '16px', color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
                Store Trigger
              </strong>
              <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.5', margin: 0 }}>
                Slow 3–6 PM slump, weekend rush, or regional festival
              </p>
            </div>

            {/* Direction Arrow */}
            <div style={{ color: 'var(--color-ink-muted)', fontSize: '22px', fontWeight: 600, flexShrink: 0 }}>
              &rarr;
            </div>

            {/* Box 2: Engine */}
            <div
              style={{
                flex: '1 1 260px',
                maxWidth: '340px',
                background: 'var(--color-surface-raised)',
                padding: '24px 20px',
                borderRadius: 'var(--radius-xs)',
                border: '2px solid var(--color-primary)',
                textAlign: 'center',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                  letterSpacing: '0.06em',
                }}
              >
                ENGINE &bull; STAGE 02
              </span>
              <strong style={{ fontSize: '16px', color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
                Store Preferences + Rules
              </strong>
              <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.5', margin: 0 }}>
                Applies neighborhood anchors, tone, and character limits
              </p>
            </div>

            {/* Direction Arrow */}
            <div style={{ color: 'var(--color-ink-muted)', fontSize: '22px', fontWeight: 600, flexShrink: 0 }}>
              &rarr;
            </div>

            {/* Box 3: Output */}
            <div
              style={{
                flex: '1 1 240px',
                maxWidth: '320px',
                background: 'var(--color-surface-raised)',
                padding: '24px 20px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--color-border)',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                  letterSpacing: '0.06em',
                }}
              >
                OUTPUT &bull; STAGE 03
              </span>
              <strong style={{ fontSize: '16px', color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
                Multi-Touchpoint Campaign
              </strong>
              <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.5', margin: 0 }}>
                Google &bull; Instagram &bull; WhatsApp &bull; Counter Print
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE 4-STEP DEEP DIVE
          ========================================================================= */}
      <section style={{ margin: '0 auto 72px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-eyebrow">STEP-BY-STEP BREAKDOWN</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', color: 'var(--color-ink)', marginTop: '4px' }}>
            How Every Campaign Is Built
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--color-ink-muted)', maxWidth: '640px', margin: '8px auto 0', lineHeight: '1.6' }}>
            Explore each stage of the StreetCraft generation and execution pipeline.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Step Selectors (Left) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {steps.map((s) => {
              const isSelected = activeStep === s.step;
              const IconComp = s.icon;
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  className="card"
                  style={{
                    padding: '20px 22px',
                    textAlign: 'left',
                    background: isSelected ? 'var(--color-surface)' : 'var(--color-surface-raised)',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    boxShadow: isSelected ? 'var(--shadow-subtle)' : 'none',
                    cursor: 'pointer',
                    transition: 'var(--motion-fast)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: isSelected ? 'var(--color-primary)' : 'var(--color-ink-muted)', fontWeight: 600 }}>
                      STEP 0{s.step} &bull; {s.tag}
                    </span>
                    <IconComp size={16} color={isSelected ? 'var(--color-primary)' : 'var(--color-ink-muted)'} />
                  </div>
                  <strong style={{ fontSize: '16px', color: 'var(--color-ink)', display: 'block' }}>
                    {s.title}
                  </strong>
                </button>
              );
            })}
          </div>

          {/* Step Detail Card (Right) */}
          {steps.map((s) => {
            if (s.step !== activeStep) return null;
            return (
              <div
                key={s.step}
                className="card"
                style={{
                  padding: '36px 40px',
                  background: 'var(--color-surface)',
                  border: '2px solid var(--color-border)',
                  boxShadow: 'var(--shadow-paper)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.08em' }}>
                      STAGE 0{s.step} &bull; {s.tag}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--color-ink)', margin: '4px 0 0' }}>
                      {s.title}
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: '15.5px', color: 'var(--color-ink-soft)', lineHeight: '1.65', marginBottom: '24px' }}>
                  {s.summary}
                </p>

                <div style={{ background: 'var(--color-surface-raised)', padding: '22px 24px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', marginBottom: '28px' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                    Key Architectural Capabilities
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {s.details.map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'var(--color-ink)' }}>
                        <CheckCircle2 size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-ink-muted)' }}>
                    {s.step < 4 ? `Next up: Stage 0${s.step + 1} — ${steps[s.step].title}` : 'Ready to test with your own store parameters?'}
                  </span>
                  {s.step < 4 ? (
                    <button className="btn-secondary" style={{ fontSize: '13px', padding: '8px 18px' }} onClick={() => setActiveStep(s.step + 1)}>
                      Next Step &rarr;
                    </button>
                  ) : (
                    <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 20px' }} onClick={() => navigate('/free-tool')}>
                      Try Free Campaign Tool &rarr;
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        </div>
      </section>

      {/* =========================================================================
          THE FOUR TOUCHPOINTS IN DETAIL
          ========================================================================= */}
      <section style={{ margin: '0 auto 72px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="section-eyebrow">OUTPUT SPECIFICATIONS</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-ink)', marginTop: '4px' }}>
            Campaign Touchpoints in Detail
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--color-ink-muted)', maxWidth: '600px', margin: '8px auto 0', lineHeight: '1.6' }}>
            Every touchpoint is formatted for its specific reading environment and action trigger.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' }}>
          
          {/* Channel 1: Google Business */}
          <div className="card" style={{ padding: '28px 26px', background: 'var(--color-surface)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              TOUCHPOINT 01
            </span>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '10px' }}>
              Google Business Profile
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
              Structured store updates for Google Maps search cards, designed to capture nearby searchers looking for food or coffee.
            </p>
            <div style={{ background: 'var(--color-surface-raised)', padding: '12px 14px', borderRadius: 'var(--radius-xs)', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-soft)' }}>
              Includes: Headline, descriptive update, call-to-action button, and landmark anchor.
            </div>
          </div>

          {/* Channel 2: Instagram */}
          <div className="card" style={{ padding: '28px 26px', background: 'var(--color-surface)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              TOUCHPOINT 02
            </span>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '10px' }}>
              Instagram Reel &amp; Story
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
              3-second video hook for Reels, a 3-frame sequenced Story narrative, plus a character-limited caption and curated neighborhood hashtags.
            </p>
            <div style={{ background: 'var(--color-surface-raised)', padding: '12px 14px', borderRadius: 'var(--radius-xs)', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-soft)' }}>
              Includes: 3s video hook, 3 Story frames, Instagram caption, 8-12 discovery tags.
            </div>
          </div>

          {/* Channel 3: WhatsApp */}
          <div className="card" style={{ padding: '28px 26px', background: 'var(--color-surface)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              TOUCHPOINT 03
            </span>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '10px' }}>
              WhatsApp VIP Broadcast
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
              High-converting direct messaging with bold anchor tags, concise timing windows, and a counter flash redemption code for regulars.
            </p>
            <div style={{ background: 'var(--color-surface-raised)', padding: '12px 14px', borderRadius: 'var(--radius-xs)', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-soft)' }}>
              Includes: WhatsApp bolding format, flash counter terms, direct CTA link.
            </div>
          </div>

          {/* Channel 4: Counter Card */}
          <div className="card" style={{ padding: '28px 26px', background: 'var(--color-surface)' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              TOUCHPOINT 04
            </span>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '10px' }}>
              Printable Counter Card
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
              A high-contrast physical table tent and counter display template ready for immediate A5 printing, complete with designated QR scan zones.
            </p>
            <div style={{ background: 'var(--color-surface-raised)', padding: '12px 14px', borderRadius: 'var(--radius-xs)', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-soft)' }}>
              Includes: High-contrast headline, QR placement zone, terms &amp; timing footer.
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          COMMERCE COMPARISON: DIRECT WALK-INS VS AGGREGATORS
          ========================================================================= */}
      <section style={{ margin: '0 auto 72px' }}>
        <div
          className="card"
          style={{
            padding: '40px 44px',
            background: 'var(--color-surface)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-paper)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', alignItems: 'center' }}>
            <div>
              <span className="section-eyebrow">THE STORE COMMERCE EQUATION</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', color: 'var(--color-ink)', margin: '8px 0 14px', lineHeight: '1.2' }}>
                Why direct walk-in marketing matters.
              </h2>
              <p style={{ fontSize: '14.5px', color: 'var(--color-ink-muted)', lineHeight: '1.65', marginBottom: '20px' }}>
                When a customer orders through delivery aggregator apps, you lose 25% to 30% of the sale in commissions. When you bring them directly through your physical front door, you keep 100% of your margin.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn-primary" style={{ padding: '11px 22px', fontSize: '13.5px' }} onClick={() => navigate('/free-tool')}>
                  Test with Your Store &rarr;
                </button>
                <button className="btn-secondary" style={{ padding: '11px 18px', fontSize: '13.5px' }} onClick={() => navigate('/pricing')}>
                  View Rates
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--color-surface-raised)', padding: '24px 28px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
                Per-Order Economics Comparison
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--color-ink-soft)' }}>Aggregator Order (₹500 ticket)</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-danger)', fontWeight: 600 }}>-₹150 commission (30%)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--color-ink-soft)' }}>Agency Retainer</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-danger)', fontWeight: 600 }}>High recurring monthly fee</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                  <div>
                    <strong style={{ color: 'var(--color-primary)', display: 'block' }}>StreetCraft Walk-In Campaign</strong>
                    <span style={{ fontSize: '12px', color: 'var(--color-ink-muted)' }}>Flat monthly/annual subscription</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700, fontSize: '14.5px' }}>
                    100% Margin Retained
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL ACTION FRAME
          ========================================================================= */}
      <section style={{ textAlign: 'center', padding: '52px 32px', background: 'var(--color-surface)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-paper)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', color: 'var(--color-ink)', marginBottom: '10px' }}>
          See StreetCraft in action for your store.
        </h2>
        <p style={{ fontSize: '15.5px', color: 'var(--color-ink-muted)', maxWidth: '540px', margin: '0 auto 28px', lineHeight: '1.6' }}>
          Generate your first complete campaign in 10 seconds. No credit card required.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '13px 30px', fontSize: '15px' }} onClick={() => navigate('/free-tool')}>
            Try Free Campaign Tool &rarr;
          </button>
          <button className="btn-secondary" style={{ padding: '13px 24px', fontSize: '15px' }} onClick={() => navigate('/login')}>
            Sign In to Store
          </button>
        </div>
      </section>

    </div>
  );
};
