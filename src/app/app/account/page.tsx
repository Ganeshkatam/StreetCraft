'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '../../../types/business';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import { getUserFacingErrorMessage } from '../../../lib/userFacingError';
import { api } from '../../../lib/api';
import { User, KeyRound, LogOut, Check, AlertCircle, Save } from 'lucide-react';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { session, signOut } = useAuth();

  const [, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [whatsappNotifs, setWhatsappNotifs] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

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
  }, [session.userId, session.name, session.phone]);

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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      setPasswordError(getUserFacingErrorMessage(err, 'Failed to update password. Please try again.'));
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
      <div className="section-header">
        <span className="section-eyebrow">USER ADMINISTRATION &bull; PROFILES &amp; CREDENTIALS</span>
        <h1 className="section-title">Account Settings</h1>
        <p className="section-subtitle">
          Manage your personal operator profile, contact notifications, and login credentials.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* Operator Profile Card */}
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
              <label className="form-label">Email Address</label>
              <input
                type="email"
                disabled
                className="form-input"
                value={session.email || ''}
                style={{ opacity: 0.7, background: 'var(--color-surface-raised)' }}
              />
              <small style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>Email cannot be modified directly.</small>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Mobile / WhatsApp Number</label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div style={{ marginBottom: '20px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <span className="section-eyebrow" style={{ display: 'block', marginBottom: '10px' }}>NOTIFICATION PREFERENCES</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="auth-checkbox-label" style={{ fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="auth-checkbox-input"
                  />
                  <span>Email alerts for campaign performance &amp; renewals</span>
                </label>
                <label className="auth-checkbox-label" style={{ fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={whatsappNotifs}
                    onChange={(e) => setWhatsappNotifs(e.target.checked)}
                    className="auth-checkbox-input"
                  />
                  <span>WhatsApp alerts for upcoming festival opportunities</span>
                </label>
                <label className="auth-checkbox-label" style={{ fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="auth-checkbox-input"
                  />
                  <span>Weekly storefront growth digest</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isSavingProfile}>
              <Save size={14} /> {isSavingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password & Security Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              <KeyRound size={16} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>Change Password</h3>
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
                  required
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>

              <button type="submit" className="btn-secondary" disabled={updatingPassword || !newPassword}>
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: '20px', background: 'var(--color-surface-raised)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>Session Management</div>
              <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)' }}>Sign out of your account on this device</div>
            </div>
            <button
              className="btn-ghost"
              style={{ color: 'var(--color-accent)', fontSize: '13px' }}
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
