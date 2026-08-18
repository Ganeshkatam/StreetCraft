'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountViewModel } from '../../../lib/server/account/getAccountProfile';
import { updateAccountProfileAction } from '../../../lib/server/account/updateAccountProfileAction';
import { updateAccountPasswordAction } from '../../../lib/server/account/updateAccountPasswordAction';
import { toast } from 'sonner';
import {
  User,
  KeyRound,
  LogOut,
  Save,
  ShieldCheck,
  Store,
  CreditCard,
  Copy,
  Bell,
  AlertTriangle,
} from 'lucide-react';

interface AccountSettingsViewProps {
  accountData: AccountViewModel;
}

export function AccountSettingsView({ accountData }: AccountSettingsViewProps) {
  const router = useRouter();
  const { profileInitialized, profile, businesses, entitlement } = accountData;

  const [profileState, profileFormAction, isSavingProfile] = useActionState(updateAccountProfileAction, null);
  const [passwordState, passwordFormAction, isUpdatingPassword] = useActionState(updateAccountPasswordAction, null);

  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (profileState) {
      if (profileState.success) {
        toast.success(profileState.message);
      } else {
        toast.error(profileState.message);
      }
    }
  }, [profileState]);

  useEffect(() => {
    if (passwordState) {
      if (passwordState.success) {
        toast.success(passwordState.message);
      } else {
        toast.error(passwordState.message);
      }
    }
  }, [passwordState]);

  const handleCopyUserId = () => {
    if (!profile?.id) return;
    navigator.clipboard.writeText(profile.id);
    setCopiedId(true);
    toast.success('Account ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2500);
  };

  if (!profileInitialized || !profile) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--color-danger-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--color-danger)', marginBottom: '16px' }}>
            <AlertTriangle size={28} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '8px' }}>
            Operator Profile Not Initialized
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', maxWidth: '440px', margin: '0 auto 24px', lineHeight: '1.5' }}>
            Your authentication identity is active, but your operator profile record is missing. Please complete store onboarding to initialize your workspace profile.
          </p>
          <button className="btn-primary" onClick={() => router.push('/setup')}>
            Complete Store Setup
          </button>
        </div>
      </div>
    );
  }

  const userInitial = (profile.fullName || profile.email || 'U').charAt(0).toUpperCase();

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
      
      {/* Page Header */}
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
                  {profile.fullName || 'Store Operator'}
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
                  <ShieldCheck size={13} /> Verified Operator
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
                {profile.email} &bull; Joined {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '12.5px', padding: '6px 12px' }}
            onClick={handleCopyUserId}
            title="Copy unique account UUID"
          >
            <Copy size={13} /> {copiedId ? 'Copied ID' : 'Copy Account ID'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Profile & Communication Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <User size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>
                Operator Identity
              </h3>
            </div>

            <form action={profileFormAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
                  Full Name / Operator Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  defaultValue={profile.fullName}
                  required
                  disabled={isSavingProfile}
                  placeholder="e.g. Ramesh Kumar"
                  style={{ width: '100%' }}
                />
                {profileState?.errors?.fullName && (
                  <p style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px' }}>
                    {profileState.errors.fullName[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
                  Login Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    style={{
                      width: '100%',
                      background: 'var(--color-surface-raised)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-ink-muted)',
                      cursor: 'not-allowed',
                    }}
                    className="form-input"
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '10.5px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-ink-muted)',
                      background: 'var(--color-surface)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Auth Identity
                  </span>
                </div>
                <small style={{ fontSize: '11px', color: 'var(--color-ink-muted)', marginTop: '4px', display: 'block' }}>
                  Email authentication credentials are managed strictly by Supabase Auth.
                </small>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
                  Phone / WhatsApp Contact (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  defaultValue={profile.phone || ''}
                  disabled={isSavingProfile}
                  placeholder="+91 98765 43210"
                  style={{ width: '100%' }}
                />
                {profileState?.errors?.phone && (
                  <p style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px' }}>
                    {profileState.errors.phone[0]}
                  </p>
                )}
              </div>

              {/* Notification Preferences Sub-Section */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Bell size={16} color="var(--color-accent)" />
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>
                    Notification Preferences
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--color-ink)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="emailNotifs"
                      defaultChecked={profile.notificationPreferences.email}
                      disabled={isSavingProfile}
                    />
                    <span>Email updates for generated campaign packs</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--color-ink)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="whatsappNotifs"
                      defaultChecked={profile.notificationPreferences.whatsapp}
                      disabled={isSavingProfile}
                    />
                    <span>WhatsApp alerts for weekend and festival radar opportunities</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--color-ink)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="weeklyDigest"
                      defaultChecked={profile.notificationPreferences.weeklyDigest}
                      disabled={isSavingProfile}
                    />
                    <span>Weekly marketing performance summary</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ fontSize: '13px', padding: '7px 18px' }}
                  disabled={isSavingProfile}
                >
                  <Save size={14} /> {isSavingProfile ? 'Saving...' : 'Save Profile & Preferences'}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Storefront Access, Security, Session */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Authorized Storefronts & Commercial Limits */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>
                  Authorized Storefronts
                </h3>
              </div>

              <span
                style={{
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-ink-muted)',
                  background: 'var(--color-surface-raised)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {entitlement.isAvailable
                  ? `${businesses.length} / ${entitlement.businessLimit ?? '∞'} Storefronts`
                  : 'Entitlement Unavailable'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {businesses.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)' }}>
                  No active businesses found. Complete setup to create your first store.
                </p>
              ) : (
                businesses.map((biz) => (
                  <div
                    key={biz.id}
                    style={{
                      padding: '12px 14px',
                      background: 'var(--color-surface-raised)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xs)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>
                        {biz.name}
                      </div>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
                        Role: {biz.role.toUpperCase()}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn-ghost"
                      style={{ fontSize: '12px', padding: '4px 10px' }}
                      onClick={() => router.push(`/app/business?biz=${biz.id}`)}
                    >
                      Store Profile
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={14} color="var(--color-ink-muted)" />
                <span style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>
                  Plan: <strong>{entitlement.planName || 'Standard'}</strong>
                </span>
              </div>

              <button
                type="button"
                className="btn-ghost"
                style={{ fontSize: '12.5px', padding: 0, color: 'var(--color-primary)' }}
                onClick={() => router.push('/app/billing')}
              >
                Manage Billing &rarr;
              </button>
            </div>
          </div>

          {/* Security & Password Form */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <KeyRound size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>
                Security &amp; Password
              </h3>
            </div>

            <form action={passwordFormAction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  className="form-input"
                  required
                  minLength={8}
                  maxLength={128}
                  disabled={isUpdatingPassword}
                  placeholder="Minimum 8 characters"
                  style={{ width: '100%' }}
                />
                {passwordState?.errors?.newPassword && (
                  <p style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px' }}>
                    {passwordState.errors.newPassword[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  required
                  minLength={8}
                  maxLength={128}
                  disabled={isUpdatingPassword}
                  placeholder="Repeat new password"
                  style={{ width: '100%' }}
                />
                {passwordState?.errors?.confirmPassword && (
                  <p style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px' }}>
                    {passwordState.errors.confirmPassword[0]}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  type="submit"
                  className="btn-secondary"
                  style={{ fontSize: '13px', padding: '7px 16px' }}
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Session & Sign Out */}
          <div className="card" style={{ padding: '24px', border: '1px solid var(--color-danger-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)' }}>
                  Active Operator Session
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                  Sign out from your current browser session.
                </p>
              </div>

              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="btn-ghost"
                  style={{
                    fontSize: '12.5px',
                    padding: '6px 14px',
                    color: 'var(--color-danger)',
                    border: '1px solid var(--color-danger-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
