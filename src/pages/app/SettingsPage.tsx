import React from 'react';
import { useUsage } from '../../hooks/useUsage';
import { useBusiness } from '../../hooks/useBusiness';
import { UserSession } from '../../types/business';
import { UsageMeter } from '../../components/UsageMeter';
import { ShieldCheck, History, User } from 'lucide-react';

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
        <span className="section-eyebrow">USAGE & SETTINGS &bull; AUDIT TRAIL</span>
        <h1 className="section-title">Settings & Quota Ledger</h1>
        <p className="section-subtitle">
          Subscription quota, active store membership, and server-side generation audit ledger.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Usage Summary Card */}
        <UsageMeter usage={usage} onUpgrade={onOpenUpgrade} />

        {/* Tenant Information Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <User size={16} color="var(--accent-indigo)" />
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>Account Details</h3>
            </div>
            <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Logged in as: <strong style={{ color: '#FFFFFF' }}>{session.email}</strong>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Role: <span style={{ textTransform: 'uppercase', color: 'var(--accent-emerald)', fontWeight: 700 }}>{session.role}</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Store: <strong style={{ color: '#FFFFFF' }}>{profile?.name || 'Store'}</strong>
            </div>
          </div>

          <div style={{ padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={14} color="var(--accent-emerald)" />
            <span>Enforced by PostgreSQL Row-Level Security</span>
          </div>
        </div>
      </div>

      {/* Append-Only Ledger Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <History size={16} color="var(--accent-amber)" />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
            Generation Ledger (Audit Trail)
          </h3>
        </div>

        {events.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '20px 0', textAlign: 'center' }}>
            No campaign packs have been generated yet for this billing cycle.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                  <th style={{ padding: '10px 12px' }}>TIMESTAMP</th>
                  <th style={{ padding: '10px 12px' }}>EVENT</th>
                  <th style={{ padding: '10px 12px' }}>UNITS</th>
                  <th style={{ padding: '10px 12px' }}>DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {new Date(e.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-emerald)', background: 'var(--accent-emerald-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        {e.eventType}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>
                      {e.units > 0 ? `+${e.units}` : e.units}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>
                      {e.description || 'Campaign generation event'}
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
