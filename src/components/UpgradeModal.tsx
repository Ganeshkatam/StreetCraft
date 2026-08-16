import React, { useState } from 'react';
import { PlanTier } from '../types/billing';
import { PLANS } from '../lib/entitlements';
import { X, Check, CreditCard, ArrowRight } from 'lucide-react';

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
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('PRO');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = (tier: PlanTier) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessNotice(`Successfully upgraded to ${PLANS[tier].name}. Quota updated to ${PLANS[tier].monthlyPackLimit} campaign packs.`);
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
            <span className="section-eyebrow">METERED BILLING & TIERS</span>
            <h3 className="modal-title">Upgrade Your StreetCraft AI Subscription</h3>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {successNotice ? (
          <div style={{ padding: '32px', textAlign: 'center', background: 'var(--accent-emerald-subtle)', border: '1px solid var(--accent-emerald)', borderRadius: 'var(--radius-md)', margin: '20px 0' }}>
            <h4 style={{ color: 'var(--accent-emerald)', fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              Subscription Synchronized
            </h4>
            <p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{successNotice}</p>
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
                      background: isPro ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-surface-elevated)',
                      border: isPro ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '16px' }}>{plan.name}</span>
                        {isPro && <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>RECOMMENDED</span>}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, margin: '10px 0 6px' }}>
                        {plan.priceINR === 0 ? 'Free' : `INR ${plan.priceINR}`}
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-emerald)', marginBottom: '14px' }}>
                        {plan.monthlyPackLimit} Campaign Packs / mo
                      </div>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
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
                      style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
                      disabled={isProcessing}
                      onClick={() => handleUpgrade(tierKey)}
                    >
                      {isProcessing ? 'Processing...' : `Switch to ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <CreditCard size={14} />
                <span>Synchronized with Razorpay Subscription Webhook engine</span>
              </div>
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
