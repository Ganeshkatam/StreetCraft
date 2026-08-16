import React, { useState } from 'react';
import { PlanTier } from '../types/billing';
import { PLANS } from '../lib/entitlements';
import { X, Check, Zap } from 'lucide-react';

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
  const [, setSelectedPlan] = useState<PlanTier>('PRO');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = (tier: PlanTier) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessNotice(`Upgraded to ${PLANS[tier].name}. Quota updated to ${PLANS[tier].monthlyPackLimit} campaign packs.`);
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
          <div style={{ padding: '32px', textAlign: 'center', background: 'var(--accent-emerald-subtle)', border: '1px solid var(--accent-emerald)', borderRadius: 'var(--radius-sm)', margin: '20px 0' }}>
            <h4 style={{ color: 'var(--accent-emerald)', fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              Subscription Synchronized
            </h4>
            <p style={{ color: '#FFFFFF', fontSize: '14px' }}>{successNotice}</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '24px 0' }}>
              {(Object.keys(PLANS) as PlanTier[]).map((tierKey) => {
                const plan = PLANS[tierKey];
                const isPro = tierKey === 'PRO';
                return (
                  <div
                    key={tierKey}
                    style={{
                      background: isPro ? 'var(--bg-surface-elevated)' : 'var(--bg-input)',
                      border: isPro ? '1.5px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isPro ? 'var(--shadow-glow-emerald)' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '15px', color: '#FFFFFF' }}>{plan.name}</span>
                        {isPro && <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', background: 'var(--accent-emerald-subtle)', padding: '1px 6px', borderRadius: '4px' }}>POPULAR</span>}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0 4px', color: '#FFFFFF' }}>
                        {plan.priceINR === 0 ? 'Free' : `₹${plan.priceINR}`}
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--accent-emerald)', marginBottom: '14px' }}>
                        {plan.monthlyPackLimit} packs / month
                      </div>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {plan.features.slice(0, 3).map((f, i) => (
                          <li key={i} style={{ display: 'flex', gap: '6px' }}>
                            <Check size={12} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      className={isPro ? 'btn-primary' : 'btn-secondary'}
                      style={{ marginTop: '18px', width: '100%', justifyContent: 'center', fontSize: '12.5px' }}
                      disabled={isProcessing}
                      onClick={() => handleUpgrade(tierKey)}
                    >
                      {isProcessing ? 'Updating...' : `Select ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
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
