import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getUserFacingErrorMessage } from '../lib/userFacingError';
import {
  Store,
  Megaphone,
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

interface SignupPageProps {
  claimToken?: string | null;
  onSuccess?: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await signUp(email, password, name);
      if (onSuccess) onSuccess();
      navigate('/setup');
    } catch (err) {
      setErrorMsg(getUserFacingErrorMessage(err, 'Failed to create your account. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="auth-full-viewport"
      style={{ backgroundImage: "url('/signup_full.jpg')" }}
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

          <button className="auth-back-btn" onClick={() => navigate('/')}>
            &larr; Back to site
          </button>
        </header>

        {/* Main 2-Column Grid */}
        <main className="auth-main-grid">
          {/* Left Column: Brand Story & Value Props */}
          <div className="auth-hero-col">
            <h1 className="auth-hero-title">
              Start growing,<br />
              <span className="auth-hero-italic">your storefront awaits.</span>
            </h1>

            <p className="auth-hero-subtitle">
              Create your free account and turn slow hours, new arrivals,
              and business opportunities into customers.
            </p>

            <div className="auth-value-props">
              <div className="auth-value-item">
                <div className="auth-value-icon">
                  <Store size={17} strokeWidth={2} />
                </div>
                <div>
                  <div className="auth-value-title">Zero setup friction</div>
                  <div className="auth-value-desc">Teach StreetCraft about your store in under 60 seconds.</div>
                </div>
              </div>

              <div className="auth-value-item">
                <div className="auth-value-icon">
                  <Megaphone size={17} strokeWidth={2} />
                </div>
                <div>
                  <div className="auth-value-title">One opportunity. Everything customers need to see.</div>
                  <div className="auth-value-desc">Google, Instagram, WhatsApp, and counter poster generated simultaneously.</div>
                </div>
              </div>

              <div className="auth-value-item">
                <div className="auth-value-icon">
                  <Sparkles size={17} strokeWidth={2} />
                </div>
                <div>
                  <div className="auth-value-title">Free tier included</div>
                  <div className="auth-value-desc">Manage up to 2 physical stores with 3 free campaigns every month.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Signup Card */}
          <div className="auth-card-col">
            <div className="auth-card">
              {errorMsg && (
                <div className="auth-error-alert">
                  {errorMsg}
                </div>
              )}

              <h2 className="auth-card-title">Create your account</h2>
              <p className="auth-card-subtitle">Start your free store workspace today.</p>

              <form onSubmit={handleSignup}>
                <div className="auth-form-field">
                  <label className="auth-form-label">Your Name</label>
                  <div className="auth-input-wrapper">
                    <User size={15} className="auth-input-icon" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya Sharma"
                      className="auth-input"
                    />
                  </div>
                </div>

                <div className="auth-form-field">
                  <label className="auth-form-label">Email Address</label>
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

                <div className="auth-form-field">
                  <label className="auth-form-label">Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={15} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="auth-input auth-input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-input-password-toggle"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="auth-form-field">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="auth-checkbox-input"
                    />
                    <span>I agree to the Terms of Service and Privacy Policy.</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !name || !email || !password || !agreeTerms}
                  className="auth-submit-btn"
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account \u2192'}
                </button>
              </form>

              <div className="auth-or-divider">
                <div className="auth-or-line" />
                <span className="auth-or-pill">or</span>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setErrorMsg(null);
                  setIsSubmitting(true);
                  try {
                    if (isSupabaseConfigured && supabase) {
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                          redirectTo: window.location.origin + '/app'
                        }
                      });
                      if (error) throw error;
                    } else {
                      setErrorMsg('Google Sign-In requires active Supabase OAuth configuration.');
                    }
                  } catch (err: any) {
                    setErrorMsg(err?.message || 'Failed to initiate Google sign-in.');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="auth-google-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="auth-switch-text">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="auth-switch-link"
                >
                  Sign in &rarr;
                </button>
              </div>
            </div>

            <footer className="auth-security-badge" style={{ flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} />
                <span>Your data is secure and never shared.</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>
                By signing up, you agree to our{' '}
                <button type="button" onClick={() => navigate('/terms')} style={{ textDecoration: 'underline', color: 'inherit' }}>Terms</button>
                {' '}&amp;{' '}
                <button type="button" onClick={() => navigate('/privacy')} style={{ textDecoration: 'underline', color: 'inherit' }}>Privacy Policy</button>.
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};
