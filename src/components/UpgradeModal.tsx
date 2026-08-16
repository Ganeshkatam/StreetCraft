import React, { useState, useEffect } from 'react';
import { PlanTier, DatabasePlan } from '../types/billing';
import { api } from '../lib/api';
import { X, Check } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanUpdated?: () => void;
  onSuccess?: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onPlanUpdated,
  onSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [plans, setPlans] = useState<DatabasePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getPlans().then((data) => {
        setPlans(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = (plan: DatabasePlan) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessNotice(`Upgraded to ${plan.name}. Quota updated to ${plan.monthly_pack_limit} campaign packs.`);
      if (onPlanUpdated) onPlanUpdated();
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccessNotice(null);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="section-eyebrow">STORE QUOTA</span>
            <h3 className="modal-title">Upgrade Campaign Tier</h3>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {successNotice ? (
          <div style={{ padding: '32px', textAlign: 'center', background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-xs)', margin: '20px 0' }}>
            <h4 style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '8px' }}>
              Subscription Synchronized
            </h4>
            <p style={{ color: 'var(--color-ink)', fontSize: '14px' }}>{successNotice}</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '24px 0' }}>
              {loading ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--color-ink-muted)' }}>Loading plans...</div>
              ) : (
                plans.map((plan) => {
                  const isPro = plan.id === 'PRO';
                  return (
                    <div
                      key={plan.id}
                      style={{
                        background: isPro ? 'var(--color-surface-raised)' : 'var(--color-surface)',
                        border: isPro ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xs)',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: isPro ? 'var(--shadow-paper)' : 'none',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)' }}>{plan.name}</span>
                          {isPro && <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', background: 'var(--color-primary-subtle)', padding: '1px 6px', borderRadius: '2px' }}>POPULAR</span>}
                        </div>
                        <div style={{ fontSize: '24px', fontFamily: 'var(--font-display)', margin: '8px 0 4px', color: 'var(--color-ink)' }}>
                          {plan.monthly_inr === 0 ? 'Free' : `₹${plan.monthly_inr}`}
                          <span style={{ fontSize: '12px', fontFamily: 'var(--font-body)', color: 'var(--color-ink-muted)' }}>/mo</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--color-primary)', marginBottom: '14px' }}>
                          {plan.monthly_pack_limit} packs / month
                        </div>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--color-ink-soft)' }}>
                          {plan.features.slice(0, 3).map((f, i) => (
                            <li key={i} style={{ display: 'flex', gap: '6px' }}>
                              <Check size={12} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        className={isPro ? 'btn-primary' : 'btn-secondary'}
                        style={{ marginTop: '18px', width: '100%', justifyContent: 'center', fontSize: '12.5px' }}
                        disabled={isProcessing}
                        onClick={() => handleUpgrade(plan)}
                      >
                        {isProcessing ? 'Updating...' : `Select ${plan.name}`}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              <button className="btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
