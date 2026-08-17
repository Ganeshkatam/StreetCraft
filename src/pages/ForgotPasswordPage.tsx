import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Store,
  Mail,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

import { getUserFacingErrorMessage } from '../lib/userFacingError';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setErrorMsg(getUserFacingErrorMessage(err, 'Failed to send recovery instructions. Please verify your email and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="auth-full-viewport"
      style={{ backgroundImage: "url('/reset_full.jpg')" }}
    >
      {/* Soft warm paper backdrop overlay for typography legibility */}
      <div className="auth-backdrop-overlay" />

      {/* Foreground Content Container */}
      <div className="auth-content-container">
        {/* Top Header */}
        <header className="auth-header">
          <div className="auth-brand-badge" onClick={() => navigate('/')}>
            <div className="auth-logo-badge">
              <Store size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="auth-logo-title">STREETCRAFT</div>
              <div className="auth-logo-subtitle">GROWTH ENGINE</div>
            </div>
          </div>

          <button className="auth-back-btn" onClick={() => navigate('/login')}>
            &larr; Back to sign in
          </button>
        </header>

        {/* Main 2-Column Grid */}
        <main className="auth-main-grid">
          {/* Left Column: Brand Story & Instructions */}
          <div className="auth-hero-col">
            <h1 className="auth-hero-title">
              Reset your password,<br />
              <span className="auth-hero-italic">access your storefront.</span>
            </h1>

            <p className="auth-hero-subtitle">
              Enter the email address registered with your StreetCraft workspace.<br />
              We will send you secure instructions to regain access.
            </p>

            <div className="auth-value-desc" style={{ marginTop: '16px', maxWidth: '420px', lineHeight: 1.5 }}>
              If you operate multiple businesses or have forgotten your store account email, contact our team directly at support@streetcraft.local.
            </div>
          </div>

          {/* Right Column: Floating Reset Card */}
          <div className="auth-card-col">
            <div className="auth-card">
              {!isSubmitted && errorMsg && (
                <div className="auth-error-alert">
                  {errorMsg}
                </div>
              )}

              {isSubmitted ? (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div className="auth-value-icon" style={{ width: '42px', height: '42px', margin: '0 auto 12px' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <h2 className="auth-card-title">Instructions Sent</h2>
                  <p className="auth-card-subtitle" style={{ margin: '0 0 20px' }}>
                    If an account exists for <strong>{email}</strong>, you will receive a secure reset link shortly.
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="auth-submit-btn"
                  >
                    Return to Sign in &rarr;
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="auth-card-title">Reset Password</h2>
                  <p className="auth-card-subtitle">Enter your email to receive recovery instructions.</p>

                  <form onSubmit={handleSubmit}>
                    <div className="auth-form-field" style={{ marginBottom: '16px' }}>
                      <label className="auth-form-label">Registered Email</label>
                      <div className="auth-input-wrapper">
                        <Mail size={15} className="auth-input-icon" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@yourstore.com"
                          className="auth-input"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !email}
                      className="auth-submit-btn"
                    >
                      {isSubmitting ? 'Sending instructions...' : 'Send Reset Link \u2192'}
                    </button>
                  </form>

                  <div className="auth-switch-text">
                    Remember your credentials?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="auth-switch-link"
                    >
                      Sign in &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            <footer className="auth-security-badge">
              <ShieldCheck size={13} />
              <span>Your data is secure and never shared.</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};
