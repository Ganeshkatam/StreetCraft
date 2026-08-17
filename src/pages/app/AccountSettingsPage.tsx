import React, { useState } from 'react';
import { UserSession } from '../../types/business';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { User, KeyRound, LogOut, ShieldCheck, Check, AlertCircle } from 'lucide-react';

interface AccountSettingsPageProps {
  session: UserSession;
}

export const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({ session }) => {
  const { signOut } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    setPasswordError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError((err as Error).message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-eyebrow">USER ADMINISTRATION &bull; CREDENTIALS</span>
        <h1 className="section-title">Account Security</h1>
        <p className="section-subtitle">
          Manage your login credentials, password security, and authenticated account session.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* User Identity Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
            <User size={16} color="var(--color-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>User Profile</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>EMAIL ADDRESS</div>
              <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '2px' }}>{session.email}</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>WORKSPACE ROLE</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', marginTop: '2px' }}>{session.role}</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>USER ID</div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', marginTop: '2px' }}>{session.userId}</div>
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '12px', color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <ShieldCheck size={14} color="var(--color-primary)" />
            <span>Protected by encrypted account security</span>
          </div>

          <button
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', color: 'var(--color-accent)' }}
            onClick={() => signOut()}
          >
            <LogOut size={14} /> Sign Out of Account
          </button>
        </div>

        {/* Change Password Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
            <KeyRound size={16} color="var(--color-accent)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>Update Password</h3>
          </div>

          {passwordSuccess && (
            <div style={{ padding: '10px 14px', background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-xs)', color: 'var(--color-primary)', fontSize: '12.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={14} /> Password updated successfully.
            </div>
          )}

          {passwordError && (
            <div style={{ padding: '10px 14px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-xs)', color: 'var(--color-accent)', fontSize: '12.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} /> {passwordError}
            </div>
          )}

          <form onSubmit={handleUpdatePassword}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={updatingPassword || !newPassword}
            >
              {updatingPassword ? 'Updating...' : 'Save New Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
