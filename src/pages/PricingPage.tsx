import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { DatabasePlan } from '../types/billing';
import { Check, ArrowRight } from 'lucide-react';

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
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '56px 32px 96px' }}>
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <span className="editorial-eyebrow">SIMPLE, CLEAR RATES</span>
        <h1 className="editorial-headline" style={{ fontSize: '44px' }}>
          One good afternoon campaign<br />pays for the whole month.
        </h1>
        <p className="editorial-lead" style={{ margin: '8px auto 0', fontSize: '16px' }}>
          Straightforward pricing for independent local businesses. No commissions, no agency retainers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '64px' }}>
        {plans.map((p) => {
          const isPro = p.id === 'PRO';
          return (
            <div
              key={p.id}
              className={`pricing-card ${isPro ? 'featured' : ''}`}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                {isPro && (
                  <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    MOST POPULAR FOR CAFES
                  </span>
                )}
                <h3 className="plan-name">{p.name}</h3>
                <div className="plan-price">
                  ₹{p.price_inr}
                  <span className="plan-period">/ month</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '24px' }}>
                  {p.monthly_pack_limit} coordinated campaign packs monthly
                </div>

                <div className="feature-list" style={{ marginBottom: '32px' }}>
                  {p.features.map((feat, i) => (
                    <div key={i} className="feature-item">
                      <Check size={14} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
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
                {p.price_inr === 0 ? 'Start Free' : `Select ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
