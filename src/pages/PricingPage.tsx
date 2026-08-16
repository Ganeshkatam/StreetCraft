import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { DatabasePlan } from '../types/billing';
import { Check, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface PricingPageProps {
  navigate: (route: string) => void;
  onOpenUpgrade?: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ navigate, onOpenUpgrade }) => {
  const [plans, setPlans] = useState<DatabasePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPlans().then((data) => {
      setPlans(data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '48px 32px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="section-eyebrow">TRANSPARENT & SIMPLE PRICING</span>
        <h1 className="section-title">One Campaign Can Pay For The Entire Month</h1>
        <p className="section-subtitle" style={{ margin: '8px auto 0' }}>
          Database-backed plans with no hidden fees, zero per-channel upcharges, and transparent campaign pack metering.
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
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', background: 'var(--accent-emerald-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-full)', marginBottom: '12px', fontWeight: 700 }}>
                    <Sparkles size={12} /> MOST POPULAR FOR LOCAL CAFES
                  </div>
                )}
                <h3 className="plan-name">{p.name}</h3>
                <div className="plan-price">
                  ₹{p.price_inr}
                  <span className="plan-period">/ month</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', fontWeight: 600 }}>
                  {p.monthly_pack_limit} Coordinated Campaign Packs per month
                </div>

                <div className="feature-list" style={{ marginBottom: '24px' }}>
                  {p.features.map((feat, i) => (
                    <div key={i} className="feature-item">
                      <Check size={14} color="var(--accent-emerald)" />
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
                {p.price_inr === 0 ? 'Start Free' : `Upgrade to ${p.name}`} <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Security Guarantee */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '32px', textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
        <ShieldCheck size={28} color="var(--accent-emerald)" style={{ marginBottom: '12px' }} />
        <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Server-Enforced Quotas & Tenant Isolation
        </h4>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          All subscriptions are tracked with server-side atomic locking to prevent over-generation and ensure complete data isolation across independent store accounts.
        </p>
      </div>
    </div>
  );
};
