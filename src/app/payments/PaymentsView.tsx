'use client';

import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '../components/PublicHeader';
import { ServerFooter } from '../components/ServerFooter';
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  Receipt,
  RotateCcw,
  Store,
  Layers,
} from 'lucide-react';

const PAYMENT_PLANS = [
  {
    id: 'FREE',
    name: 'Neighborhood Starter',
    price: 'Free',
    period: '/ lifetime',
    monthlyBreakdown: '₹0/mo · Free forever',
    quota: '3 campaigns / month',
    highlight: 'FREE FOREVER',
    accentColor: '#4B5563',
    ctaText: 'Start Free Account',
    ctaHref: '/free-tool',
    features: [
      '3 Coordinated monthly campaigns',
      'Google Search & Maps store updates',
      'Instagram post & reels generator',
      'Print-ready counter card formats',
      'Storefront review hooks',
      'Zero monthly cost forever',
    ],
  },
  {
    id: 'FOUNDER',
    name: 'Early Adopter Pro',
    price: '₹789',
    period: '/ quarter',
    monthlyBreakdown: 'That\'s ₹263/mo breakdown (Founder lifetime rate)',
    quota: '100 campaigns / month',
    highlight: 'LIMITED ALLOCATION',
    accentColor: 'var(--color-ink)',
    ctaText: 'Claim Founder Checkout',
    ctaHref: '/checkout?plan=FOUNDER&cycle=quarterly',
    features: [
      '100 Campaigns every month',
      'Locked-in rate guaranteed for life',
      'Google Maps & Search promotion hooks',
      'Instagram Reels & WhatsApp distribution',
      'Print-ready counter QR layouts',
      'Up to 3 storefront accounts',
      '0% sales commission',
    ],
  },
  {
    id: 'PRO',
    name: 'High-Street Pro',
    price: '₹1,099',
    period: '/ quarter',
    monthlyBreakdown: 'That\'s ₹366/mo breakdown (or ₹399/mo monthly)',
    quota: '100 campaigns / month',
    highlight: 'MOST POPULAR',
    accentColor: 'var(--color-primary)',
    ctaText: 'Checkout Pro Plan',
    ctaHref: '/checkout?plan=PRO&cycle=quarterly',
    features: [
      '100 Coordinated multi-channel campaigns',
      'Google Search & Maps store updates',
      'Instagram Post & Reels copy generator',
      'WhatsApp Broadcast templates',
      'High-resolution printable A5/A4 posters',
      'Up to 5 storefront workspaces',
      'Fast-lane generation priority',
      '0% commission on walk-in orders',
    ],
  },
  {
    id: 'GROWTH',
    name: 'Multi-Business Growth',
    price: '₹2,199',
    period: '/ quarter',
    monthlyBreakdown: 'That\'s ₹733/mo breakdown (or ₹799/mo monthly)',
    quota: '300 campaigns / month',
    highlight: 'MULTI-OUTLET',
    accentColor: '#374151',
    ctaText: 'Checkout Growth Plan',
    ctaHref: '/checkout?plan=GROWTH&cycle=quarterly',
    features: [
      '300 Campaigns monthly quota',
      'Up to 10 isolated storefront accounts',
      'Dedicated priority generation cluster',
      'Full multi-touchpoint distribution suite',
      'Custom print-ready poster formats',
      'Multi-brand asset libraries',
      'Priority commercial support',
      '0% sales commission',
    ],
  },
];

const PAYMENT_METHODS = [
  {
    name: 'Unified Payments Interface (UPI)',
    description: 'Instant zero-fee payments via Google Pay, PhonePe, Paytm, BHIM, or any banking UPI app.',
  },
  {
    name: 'Credit & Debit Cards',
    description: 'Visa, MasterCard, RuPay, and American Express with 3D Secure OTP verification.',
  },
  {
    name: 'Internet Banking',
    description: 'Direct account transfers supported across 50+ major Indian retail and corporate banks.',
  },
  {
    name: 'Digital Wallets',
    description: 'Instant checkout through top digital payment wallets.',
  },
];

const BILLING_STANDARDS = [
  {
    icon: ShieldCheck,
    title: 'Bank-Grade Security',
    description: 'All payments processed over 256-bit TLS encryption via official Razorpay banking rails.',
  },
  {
    icon: Zap,
    title: 'Instant Quota Unlock',
    description: 'Campaign limits and fast-lane processing are granted the millisecond transaction signature verifies.',
  },
  {
    icon: Receipt,
    title: 'GST-Compliant Invoices',
    description: 'Itemized commercial receipts automatically generated for business expense deduction.',
  },
  {
    icon: RotateCcw,
    title: 'Cancel Anytime',
    description: 'Cancel in 1 click from Plan & Usage. Keep full paid access until the current billing period concludes.',
  },
];

