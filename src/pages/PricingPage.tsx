import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { DatabasePlan } from '../types/billing';
import { Check, Zap, Sparkles } from 'lucide-react';

interface PricingPageProps {
  navigate: (route: string) => void;
  onOpenUpgrade?: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ navigate, onOpenUpgrade }) => {
  const [plans, setPlans] = useState<DatabasePlan[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    api.getPlans().then((data) => {
      setPlans(data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px 96px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="section-eyebrow">TRANSPARENT PLANS</span>
        <h1 className="section-title">
          Scale Your Local Marketing
        </h1>
        <p className="section-subtitle" style={{ margin: '8px auto 0' }}>
          One good afternoon campaign covers the entire monthly subscription. No commissions, no agency retainers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
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
                border: isPro ? '1.5px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                boxShadow: isPro ? 'var(--shadow-glow-emerald)' : 'var(--shadow-md)',
                background: isPro ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                position: 'relative',
              }}
            >
              <div>
                {isPro && (
                  <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-emerald)', color: '#000', fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '2px 10px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase' }}>
                    MOST POPULAR
                  </div>
                )}
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginTop: isPro ? '8px' : 0 }}>
                  {p.name}
                </h3>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#FFFFFF', margin: '14px 0 6px', letterSpacing: '-0.02em' }}>
                  ₹{p.price_inr}
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}> / month</span>
                </div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginBottom: '24px' }}>
                  {p.monthly_pack_limit} campaign packs monthly
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {p.features.map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <Check size={14} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className={isPro ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  if (onOpenUpgrade) {
                    onOpenUpgrade();
                  } else {
                    navigate('app/dashboard');
                  }
                }}
              >
                {p.price_inr === 0 ? 'Start Free' : `Choose ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
