'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyPlanViewModel } from '../../../lib/server/myplan/getMyPlanData';
import { cancelSubscriptionAction } from '../../../lib/server/myplan/cancelSubscriptionAction';
import { UpgradeModal } from '../../../components/UpgradeModal';
import { toast } from 'sonner';
import {
  CreditCard,
  Sparkles,
  History,
  Store,
  Plus,
  AlertCircle,
} from 'lucide-react';

interface MyPlanViewProps {
  billingData: MyPlanViewModel;
}

export function MyPlanView({ billingData }: MyPlanViewProps) {
  const router = useRouter();
  const { business, subscription, usagePeriod, events, isEntitled } = billingData;

  const [cancelState, cancelFormAction, isCancelling] = useActionState(cancelSubscriptionAction, null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (cancelState) {
      if (cancelState.success) {
        toast.success(cancelState.message);
        setShowCancelModal(false);
      } else {
        toast.error(cancelState.message);
      }
    }
  }, [cancelState]);

  // Zero-Business State
  if (!business) {
    return (
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
        <div className="section-header">
          <span className="section-eyebrow">WORKSPACE ADMINISTRATION &bull; PLAN &amp; USAGE</span>
          <h1 className="section-title">My Plan</h1>
          <p className="section-subtitle">
            Manage your subscription tier, monthly campaign allowances, and active store limits.
          </p>
        </div>

        <div className="card" style={{ maxWidth: '560px', margin: '40px auto', textAlign: 'center', padding: '48px 36px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Store size={26} />
          </div>
          <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', marginBottom: '8px', color: 'var(--color-ink)' }}>
            No Storefront Selected
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
            You have not set up a store profile yet. Complete onboarding setup to activate and manage your workspace plan.
          </p>
          <button
            onClick={() => router.push('/setup')}
            className="btn-primary"
            style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            Set Up Your Storefront
          </button>
        </div>
      </div>
    );
  }

  const currentPlan = subscription?.planId || usagePeriod?.plan || 'FREE';
  const isPaid = currentPlan !== 'FREE';

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
      
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <span className="section-eyebrow">WORKSPACE ADMINISTRATION &bull; PLAN &amp; USAGE</span>
        <h1 className="section-title">My Plan</h1>
        <p className="section-subtitle">
          Manage subscription tier, monthly campaign allowances, and active store limits for {business.name}.
        </p>
      </div>

      {/* Missing Entitlement Alert */}
      {!isEntitled && (
        <div
          style={{
            padding: '16px 20px',
            background: 'var(--color-danger-subtle)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-xs)',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <AlertCircle size={18} color="var(--color-danger)" style={{ marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-danger)', marginBottom: '4px' }}>
              Usage Quota Unavailable
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--color-danger)', opacity: 0.9, marginBottom: '12px' }}>
              No active usage period was found for {business.name}. Upgrade your plan or activate a subscription to generate marketing campaigns.
            </p>
            <button
              className="btn-primary"
              style={{ fontSize: '12.5px', padding: '5px 14px' }}
              onClick={() => setShowUpgradeModal(true)}
            >
              Select a Plan
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Summary Grid */}
      <div className="workspace-grid-2col" style={{ marginBottom: '32px' }}>
        
        {/* Monthly Campaign Allowance & Progress */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>Monthly Campaign Quota</h3>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', background: 'var(--color-primary-subtle)', padding: '3px 8px', borderRadius: 'var(--radius-xs)', fontWeight: 700 }}>
              {usagePeriod?.plan || currentPlan}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-ink)' }}>
              {usagePeriod?.campaignsRemaining ?? 0}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--color-ink-muted)' }}>
              campaigns remaining of {usagePeriod?.campaignLimit ?? 3}
            </span>
          </div>

          {/* Progress Meter */}
          <div style={{ background: 'var(--color-surface-raised)', height: '8px', borderRadius: '4px', overflow: 'hidden', margin: '14px 0 20px', border: '1px solid var(--color-border)' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, usagePeriod?.percentageUsed ?? 0))}%`,
                background: (usagePeriod?.percentageUsed ?? 0) >= 90 ? 'var(--color-danger)' : 'var(--color-primary)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '8px 16px' }}
            onClick={() => setShowUpgradeModal(true)}
          >
            <Sparkles size={14} /> Upgrade Plan &amp; Allowance
          </button>
        </div>

        {/* Current Plan Details */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={16} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>Current Plan</h3>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', background: 'var(--color-primary-subtle)', padding: '3px 10px', borderRadius: 'var(--radius-xs)', fontWeight: 700 }}>
              {currentPlan}
            </span>
          </div>

          <div style={{ fontSize: '13.5px', color: 'var(--color-ink-soft)', lineHeight: '1.6', marginBottom: '20px' }}>
            {currentPlan === 'FREE' && (
              <p style={{ margin: 0 }}>
                You are on the <strong>Free Tier</strong> (3 campaigns per month, 1 physical storefront).
              </p>
            )}
            {currentPlan === 'PRO' && (
              <p style={{ margin: 0 }}>
                You are on the <strong>High-Street Pro Tier</strong> (100 campaigns per month, up to 5 physical storefronts).
              </p>
            )}
            {currentPlan === 'GROWTH' && (
              <p style={{ margin: 0 }}>
                You are on the <strong>Multi-Business Growth Tier</strong> (300 campaigns per month, up to 10 physical storefronts).
              </p>
            )}
            {currentPlan === 'FOUNDER' && (
              <p style={{ margin: 0 }}>
                You have an active <strong>Early Adopter Founder Tier</strong> pass (100 campaigns per month, up to 5 physical storefronts).
              </p>
            )}
          </div>

          {isPaid && currentPlan !== 'FOUNDER' && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-ghost"
                style={{ fontSize: '12px', color: 'var(--color-danger)', padding: 0 }}
                onClick={() => setShowCancelModal(true)}
              >
                Cancel subscription
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Activity History Ledger Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
          <History size={16} color="var(--color-accent)" />
          <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-ink)' }}>
            Campaign Activity History
          </h3>
        </div>

        {events.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', padding: '20px 0', textAlign: 'center' }}>
            No campaign activity recorded yet in this billing cycle.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-ink-muted)', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                  <th style={{ padding: '10px 14px' }}>Timestamp</th>
                  <th style={{ padding: '10px 14px' }}>Event</th>
                  <th style={{ padding: '10px 14px' }}>Units</th>
                  <th style={{ padding: '10px 14px' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => (
                  <tr key={evt.id} style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-ink)' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-ink-muted)' }}>
                      {new Date(evt.createdAt).toLocaleString('en-IN', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: '3px', background: 'var(--color-surface-subtle)', color: 'var(--color-primary)' }}>
                        {evt.eventType}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      {evt.units > 0 ? `+${evt.units}` : evt.units}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-ink-soft)' }}>
                      {evt.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '480px', padding: '28px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--color-danger-subtle)',
                  color: 'var(--color-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  Cancel Subscription?
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>
                  Your {currentPlan} subscription will end immediately. Your workspace will revert to the free Neighborhood Starter tier (3 monthly campaigns) until you resubscribe.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '13px', padding: '7px 16px' }}
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                Keep Subscription
              </button>

              <form action={cancelFormAction}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    fontSize: '13px',
                    padding: '7px 16px',
                    background: 'var(--color-danger)',
                    borderColor: 'var(--color-danger)',
                    cursor: isCancelling ? 'wait' : 'pointer',
                    opacity: isCancelling ? 0.7 : 1,
                  }}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          currentPlanId={currentPlan}
          onClose={() => setShowUpgradeModal(false)}
          onPlanUpdated={() => router.refresh()}
        />
      )}
    </div>
  );
}
