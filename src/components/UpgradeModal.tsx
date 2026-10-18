import React, { useState, useEffect } from 'react';
import { DatabasePlan } from '../types/billing';
import { api } from '../lib/api';
import { X, Check, Loader2 } from 'lucide-react';
import { getUserFacingErrorMessage } from '../lib/userFacingError';
import { createRazorpayOrderAction } from '../lib/server/plan/createRazorpayOrderAction';
import { verifyRazorpayPaymentAction } from '../lib/server/plan/verifyRazorpayPaymentAction';
import { loadRazorpayScript } from '../lib/client/loadRazorpayScript';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId?: string;
  onPlanUpdated?: () => void;
  onSuccess?: () => void;
  businessId?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentPlanId,
  onPlanUpdated,
  onSuccess,
  businessId,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [plans, setPlans] = useState<DatabasePlan[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizedCurrentPlanId = (currentPlanId || 'FREE').toUpperCase();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setErrorNotice(null);
      setSuccessNotice(null);
      api.getPlans().then((data) => {
        setPlans(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = async (plan: DatabasePlan) => {
    if (plan.id.toUpperCase() === normalizedCurrentPlanId) return;
    setIsProcessing(true);
    setProcessingPlanId(plan.id);
    setErrorNotice(null);

    try {
      const billingCycle: 'monthly' | 'quarterly' | 'annual' = plan.id === 'FOUNDER' ? 'quarterly' : 'monthly';

      // 1. Create order on the server
      const orderRes = await createRazorpayOrderAction({
        targetPlanId: plan.id,
        billingCycle,
        businessId,
      });

      if (!orderRes.success || !orderRes.orderId || !orderRes.keyId) {
        throw new Error(orderRes.message || 'Failed to initiate payment order.');
      }

      // 2. Load Razorpay Checkout SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !(window as any).Razorpay) {
        throw new Error('Unable to load Razorpay Checkout script. Please check your internet connection.');
      }

      // 3. Open Razorpay Checkout modal
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency || 'INR',
        name: 'StreetCraft',
        description: `${orderRes.planName || plan.name} Subscription`,
        order_id: orderRes.orderId,
        theme: {
          color: '#166534',
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setIsProcessing(true);
          try {
            const verifyRes = await verifyRazorpayPaymentAction({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              targetPlanId: plan.id,
              billingCycle,
              businessId,
            });

            if (!verifyRes.success) {
              throw new Error(verifyRes.message || 'Payment signature verification failed.');
            }

            const limit = plan.monthly_campaign_limit ?? plan.monthly_pack_limit ?? 100;
            setSuccessNotice(`Upgraded to ${plan.name}. Quota updated to ${limit} monthly campaigns.`);
            if (onPlanUpdated) onPlanUpdated();
            if (onSuccess) onSuccess();

            setTimeout(() => {
              setSuccessNotice(null);
              onClose();
            }, 1800);
          } catch (verifyErr: any) {
            setErrorNotice(getUserFacingErrorMessage(verifyErr, 'Payment verification failed. If your account was charged, please contact support.'));
          } finally {
            setIsProcessing(false);
            setProcessingPlanId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setProcessingPlanId(null);
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.open();
    } catch (err: any) {
      setErrorNotice(getUserFacingErrorMessage(err, 'Failed to open payment gateway. Please check your credentials.'));
      setIsProcessing(false);
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '1080px', width: '95vw' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="section-eyebrow">STORE QUOTA</span>
            <h3 className="modal-title">Upgrade Campaign Tier</h3>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {errorNotice && (
          <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-xs)', margin: '16px 0 8px', color: '#b91c1c', fontSize: '13.5px' }}>
            {errorNotice}
          </div>
        )}

        {successNotice ? (
          <div style={{ padding: '32px', textAlign: 'center', background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-xs)', margin: '20px 0' }}>
            <h4 style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '8px' }}>
              Subscription Activated
            </h4>
            <p style={{ color: 'var(--color-ink)', fontSize: '14px' }}>{successNotice}</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', margin: '24px 0' }}>
              {loading ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--color-ink-muted)' }}>Loading plans...</div>
              ) : (
                plans.map((plan) => {
                  const isCurrent = plan.id.toUpperCase() === normalizedCurrentPlanId;
                  const isPro = plan.id === 'PRO' && !isCurrent;
                  const isCardProcessing = isProcessing && processingPlanId === plan.id;

                  return (
                    <div
                      key={plan.id}
                      style={{
                        background: isCurrent ? 'var(--color-surface)' : isPro ? 'var(--color-surface-raised)' : 'var(--color-surface)',
                        border: isCurrent ? '2px solid #9CA3AF' : isPro ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm, 10px)',
                        padding: '20px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: isPro ? '0 8px 24px rgba(22, 101, 52, 0.12)' : 'none',
                        position: 'relative',
                        opacity: isCurrent ? 0.92 : 1,
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '26px' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.2 }}>{plan.name}</span>
                          {isCurrent ? (
                            <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#374151', background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '2px 6px', borderRadius: '4px' }}>CURRENT PLAN</span>
                          ) : isPro ? (
                            <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>POPULAR</span>
                          ) : null}
                        </div>
                        <div style={{ fontSize: '24px', fontFamily: 'var(--font-display)', margin: '10px 0 2px', color: 'var(--color-ink)', fontWeight: 700 }}>
                          {plan.monthly_inr === 0 ? 'Free' : `₹${plan.monthly_inr}`}
                          <span style={{ fontSize: '12px', fontFamily: 'var(--font-body)', color: 'var(--color-ink-muted)', fontWeight: 400 }}>/mo</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--color-primary)', marginBottom: '14px', fontWeight: 600 }}>
                          {plan.monthly_campaign_limit ?? plan.monthly_pack_limit ?? 3} campaigns / month
                        </div>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--color-ink-soft)', padding: 0, margin: 0 }}>
                          {plan.features.slice(0, 3).map((f, i) => (
                            <li key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', lineHeight: 1.35 }}>
                              <Check size={13} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {isCurrent ? (
                        <button
                          type="button"
                          disabled
                          style={{
                            marginTop: '20px',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12.5px',
                            padding: '9px 12px',
                            cursor: 'not-allowed',
                            background: '#F3F4F6',
                            border: '1px solid #E5E7EB',
                            color: '#6B7280',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-sm, 8px)',
                          }}
                        >
                          Current Plan
                        </button>
                      ) : (
                        <button
                          className={isPro ? 'btn-primary' : 'btn-secondary'}
                          style={{ marginTop: '20px', width: '100%', justifyContent: 'center', fontSize: '12.5px', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                          disabled={isProcessing}
                          onClick={() => handleUpgrade(plan)}
                        >
                          {isCardProcessing ? (
                            <>
                              <Loader2 size={13} className="spin" />
                              <span>Connecting Gateway...</span>
                            </>
                          ) : (
                            `Select ${plan.name}`
                          )}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              <button className="btn-secondary" onClick={onClose} disabled={isProcessing}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
