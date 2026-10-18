'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BillablePlanId, BillingCycle, getPlanPricingQuote } from '../../lib/domain/plan/planPricing';
import { createRazorpayOrderAction } from '../../lib/server/plan/createRazorpayOrderAction';
import { verifyRazorpayPaymentAction } from '../../lib/server/plan/verifyRazorpayPaymentAction';
import { loadRazorpayScript } from '../../lib/client/loadRazorpayScript';
import { getUserFacingErrorMessage } from '../../lib/userFacingError';
import { Logo } from '../../components/Logo';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  ArrowLeft,
  Loader2,
  Sparkles,
  Store,
  Check,
  Zap,
} from 'lucide-react';

export interface CheckoutStoreOption {
  id: string;
  name: string;
  category: string;
}

interface CheckoutViewProps {
  initialPlanId?: string;
  initialBillingCycle?: string;
  initialBusinessId?: string;
  isAuthenticated: boolean;
  userEmail?: string;
  businesses: CheckoutStoreOption[];
  returnUrl?: string;
}

const AVAILABLE_PLANS: Array<{
  id: BillablePlanId;
  name: string;
  monthlyQuota: number;
  highlight?: string;
  features: string[];
}> = [
    {
      id: 'PRO',
      name: 'High-Street Pro',
      monthlyQuota: 100,
      highlight: 'MOST POPULAR',
      features: [
        '100 Coordinated Campaigns / month',
        'Google Search & Maps Store Updates',
        'Instagram Post & Reels Generation',
        'WhatsApp Broadcast Copy',
        'Print-Ready A5/A4 Counter Cards',
        'Up to 5 Isolated Storefront Accounts',
        'Fast-Lane Generation Priority',
        '0% Sales Commission',
      ],
    },
    {
      id: 'FOUNDER',
      name: 'Early Adopter Pro',
      monthlyQuota: 100,
      highlight: 'FOUNDER EXCLUSIVE',
      features: [
        '100 Coordinated Campaigns / month',
        'Locked-In Founder Rates Forever',
        'Google Search & Maps Updates',
        'Instagram Post & Reels Generator',
        'WhatsApp Broadcast Copy',
        'Print-Ready Counter Cards',
        'Up to 3 Storefront Accounts',
        '0% Sales Commission',
      ],
    },
    {
      id: 'GROWTH',
      name: 'Multi-Business Growth',
      monthlyQuota: 300,
      highlight: 'MULTI-STORE SCALING',
      features: [
        '300 Coordinated Campaigns / month',
        'Full Multi-Touchpoint Distribution',
        'Up to 10 Isolated Storefronts',
        'Dedicated Priority Queue',
        'Custom Print Formats',
        'Multi-Brand Asset Library',
        'Dedicated Account Review',
        '0% Sales Commission',
      ],
    },
  ];

