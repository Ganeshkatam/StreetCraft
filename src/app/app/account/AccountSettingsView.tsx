'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '../../../types/business';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import { getUserFacingErrorMessage } from '../../../lib/userFacingError';
import { api } from '../../../lib/api';
import { toast } from 'sonner';
import {
  User,
  KeyRound,
  LogOut,
  Save,
  ShieldCheck,
  CheckCircle2,
  Store,
  CreditCard,
  Copy,
  Bell,
  Sparkles,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

export function AccountSettingsView() {
  const router = useRouter();
  const { session, getMyBusinesses, getAccountLimits, switchBusiness, signOut } = useAuth();

  const [, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [whatsappNotifs, setWhatsappNotifs] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [businesses, setBusinesses] = useState<Array<{ id: string; name: string }>>([]);
  const [accountLimit, setAccountLimit] = useState(2);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

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

      getMyBusinesses().then((res) => setBusinesses(Array.isArray(res) ? res : []));
      getAccountLimits().then((res) => setAccountLimit(res?.limit || 2));
    }
  }, [session.userId, session.name, session.phone, session.activeBusinessId]);

  const handleCopyUserId = () => {
    if (!session.userId) return;
    navigator.clipboard.writeText(session.userId);
    setCopiedId(true);
    toast.success('Account ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session.userId) return;

    setIsSavingProfile(true);

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
        toast.success('Profile preferences saved successfully.');
      }
    } catch (err: unknown) {
      toast.error(getUserFacingErrorMessage(err, 'Failed to update profile. Please try again.'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast.success('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      toast.error(getUserFacingErrorMessage(err, 'Failed to update password. Please try again.'));
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleGlobalSignOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      await signOut();
      toast.success('Signed out from all active devices.');
      router.push('/login');
    } catch {
      await signOut();
      router.push('/login');
    }
  };

  const userInitial = (fullName || session.name || session.email || 'U').charAt(0).toUpperCase();

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
      
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <span className="section-eyebrow">ACCOUNT ADMINISTRATION &bull; VERIFIED OPERATOR</span>
        <h1 className="section-title">Account &amp; Operator Profile</h1>
        <p className="section-subtitle">
          Manage your verified operator credentials, multi-store access, and communication preferences.
        </p>
      </div>

      {/* Verified Operator Identity Banner */}
      <div
        className="card"
        style={{
          padding: '24px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-raised) 100%)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {userInitial}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                  {fullName || session.name || 'Store Operator'}
                </h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    background: 'var(--color-primary-subtle)',
                    color: 'var(--color-primary)',
                    border: '1px solid var(--color-primary-border)',
                  }}
                >
                  <CheckCircle2 size={13} /> Email Verified
                </span>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: 'var(--color-surface-raised)',
                    color: 'var(--color-ink-muted)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {session.role || 'Owner'}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
                {session.email}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn-secondary"
              onClick={handleCopyUserId}
              style={{ fontSize: '12.5px', padding: '6px 12px' }}
              title="Copy Account User ID"
            >
              <Copy size={13} /> {copiedId ? 'Copied ID' : 'Copy ID'}
            </button>
            <button
              className="btn-primary"
              onClick={() => router.push('/app/billing')}
              style={{ fontSize: '12.5px', padding: '6px 14px' }}
            >
              <CreditCard size={13} /> Manage Subscription
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Column: Profile & Storefront Ownership */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Operator Profile Form */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              <User size={18} color="var(--color-primary)" />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Operator Profile</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-ink-muted)' }}>Personal details for workspace ownership and reports</span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Account Email (Verified)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    disabled
                    className="form-input"
                    value={session.email || ''}
                    style={{ opacity: 0.8, background: 'var(--color-surface-raised)', paddingRight: '90px' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '11px',
                      color: 'var(--color-primary)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCircle2 size={12} /> Confirmed
                  </span>
                </div>
                <span style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)', marginTop: '4px', display: 'block' }}>
                  Email confirmation is strictly enforced for account security and profile creation.
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Operator Mobile / WhatsApp Direct</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <span style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)', marginTop: '4px', display: 'block' }}>
                  Your private account number. (Customer-facing store WhatsApp is configured separately under Store Preferences).
                </span>
              </div>

              <div style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Bell size={15} color="var(--color-ink-muted)" />
                  <span className="section-eyebrow" style={{ margin: 0 }}>COMMUNICATION &amp; DIGESTS</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label className="auth-checkbox-label" style={{ fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={emailNotifs}
                      onChange={(e) => setEmailNotifs(e.target.checked)}
                      className="auth-checkbox-input"
                    />
                    <span>Email campaign summaries, quota receipts, and drop confirmations</span>
                  </label>
                  <label className="auth-checkbox-label" style={{ fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={whatsappNotifs}
                      onChange={(e) => setWhatsappNotifs(e.target.checked)}
                      className="auth-checkbox-input"
                    />
                    <span>WhatsApp triggers for 48-hour festival marketing opportunities</span>
                  </label>
                  <label className="auth-checkbox-label" style={{ fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={weeklyDigest}
                      onChange={(e) => setWeeklyDigest(e.target.checked)}
                      className="auth-checkbox-input"
                    />
                    <span>Weekly local storefront growth and footfall insights</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isSavingProfile} style={{ width: '100%', justifyContent: 'center' }}>
                <Save size={14} /> {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Connected Storefronts Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Store size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Managed Storefronts</h3>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-ink-muted)' }}>
                {(businesses || []).length} of {accountLimit} used
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {(businesses || []).map((biz) => {
                const isActive = biz.id === session.activeBusinessId;
                return (
                  <div
                    key={biz.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: isActive ? 'var(--color-primary-subtle)' : 'var(--color-surface-raised)',
                      border: `1px solid ${isActive ? 'var(--color-primary-border)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Store size={15} color={isActive ? 'var(--color-primary)' : 'var(--color-ink-muted)'} />
                      <strong style={{ fontSize: '13.5px', color: 'var(--color-ink)' }}>{biz.name}</strong>
                      {isActive && (
                        <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--color-primary)', background: 'var(--color-surface)', padding: '1px 6px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-primary-border)' }}>
                          Active
                        </span>
                      )}
                    </div>

                    {!isActive && (
                      <button
                        className="btn-ghost"
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                        onClick={() => switchBusiness(biz.id)}
                      >
                        Switch
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '12.5px' }}
                onClick={() => router.push('/app/business')}
              >
                Configure Store Context
              </button>
              {(businesses || []).length < accountLimit && (
                <button
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '12.5px' }}
                  onClick={() => router.push('/setup')}
                >
                  Add Storefront
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Security, Passwords & Session Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Change Password Card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              <KeyRound size={18} color="var(--color-primary)" />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Update Password</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-ink-muted)' }}>Secure your operator login credentials</span>
              </div>
            </div>

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
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                />
              </div>

              <button
                type="submit"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={updatingPassword || !newPassword}
              >
                {updatingPassword ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          </div>

          {/* Security Highlights & Tenant Isolation */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <ShieldCheck size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Security &amp; Isolation</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                <CheckCircle2 size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>PostgreSQL Row-Level Security</strong>
                  <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                    All campaign vaults and business profiles are strictly tenant-isolated at the database layer.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                <CheckCircle2 size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Verified Email Gating Active</strong>
                  <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                    Unconfirmed accounts are rejected by database triggers and purged automatically.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Session Management */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <LogOut size={18} color="var(--color-accent)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Session Controls</h3>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
              Control your active logins. You can sign out of this browser or invalidate all active sessions across devices.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', color: 'var(--color-accent)' }}
                onClick={async () => {
                  await signOut();
                  router.push('/login');
                }}
              >
                <LogOut size={14} /> Sign Out of This Device
              </button>

              <button
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'center', color: 'var(--color-ink-muted)', fontSize: '12.5px' }}
                onClick={handleGlobalSignOut}
              >
                Sign Out of All Devices
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
