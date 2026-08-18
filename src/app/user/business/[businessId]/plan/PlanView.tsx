'use client';

import React, { useState, useActionState } from 'react';
import Link from 'next/link';
import { StorePlanViewModel } from '../../../../../lib/domain/plan/planTypes';
import { requestSubscriptionCancellationAction, CancellationActionState } from '../../../../../lib/server/plan/requestSubscriptionCancellationAction';
import { UpgradeModal } from '../../../../../components/UpgradeModal';
import { CreditCard, Sparkles, Store, ChevronRight, AlertTriangle, CheckCircle2, Zap, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface PlanViewProps {
  planData: StorePlanViewModel;
}

const initialCancelState: CancellationActionState = { success: false };

export function PlanView({ planData }: PlanViewProps) {
  const { businessId, businessName, connectedStorefrontsCount, subscription, quota, activityLedger } = planData;
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const [cancelState, cancelAction, isCancelling] = useActionState(
    requestSubscriptionCancellationAction,
    initialCancelState
  );

  const isPaid = subscription.planId !== 'FREE';
  const renewalDateStr = new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div style={{ width: '100%', padding: '24px var(--space-gutter) 80px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Link
              href={`/user/business/${encodeURIComponent(businessId)}/today`}
              style={{ fontSize: '12px', color: 'var(--color-ink-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <ArrowLeft size={13} />
              <span>{businessName}</span>
            </Link>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-ink)', margin: 0 }}>
            Plan &amp; Usage
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-primary"
            style={{ fontSize: '13px', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setShowUpgradeModal(true)}
          >
            <Sparkles size={14} />
            <span>{isPaid ? 'Change Plan' : 'Upgrade Plan'}</span>
          </button>
        </div>
      </div>

      {/* Cancellation Scheduled Alert */}
      {subscription.cancelAtPeriodEnd && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-accent)',
            borderRadius: 'var(--radius-sm)',
            padding: '18px 22px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <AlertTriangle size={20} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-ink)' }}>
              Cancellation Scheduled
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', margin: '4px 0 0', lineHeight: '1.5' }}>
              Your plan remains fully active with full campaign allowances until <strong>{renewalDateStr}</strong>. After this date, your account will switch to Neighborhood Starter.
            </p>
          </div>
        </div>
      )}

      {/* Main Plan Overview Card */}
      <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              CURRENT PLAN
            </span>
            <div style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-ink)', marginTop: '2px' }}>
              {subscription.planName}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
              {isPaid ? `₹${subscription.monthlyInr.toLocaleString('en-IN')} / month` : 'Free forever'} &bull; {subscription.cancelAtPeriodEnd ? `Expires ${renewalDateStr}` : `Renews ${renewalDateStr}`}
            </div>
          </div>

          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: subscription.status === 'ACTIVE' ? 'var(--color-primary)' : 'var(--color-accent)',
              background: subscription.status === 'ACTIVE' ? 'var(--color-primary-subtle)' : 'var(--color-accent-subtle)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-xs)',
            }}
          >
            {subscription.status}
          </span>
        </div>

        {/* 2-Column Usage Grid */}
        <div className="workspace-grid-2col" style={{ marginTop: '28px', gap: '20px' }}>
          {/* Campaign Generation Quota */}
          <div
            style={{
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xs)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                CAMPAIGN GENERATION
              </span>
              <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-ink)' }}>
                {quota.campaignsUsed.toString().padStart(2, '0')} / {quota.campaignLimit.toString().padStart(2, '0')}
              </span>
            </div>

            <div
              style={{
                background: 'var(--color-border)',
                height: '8px',
                borderRadius: '4px',
                overflow: 'hidden',
                margin: '12px 0 10px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${quota.percentUsed}%`,
                  background: 'var(--color-primary)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>
              <strong>{quota.campaignsRemaining}</strong> campaigns remaining for this store this month.
            </div>
          </div>

          {/* Connected Storefronts Allowance */}
          <div
            style={{
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xs)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                STOREFRONTS
              </span>
              <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-ink)' }}>
                {connectedStorefrontsCount.toString().padStart(2, '0')} / {subscription.storefrontLimit.toString().padStart(2, '0')}
              </span>
            </div>

            <div
              style={{
                background: 'var(--color-border)',
                height: '8px',
                borderRadius: '4px',
                overflow: 'hidden',
                margin: '12px 0 10px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (connectedStorefrontsCount / subscription.storefrontLimit) * 100)}%`,
                  background: 'var(--color-accent)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>
              <strong>{Math.max(0, subscription.storefrontLimit - connectedStorefrontsCount)}</strong> additional storefront slot available on this plan.
            </div>
          </div>
        </div>
      </div>

      {/* Billing Activity Ledger Card */}
      <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
            Billing &amp; Generation Activity
          </h3>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
            RECENT EVENTS
          </span>
        </div>

        {activityLedger.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', padding: '12px 0' }}>
            No billing activity recorded yet for this storefront.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activityLedger.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', width: '80px' }}>
                    {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{ color: 'var(--color-ink)', fontWeight: 500 }}>
                    {item.description}
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: item.unitsDelta < 0 ? 'var(--color-ink-muted)' : '#10b981',
                  }}
                >
                  {item.unitsDelta > 0 ? `+${item.unitsDelta}` : item.unitsDelta}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Management Footer */}
      {isPaid && !subscription.cancelAtPeriodEnd && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', background: 'var(--color-surface)' }}>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)' }}>
              Manage Commercial Subscription
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
              Cancel subscription at the end of the billing period without immediate loss of access.
            </div>
          </div>

          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: '12.5px', color: 'var(--color-danger)' }}
            onClick={() => setShowCancelDialog(true)}
          >
            Cancel Subscription
          </button>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', color: 'var(--color-ink)', marginBottom: '8px' }}>
              Cancel Subscription?
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5', marginBottom: '24px' }}>
              Your subscription and quota will remain active until <strong>{renewalDateStr}</strong>. You will not be charged again.
            </p>

            <form action={cancelAction}>
              <input type="hidden" name="subscriptionId" value={subscription.id} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCancelDialog(false)}
                  disabled={isCancelling}
                >
                  Keep Subscription
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          currentPlanId={subscription.planId}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
}
