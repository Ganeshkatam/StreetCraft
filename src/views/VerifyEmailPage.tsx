import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, RotateCw, CheckCircle2, Store } from 'lucide-react';
import { api } from '../lib/api';
import { getUserFacingErrorMessage } from '../lib/userFacingError';
import { toast } from 'sonner';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const emailParam = queryParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setIsResending(true);
    try {
      await api.resendConfirmationEmail(email);
      toast.success(`Verification email resent to ${email}. Please check your inbox.`);
      setCooldown(60);
    } catch (err: unknown) {
      toast.error(getUserFacingErrorMessage(err, 'Unable to resend verification email. Please verify the address and try again.'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-page auth-full-viewport">
      <div className="auth-content-container">
        <header className="auth-header">
          <div className="auth-brand-badge">
            <div className="auth-logo-badge">
              <Store size={18} />
            </div>
            <div>
              <span className="auth-logo-title">StreetCraft</span>
              <span className="auth-logo-subtitle">Local Growth Engine</span>
            </div>
          </div>

          <Link to="/login" className="auth-back-btn">
            <span>Sign In</span>
          </Link>
        </header>

        <main className="auth-main-grid">
          {/* Editorial Column */}
          <div className="auth-hero-col">
            <div className="auth-step-pill">
              <span className="auth-step-dot" />
              <span>Step 1 of 2 · Account Activation</span>
            </div>

            <h1 className="auth-hero-title">
              Verify your store operator email.
            </h1>

            <p className="auth-hero-desc">
              To protect your business workspace and keep your store marketing isolated, we verify every operator's email address prior to onboarding.
            </p>

            <div className="auth-value-props">
              <div className="auth-value-item">
                <div className="auth-value-icon">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="auth-value-title">Instant Verification Link</div>
                  <div className="auth-value-desc">Click the link in your email to instantly activate your storefront workspace.</div>
                </div>
              </div>

              <div className="auth-value-item">
                <div className="auth-value-icon">
                  <Mail size={16} />
                </div>
                <div>
                  <div className="auth-value-title">Check Spam or Promotions</div>
                  <div className="auth-value-desc">If the email hasn't arrived within two minutes, check your spam or promotions folder.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Card Column */}
          <div className="auth-card-col">
            <div className="auth-card">
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: '#E8F1EB',
                    color: '#1B4332',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    border: '1px solid #CADBCF',
                  }}
                >
                  <Mail size={26} />
                </div>
                <h2 className="auth-card-title">Check your inbox</h2>
                <p className="auth-card-subtitle">
                  We sent a confirmation link to{' '}
                  <strong style={{ color: '#111827' }}>
                    {email || 'your email address'}
                  </strong>
                  .
                </p>
              </div>

              <div
                style={{
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: 10,
                  padding: '14px 16px',
                  fontSize: 13,
                  color: '#4B5563',
                  lineHeight: 1.5,
                  marginBottom: 20,
                }}
              >
                Click the confirmation button in the email to activate your account and configure your storefront profile.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || cooldown > 0 || !email}
                  className="auth-btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <RotateCw size={15} className={isResending ? 'spin-icon' : ''} />
                  <span>
                    {cooldown > 0
                      ? `Resend available in ${cooldown}s`
                      : isResending
                      ? 'Sending...'
                      : 'Resend Verification Email'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="auth-btn-google"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>Already confirmed? Sign in</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
