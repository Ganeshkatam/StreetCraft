'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SecurityViewModel } from '../../../../lib/domain/account/accountTypes';
import { updateAccountPasswordAction, UpdatePasswordActionState } from '../../../../lib/server/account/updateAccountPasswordAction';
import { AccountProfileHeader } from '../components/AccountProfileHeader';
import { AccountSecurityFooter } from '../components/AccountSecurityFooter';
import { toast } from 'sonner';
import { Lock, Key, LogOut, Check, Shield } from 'lucide-react';

interface SecurityPanelViewProps {
  security: SecurityViewModel;
}

const initialState: UpdatePasswordActionState = { success: false };

export function SecurityPanelView({ security }: SecurityPanelViewProps) {
  const router = useRouter();
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
    <div>
      <AccountProfileHeader
        eyebrow="ACCOUNT &amp; SECURITY"
        title="Password &amp; Security"
        subtitle="Manage your password, login authorization credentials, and authenticated session state."
      />

      <div className="account-stage-content">
        {/* Password Update Form */}
        <div style={{ marginBottom: '32px', paddingBottom: '28px', borderBottom: '1px solid var(--color-border)' }}>
          <div className="account-field-label" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={14} color="var(--color-primary)" />
            <span>CHANGE PASSWORD</span>
          </div>

          <form action={formAction}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="currentPassword">
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
                required
              />
              {state.errors?.currentPassword && (
                <span className="field-error">{state.errors.currentPassword[0]}</span>
              )}
            </div>

            <div className="workspace-grid-2col" style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">
                  New Password <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className="input-field"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                {state.errors?.newPassword && (
                  <span className="field-error">{state.errors.newPassword[0]}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm New Password <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="input-field"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                style={{ fontSize: '13px', padding: '7px 20px' }}
                disabled={isSaving}
              >
                <Check size={14} />
                <span>{isSaving ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Authentication Session Metadata */}
        <div style={{ marginBottom: '32px', paddingBottom: '28px', borderBottom: '1px solid var(--color-border)' }}>
          <div className="account-field-label" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={14} color="var(--color-primary)" />
            <span>SESSION CREDENTIALS</span>
          </div>

          <div className="workspace-grid-2col">
            <div className="account-review-domain-card" style={{ padding: '16px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', marginBottom: '4px' }}>
                PRIMARY IDENTITY
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>
                {security.email}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                Provider: {security.provider.toUpperCase()}
              </div>
            </div>

            <div className="account-review-domain-card" style={{ padding: '16px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', marginBottom: '4px' }}>
                LAST SIGN-IN TIMESTAMP
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>
                {lastSignInDate}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                Session State: Verified
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 2px' }}>
              Sign Out of Account
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', margin: 0 }}>
              End your active session on this device.
            </p>
          </div>

          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="btn-secondary"
              style={{ fontSize: '12.5px', padding: '6px 16px', color: 'var(--color-danger)' }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>

        <AccountSecurityFooter />
      </div>
    </div>
  );
}
