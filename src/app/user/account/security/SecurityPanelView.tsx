'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { SecurityViewModel } from '../../../../lib/domain/account/accountTypes';
import { updateAccountPasswordAction, UpdatePasswordActionState } from '../../../../lib/server/account/updateAccountPasswordAction';
import { toast } from 'sonner';
import { Key, LogOut, Check, Shield, CheckCircle2 } from 'lucide-react';

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
        {/* Primary Identity Row */}
        <div className="account-field-row">
          <div className="account-field-info">
            <div className="account-field-label">PRIMARY IDENTITY</div>
            <div className="account-field-display-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <Shield size={14} color="var(--color-primary)" />
              <span>{security.email}</span>
            </div>
            <div className="account-field-helper">
              Provider: {security.provider.toUpperCase()} (Supabase Auth)
            </div>
          </div>
        </div>

        {/* Last Sign-In Row */}
        <div className="account-field-row">
          <div className="account-field-info">
            <div className="account-field-label">LAST SIGN-IN TIMESTAMP</div>
            <div className="account-field-display-value" style={{ marginTop: '2px' }}>
              {lastSignInDate}
            </div>
            <div className="account-field-helper">
              Active authenticated browser session
            </div>
          </div>

          <span className="account-badge-verified">
            <CheckCircle2 size={10} strokeWidth={3} /> VERIFIED
          </span>
        </div>

        {/* Change Password Section */}
        <div className="account-section-block">
          <div className="account-field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
            <Key size={13} color="var(--color-primary)" />
            <span>CHANGE PASSWORD</span>
          </div>

          <form action={formAction}>
            <div className="account-form-grid-3col">
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
                style={{ fontSize: '12px', padding: '6px 16px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                disabled={isSaving}
              >
                <Check size={13} />
                <span>{isSaving ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sign Out Row */}
        <div className="account-field-row" style={{ padding: '16px 0' }}>
          <div className="account-field-info">
            <div className="account-field-label">ACCOUNT SESSION</div>
            <div className="account-field-display-value">
              Sign Out of Account
            </div>
            <div className="account-field-helper">
              End your active session on this device.
            </div>
          </div>

          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px', color: 'var(--color-danger)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