export function PaymentsView() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-page)' }}>
      <PublicHeader />

      <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '48px var(--space-gutter) 96px' }}>
        {/* Page Hero */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span className="section-eyebrow">COMMERCIAL BILLING &amp; CHECKOUT</span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '42px',
              color: 'var(--color-ink)',
              margin: '8px 0 14px',
              letterSpacing: '-0.02em',
            }}
          >
            Payments &amp; Commercial Subscriptions
          </h1>
          <p
            style={{
              fontSize: '16.5px',
              color: 'var(--color-ink-muted)',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Straightforward flat subscriptions for physical stores, cafes, and bakeries. Zero commissions on your revenue, instant quota provisioning, and bank-grade checkout.
          </p>
        </div>

        {/* Commercial Plans Grid */}
        <section style={{ marginBottom: '64px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="section-eyebrow">ACTIVE PLANS</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--color-ink)', margin: '2px 0 0' }}>
                Select Your Commercial Tier
              </h2>
            </div>
            <Link
              href="/pricing"
              style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>See Full Plan Matrix</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '24px' }}>
            {PAYMENT_PLANS.map((plan) => {
              const isPro = plan.id === 'PRO';

              return (
                <div
                  key={plan.id}
                  className="card"
                  style={{
                    padding: '32px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isPro ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: isPro ? 'var(--color-surface-raised)' : 'var(--color-surface)',
                    position: 'relative',
                    boxShadow: isPro ? '0 8px 28px rgba(22, 101, 52, 0.12)' : 'var(--shadow-subtle)',
                  }}
                >
                  <div>
                    {plan.highlight && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: isPro ? '#15803D' : '#374151',
                          background: isPro ? '#DCFCE7' : '#F3F4F6',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          letterSpacing: '0.04em',
                          display: 'inline-block',
                          marginBottom: '12px',
                        }}
                      >
                        {plan.highlight}
                      </span>
                    )}

                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-ink)', margin: 0 }}>
                      {plan.name}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '14px 0 2px' }}>
                      <span style={{ fontSize: '38px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1 }}>
                        {plan.price}
                      </span>
                      <span style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)' }}>{plan.period}</span>
                    </div>

                    <div style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)', marginBottom: '10px', fontWeight: 500 }}>
                      {plan.monthlyBreakdown}
                    </div>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '20px' }}>
                      {plan.quota}
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--color-ink-soft)' }}>
                      {plan.features.map((feat, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.4 }}>
                          <CheckCircle2 size={15} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={plan.ctaHref || `/checkout?plan=${plan.id}`}
                    className={isPro ? 'btn-primary' : 'btn-secondary'}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '14px',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Lock size={14} />
                    <span>{plan.ctaText}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Security & Commercial Standards */}
        <section style={{ marginBottom: '64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span className="section-eyebrow">TRUST &amp; RELIABILITY</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--color-ink)' }}>
              Commercial Billing Standards
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {BILLING_STANDARDS.map((standard, idx) => {
              const Icon = standard.icon;
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '24px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--color-primary-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <Icon size={20} color="var(--color-primary)" />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '6px' }}>
                    {standard.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: 1.5, margin: 0 }}>
                    {standard.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Payment Methods Supported */}
        <section
          className="card"
          style={{
            padding: '36px',
            marginBottom: '64px',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '32px' }}>
            <span className="section-eyebrow">PAYMENT METHODS</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--color-ink)', margin: '4px 0 8px' }}>
              Supported Payment Rails
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)' }}>
              Integrated with India's most trusted banking gateways. All transactions settle instantly.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {PAYMENT_METHODS.map((method, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--color-surface)',
                  padding: '20px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  {method.name}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: 1.45 }}>
                  {method.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Direct CTA Bar */}
        <section
          style={{
            background: 'var(--color-ink)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-sm)',
            padding: '40px 36px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', margin: '0 0 6px', color: '#FFFFFF' }}>
              Ready to Upgrade Your Store Marketing?
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.75)' }}>
              100 campaigns per month for ₹399. No contracts, cancel anytime.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/checkout?plan=PRO"
              className="btn-primary"
              style={{
                background: '#FFFFFF',
                color: 'var(--color-ink)',
                padding: '12px 28px',
                fontSize: '14.5px',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Go to Checkout &rarr;
            </Link>
            <Link
              href="/pricing"
              className="btn-secondary"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                padding: '12px 20px',
                fontSize: '14.5px',
                textDecoration: 'none',
              }}
            >
              Compare Plans
            </Link>
          </div>
        </section>
      </main>

      <ServerFooter variant="full" />
    </div>
  );
}
