import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsage } from '../../hooks/useUsage';
import { useBusiness } from '../../hooks/useBusiness';
import { UsageMeter } from '../../components/UsageMeter';
import { CreditCard, Sparkles, History, Store, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { getUserFacingErrorMessage } from '../../lib/userFacingError';
import { useDialog } from '../../context/DialogContext';

interface BillingSettingsPageProps {
  businessId: string;
  onOpenUpgrade: () => void;
}

export const BillingSettingsPage: React.FC<BillingSettingsPageProps> = ({
  businessId,
  onOpenUpgrade,
}) => {
  const navigate = useNavigate();
  const { usage, events, refreshUsage } = useUsage(businessId);
  const { refreshProfile } = useBusiness(businessId);
  const dialog = useDialog();
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  if (!businessId) {
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
            You have not set up a store profile yet. Complete the quick onboarding setup to activate and manage your workspace billing.
          </p>
          <button
            onClick={() => navigate('/setup')}
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

  const plan = usage?.plan || 'FREE';
  const isPaid = plan !== 'FREE';

  const handleCancel = async () => {
    const confirmed = await dialog.confirm({
      title: 'Confirm Plan Cancellation',
      eyebrow: 'COMMERCIAL STATE',
      variant: 'danger',
      message: 'Are you sure you want to cancel your paid subscription? Your account will revert to the Free Tier (max 3 campaigns/month and 2 businesses) at the end of the current cycle.',
      confirmText: 'Confirm Downgrade',
      cancelText: 'Keep Plan',
    });

    if (!confirmed) return;

    setCancelling(true);
    setCancelMessage(null);
    try {
      await api.cancelSubscription(businessId);
      setCancelMessage('Your subscription has been cancelled. Your workspace is now on the Free tier.');
      await refreshUsage();
      await refreshProfile();
    } catch (err) {
      setCancelMessage(getUserFacingErrorMessage(err, 'Failed to update subscription. Please try again.'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-eyebrow">WORKSPACE ADMINISTRATION &bull; COMMERCIAL STATE</span>
        <h1 className="section-title">Billing & Usage</h1>
        <p className="section-subtitle">
          Manage your subscription tier, monthly campaign allowances, and active store limits.
        </p>
      </div>

      {cancelMessage && (
        <div style={{ padding: '14px 18px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', marginBottom: '24px', fontSize: '13.5px', color: 'var(--color-ink)' }}>
          {cancelMessage}
        </div>
      )}

      {/* Main Quota & Plan Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px', alignItems: 'start' }}>
        {/* Usage Summary Card */}
        <UsageMeter usage={usage} onUpgrade={onOpenUpgrade} />

        {/* Plan Details & Management Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={16} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>Current Plan</h3>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', background: 'var(--color-primary-subtle)', padding: '3px 10px', borderRadius: 'var(--radius-xs)', fontWeight: 700 }}>
              {plan}
            </span>
          </div>

          <div style={{ fontSize: '13.5px', color: 'var(--color-ink-soft)', lineHeight: '1.6', marginBottom: '16px' }}>
            {plan === 'FREE' && (
              <p style={{ margin: 0 }}>
                You are on the <strong>Free Tier</strong> (3 campaigns per month, up to 2 physical stores).
              </p>
            )}
            {plan === 'PRO' && (
              <p style={{ margin: 0 }}>
                You are on the <strong>Pro Tier</strong> (30 campaigns per month, up to 5 physical stores).
              </p>
            )}
            {plan === 'GROWTH' && (
              <p style={{ margin: 0 }}>
                You are on the <strong>Growth Tier</strong> (300 campaigns per month, up to 10 physical stores).
              </p>
            )}
            {plan === 'FOUNDER' && (
              <p style={{ margin: 0 }}>
                You have an active <strong>Founder Tier</strong> lifetime pass.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {!isPaid || plan === 'PRO' ? (
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onOpenUpgrade}>
                <Sparkles size={14} /> Upgrade Plan & Allowance
              </button>
            ) : null}

            {isPaid && plan !== 'FOUNDER' && (
              <button
                className="btn-ghost"
                style={{ fontSize: '12px', color: 'var(--color-ink-muted)', alignSelf: 'center' }}
                disabled={cancelling}
                onClick={handleCancel}
              >
                {cancelling ? 'Cancelling...' : 'Cancel subscription (revert to Free)'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Activity History Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
          <History size={16} color="var(--color-accent)" />
          <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-ink)' }}>
            Campaign Activity History
          </h3>
        </div>

        {events.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', padding: '20px 0', textAlign: 'center' }}>
            No campaigns generated yet in this billing cycle.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
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
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
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
                      {e.description || 'Campaign creation'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
