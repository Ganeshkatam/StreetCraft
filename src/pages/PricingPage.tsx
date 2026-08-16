import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { DatabasePlan } from '../types/billing';
import { Check } from 'lucide-react';

interface PricingPageProps {
  onOpenUpgrade?: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onOpenUpgrade }) => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<DatabasePlan[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    api.getPlans().then((data) => {
      setPlans(data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 24px 96px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="section-eyebrow">STRAIGHTFORWARD RATES</span>
        <h1 className="section-title">
          Scale Your Local Marketing
        </h1>
        <p className="section-subtitle" style={{ margin: '8px auto 0' }}>
          One good afternoon campaign covers the entire monthly subscription. No commissions, no agency retainers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
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
              }}
            >
              <div>
                {isPro && (
                  <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary)', color: '#FFFFFF', fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 600, padding: '2px 10px', borderRadius: 'var(--radius-xs)', textTransform: 'uppercase' }}>
                    POPULAR FOR CAFES
                  </div>
                )}
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)', marginTop: isPro ? '8px' : 0 }}>
                  {p.name}
                </h3>
                <div style={{ fontSize: '36px', fontFamily: 'var(--font-display)', color: 'var(--color-ink)', margin: '14px 0 6px' }}>
                  ₹{p.price_inr}
                  <span style={{ fontSize: '14px', fontFamily: 'var(--font-body)', color: 'var(--color-ink-muted)' }}> / month</span>
                </div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', marginBottom: '24px' }}>
                  {p.monthly_pack_limit} campaign packs monthly
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {p.features.map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-ink-soft)' }}>
                      <Check size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
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
                    navigate('/app/dashboard');
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
