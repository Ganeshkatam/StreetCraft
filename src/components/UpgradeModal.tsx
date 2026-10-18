import React, { useState, useEffect } from 'react';
import { DatabasePlan } from '../types/billing';
import { api } from '../lib/api';
import { X, Check, Loader2, ExternalLink, Table, Layers } from 'lucide-react';
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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
      // Founder tier requires quarterly or annual billing
      const effectiveBillingCycle: 'monthly' | 'quarterly' | 'annual' =
        plan.id === 'FOUNDER' && billingCycle === 'monthly' ? 'quarterly' : billingCycle;

      // 1. Create order on the server
      const orderRes = await createRazorpayOrderAction({
        targetPlanId: plan.id,
        billingCycle: effectiveBillingCycle,
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
        description: `${orderRes.planName || plan.name} (${effectiveBillingCycle.toUpperCase()})`,
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
              billingCycle: effectiveBillingCycle,
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

  const getPlanRateDisplay = (plan: DatabasePlan) => {
    if (plan.monthly_inr === 0) {
      return { price: 'Free', period: '/mo', subtext: 'Free forever' };
    }

    if (billingCycle === 'annual') {
      const annualPrice = plan.annual_price_inr;
      const effectivePerMonth = Math.round(annualPrice / 12);
      return {
        price: `₹${effectivePerMonth}`,
        period: '/mo',
        subtext: `Billed annually at ₹${annualPrice.toLocaleString('en-IN')} (2 months free)`,
      };
    }

    if (billingCycle === 'quarterly') {
      const quarterlyPrice = plan.quarterly_price_inr;
      const effectivePerMonth = Math.round(quarterlyPrice / 3);
      return {
        price: `₹${effectivePerMonth}`,
        period: '/mo',
        subtext: `Billed quarterly at ₹${quarterlyPrice.toLocaleString('en-IN')}`,
      };
    }

    if (plan.id === 'FOUNDER') {
      return {
        price: '₹279',
        period: '/mo',
        subtext: `Billed quarterly at ₹${plan.quarterly_price_inr.toLocaleString('en-IN')}`,
      };
    }

    return {
      price: `₹${plan.monthly_inr}`,
      period: '/mo',
      subtext: 'Billed monthly',
    };
  };

  const featureMatrixRows = [
    {
      feature: 'Monthly Campaigns',
      starter: `${plans.find((p) => p.id === 'FREE')?.monthly_campaign_limit ?? 3} campaigns / mo`,
      founder: `${plans.find((p) => p.id === 'FOUNDER')?.monthly_campaign_limit ?? 100} campaigns / mo`,
      pro: `${plans.find((p) => p.id === 'PRO')?.monthly_campaign_limit ?? 100} campaigns / mo`,
      growth: `${plans.find((p) => p.id === 'GROWTH')?.monthly_campaign_limit ?? 300} campaigns / mo`,
    },
    {
      feature: 'Google Search & Maps',
      starter: 'Included',
      founder: 'Included',
      pro: 'Included',
      growth: 'Included',
    },
    {
      feature: 'Instagram Reels & Stories',
      starter: 'Included',
      founder: 'Included',
      pro: 'Included',
      growth: 'Included',
    },
    {
      feature: 'WhatsApp Broadcast Copy',
      starter: 'Included',
      founder: 'Included',
      pro: 'Included',
      growth: 'Included',
    },
    {
      feature: 'Print-Ready Counter Cards',
      starter: 'Standard',
      founder: 'High-Res A5/A4',
      pro: 'High-Res A5/A4',
      growth: 'Custom Multi-Format',
    },
    {
      feature: 'Storefront Accounts',
      starter: 'Up to 2 Businesses',
      founder: 'Up to 3 Businesses',
      pro: 'Up to 5 Businesses',
      growth: 'Up to 10 Businesses',
    },
    {
      feature: 'Generation Queue',
      starter: 'Standard',
      founder: 'Fast Lane',
      pro: 'Fast Lane',
      growth: 'Dedicated Priority Queue',
    },
    {
      feature: 'Sales Commissions',
      starter: '0%',
      founder: '0%',
      pro: '0%',
      growth: '0%',
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '1100px', width: '95vw', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="section-eyebrow">STORE QUOTA &amp; COMMERCIAL TIERS</span>
            <h3 className="modal-title">Upgrade Campaign Tier</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href="/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{
                fontSize: '12.5px',
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                textDecoration: 'none',
              }}
              title="Open full pricing breakdown and FAQs in a new tab"
            >
              <span>See All Plans</span>
              <ExternalLink size={13} />
            </a>
            <button className="btn-ghost" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
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
            {/* Top Toolbar: Billing Switcher & View Mode Toggle */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                margin: '18px 0 16px',
                padding: '10px 14px',
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              {/* Billing Cycle Selector */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--color-surface)', padding: '3px', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
                {(['monthly', 'quarterly', 'annual'] as const).map((cycle) => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setBillingCycle(cycle)}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '20px',
                      border: 'none',
                      background: billingCycle === cycle ? 'var(--color-ink)' : 'transparent',
                      color: billingCycle === cycle ? '#FFFFFF' : 'var(--color-ink-muted)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span>{cycle.charAt(0).toUpperCase() + cycle.slice(1)}</span>
                    {cycle === 'annual' && (
                      <span
                        style={{
                          fontSize: '10px',
                          background: 'var(--color-primary-subtle)',
                          color: 'var(--color-primary)',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          fontWeight: 700,
                        }}
                      >
                        2 MO FREE
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle: Cards vs Comparison Table */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  className={viewMode === 'cards' ? 'btn-primary' : 'btn-ghost'}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                  onClick={() => setViewMode('cards')}
                >
                  <Layers size={13} />
                  <span>Plan Cards</span>
                </button>
                <button
                  type="button"
                  className={viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                  onClick={() => setViewMode('table')}
                >
                  <Table size={13} />
                  <span>Feature Comparison</span>
                </button>
              </div>
            </div>

            {/* View Mode 1: Cards Grid */}
            {viewMode === 'cards' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', margin: '20px 0' }}>
                {loading ? (
                  <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--color-ink-muted)' }}>Loading plans...</div>
                ) : (
                  plans.map((plan) => {
                    const isCurrent = plan.id.toUpperCase() === normalizedCurrentPlanId;
                    const isPro = plan.id === 'PRO' && !isCurrent;
                    const isCardProcessing = isProcessing && processingPlanId === plan.id;
                    const rateDisplay = getPlanRateDisplay(plan);

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
                            {rateDisplay.price}
                            <span style={{ fontSize: '12px', fontFamily: 'var(--font-body)', color: 'var(--color-ink-muted)', fontWeight: 400 }}>{rateDisplay.period}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-ink-muted)', minHeight: '16px', marginBottom: '8px' }}>
                            {rateDisplay.subtext}
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
            ) : (
              /* View Mode 2: Detailed Feature Comparison Matrix */
              <div style={{ margin: '20px 0', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', overflowX: 'auto', background: 'var(--color-surface)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-surface-raised)', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '12px 16px', color: 'var(--color-ink-muted)', fontWeight: 600, width: '28%' }}>Capability</th>
                      <th style={{ padding: '12px 14px', color: 'var(--color-ink)', fontWeight: 600, width: '18%' }}>Starter (Free)</th>
                      <th style={{ padding: '12px 14px', color: 'var(--color-ink)', fontWeight: 600, width: '18%' }}>Early Adopter (₹279/mo)</th>
                      <th style={{ padding: '12px 14px', color: 'var(--color-primary)', fontWeight: 700, width: '18%' }}>High-Street Pro (₹399/mo)</th>
                      <th style={{ padding: '12px 14px', color: 'var(--color-ink)', fontWeight: 600, width: '18%' }}>Growth (₹799/mo)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureMatrixRows.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '10px 16px', color: 'var(--color-ink)', fontWeight: 500 }}>{row.feature}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--color-ink-muted)' }}>{row.starter}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--color-ink-soft)' }}>{row.founder}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--color-primary)', fontWeight: 600 }}>{row.pro}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--color-ink)' }}>{row.growth}</td>
                      </tr>
                    ))}
                    {/* Action Row */}
                    <tr style={{ background: 'var(--color-surface-raised)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-ink)' }}>Action</td>
                      {['FREE', 'FOUNDER', 'PRO', 'GROWTH'].map((pid) => {
                        const plan = plans.find((p) => p.id === pid);
                        const isCurrent = pid === normalizedCurrentPlanId;
                        const isCardProcessing = isProcessing && processingPlanId === pid;

                        if (!plan) return <td key={pid} style={{ padding: '12px 14px' }}>-</td>;

                        return (
                          <td key={pid} style={{ padding: '12px 14px' }}>
                            {isCurrent ? (
                              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-ink-muted)' }}>
                                Current Plan
                              </span>
                            ) : (
                              <button
                                className={pid === 'PRO' ? 'btn-primary' : 'btn-secondary'}
                                style={{ fontSize: '11.5px', padding: '6px 10px', width: '100%', justifyContent: 'center' }}
                                disabled={isProcessing}
                                onClick={() => handleUpgrade(plan)}
                              >
                                {isCardProcessing ? (
                                  <Loader2 size={12} className="spin" />
                                ) : (
                                  `Select ${plan.id}`
                                )}
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer with See All Plans link and Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <a
                  href="/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12.5px',
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: 600,
                  }}
                >
                  <span>See All Plans &amp; Full Feature Breakdown</span>
                  <ExternalLink size={13} />
                </a>
              </div>
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

