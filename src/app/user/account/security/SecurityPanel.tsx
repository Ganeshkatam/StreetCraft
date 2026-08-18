'use client';

import React, { useState } from 'react';
import { ChevronRight, KeyRound, Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import { AccountUserProfile } from '../../../../lib/server/account/getAccountProfile';
import {
  sendPasswordOtpAction,
  updateAccountPasswordAction,
} from '../../../../lib/server/account/updateAccountPasswordAction';
import { toast } from 'sonner';

interface SecurityPanelProps {
  profile: AccountUserProfile;
}

export const SecurityPanel: React.FC<SecurityPanelProps> = ({ profile }) => {
  // Wizard steps: 'idle' | 'request_otp' | 'verify_and_update'
  const [step, setStep] = useState<'idle' | 'request_otp' | 'verify_and_update'>('idle');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

  const handleRequestOtp = async () => {
    setIsSendingOtp(true);
    setFeedback(null);

    const res = await sendPasswordOtpAction();
    setIsSendingOtp(false);

    if (res.success) {
      setStep('verify_and_update');
      const msg = res.message || `Verification code sent to ${profile.email}.`;
      setFeedback({ type: 'info', message: msg });
      toast.success(msg);
    } else {
      setStep('verify_and_update');
      const msg = res.message || 'Enter verification code to continue.';
      setFeedback({ type: 'info', message: msg });
      toast.info(msg);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length < 6) {
      const err = 'Please enter the complete 6-digit verification code.';
      setFeedback({ type: 'error', message: err });
      toast.error(err);
      return;
    }
    if (newPassword.length < 8) {
      const err = 'Password must be at least 8 characters long.';
      setFeedback({ type: 'error', message: err });
      toast.error(err);
      return;
    }
    if (newPassword !== confirmPassword) {
      const err = 'Passwords do not match.';
      setFeedback({ type: 'error', message: err });
      toast.error(err);
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData();
    formData.set('otpCode', otpCode.trim());
    formData.set('newPassword', newPassword);
    formData.set('confirmPassword', confirmPassword);

    const res = await updateAccountPasswordAction(null, formData);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', message: 'Password successfully updated.' });
      toast.success('Password successfully updated.');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setStep('idle');
        setFeedback(null);
      }, 2500);
    } else {
      const err = res.message || 'Verification failed. Please try again.';
      setFeedback({ type: 'error', message: err });
      toast.error(err);
    }
  };

  const handleCancel = () => {
    setStep('idle');
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
    setFeedback(null);
  };

  return (
    <div className="account-pane-fields">
      {/* PASSWORD SECTION */}
      <div className="account-field-row">
        <div className="account-field-meta-label">
          PASSWORD &amp; ACCESS SECURITY
        </div>

        {step === 'idle' && (
          <div className="account-field-content-row">
            <div>
              <div className="account-security-masked-value">
                &bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;
              </div>
              <div className="account-field-help-muted">Protected with email OTP authorization</div>
            </div>

            <button
              type="button"
              onClick={() => setStep('request_otp')}
              className="account-field-edit-action"
            >
              <span>Change</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {step === 'request_otp' && (
          <div className="account-otp-step-container">
            <div className="account-otp-notice">
              <Mail size={16} className="account-otp-icon" />
              <div>
                <div className="account-otp-notice-title">Authorization Required</div>
                <div className="account-otp-notice-sub">
                  We will send a 6-digit security code to <strong>{profile.email}</strong> to authorize changing your password.
                </div>
              </div>
            </div>

            <div className="account-password-actions-row">
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isSendingOtp}
                className="btn-primary"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 size={14} className="spin" />
                    <span>Sending Code…</span>
                  </>
                ) : (
                  <>
                    <Mail size={14} />
                    <span>Send Verification Code</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isSendingOtp}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === 'verify_and_update' && (
          <form onSubmit={handlePasswordSubmit} className="account-password-inline-form">
            <div className="account-otp-form-header">
              <div className="account-otp-form-title">Enter Verification Code &amp; New Password</div>
              <div className="account-otp-form-sub">
                Enter the 6-digit code sent to {profile.email}
              </div>
            </div>

            <div className="account-otp-inputs-grid">
              <div>
                <label className="account-input-label">6-DIGIT VERIFICATION CODE</label>
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="account-field-input account-otp-code-input"
                  required
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>

              <div>
                <label className="account-input-label">NEW PASSWORD</label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="account-field-input"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="account-input-label">CONFIRM NEW PASSWORD</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="account-field-input"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {feedback && (
              <div className={`account-security-feedback ${feedback.type}`}>
                {feedback.type === 'success' && <Check size={14} />}
                {feedback.type === 'error' && <AlertCircle size={14} />}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="account-password-actions-row">
              <button
                type="submit"
                disabled={isSubmitting || otpCode.length < 6}
                className="btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="spin" />
                    <span>Verifying…</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={14} />
                    <span>Verify Code &amp; Update Password</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isSendingOtp || isSubmitting}
                className="account-resend-btn"
              >
                {isSendingOtp ? 'Resending…' : 'Resend Code'}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="account-field-row-divider" />
      </div>

      {/* VERIFIED AUTH ROW */}
      <div className="account-field-row">
        <div className="account-field-meta-label">
          AUTHENTICATION IDENTITY
        </div>

        <div className="account-field-content-row">
          <div>
            <div className="account-auth-name">{profile.email}</div>
            <div className="account-field-help-muted">Authenticated via Supabase Auth Security Provider</div>
          </div>

          <div className="account-auth-identity-pill">
            <span>Verified Auth</span>
          </div>
        </div>

        <div className="account-field-row-divider" />
      </div>
    </div>
  );
};
