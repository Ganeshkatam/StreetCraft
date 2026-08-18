'use client';

import React from 'react';
import Link from 'next/link';
import { PlanViewModel } from '../../../../lib/domain/account/accountTypes';
import { CreditCard, Sparkles, Store, ChevronRight, Check, FileText } from 'lucide-react';

interface PlanPanelViewProps {
  planData: PlanViewModel;
}

export function PlanPanelView({ planData }: PlanPanelViewProps) {
  const { subscription, plan, usage } = planData;

  const isPaid = subscription && subscription.planId !== 'FREE';
  const planName = plan?.name || (subscription?.planId ? subscription.planId : 'Neighborhood Starter');
  const monthlyPriceInr = plan?.monthlyInr ?? 0;
  const billingCycle = subscription?.billingCycle || 'monthly';
  const businessLimit = plan?.businessLimit ?? 1;
  const monthlyCampaignLimit = plan?.monthlyCampaignLimit ?? 3;

  return (
    <div className="account-pane">
      <div className="account-pane-header">
        <span className="account-pane-tag">COMMERCIAL SUBSCRIPTION</span>
        <h1 className="account-pane-title">Plan &amp; Usage Limits</h1>
        <p className="account-pane-subtitle">
          Manage your subscription tier, monthly campaign allowances, and connected store limits.
        </p>
      </div>

      <div className="account-pane-fields">
        {/* Tier Hero Card */}
        <div
          className="account-field-card locked"
          style={{
            padding: '20px 24px',
            marginBottom: '14px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAF9 100%)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={16} color="var(--color-primary)" />
              <span className="account-field-card-label" style={{ margin: 0 }}>ACTIVE MEMBERSHIP</span>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--color-primary)',
                background: 'var(--color-primary-subtle)',
                padding: '3px 10px',
                borderRadius: '4px',
                letterSpacing: '0.04em',
              }}
            >
              {planName.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-ink)' }}>
                {isPaid ? `₹${monthlyPriceInr}` : 'Free'}
                <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-ink-muted)', marginLeft: '6px' }}>
                  / month {isPaid ? `(${billingCycle})` : ''}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--color-ink)' }}>
                  <Check size={14} color="var(--color-primary)" />
                  <span>Up to <strong>{businessLimit} connected {businessLimit === 1 ? 'storefront' : 'storefronts'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--color-ink)' }}>
                  <Check size={14} color="var(--color-primary)" />
                  <span><strong>{monthlyCampaignLimit} AI campaign packs</strong> per month</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--color-ink)' }}>
                  <Check size={14} color="var(--color-primary)" />
                  <span>Multi-channel publishing (WhatsApp, Instagram, Posters, SMS)</span>
                </div>
              </div>
            </div>

            <div>
              <Link
                href="/user/myplan"
                className="btn-primary"
                style={{ fontSize: '13px', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
              >
                <Sparkles size={14} />
                <span>{isPaid ? 'Manage Subscription' : 'Upgrade to Pro'}</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Active Storefront Quota Breakdown */}
        {usage && (
          <div className="account-field-card locked" style={{ padding: '18px 22px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={15} color="var(--color-primary)" />
                <span className="account-field-card-label" style={{ margin: 0 }}>
                  ACTIVE STORE QUOTA ({usage.businessName.toUpperCase()})
                </span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
                CURRENT BILLING CYCLE
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-ink)' }}>
                {usage.campaignsRemaining}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--color-ink-muted)' }}>
                campaigns remaining of {usage.campaignLimit} allowance
              </span>
            </div>

            <div style={{ background: '#E5E7EB', height: '6px', borderRadius: '3px', overflow: 'hidden', margin: '8px 0 4px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(0, (usage.campaignsUsed / usage.campaignLimit) * 100))}%`,
                  background: 'var(--color-primary)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Invoices & Billing History Card */}
        <div
          className="account-field-card locked"
          style={{
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', flexShrink: 0 }}>
              <FileText size={16} />
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)' }}>
                Invoices &amp; Billing History
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                View past payment receipts, tax invoices, and detailed campaign generation logs.
              </div>
            </div>
          </div>

          <Link
            href="/user/myplan"
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}
          >
            <span>View Invoices</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
