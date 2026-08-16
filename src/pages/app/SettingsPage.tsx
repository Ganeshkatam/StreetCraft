import React from 'react';
import { useUsage } from '../../hooks/useUsage';
import { useBusiness } from '../../hooks/useBusiness';
import { UserSession } from '../../types/business';
import { UsageMeter } from '../../components/UsageMeter';
import { ShieldCheck, History, Users, CreditCard, ArrowRight } from 'lucide-react';

interface SettingsPageProps {
  businessId: string;
  session: UserSession;
  onOpenUpgrade: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ businessId, session, onOpenUpgrade }) => {
  const { usage, events } = useUsage(businessId);
  const { profile } = useBusiness(businessId);

  return (
    <div style={{ maxWidth: '900px' }}>
      <div className="section-header">
        <span className="section-eyebrow">USAGE LEDGER &bull; POSTGRES AUDIT TRAIL</span>
        <h1 className="section-title">Settings & Quota Accounting</h1>
        <p className="section-subtitle">
          Realtime subscription tier, server-side atomic usage limits, and tamper-proof generation audit trail.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Usage Summary Card */}
        <UsageMeter usage={usage} onUpgrade={onOpenUpgrade} />

        {/* Tenant Information Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Users size={18} color="var(--accent-indigo)" />
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Account & Access</h3>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Logged in as: <strong style={{ color: 'var(--text-primary)' }}>{session.email}</strong>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Role: <strong style={{ color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>{session.role}</strong>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Active Store: <strong style={{ color: 'var(--text-primary)' }}>{profile?.name || 'Store'}</strong>
            </div>
          </div>

          <div style={{ padding: '10px 12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={14} color="var(--accent-emerald)" />
            <span>Enforced by Postgres Row-Level Security</span>
          </div>
        </div>
      </div>

      {/* Append-Only Ledger Table */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} color="var(--accent-amber)" /> Quota Generation Ledger (Audit Trail)
        </h3>

        {events.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '20px 0', textAlign: 'center' }}>
            No campaign packs have been generated yet for this billing cycle.
          </p>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event Type</th>
                <th>Units</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>{new Date(e.createdAt).toLocaleString('en-IN')}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-emerald)', background: 'var(--accent-emerald-subtle)', padding: '2px 6px', borderRadius: '4px' }}>
                      {e.eventType}
                    </span>
                  </td>
                  <td>{e.units > 0 ? `+${e.units}` : e.units}</td>
                  <td>{e.description || 'Campaign generation event'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
