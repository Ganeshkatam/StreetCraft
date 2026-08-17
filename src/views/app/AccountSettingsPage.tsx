import React, { useState, useEffect } from 'react';
import { UserSession, UserProfile } from '../../types/business';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { getUserFacingErrorMessage } from '../../lib/userFacingError';
import { api } from '../../lib/api';
import { User, KeyRound, LogOut, ShieldCheck, Check, AlertCircle, Phone, Bell, Save } from 'lucide-react';

interface AccountSettingsPageProps {
  session: UserSession;
}

export const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({ session }) => {
  const { signOut } = useAuth();

  // User Profile State (from public.profiles)
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [whatsappNotifs, setWhatsappNotifs] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (session.userId) {
      api.getUserProfile(session.userId).then((data) => {
        if (data) {
          setProfile(data);
          setFullName(data.fullName || session.name || '');
          setPhone(data.phone || session.phone || '');
          setEmailNotifs(data.notificationPreferences?.email ?? true);
          setWhatsappNotifs(data.notificationPreferences?.whatsapp ?? false);
          setWeeklyDigest(data.notificationPreferences?.weeklyDigest ?? true);
        }
      });
    }
  }, [session.userId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session.userId) return;

    setIsSavingProfile(true);
    setProfileError(null);

    try {
      const updated = await api.updateUserProfile(session.userId, {
        fullName,
        phone,
        notificationPreferences: {
          email: emailNotifs,
          whatsapp: whatsappNotifs,
          weeklyDigest,
        },
      });

      if (updated) {
        setProfile(updated);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      setProfileError(getUserFacingErrorMessage(err, 'Failed to update profile. Please try again.'));
    } finally {
      setIsSavingProfile(false);
    }
  };

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
      setPasswordError(getUserFacingErrorMessage(err, 'Failed to update password. Please try again.'));
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-eyebrow">USER ADMINISTRATION &bull; PROFILES &amp; CREDENTIALS</span>
        <h1 className="section-title">Account Settings</h1>
        <p className="section-subtitle">
          Manage your personal operator profile, contact notifications, and login credentials.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* 1. Operator Profile Card (public.profiles) */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
            <User size={16} color="var(--color-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>Operator Profile</h3>
          </div>

          {profileSuccess && (
            <div style={{ padding: '10px 14px', background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-xs)', color: 'var(--color-primary)', fontSize: '12.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={14} /> Profile preferences saved successfully.
            </div>
          )}

          {profileError && (
            <div style={{ padding: '10px 14px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-xs)', color: 'var(--color-accent)', fontSize: '12.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} /> {profileError}
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Operator name"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Account Phone (Operator Direct)</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
              <span style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)', marginTop: '4px', display: 'block' }}>
                Your private account number (customer-facing WhatsApp is managed per physical store in Store Preferences).
              </span>
            </div>

            <div style={{ marginBottom: '20px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                Notification Preferences
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-ink)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                  />
                  <span>Email campaign digests &amp; usage receipts</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-ink)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                  />
                  <span>Weekly local opportunity briefing</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={isSavingProfile}
            >
              <Save size={14} /> {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* Account Identifiers */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--color-ink-muted)' }}>Email:</span>
              <strong style={{ color: 'var(--color-ink)' }}>{session.email}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--color-ink-muted)' }}>Workspace Role:</span>
              <strong style={{ color: 'var(--color-primary)', textTransform: 'uppercase' }}>{session.role}</strong>
            </div>
          </div>
        </div>

        {/* 2. Security & Credentials Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={updatingPassword || !newPassword}
              >
                {updatingPassword ? 'Updating...' : 'Save New Password'}
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ padding: '12px 14px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '12px', color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ShieldCheck size={14} color="var(--color-primary)" />
              <span>Session secured with PostgreSQL Row-Level Security</span>
            </div>

            <button
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', color: 'var(--color-accent)' }}
              onClick={() => signOut()}
            >
              <LogOut size={14} /> Sign Out of Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
