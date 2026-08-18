'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { SecurityViewModel } from '../../../../lib/domain/account/accountTypes';
import { updateAccountPasswordAction, UpdatePasswordActionState } from '../../../../lib/server/account/updateAccountPasswordAction';
import { toast } from 'sonner';
import { Key, LogOut, Check, Shield } from 'lucide-react';

interface SecurityPanelViewProps {
  security: SecurityViewModel;
}

const initialState: UpdatePasswordActionState = { success: false };

export function SecurityPanelView({ security }: SecurityPanelViewProps) {
  const [state, formAction, isSaving] = useActionState(updateAccountPasswordAction, initialState);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (state) {
      if (state.success) {
        toast.success(state.message || 'Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else if (state.message) {
        toast.error(state.message);
      }
    }
  }, [state]);

  const lastSignInDate = security.lastSignInAt
    ? new Date(security.lastSignInAt).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    : 'Active Session';

  return (
    <div className="account-pane">
      <div className="account-pane-header">
        <span className="account-pane-tag">ACCOUNT SECURITY</span>
        <h1 className="account-pane-title">Password &amp; Credentials</h1>
        <p className="account-pane-subtitle">
          Manage your password, login authorization credentials, and authenticated session state.
        </p>
      </div>

      <div className="account-pane-fields">
        {/* Session Metadata Grid */}
        <div className="account-fields-grid" style={{ marginBottom: '14px', marginTop: 0 }}>
          <div className="account-field-card locked">
            <div className="account-field-card-header">
              <span className="account-field-card-label">PRIMARY IDENTITY</span>
              <Shield size={13} color="var(--color-primary)" />
            </div>
            <div className="account-field-card-value">
              {security.email}
            </div>
            <div className="account-field-card-helper">
              Provider: {security.provider.toUpperCase()} (Supabase Auth)
            </div>
          </div>

          <div className="account-field-card locked">
            <div className="account-field-card-header">
              <span className="account-field-card-label">LAST SIGN-IN TIMESTAMP</span>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', fontWeight: 700 }}>
                VERIFIED
              </span>
            </div>
            <div className="account-field-card-value">
              {lastSignInDate}
            </div>
            <div className="account-field-card-helper">
              Active browser session
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="account-field-card locked" style={{ padding: '16px 20px', marginBottom: '14px' }}>
          <div className="account-field-card-header" style={{ marginBottom: '12px' }}>
            <span className="account-field-card-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={13} color="var(--color-primary)" />
              <span>UPDATE PASSWORD</span>
            </span>
          </div>

          <form action={formAction}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="currentPassword" style={{ fontSize: '11.5px' }}>
                  Current Password <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  className="input-field"
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ height: '36px', fontSize: '13px' }}
                  required
                />
                {state.errors?.currentPassword && (
                  <span className="field-error">{state.errors.currentPassword[0]}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newPassword" style={{ fontSize: '11.5px' }}>
                  New Password <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className="input-field"
                  placeholder="Min. 8 chars"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ height: '36px', fontSize: '13px' }}
                  required
                />
                {state.errors?.newPassword && (
                  <span className="field-error">{state.errors.newPassword[0]}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword" style={{ fontSize: '11.5px' }}>
                  Confirm New Password <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="input-field"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ height: '36px', fontSize: '13px' }}
                  required
                />
                {state.errors?.confirmPassword && (
                  <span className="field-error">{state.errors.confirmPassword[0]}</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ fontSize: '12px', padding: '6px 16px' }}
                disabled={isSaving}
              >
                <Check size={13} />
                <span>{isSaving ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sign Out Action Card */}
        <div className="account-field-card locked" style={{ padding: '12px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)' }}>
                Sign Out of Account
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)' }}>
                End your active session on this device.
              </div>
            </div>

            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '5px 14px', color: 'var(--color-danger)' }}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
