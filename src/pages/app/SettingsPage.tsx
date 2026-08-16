import React from 'react';
import { useUsage } from '../../hooks/useUsage';
import { useBusiness } from '../../hooks/useBusiness';
import { UserSession } from '../../types/business';
import { UsageMeter } from '../../components/UsageMeter';

interface SettingsPageProps {
  businessId: string;
  session: UserSession;
  onOpenUpgrade: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ businessId, session, onOpenUpgrade }) => {
  const { usage, events } = useUsage(businessId);
  const { profile } = useBusiness(businessId);

  return (
    <div>
      <div className="section-header">
        <span className="section-eyebrow">STORE LEDGER &bull; QUOTA ACCOUNTING</span>
        <h1 className="section-title">Settings & Ledger</h1>
        <p className="section-subtitle">
          Subscription quota, active store membership, and generation audit ledger.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Usage Summary Card */}
        <UsageMeter usage={usage} onUpgrade={onOpenUpgrade} />

        {/* Tenant Information Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>ACCOUNT</span>
            <div style={{ fontSize: '14px', color: 'var(--color-ink)', marginTop: '8px', marginBottom: '6px' }}>
              Logged in as: <strong>{session.email}</strong>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '6px' }}>
              Role: <span style={{ textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: 600 }}>{session.role}</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
              Store: <strong style={{ color: 'var(--color-ink)' }}>{profile?.name || 'Store'}</strong>
            </div>
          </div>

          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-editorial)', fontSize: '11px', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
            Protected by PostgreSQL Row-Level Security
          </div>
        </div>
      </div>

      {/* Append-Only Ledger Table */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '16px' }}>
          Generation Ledger (Audit Trail)
        </h3>

        {events.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', padding: '20px 0', textAlign: 'center' }}>
            No campaign packs have been generated yet for this billing cycle.
          </p>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event</th>
                <th>Units</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>{new Date(e.createdAt).toLocaleString('en-IN')}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-primary)', background: 'var(--color-primary-faint)', padding: '2px 6px', borderRadius: '2px' }}>
                      {e.eventType}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{e.units > 0 ? `+${e.units}` : e.units}</td>
                  <td style={{ fontSize: '13px' }}>{e.description || 'Campaign generation event'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
