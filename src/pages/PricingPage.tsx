import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { DatabasePlan } from '../types/billing';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface PricingPageProps {
  onOpenUpgrade?: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onOpenUpgrade }) => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<DatabasePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    api.getPlans().then((data) => {
      setPlans(data);
      setLoading(false);
    });
  }, []);

  const pricingFaqs = [
    {
      q: 'How does the monthly campaign pack limit work?',
      a: 'Each campaign pack generates 4 synchronized channel outputs simultaneously: Google Search/Maps update, Instagram Reel hook + Story sequence, WhatsApp broadcast copy, and printable counter card. Quota resets on the 1st of every calendar month.',
    },
    {
      q: 'Are there any hidden fees or sales commissions?',
      a: 'Zero. Unlike delivery aggregator apps that take 25% to 30% of your customer revenue, StreetCraft charges a flat subscription. You keep 100% of your walk-in and counter revenue.',
    },
    {
      q: 'Can I start for free without a credit card?',
      a: 'Yes. The Neighborhood Starter tier includes 5 complete 4-channel campaign packs every month, Store Memory, and the Daily Opportunity Radar. No payment card is required.',
    },
    {
      q: 'Can I upgrade or cancel my plan at any time?',
      a: 'Yes, you can upgrade, downgrade, or cancel your subscription directly from your workspace settings with 1 click.',
    },
  ];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '56px 24px 96px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="section-eyebrow">STRAIGHTFORWARD RATES</span>
        <h1 className="section-title" style={{ fontSize: '40px', letterSpacing: '-0.02em' }}>
          Scale Your Local Marketing
        </h1>
        <p className="section-subtitle" style={{ margin: '10px auto 0', maxWidth: '580px', fontSize: '15.5px' }}>
          One single afternoon promotion covers the entire monthly subscription. No commissions, no agency retainers.
        </p>
      </div>

      {/* Plan Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px', marginBottom: '64px' }}>
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
                padding: '32px 28px',
                boxShadow: isPro ? 'var(--shadow-paper)' : 'none',
              }}
            >
              <div>
                {isPro && (
                  <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary)', color: '#FFFFFF', fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 600, padding: '3px 12px', borderRadius: 'var(--radius-xs)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    MOST POPULAR FOR CAFES
                  </div>
                )}

                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)', marginTop: isPro ? '6px' : 0 }}>
                  {p.name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'baseline', margin: '16px 0 6px', gap: '4px' }}>
                  <span style={{ fontSize: '38px', fontFamily: 'var(--font-display)', color: 'var(--color-ink)', lineHeight: 1 }}>
                    ₹{p.price_inr}
                  </span>
                  <span style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)' }}>
                    / month
                  </span>
                </div>

                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '24px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)' }}>
                  {p.monthly_pack_limit} campaign packs monthly
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '32px' }}>
                  {p.features.map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--color-ink-soft)', lineHeight: '1.4' }}>
                      <CheckCircle2 size={15} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className={isPro ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '13.5px' }}
                onClick={() => {
                  if (onOpenUpgrade) {
                    onOpenUpgrade();
                  } else {
                    navigate(p.price_inr === 0 ? '/free-tool' : '/login');
                  }
                }}
              >
                {p.price_inr === 0 ? 'Start Free' : `Select ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* The Local Unit Economics / ROI Panel */}
      <section className="card" style={{ padding: '32px 36px', marginBottom: '64px', background: 'var(--color-surface-raised)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'center' }}>
          <div>
            <span className="section-eyebrow">STORE UNIT ECONOMICS</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-ink)', margin: '4px 0 10px' }}>
              How 3 Extra Customers Cover Your Entire Month
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              If your average customer ticket is ₹350, just 3 extra walk-ins generated from a single Tuesday afternoon drop completely pays for the Pro Plan (₹799/mo). Every additional table cover is 100% net revenue.
            </p>
          </div>

          <div style={{ background: 'var(--color-surface)', padding: '20px 24px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)', fontSize: '13px' }}>
              <span style={{ color: 'var(--color-ink-muted)' }}>Average Ticket Size:</span>
              <strong style={{ color: 'var(--color-ink)' }}>₹350</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)', fontSize: '13px' }}>
              <span style={{ color: 'var(--color-ink-muted)' }}>High-Street Pro Monthly:</span>
              <strong style={{ color: 'var(--color-primary)' }}>₹799</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontSize: '13.5px' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>Breakeven Required:</span>
              <strong style={{ color: 'var(--color-accent)' }}>2.3 walk-in covers / month</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section style={{ marginBottom: '64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span className="section-eyebrow">FEATURE COMPARISON</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--color-ink)' }}>
            Plan Capabilities
          </h2>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-raised)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '14px 20px', color: 'var(--color-ink-muted)', fontWeight: 600 }}>Capability</th>
                <th style={{ padding: '14px 20px', color: 'var(--color-ink)', fontWeight: 600 }}>Starter (₹0)</th>
                <th style={{ padding: '14px 20px', color: 'var(--color-primary)', fontWeight: 700 }}>Pro (₹799)</th>
                <th style={{ padding: '14px 20px', color: 'var(--color-ink)', fontWeight: 600 }}>Growth (₹1499)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Monthly Campaign Packs', starter: '5 packs', pro: '100 packs', growth: '300 packs' },
                { feature: 'Google Search & Maps Local Updates', starter: 'Included', pro: 'Included', growth: 'Included' },
                { feature: 'Instagram Reel Hook & Stories', starter: 'Included', pro: 'Included', growth: 'Included' },
                { feature: 'WhatsApp Broadcast Copy', starter: 'Included', pro: 'Included', growth: 'Included' },
                { feature: 'Print-Ready Counter QR Cards', starter: 'Standard', pro: 'High-Res A5/A4', growth: 'Custom Formats' },
                { feature: 'Store Memory & Landmarks', starter: '1 Store', pro: '1 Store', growth: 'Up to 3 Stores' },
                { feature: 'Daily Opportunity Radar', starter: 'Standard', pro: 'Priority Live', growth: 'Realtime Multi-Store' },
                { feature: 'Commission Fee on Orders', starter: '0%', pro: '0%', growth: '0%' },
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: idx === 7 ? 'none' : '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 20px', color: 'var(--color-ink)', fontWeight: 500 }}>{row.feature}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--color-ink-muted)' }}>{row.starter}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--color-primary)', fontWeight: 600 }}>{row.pro}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--color-ink)' }}>{row.growth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing FAQs */}
      <section style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span className="section-eyebrow">COMMON QUESTIONS</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--color-ink)' }}>
            Pricing & Billing FAQ
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pricingFaqs.map((faq, idx) => {
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
                    {faq.q}
                  </h3>
                  {isOpen ? <ChevronUp size={16} color="var(--color-primary)" /> : <ChevronDown size={16} color="var(--color-ink-muted)" />}
                </div>
                {isOpen && (
                  <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', marginTop: '10px', lineHeight: '1.6', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
