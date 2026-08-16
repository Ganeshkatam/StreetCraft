import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('annual');
  const [founderAllocation, setFounderAllocation] = useState<{ total_slots: number; claimed_slots: number } | null>(null);

  useEffect(() => {
    api.getPlans().then((data) => {
      setPlans(data);
      setLoading(false);
    });
    
    api.getFounderAllocation().then(setFounderAllocation);

    if (isSupabaseConfigured) {
      const channel = supabase.channel('founder_allocation_changes')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'founder_allocation' }, (payload) => {
          if (payload.new) {
            setFounderAllocation(payload.new as any);
          }
        })
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
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
      a: `Yes. The Neighborhood Starter tier includes ${plans.find(p => p.id === 'FREE')?.monthly_pack_limit ?? 3} complete 4-channel campaign packs every month, Store Memory, and the Daily Opportunity Radar. No payment card is required.`,
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

      {/* Billing Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--color-surface)', padding: '6px', borderRadius: '32px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          {(['monthly', 'quarterly', 'annual'] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              style={{
                padding: '8px 20px',
                borderRadius: '24px',
                border: 'none',
                background: billingCycle === cycle ? 'var(--color-ink)' : 'transparent',
                color: billingCycle === cycle ? '#FFFFFF' : 'var(--color-ink-muted)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
              {cycle === 'annual' && (
                <span style={{ fontSize: '11px', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, letterSpacing: '0.02em' }}>
                  2 MONTHS FREE
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Founder Plan Section */}
      {(() => {
        const founderPlan = plans.find((p) => p.id === 'FOUNDER');
        if (!founderPlan || !founderAllocation) return null;

        const isSoldOut = founderAllocation.claimed_slots >= founderAllocation.total_slots;
        const placesRemaining = Math.max(0, founderAllocation.total_slots - founderAllocation.claimed_slots);
        const proPlan = plans.find((p) => p.id === 'PRO');
        
        return (
          <div style={{ marginBottom: '64px', background: 'var(--color-surface)', border: '2px solid var(--color-ink)', borderRadius: 'var(--radius-sm)', padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <span className="section-eyebrow" style={{ color: 'var(--color-ink)', fontWeight: 700, letterSpacing: '0.1em' }}>FIRST 100 MEMBERS</span>
            
            {isSoldOut ? (
              <div style={{ padding: '32px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-xs)', marginTop: '24px', width: '100%', maxWidth: '600px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-ink-muted)' }}>Founder allocation has ended.</h3>
                <p style={{ marginTop: '8px', color: 'var(--color-ink-soft)' }}>All {founderAllocation.total_slots} places have been claimed.</p>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', margin: '16px 0 8px', color: 'var(--color-ink)' }}>Founder pricing is now open.</h2>
                <div style={{ fontSize: '17px', color: 'var(--color-ink-muted)', marginBottom: '40px' }}>Founder offer — available once per account for the first 100 members.</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', width: '100%', maxWidth: '880px', textAlign: 'left', background: 'var(--color-surface-raised)', padding: '32px', borderRadius: 'var(--radius-xs)', alignItems: 'center' }}>
                  
                  {/* Pricing Box */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '36px', lineHeight: 1.1, color: 'var(--color-ink)' }}>
                        ₹{founderPlan.quarterly_price_inr.toLocaleString('en-IN')} <span style={{ fontSize: '15px', color: 'var(--color-ink-muted)' }}>/ quarter</span><br/>
                        <span style={{ fontSize: '20px', color: 'var(--color-ink-soft)' }}>or</span> ₹{founderPlan.annual_price_inr.toLocaleString('en-IN')} <span style={{ fontSize: '15px', color: 'var(--color-ink-muted)' }}>/ year</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Features Box */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px', borderLeft: '1px solid var(--color-border)', paddingLeft: '32px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', color: 'var(--color-ink)' }}>
                       <CheckCircle2 size={20} color="var(--color-ink)" />
                       <span style={{ fontWeight: 600 }}>{founderPlan.monthly_pack_limit} campaign packs</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', color: 'var(--color-ink)' }}>
                       <CheckCircle2 size={20} color="var(--color-ink)" />
                       <span style={{ fontWeight: 600 }}>{founderPlan.business_limit} businesses</span>
                     </div>
                  </div>
  
                  {/* CTA Box */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid var(--color-border)', paddingLeft: '32px' }}>
                    <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '15px', justifyContent: 'center', background: 'var(--color-ink)', color: '#FFFFFF' }} onClick={() => navigate('/login')}>
                      Become a Founder
                    </button>
                    <div style={{ marginTop: '16px', fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.02em' }}>
                      {placesRemaining} of {founderAllocation.total_slots} remaining
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* Standard Plan Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px', marginBottom: '64px' }}>
        {plans
          .filter(p => p.id !== 'FOUNDER' && !(billingCycle !== 'monthly' && p.monthly_inr === 0))
          .map((p) => {
          const isPro = p.id === 'PRO';

          const displayPrice = billingCycle === 'annual'
            ? p.annual_price_inr
            : billingCycle === 'quarterly'
              ? p.quarterly_price_inr
              : p.monthly_inr;

          const periodLabel = billingCycle === 'annual'
            ? '/ year'
            : billingCycle === 'quarterly'
              ? '/ 3 months'
              : '/ month';

          const subtitle = billingCycle === 'annual' && p.annual_price_inr > 0
            ? `That's ₹${Math.round(p.annual_price_inr / 12).toLocaleString('en-IN')}/month — 2 months free`
            : billingCycle === 'quarterly' && p.quarterly_price_inr > 0
              ? `That's ₹${Math.round(p.quarterly_price_inr / 3).toLocaleString('en-IN')}/month`
              : null;

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

                <div style={{ margin: '16px 0 6px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '38px', fontFamily: 'var(--font-display)', color: 'var(--color-ink)', lineHeight: 1 }}>
                        ₹{displayPrice.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)' }}>
                        {periodLabel}
                      </span>
                    </div>
                    {subtitle && (
                      <div style={{ fontSize: '12.5px', color: 'var(--color-primary)', marginTop: '4px', fontWeight: 500 }}>
                        {subtitle}
                      </div>
                    )}
                  </div>
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
                    navigate(p.monthly_inr === 0 ? '/free-tool' : '/login');
                  }
                }}
              >
                {p.monthly_inr === 0 ? 'Start Free' : `Select ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* The Local Unit Economics / ROI Panel */}
      <section className="card" style={{ padding: '32px 36px', marginBottom: '64px', background: 'var(--color-surface-raised)' }}>
        {(() => {
          const proPlan = plans.find(p => p.id === 'PRO');
          const effectiveMonthly = billingCycle === 'annual'
            ? Math.round((proPlan?.annual_price_inr ?? 3990) / 12)
            : billingCycle === 'quarterly'
              ? Math.round((proPlan?.quarterly_price_inr ?? 1099) / 3)
              : (proPlan?.monthly_inr ?? 399);
          const requiredCovers = Math.ceil(effectiveMonthly / 200);
          const cycleNote = billingCycle !== 'monthly' ? ' equivalent' : '';
          
          return (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'center' }}>
              <div>
                <span className="section-eyebrow">WORKSPACE UNIT ECONOMICS</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-ink)', margin: '4px 0 10px' }}>
                  How {requiredCovers} Extra Customers Cover Your Entire Month
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
                  If your average customer ticket is ₹200, just {requiredCovers} extra walk-ins generated from a single Tuesday afternoon drop completely pays for the Pro Plan (₹{effectiveMonthly}/mo{cycleNote}). Every additional table cover is 100% net revenue.
                </p>
              </div>

              <div style={{ background: 'var(--color-surface)', padding: '20px 24px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-ink-muted)' }}>Average Ticket Size:</span>
                  <strong style={{ color: 'var(--color-ink)' }}>₹200</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-ink-muted)' }}>High-Street Pro Monthly:</span>
                  <strong style={{ color: 'var(--color-primary)' }}>₹{effectiveMonthly}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontSize: '13.5px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>Breakeven Required:</span>
                  <strong style={{ color: 'var(--color-accent)' }}>{(effectiveMonthly / 200).toFixed(1)} walk-in covers / month</strong>
                </div>
              </div>
            </div>
          );
        })()}
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
                <th style={{ padding: '14px 20px', color: 'var(--color-ink)', fontWeight: 600 }}>Starter (₹{plans.find(p => p.id === 'FREE')?.monthly_inr ?? 0})</th>
                <th style={{ padding: '14px 20px', color: 'var(--color-primary)', fontWeight: 700 }}>Pro (₹{plans.find(p => p.id === 'PRO')?.monthly_inr ?? 399})</th>
                <th style={{ padding: '14px 20px', color: 'var(--color-ink)', fontWeight: 600 }}>Growth (₹{plans.find(p => p.id === 'GROWTH')?.monthly_inr ?? 799})</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Monthly Campaign Packs', starter: `${plans.find(p => p.id === 'FREE')?.monthly_pack_limit ?? 3} packs`, pro: `${plans.find(p => p.id === 'PRO')?.monthly_pack_limit ?? 100} packs`, growth: `${plans.find(p => p.id === 'GROWTH')?.monthly_pack_limit ?? 300} packs` },
                { feature: 'Google Search & Maps Local Updates', starter: 'Included', pro: 'Included', growth: 'Included' },
                { feature: 'Instagram Reel Hook & Stories', starter: 'Included', pro: 'Included', growth: 'Included' },
                { feature: 'WhatsApp Broadcast Copy', starter: 'Included', pro: 'Included', growth: 'Included' },
                { feature: 'Print-Ready Counter QR Cards', starter: 'Standard', pro: 'High-Res A5/A4', growth: 'Custom Formats' },
                { feature: 'Isolated Workspaces', starter: 'Up to 2 Businesses', pro: 'Up to 5 Businesses', growth: 'Up to 10 Businesses' },
                { feature: 'Daily Opportunity Radar', starter: 'Standard', pro: 'Priority Live', growth: 'Realtime Multi-Business' },
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