export function CheckoutView({
  initialPlanId,
  initialBillingCycle,
  initialBusinessId,
  isAuthenticated,
  userEmail,
  businesses,
  returnUrl,
}: CheckoutViewProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const normalizePlanId = (raw?: string): BillablePlanId => {
    const upper = (raw || 'PRO').toUpperCase();
    if (upper === 'GROWTH' || upper === 'FOUNDER') return upper;
    return 'PRO';
  };

  const normalizeCycle = (raw?: string): BillingCycle => {
    const lower = (raw || 'monthly').toLowerCase();
    if (lower === 'quarterly' || lower === 'annual') return lower;
    return 'monthly';
  };

  const [selectedPlan, setSelectedPlan] = useState<BillablePlanId>(normalizePlanId(initialPlanId));
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(normalizeCycle(initialBillingCycle));
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(
    initialBusinessId && businesses.some((b) => b.id === initialBusinessId)
      ? initialBusinessId
      : businesses[0]?.id || ''
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<{
    orderId: string;
    paymentId: string;
    planName: string;
    quota: number;
    amountPaid: number;
  } | null>(null);

  // Founder plan requires quarterly or annual cycle
  const effectiveBillingCycle: BillingCycle =
    selectedPlan === 'FOUNDER' && billingCycle === 'monthly' ? 'quarterly' : billingCycle;

  const quote = getPlanPricingQuote(selectedPlan, effectiveBillingCycle);
  const activePlanDef = AVAILABLE_PLANS.find((p) => p.id === selectedPlan) || AVAILABLE_PLANS[0];
  const activeBusiness = businesses.find((b) => b.id === selectedBusinessId);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      const targetParams = new URLSearchParams({
        plan: selectedPlan,
        cycle: billingCycle,
        ...(selectedBusinessId ? { businessId: selectedBusinessId } : {}),
      });
      router.push(`/login?returnUrl=${encodeURIComponent(`/checkout?${targetParams.toString()}`)}`);
      return;
    }

    setIsProcessing(true);
    setErrorNotice(null);

    try {
      // 1. Create order on server
      const orderRes = await createRazorpayOrderAction({
        targetPlanId: selectedPlan,
        billingCycle: effectiveBillingCycle,
        businessId: selectedBusinessId || undefined,
      });

      if (!orderRes.success || !orderRes.orderId || !orderRes.keyId) {
        throw new Error(orderRes.message || 'Unable to initialize Razorpay order.');
      }

      // 2. Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !(window as any).Razorpay) {
        throw new Error('Unable to connect to Razorpay secure checkout. Please check your network connection.');
      }

      // 3. Launch Razorpay modal
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency || 'INR',
        name: 'StreetCraft',
        description: `${orderRes.planName || activePlanDef.name} Subscription (${effectiveBillingCycle.toUpperCase()})`,
        order_id: orderRes.orderId,
        prefill: {
          email: userEmail || '',
        },
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
              targetPlanId: selectedPlan,
              billingCycle: effectiveBillingCycle,
              businessId: selectedBusinessId || undefined,
            });

            if (!verifyRes.success) {
              throw new Error(verifyRes.message || 'Payment signature verification failed.');
            }

            setPaymentSuccess({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              planName: activePlanDef.name,
              quota: quote.monthlyPackLimit,
              amountPaid: quote.amountINR,
            });

            startTransition(() => {
              router.refresh();
            });
          } catch (verifyErr: any) {
            setErrorNotice(
              getUserFacingErrorMessage(
                verifyErr,
                'Payment verification failed. If your card was charged, contact support with your payment ID.'
              )
            );
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.open();
    } catch (err: any) {
      setErrorNotice(
        getUserFacingErrorMessage(err, 'Failed to open payment gateway. Please check your connection and credentials.')
      );
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-page)', display: 'flex', flexDirection: 'column' }}>
      {/* Checkout Navbar */}
      <header
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '16px var(--space-gutter)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Logo size="md" />
            </Link>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--color-ink-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderLeft: '1px solid var(--color-border)',
                paddingLeft: '16px',
              }}
            >
              Secure Commercial Checkout
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: 'var(--color-primary)',
                background: 'var(--color-primary-subtle)',
                padding: '4px 10px',
                borderRadius: '16px',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={14} />
              <span>256-Bit Encrypted</span>
            </div>

            <Link
              href={returnUrl || (selectedBusinessId ? `/user/business/${encodeURIComponent(selectedBusinessId)}/today` : '/pricing')}
              style={{
                fontSize: '13px',
                color: 'var(--color-ink-muted)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <ArrowLeft size={13} />
              <span>Cancel</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Checkout Container */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '36px var(--space-gutter) 80px' }}>
        {paymentSuccess ? (
          /* Payment Success Confirmation */
          <div
            className="card"
            style={{
              maxWidth: '680px',
              margin: '20px auto',
              padding: '48px 40px',
              textAlign: 'center',
              border: '2px solid var(--color-primary)',
              background: 'var(--color-surface)',
              boxShadow: 'var(--shadow-paper)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'var(--color-primary-subtle)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <CheckCircle2 size={36} color="var(--color-primary)" />
            </div>

            <span className="section-eyebrow" style={{ color: 'var(--color-primary)' }}>
              PAYMENT VERIFIED &amp; COMPLETED
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '32px',
                color: 'var(--color-ink)',
                margin: '8px 0 12px',
              }}
            >
              Subscription Activated
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--color-ink-muted)', maxWidth: '480px', margin: '0 auto 28px' }}>
              Your store is now upgraded to <strong>{paymentSuccess.planName}</strong> with an allowance of{' '}
              <strong>{paymentSuccess.quota} campaigns per month</strong>.
            </p>

            <div
              style={{
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xs)',
                padding: '18px 24px',
                textAlign: 'left',
                fontSize: '13px',
                marginBottom: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-ink-muted)' }}>Order ID:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{paymentSuccess.orderId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-ink-muted)' }}>Payment ID:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{paymentSuccess.paymentId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-ink-muted)' }}>Amount Paid:</span>
                <strong>₹{paymentSuccess.amountPaid.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-ink-muted)' }}>Storefront:</span>
                <strong>{activeBusiness ? activeBusiness.name : 'Primary Account'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {selectedBusinessId ? (
                <>
                  <Link
                    href={`/user/business/${encodeURIComponent(selectedBusinessId)}/create`}
                    className="btn-primary"
                    style={{ padding: '12px 28px', fontSize: '14px', textDecoration: 'none' }}
                  >
                    Create a Campaign Now &rarr;
                  </Link>
                  <Link
                    href={`/user/business/${encodeURIComponent(selectedBusinessId)}/plan`}
                    className="btn-secondary"
                    style={{ padding: '12px 24px', fontSize: '14px', textDecoration: 'none' }}
                  >
                    View Plan &amp; Quota
                  </Link>
                </>
              ) : (
                <Link
                  href="/user/today"
                  className="btn-primary"
                  style={{ padding: '12px 28px', fontSize: '14px', textDecoration: 'none' }}
                >
                  Go to Storefront Dashboard &rarr;
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* Main 2-Column Checkout Layout */
          <div>
            <div style={{ marginBottom: '28px' }}>
              <span className="section-eyebrow">CHECKOUT &amp; PLAN ACTIVATION</span>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '34px',
                  color: 'var(--color-ink)',
                  margin: '4px 0 6px',
                }}
              >
                Complete Your Subscription
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--color-ink-muted)', margin: 0 }}>
                Instant quota upgrade across Google Search, Instagram Reels, WhatsApp, and in-store print channels.
              </p>
            </div>

            {errorNotice && (
              <div
                style={{
                  padding: '14px 18px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: 'var(--radius-xs)',
                  marginBottom: '24px',
                  color: '#b91c1c',
                  fontSize: '13.5px',
                }}
              >
                {errorNotice}
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
                gap: '32px',
                alignItems: 'start',
              }}
            >
              {/* Left Column: Order Configuration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* 1. Storefront Selection */}
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Store size={18} color="var(--color-primary)" />
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                      Target Storefront
                    </h3>
                  </div>

                  {businesses.length > 0 ? (
                    <div>
                      <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginBottom: '12px' }}>
                        The quota allowance and generation fast lane will be attached to this store:
                      </p>
                      <select
                        value={selectedBusinessId}
                        onChange={(e) => setSelectedBusinessId(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--color-border)',
                          background: 'var(--color-surface)',
                          fontSize: '14px',
                          color: 'var(--color-ink)',
                          fontWeight: 500,
                        }}
                      >
                        {businesses.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.category || 'Retail'})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : isAuthenticated ? (
                    <div style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)' }}>
                      Subscription will be linked to your primary account. You can attach storefronts anytime from Store Settings.
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '12px 16px',
                        background: 'var(--color-surface-raised)',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--color-border)',
                        fontSize: '13px',
                        color: 'var(--color-ink-soft)',
                      }}
                    >
                      Sign in or create an account to assign this subscription to your physical store.
                    </div>
                  )}
                </div>

                {/* 2. Plan Tier Selection */}
                <div className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="var(--color-primary)" />
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                        Select Commercial Tier
                      </h3>
                    </div>
                    <Link
                      href="/pricing"
                      target="_blank"
                      style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}
                    >
                      Compare All Features &rarr;
                    </Link>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    {AVAILABLE_PLANS.map((plan) => {
                      const isSelected = selectedPlan === plan.id;
                      const planQuote = getPlanPricingQuote(
                        plan.id,
                        plan.id === 'FOUNDER' && billingCycle === 'monthly' ? 'quarterly' : billingCycle
                      );

                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan.id)}
                          style={{
                            border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            background: isSelected ? 'var(--color-surface-raised)' : 'var(--color-surface)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 4px 16px rgba(22, 101, 52, 0.08)' : 'none',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '22px' }}>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)' }}>
                                {plan.name}
                              </span>
                              {plan.highlight && (
                                <span
                                  style={{
                                    fontSize: '9px',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 700,
                                    color: isSelected ? '#15803D' : '#4B5563',
                                    background: isSelected ? '#DCFCE7' : '#F3F4F6',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {plan.highlight}
                                </span>
                              )}
                            </div>

                            <div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-ink)', margin: '8px 0 2px' }}>
                              ₹{planQuote.monthlyEffectiveINR}
                              <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', color: 'var(--color-ink-muted)', fontWeight: 400 }}>/mo</span>
                            </div>

                            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '10px' }}>
                              {plan.monthlyQuota} campaigns / mo
                            </div>
                          </div>

                          <div
                            style={{
                              marginTop: '12px',
                              paddingTop: '10px',
                              borderTop: '1px solid var(--color-border)',
                              fontSize: '11px',
                              color: isSelected ? 'var(--color-primary)' : 'var(--color-ink-muted)',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <div
                              style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                border: isSelected ? '4px solid var(--color-primary)' : '1px solid #9CA3AF',
                                background: '#FFFFFF',
                              }}
                            />
                            <span>{isSelected ? 'Selected' : 'Choose Tier'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Billing Cycle Selection */}
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 14px' }}>
                    Billing Cycle
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {(['monthly', 'quarterly', 'annual'] as const).map((cycle) => {
                      const isSelected = billingCycle === cycle;
                      const isFounderMonthly = selectedPlan === 'FOUNDER' && cycle === 'monthly';

                      return (
                        <button
                          key={cycle}
                          type="button"
                          onClick={() => setBillingCycle(cycle)}
                          style={{
                            padding: '14px 12px',
                            borderRadius: 'var(--radius-xs)',
                            border: isSelected ? '2px solid var(--color-ink)' : '1px solid var(--color-border)',
                            background: isSelected ? 'var(--color-surface-raised)' : 'var(--color-surface)',
                            color: 'var(--color-ink)',
                            textAlign: 'center',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ fontSize: '13.5px', fontWeight: 600 }}>
                            {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                          </span>
                          {cycle === 'annual' && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--color-primary)',
                                background: 'var(--color-primary-subtle)',
                                padding: '1px 6px',
                                borderRadius: '10px',
                                fontWeight: 700,
                              }}
                            >
                              2 MO FREE (SAVE 17%)
                            </span>
                          )}
                          {cycle === 'quarterly' && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--color-ink-soft)',
                                fontWeight: 600,
                              }}
                            >
                              Save 8%
                            </span>
                          )}
                          {isFounderMonthly && (
                            <span
                              style={{
                                fontSize: '9.5px',
                                color: 'var(--color-accent)',
                                fontWeight: 600,
                              }}
                            >
                              Billed quarterly
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. What's Included */}
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 12px' }}>
                    Included With {activePlanDef.name}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    {activePlanDef.features.map((feature, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--color-ink-soft)' }}>
                        <Check size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary & Checkout CTA */}
              <div
                style={{
                  position: 'sticky',
                  top: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div
                  className="card"
                  style={{
                    padding: '28px',
                    border: '1.5px solid var(--color-border)',
                    boxShadow: 'var(--shadow-paper)',
                    background: 'var(--color-surface)',
                  }}
                >
                  <span className="section-eyebrow" style={{ letterSpacing: '0.08em' }}>ORDER SUMMARY</span>
                  <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-ink)', margin: '4px 0 16px' }}>
                    {quote.planName}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-ink-muted)' }}>Billing Cycle:</span>
                      <strong style={{ color: 'var(--color-ink)', textTransform: 'capitalize' }}>{quote.billingCycle}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-ink-muted)' }}>Campaign Allowance:</span>
                      <strong style={{ color: 'var(--color-primary)' }}>{quote.monthlyPackLimit} campaigns / mo</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-ink-muted)' }}>Effective Rate:</span>
                      <span>₹{quote.monthlyEffectiveINR} / month</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-ink-muted)' }}>Sales Commission:</span>
                      <strong style={{ color: 'var(--color-primary)' }}>0% (Retain 100%)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-ink-muted)' }}>Taxes:</span>
                      <span>Included</span>
                    </div>
                  </div>

                  {/* Total Amount Due */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)' }}>Total Due Today:</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1 }}>
                        ₹{quote.amountINR.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                        INR (all-inclusive)
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {isAuthenticated ? (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{
                        width: '100%',
                        padding: '14px',
                        fontSize: '15px',
                        justifyContent: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      disabled={isProcessing}
                      onClick={handleCheckout}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={16} className="spin" />
                          <span>Connecting Gateway...</span>
                        </>
                      ) : (
                        <>
                          <Lock size={15} />
                          <span>Pay ₹{quote.amountINR.toLocaleString('en-IN')} with Razorpay</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{
                        width: '100%',
                        padding: '14px',
                        fontSize: '14.5px',
                        justifyContent: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                      onClick={handleCheckout}
                    >
                      <span>Sign In to Complete Payment &rarr;</span>
                    </button>
                  )}

                  {/* Security Guarantees */}
                  <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px', color: 'var(--color-ink-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={13} color="var(--color-primary)" />
                      <span>Instant quota unlock upon successful transaction</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={13} color="var(--color-primary)" />
                      <span>Supports UPI, Cards, NetBanking, and RuPay</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={13} color="var(--color-primary)" />
                      <span>Cancel anytime with 1 click from Plan &amp; Usage</span>
                    </div>
                  </div>
                </div>

                {/* Trust Footer Card */}
                <div
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <CreditCard size={22} color="var(--color-ink-muted)" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '11.5px', color: 'var(--color-ink-soft)', lineHeight: 1.4 }}>
                    Secured by Razorpay. StreetCraft never stores payment card numbers or banking secrets.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
