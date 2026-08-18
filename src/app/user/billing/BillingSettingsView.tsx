'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BillingViewModel } from '../../../lib/server/billing/getBillingData';
import { cancelSubscriptionAction } from '../../../lib/server/billing/cancelSubscriptionAction';
import { UpgradeModal } from '../../../components/UpgradeModal';
import { toast } from 'sonner';
import {
  CreditCard,
  Sparkles,
  History,
  Store,
  Plus,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface BillingSettingsViewProps {
  billingData: BillingViewModel;
}

export function BillingSettingsView({ billingData }: BillingSettingsViewProps) {
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
          <span className="section-eyebrow">WORKSPACE ADMINISTRATION &bull; COMMERCIAL STATE</span>
          <h1 className="section-title">Billing &amp; Usage</h1>
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
            You have not set up a store profile yet. Complete onboarding setup to activate and manage your workspace billing.
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
  const isCancelScheduled = subscription?.cancelAtPeriodEnd === true;

  const formattedPeriodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })
    : usagePeriod?.periodEnd
    ? new Date(usagePeriod.periodEnd).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'End of cycle';

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
      
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <span className="section-eyebrow">WORKSPACE ADMINISTRATION &bull; COMMERCIAL STATE</span>
        <h1 className="section-title">Billing &amp; Usage</h1>
        <p className="section-subtitle">
          Manage subscription tier, monthly campaign allowances, and active store limits for {business.name}.
        </p>
      </div>

      {/* Cancellation Scheduled Banner */}
      {isCancelScheduled && (
        <div
          style={{
            padding: '16px 20px',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xs)',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Clock size={18} color="var(--color-ink-muted)" />
          <div style={{ fontSize: '13.5px', color: 'var(--color-ink)' }}>
            <strong>Cancellation Scheduled:</strong> Your {currentPlan} plan is active and will cancel on <strong>{formattedPeriodEnd}</strong>. You retain full quota and commercial benefits until then.
          </div>
        </div>
      )}

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
              Activate Commercial Plan
            </button>
          </div>
        </div>
      )}

      {/* Main Quota & Plan Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px', alignItems: 'start' }}>
        
        {/* Authentic Usage Meter */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>
              Monthly Campaign Quota
            </h3>
            <span
              style={{
                fontSize: '11.5px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-primary)',
                background: 'var(--color-primary-subtle)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                fontWeight: 600,
              }}
            >
              {usagePeriod ? `${usagePeriod.campaignsUsed} / ${usagePeriod.campaignLimit} Used` : 'No Active Period'}
            </span>
          </div>

          {usagePeriod ? (
            <div>
              <div
                style={{
                  width: '100%',
                  height: '10px',
                  background: 'var(--color-surface-raised)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  marginBottom: '12px',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    width: `${usagePeriod.percentageUsed}%`,
                    height: '100%',
                    background: usagePeriod.percentageUsed >= 90 ? 'var(--color-danger)' : 'var(--color-primary)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--color-ink-muted)', marginBottom: '16px' }}>
                <span>{usagePeriod.campaignsRemaining} campaigns remaining</span>
                <span>Cycle ends {new Date(usagePeriod.periodEnd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginBottom: '16px' }}>
              Quota accounting will begin once an active billing cycle starts.
            </p>
          )}

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
                You are on the <strong>Free Tier</strong> (3 campaigns per month, up to 2 physical stores).
              </p>
            )}
            {currentPlan === 'PRO' && (
              <p style={{ margin: 0 }}>
                You are on the <strong>Pro Tier</strong> (30 campaigns per month, up to 5 physical stores).
              </p>
            )}
            {currentPlan === 'GROWTH' && (
              <p style={{ margin: 0 }}>
                You are on the <strong>Growth Tier</strong> (300 campaigns per month, up to 10 physical stores).
              </p>
            )}
            {currentPlan === 'FOUNDER' && (
              <p style={{ margin: 0 }}>
                You have an active <strong>Founder Tier</strong> pass.
              </p>
            )}
          </div>

          {isPaid && currentPlan !== 'FOUNDER' && !isCancelScheduled && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-ghost"
                style={{ fontSize: '12px', color: 'var(--color-danger)', padding: 0 }}
                onClick={() => setShowCancelModal(true)}
              >
                Cancel subscription (at end of period)
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
                  <th style={{ padding: '10px 12px' }}>TIMESTAMP</th>
                  <th style={{ padding: '10px 12px' }}>EVENT</th>
                  <th style={{ padding: '10px 12px' }}>UNITS</th>
                  <th style={{ padding: '10px 12px' }}>DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-ink-muted)' }}>
                      {new Date(e.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-primary)', background: 'var(--color-primary-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-primary-border)' }}>
                        {e.eventType}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink)' }}>
                      {e.units > 0 ? `+${e.units}` : e.units}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--color-ink)' }}>
                      {e.description || 'Campaign activity'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Subscription Cancellation */}
      {showCancelModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-elevation-high)',
              background: 'var(--color-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  background: 'var(--color-danger-subtle)',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  Cancel at Period End?
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>
                  Your {currentPlan} plan and campaign quota will remain fully active until <strong>{formattedPeriodEnd}</strong>. You will not be charged for the next billing period.
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
                  {isCancelling ? 'Scheduling Cancellation...' : 'Confirm Cancellation'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
}
