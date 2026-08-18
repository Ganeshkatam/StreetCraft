'use client';

import React from 'react';
import Link from 'next/link';
import { PlanViewModel } from '../../../../lib/domain/account/accountTypes';
import { AccountProfileHeader } from '../components/AccountProfileHeader';
import { AccountSecurityFooter } from '../components/AccountSecurityFooter';
import { CreditCard, Sparkles, Store, ChevronRight } from 'lucide-react';

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
    <div>
      <AccountProfileHeader
        eyebrow="SUBSCRIPTION"
        title="Plan &amp; Usage Limits"
        subtitle="Manage your commercial subscription tier, monthly campaign allowances, and active store limits."
      />

      <div className="account-stage-content">
        {/* Current Plan Summary Card */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                Account Subscription
              </h3>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--color-primary)',
                background: 'var(--color-primary-subtle)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              {planName.toUpperCase()}
            </span>
          </div>

          <div className="workspace-grid-2col" style={{ alignItems: 'center', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-ink)' }}>
                {isPaid ? `₹${monthlyPriceInr}` : 'Free'}
                <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-ink-muted)', marginLeft: '4px' }}>
                  / month {isPaid ? `(${billingCycle})` : ''}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-ink-soft)', marginTop: '4px', margin: '4px 0 0' }}>
                Allows up to <strong>{businessLimit} connected {businessLimit === 1 ? 'storefront' : 'storefronts'}</strong> and <strong>{monthlyCampaignLimit} campaigns/mo</strong> per store.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link
                href="/user/myplan"
                className="btn-primary"
                style={{ fontSize: '13px', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={14} />
                <span>{isPaid ? 'Manage / Upgrade Plan' : 'Upgrade to Pro'}</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Active Storefront Quota Breakdown */}
        {usage && (
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={18} color="var(--color-accent)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                  Active Store Quota ({usage.businessName})
                </h3>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
                CURRENT PERIOD
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-ink)' }}>
                {usage.campaignsRemaining}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--color-ink-muted)' }}>
                campaigns remaining of {usage.campaignLimit} limit
              </span>
            </div>

            <div style={{ background: 'var(--color-surface-raised)', height: '8px', borderRadius: '4px', overflow: 'hidden', margin: '12px 0 16px', border: '1px solid var(--color-border)' }}>
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

        <div className="account-field-row" style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <div className="account-field-label">INVOICES &amp; BILLING HISTORY</div>
          <div className="account-field-content-row">
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>
                Detailed ledger &amp; campaign consumption records
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                View complete ledger audit log and invoices on the dedicated My Plan page.
              </div>
            </div>

            <Link href="/user/myplan" className="account-field-edit-action" style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>Open My Plan</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        <AccountSecurityFooter />
      </div>
    </div>
  );
}
