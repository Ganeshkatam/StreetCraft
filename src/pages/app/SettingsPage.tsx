import React, { useState } from 'react';
import { useUsage } from '../../hooks/useUsage';
import { useBusiness } from '../../hooks/useBusiness';
import { UserSession } from '../../types/business';
import { UsageMeter } from '../../components/UsageMeter';
import { useTheme } from '../../theme/ThemeProvider';
import { ShieldCheck, History, User, Palette, Check, Sparkles } from 'lucide-react';

interface SettingsPageProps {
  businessId: string;
  session: UserSession;
  onOpenUpgrade: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ businessId, session, onOpenUpgrade }) => {
  const { usage, events } = useUsage(businessId);
  const { profile } = useBusiness(businessId);
  const { theme, setTheme, availableThemes, brand, setBrandTheme } = useTheme();

  const [customPrimary, setCustomPrimary] = useState(brand?.primaryColor || '#176B4D');
  const [customAccent, setCustomAccent] = useState(brand?.accentColor || '#C96B32');
  const [brandSaved, setBrandSaved] = useState(false);

  const handleApplyBrand = (e: React.FormEvent) => {
    e.preventDefault();
    setBrandTheme({
      primaryColor: customPrimary,
      accentColor: customAccent,
      businessName: profile?.name,
    });
    setBrandSaved(true);
    setTimeout(() => setBrandSaved(false), 2000);
  };

  const handleResetBrand = () => {
    setCustomPrimary('#176B4D');
    setCustomAccent('#C96B32');
    setBrandTheme(null);
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-eyebrow">STORE SETTINGS &bull; APPEARANCE & QUOTA</span>
        <h1 className="section-title">Settings & Theme Engine</h1>
        <p className="section-subtitle">
          Design-token theme engine, business brand customization, and server-side generation ledger.
        </p>
      </div>

      {/* Theme & Appearance Card */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
          <Palette size={16} color="var(--color-primary)" />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)' }}>
            Appearance & Visual Theme
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {availableThemes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  background: isSelected ? 'var(--color-surface-raised)' : 'var(--color-surface)',
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'var(--motion-fast)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-ink)' }}>{t.name}</span>
                  {isSelected && <Check size={16} color="var(--color-primary)" />}
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', marginBottom: '14px', lineHeight: '1.4' }}>
                  {t.description}
                </p>

                {/* Color Swatch Preview */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '4px', background: t.colorPreview.page, border: '1px solid var(--color-border)' }} title="Page Canvas" />
                  <div style={{ width: '22px', height: '22px', borderRadius: '4px', background: t.colorPreview.surface, border: '1px solid var(--color-border)' }} title="Surface" />
                  <div style={{ width: '22px', height: '22px', borderRadius: '4px', background: t.colorPreview.ink, border: '1px solid var(--color-border)' }} title="Ink" />
                  <div style={{ width: '22px', height: '22px', borderRadius: '4px', background: t.colorPreview.primary, border: '1px solid var(--color-border)' }} title="Primary Accent" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Business Brand Theming Sub-Section */}
        <div style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)' }}>
                Store Brand Accent Overrides
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>
                Safely customize primary brand tokens without breaking accessibility or layout standards.
              </p>
            </div>
            {brandSaved && (
              <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>Brand Applied!</span>
            )}
          </div>

          <form onSubmit={handleApplyBrand} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label className="form-label" style={{ fontSize: '12px' }}>Primary Accent Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="color"
                  value={customPrimary}
                  onChange={(e) => setCustomPrimary(e.target.value)}
                  style={{ width: '36px', height: '36px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', cursor: 'pointer', background: 'transparent' }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100px', padding: '6px 10px', fontSize: '12.5px' }}
                  value={customPrimary}
                  onChange={(e) => setCustomPrimary(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '12px' }}>Secondary Accent Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="color"
                  value={customAccent}
                  onChange={(e) => setCustomAccent(e.target.value)}
                  style={{ width: '36px', height: '36px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', cursor: 'pointer', background: 'transparent' }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100px', padding: '6px 10px', fontSize: '12.5px' }}
                  value={customAccent}
                  onChange={(e) => setCustomAccent(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '12.5px' }}>
                Apply Brand Tokens
              </button>
              <button type="button" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '12.5px' }} onClick={handleResetBrand}>
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Usage Summary Card */}
        <UsageMeter usage={usage} onUpgrade={onOpenUpgrade} />

        {/* Tenant Information Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <User size={16} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>Workspace Profile</h3>
            </div>
            <div style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', marginBottom: '6px' }}>
              Logged in as: <strong style={{ color: 'var(--color-ink)' }}>{session.email}</strong>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginBottom: '6px' }}>
              Role: <span style={{ textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: 700 }}>{session.role}</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-ink-muted)' }}>
              Store: <strong style={{ color: 'var(--color-ink)' }}>{profile?.name || 'Store'}</strong>
            </div>
          </div>

          <div style={{ padding: '10px 12px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '11.5px', color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={14} color="var(--color-primary)" />
            <span>Protected by PostgreSQL Row-Level Security</span>
          </div>
        </div>
      </div>

      {/* Append-Only Ledger Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <History size={16} color="var(--color-accent)" />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)' }}>
            Generation Ledger (Audit Trail)
          </h3>
        </div>

        {events.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', padding: '20px 0', textAlign: 'center' }}>
            No campaign packs have been generated yet for this billing cycle.
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
