'use client';

import React, { useEffect, useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AccountViewModel } from '../../../lib/server/account/getAccountProfile';
import { updateAccountProfileAction } from '../../../lib/server/account/updateAccountProfileAction';
import { updateAccountPasswordAction } from '../../../lib/server/account/updateAccountPasswordAction';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Check,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  LogOut,
  Lock,
  Sparkles,
} from 'lucide-react';

interface AccountSettingsViewProps {
  accountData: AccountViewModel;
}

type TabType = 'identity' | 'stores' | 'notifications' | 'security' | 'plan';

export function AccountSettingsView({ accountData }: AccountSettingsViewProps) {
  const router = useRouter();
  const { profileInitialized, profile, businesses, entitlement } = accountData;

  const [activeTab, setActiveTab] = useState<TabType>('identity');
  const [, startTransition] = useTransition();

  // Local individual property state
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [notifs, setNotifs] = useState({
    email: profile?.notificationPreferences.email ?? true,
    whatsapp: profile?.notificationPreferences.whatsapp ?? false,
    weeklyDigest: profile?.notificationPreferences.weeklyDigest ?? true,
  });

  // Individual field editing flags
  const [editingField, setEditingField] = useState<'fullName' | 'phone' | null>(null);

  // Individual field status: 'idle' | 'saving' | 'saved' | 'error'
  const [fullNameStatus, setFullNameStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [notifStatus, setNotifStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Individual validation errors
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Security password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save Full Name independently
  const saveFullName = async (targetName: string) => {
    const trimmed = targetName.trim();
    if (trimmed.length < 2) {
      setFullNameError('Name must contain at least 2 characters');
      setFullNameStatus('error');
      return;
    }
    setFullNameError(null);
    setFullNameStatus('saving');

    const formData = new FormData();
    formData.append('fullName', trimmed);
    formData.append('phone', phone);
    if (notifs.email) formData.append('emailNotifs', 'on');
    if (notifs.whatsapp) formData.append('whatsappNotifs', 'on');
    if (notifs.weeklyDigest) formData.append('weeklyDigest', 'on');

    try {
      const result = await updateAccountProfileAction(null, formData);
      if (result.success) {
        setFullNameStatus('saved');
        setTimeout(() => {
          setFullNameStatus('idle');
          setEditingField((curr) => (curr === 'fullName' ? null : curr));
        }, 1200);
      } else {
        setFullNameStatus('error');
        setFullNameError(result.message || 'Failed to save');
      }
    } catch {
      setFullNameStatus('error');
      setFullNameError('Network error while saving');
    }
  };

  // Save Phone independently
  const savePhone = async (targetPhone: string) => {
    const trimmed = targetPhone.trim();
    if (trimmed !== '' && !/^[+\d\s\-()]+$/.test(trimmed)) {
      setPhoneError('Phone number contains invalid characters');
      setPhoneStatus('error');
      return;
    }
    setPhoneError(null);
    setPhoneStatus('saving');

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phone', trimmed);
    if (notifs.email) formData.append('emailNotifs', 'on');
    if (notifs.whatsapp) formData.append('whatsappNotifs', 'on');
    if (notifs.weeklyDigest) formData.append('weeklyDigest', 'on');

    try {
      const result = await updateAccountProfileAction(null, formData);
      if (result.success) {
        setPhoneStatus('saved');
        setTimeout(() => {
          setPhoneStatus('idle');
          setEditingField((curr) => (curr === 'phone' ? null : curr));
        }, 1200);
      } else {
        setPhoneStatus('error');
        setPhoneError(result.message || 'Failed to save');
      }
    } catch {
      setPhoneStatus('error');
      setPhoneError('Network error while saving');
    }
  };

  const handleNameInput = (val: string) => {
    setFullName(val);
    setFullNameStatus('saving');
    setFullNameError(null);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      saveFullName(val);
    }, 600);
  };

  const handlePhoneInput = (val: string) => {
    setPhone(val);
    setPhoneStatus('saving');
    setPhoneError(null);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      savePhone(val);
    }, 600);
  };

  const handleNotificationToggle = async (key: 'email' | 'whatsapp' | 'weeklyDigest') => {
    const updated = {
      ...notifs,
      [key]: !notifs[key],
    };
    setNotifs(updated);
    setNotifStatus('saving');

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phone', phone);
    if (updated.email) formData.append('emailNotifs', 'on');
    if (updated.whatsapp) formData.append('whatsappNotifs', 'on');
    if (updated.weeklyDigest) formData.append('weeklyDigest', 'on');

    try {
      const result = await updateAccountProfileAction(null, formData);
      if (result.success) {
        setNotifStatus('saved');
        setTimeout(() => setNotifStatus('idle'), 1500);
      } else {
        setNotifStatus('error');
        toast.error('Failed to update preference.');
      }
    } catch {
      setNotifStatus('error');
      toast.error('Network error updating preference.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    const formData = new FormData();
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    try {
      const result = await updateAccountPasswordAction(null, formData);
      if (result.success) {
        toast.success('Password updated successfully.');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangingPassword(false);
      } else {
        setPasswordError(result.message || 'Failed to update password.');
      }
    } catch {
      setPasswordError('An unexpected error occurred.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  if (!profileInitialized || !profile) {
    return (
      <div className="account-uninitialized-box">
        <div className="account-uninitialized-card">
          <AlertCircle size={32} color="var(--color-danger)" style={{ margin: '0 auto 16px', display: 'block' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '8px' }}>
            Operator Profile Uninitialized
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '24px' }}>
            Your authentication identity is active, but the operator profile is uninitialized.
          </p>
          <button className="btn-primary" onClick={() => startTransition(() => router.push('/onboarding'))}>
            Complete Operator Onboarding
          </button>
        </div>
      </div>
    );
  }

  const userInitial = (profile.fullName || profile.email || 'U').charAt(0).toUpperCase();

  const planLabel = (entitlement.planName || 'FREE').toUpperCase().replace(/NEIGHBORHOOD /g, '').split(' ')[0];

  const indexItems = [
    { id: 'identity' as const, label: 'Identity', count: undefined },
    { id: 'stores' as const, label: 'Storefronts', count: businesses.length < 10 ? `0${businesses.length}` : `${businesses.length}` },
    { id: 'notifications' as const, label: 'Notifications', count: '03' },
    { id: 'security' as const, label: 'Security', count: undefined },
    { id: 'plan' as const, label: 'Plan', count: planLabel },
  ];

  return (
    <div className="account-workspace-container">
      
      {/* Workspace Grid Layout: Direct Canvas Sidepanel + Unboxed Content Stage */}
      <div className="account-workspace-grid">
        
        {/* LEFT PANEL: Clean Canvas Index */}
        <aside className="account-sidepanel">
          {/* Operator Monogram & Identity Block */}
          <div>
            <div className="account-operator-avatar">
              {userInitial}
            </div>

            <div className="account-operator-name">
              {profile.fullName || 'Operator'}
            </div>

            <div className="account-verified-chip">
              <span className="account-verified-dot" />
              VERIFIED OPERATOR
            </div>
          </div>

          {/* Hairline Separator */}
          <div className="account-divider" />

          {/* Content Index */}
          <nav className="account-nav-list">
            {indexItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`account-nav-btn ${isActive ? 'active' : ''}`}
                >
                  <span className="account-nav-label">
                    {item.label}
                  </span>

                  {item.count && (
                    <span className="account-nav-count">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Hairline Separator */}
          <div className="account-divider" />

          {/* Sign Out Action */}
          <form action="/auth/signout" method="POST">
            <button type="submit" className="account-signout-btn">
              <LogOut size={12} /> Sign out
            </button>
          </form>
        </aside>

        {/* RIGHT PANE: Unboxed Content Stage */}
        <main className="account-stage">
          
          {/* Stage Header */}
          <div className="account-stage-header">
            <div className="account-stage-eyebrow">
              OPERATOR CONSOLE &bull; {activeTab.toUpperCase()}
            </div>

            <div className="account-stage-header-row">
              <div>
                <h1 className="account-stage-title">
                  {activeTab === 'identity' && (profile.fullName || 'Operator Identity')}
                  {activeTab === 'stores' && 'Authorized Storefronts'}
                  {activeTab === 'notifications' && 'Notification Channels'}
                  {activeTab === 'security' && 'Security & Access'}
                  {activeTab === 'plan' && 'Commercial Tier & Usage'}
                </h1>
                <div className="account-stage-subtitle">
                  {profile.email} &bull; Joined {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Verified Operator Badge */}
              <div className="account-badge-verified">
                <ShieldCheck size={13} /> VERIFIED OPERATOR
              </div>
            </div>
          </div>

          {/* Hairline Divider */}
          <div className="account-divider" style={{ marginBottom: '32px' }} />

          {/* STAGE 1: IDENTITY (Individual Field Editing Lifecycle in 2-Column Stage) */}
          {activeTab === 'identity' && (
            <div className="account-identity-layout">
              
              {/* Left Sub-column: Editable Properties Stack */}
              <div className="account-fields-stack">
                
                {/* FIELD 1: FULL NAME */}
                <div className="account-field-block">
                  <div className="account-field-label">
                    FULL NAME
                  </div>

                  {editingField !== 'fullName' ? (
                    <div className="account-field-read-row">
                      <span className="account-field-value">
                        {fullName || 'Not provided'}
                      </span>
                      <div className="account-field-actions">
                        {fullNameStatus === 'saved' && (
                          <span className="account-field-saved-indicator">
                            <Check size={12} /> SAVED
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingField('fullName')}
                          className="account-field-edit-btn"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="account-field-edit-wrapper">
                      <div className="account-field-input-box">
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => handleNameInput(e.target.value)}
                          onBlur={() => {
                            if (!fullNameError) {
                              setTimeout(() => setEditingField(null), 300);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="form-input"
                          placeholder="e.g. Ganesh Katam"
                          autoFocus
                        />
                        <div className="account-field-status-addon">
                          {fullNameStatus === 'saving' && (
                            <span style={{ color: 'var(--color-accent, #d97706)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Loader2 size={11} className="spin" /> Saving…
                            </span>
                          )}
                          {fullNameStatus === 'saved' && (
                            <span style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Check size={12} /> Saved
                            </span>
                          )}
                        </div>
                      </div>
                      {fullNameError && (
                        <p className="account-field-error-msg">
                          {fullNameError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* FIELD 2: LOGIN EMAIL (Read-Only) */}
                <div className="account-field-block">
                  <div className="account-field-label">
                    LOGIN EMAIL
                  </div>
                  <div className="account-field-read-row">
                    <span className="account-field-value">
                      {profile.email}
                    </span>
                    <span className="account-auth-lock-badge" title="Managed securely by Supabase Auth">
                      <Lock size={11} /> Auth Identity
                    </span>
                  </div>
                </div>

                {/* FIELD 3: PHONE / WHATSAPP */}
                <div className="account-field-block">
                  <div className="account-field-label">
                    PHONE / WHATSAPP
                  </div>

                  {editingField !== 'phone' ? (
                    <div className="account-field-read-row">
                      <span className={`account-field-value ${phone ? '' : 'muted'}`}>
                        {phone || 'Not provided'}
                      </span>
                      <div className="account-field-actions">
                        {phoneStatus === 'saved' && (
                          <span className="account-field-saved-indicator">
                            <Check size={12} /> SAVED
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingField('phone')}
                          className="account-field-edit-btn"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="account-field-edit-wrapper">
                      <div className="account-field-input-box">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => handlePhoneInput(e.target.value)}
                          onBlur={() => {
                            if (!phoneError) {
                              setTimeout(() => setEditingField(null), 300);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="form-input"
                          placeholder="+91 98765 43210"
                          autoFocus
                        />
                        <div className="account-field-status-addon">
                          {phoneStatus === 'saving' && (
                            <span style={{ color: 'var(--color-accent, #d97706)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Loader2 size={11} className="spin" /> Saving…
                            </span>
                          )}
                          {phoneStatus === 'saved' && (
                            <span style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Check size={12} /> Saved
                            </span>
                          )}
                        </div>
                      </div>
                      {phoneError && (
                        <p className="account-field-error-msg">
                          {phoneError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Sub-column: Digital Operator Membership Card */}
              <div className="account-membership-card">
                <div className="account-card-header">
                  <div className="account-card-initial">
                    {userInitial}
                  </div>

                  <span className="account-card-brand-tag">
                    STREETCRAFT &bull; {new Date().getFullYear()}
                  </span>
                </div>

                <div>
                  <div className="account-card-name">
                    {profile.fullName || 'OPERATOR'}
                  </div>

                  <div className="account-card-role">
                    VERIFIED OPERATOR &bull; {planLabel}
                  </div>
                </div>

                <div className="account-card-email">
                  {profile.email}
                </div>
              </div>

            </div>
          )}

          {/* STAGE 2: STOREFRONTS */}
          {activeTab === 'stores' && (
            <div className="account-fields-stack">
              <div className="account-stores-header">
                <span className="account-field-label">
                  {businesses.length} CONNECTED STOREFRONTS ({entitlement.businessLimit ?? '∞'} ALLOWED)
                </span>
                <button
                  type="button"
                  onClick={() => router.push('/setup')}
                  className="btn-ghost"
                  style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700 }}
                >
                  <Sparkles size={12} /> ADD STORE
                </button>
              </div>

              {businesses.length === 0 ? (
                <div className="account-uninitialized-card" style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', margin: '0 0 16px' }}>
                    No storefronts linked to this operator account yet.
                  </p>
                  <button className="btn-primary" onClick={() => router.push('/setup')} style={{ fontSize: '13px' }}>
                    Complete Store Setup
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {businesses.map((biz) => (
                    <div key={biz.id} className="account-store-item">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                            {biz.name}
                          </h3>
                          <span
                            style={{
                              fontSize: '10px',
                              fontFamily: 'var(--font-mono)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-xs)',
                              background: 'var(--color-primary-subtle)',
                              color: 'var(--color-primary)',
                              border: '1px solid var(--color-primary-border)',
                              fontWeight: 700,
                            }}
                          >
                            {biz.role.toUpperCase()} &bull; ACTIVE
                          </span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
                          Multi-touchpoint retail engine &bull; Store ID: {biz.id.slice(0, 8)}...
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => router.push(`/user/business?biz=${biz.id}`)}
                        className="btn-secondary"
                        style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        OPEN STOREFRONT <ArrowUpRight size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STAGE 3: NOTIFICATIONS (Individual Toggles) */}
          {activeTab === 'notifications' && (
            <div className="account-fields-stack">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="account-field-label">
                  INDIVIDUAL CHANNEL PREFERENCES
                </span>
                {notifStatus === 'saving' && (
                  <span style={{ fontSize: '11px', color: 'var(--color-accent, #d97706)', fontFamily: 'var(--font-mono)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Loader2 size={11} className="spin" /> SAVING…
                  </span>
                )}
                {notifStatus === 'saved' && (
                  <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Check size={12} /> SAVED
                  </span>
                )}
              </div>

              {/* Email Drop Toggle */}
              <div className="account-notif-row">
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-ink)' }}>
                    Email campaign drops
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                    Full copy packs and ready-to-use creative copy sent to {profile.email}.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleNotificationToggle('email')}
                  className={`account-toggle-btn ${notifs.email ? 'on' : 'off'}`}
                >
                  {notifs.email ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* WhatsApp Radar Toggle */}
              <div className="account-notif-row">
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-ink)' }}>
                    WhatsApp opportunity radar
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                    Instant radar pings for weather surges, festival drops, and traffic dips.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleNotificationToggle('whatsapp')}
                  className={`account-toggle-btn ${notifs.whatsapp ? 'on' : 'off'}`}
                >
                  {notifs.whatsapp ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Weekly Digest Toggle */}
              <div className="account-notif-row">
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-ink)' }}>
                    Weekly performance summary
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                    Monday morning digest of customer responses and campaign metrics.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleNotificationToggle('weeklyDigest')}
                  className={`account-toggle-btn ${notifs.weeklyDigest ? 'on' : 'off'}`}
                >
                  {notifs.weeklyDigest ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: SECURITY */}
          {activeTab === 'security' && (
            <div className="account-fields-stack">
              
              {/* Password Section */}
              <div style={{ paddingBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div className="account-field-label">
                      PASSWORD
                    </div>
                    <div style={{ fontSize: '14.5px', color: 'var(--color-ink)', marginTop: '4px' }}>
                      Managed securely through your StreetCraft account credentials.
                    </div>
                  </div>

                  {!isChangingPassword ? (
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(true)}
                      className="btn-ghost"
                      style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600 }}
                    >
                      Change password &rarr;
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordError(null);
                      }}
                      className="btn-ghost"
                      style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {isChangingPassword && (
                  <form
                    onSubmit={handlePasswordSubmit}
                    style={{
                      marginTop: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      maxWidth: '440px',
                    }}
                  >
                    {passwordError && (
                      <p className="account-field-error-msg">
                        {passwordError}
                      </p>
                    )}

                    <div>
                      <label className="account-field-label" style={{ display: 'block', marginBottom: '4px' }}>
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        required
                        minLength={8}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="account-field-label" style={{ display: 'block', marginBottom: '4px' }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        required
                        minLength={8}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isUpdatingPassword}
                        style={{ fontSize: '12.5px', padding: '8px 18px' }}
                      >
                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Active Session Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div className="account-field-label">
                    ACTIVE SESSION
                  </div>
                  <div style={{ fontSize: '14.5px', color: 'var(--color-ink)', marginTop: '4px' }}>
                    Authenticated via Supabase Auth session token.
                  </div>
                </div>

                <form action="/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="account-signout-btn"
                    style={{ width: 'auto', padding: '6px 12px' }}
                  >
                    Sign out of session &rarr;
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* STAGE 5: PLAN */}
          {activeTab === 'plan' && (
            <div className="account-fields-stack">
              <div>
                <div className="account-stage-eyebrow">
                  COMMERCIAL ENTITLEMENT
                </div>
                <h3 className="account-stage-title" style={{ fontSize: '24px' }}>
                  {entitlement.planName || 'Standard Plan'}
                </h3>
              </div>

              <div className="account-plan-metrics-grid">
                <div>
                  <span className="account-field-label" style={{ display: 'block' }}>
                    Store Capacity
                  </span>
                  <strong style={{ fontSize: '16px', color: 'var(--color-ink)', marginTop: '2px', display: 'block' }}>
                    {businesses.length} / {entitlement.businessLimit ?? '∞'} Stores
                  </strong>
                </div>
                <div>
                  <span className="account-field-label" style={{ display: 'block' }}>
                    Marketing Channels
                  </span>
                  <strong style={{ fontSize: '16px', color: 'var(--color-primary)', marginTop: '2px', display: 'block' }}>
                    All 4 Channels Active
                  </strong>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => router.push('/user/billing')}
                  style={{ fontSize: '13px', padding: '9px 22px' }}
                >
                  Manage billing &amp; subscription &rarr;
                </button>
              </div>
            </div>
          )}

        </main>

      </div>
    </div>
  );
}
