import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { KeyRound, Check, AlertCircle, Sparkles } from 'lucide-react';

import { getUserFacingErrorMessage } from '../lib/userFacingError';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setErrorMsg(getUserFacingErrorMessage(err, 'Failed to update your password. Please request a new reset link.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card" style={{ maxWidth: '440px', margin: '60px auto', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="section-eyebrow">ACCOUNT RECOVERY</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--color-ink)', marginTop: '4px' }}>
            Set New Password
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
            Enter a secure password to restore access to your store workspace.
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Check size={22} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '6px' }}>
              Password Reset Complete
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)' }}>
              Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            {errorMsg && (
              <div className="auth-error-alert" style={{ marginBottom: '16px' }}>
                <AlertCircle size={15} /> {errorMsg}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">New Password</label>
              <input
                type="password"
                required
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
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
              disabled={loading || !password}
              className="auth-submit-btn"
              style={{ width: '100%' }}
            >
              {loading ? 'Updating Password...' : 'Save New Password &rarr;'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
