'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { supabase, isGoogleOAuthEnabled } from '../../lib/supabase';
import { getUserFacingErrorMessage } from '../../lib/userFacingError';
import { toast } from 'sonner';
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

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimToken = searchParams.get('claim');
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await signUp(email, password, name);
      if (!res.isAuthenticated) {
        toast.info(`Verification email sent to ${email}. Please check your inbox.`);
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        toast.success('Account created successfully.');
        const dest = claimToken ? `/setup?claim=${encodeURIComponent(claimToken)}` : '/setup';
        router.push(dest);
      }
    } catch (err: unknown) {
      toast.error(getUserFacingErrorMessage(err, 'Failed to create your account. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleOAuth = async () => {
    try {
      const redirectTo = `${window.location.origin}/auth/callback${claimToken ? `?claim=${encodeURIComponent(claimToken)}` : ''}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (err: unknown) {
      toast.error(getUserFacingErrorMessage(err, 'Google Sign-In is unavailable. Please sign up with email.'));
    }
  };

  return (
    <div
      className="auth-full-viewport"
      style={{ backgroundImage: "url('/signup_full.jpg')" }}
    >
      <div className="auth-backdrop-overlay" />

      <div className="auth-content-container">
        <header className="auth-header">
          <div className="auth-brand-badge" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            <div className="auth-logo-badge">
              <Store size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="auth-logo-title">STREETCRAFT</div>
              <div className="auth-logo-subtitle">PHYSICAL STOREFRONT ENGINE</div>
            </div>
          </div>

          <button
            className="auth-back-btn"
            onClick={() => router.push('/')}
          >
            Back to home
          </button>
        </header>

        <main className="auth-main-grid">
          <div className="auth-hero-col">
            <h1 className="auth-hero-title">
              Turn quiet tables<br />
              <span className="auth-hero-italic">into packed counters.</span>
            </h1>

            <p className="auth-hero-subtitle">
              Start generating coordinated, character-compliant marketing for Google, Instagram, WhatsApp, and in-store print in 60 seconds.
            </p>

            <div className="auth-value-props">
              <div className="auth-value-item">
                <div className="auth-value-icon">
                  <Megaphone size={16} />
                </div>
                <div>
                  <div className="auth-value-title">4 Channels, 1 Opportunity</div>
                  <div className="auth-value-desc">Google update, IG Reel + Story, WhatsApp broadcast, and printable counter card.</div>
                </div>
              </div>

              <div className="auth-value-item">
                <div className="auth-value-icon">
                  <Sparkles size={16} />
                </div>
                <div>
                  <div className="auth-value-title">Starts Free with Store Preferences</div>
                  <div className="auth-value-desc">No credit card required. Free tier includes complete campaigns every month.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-card-col">
            <div className="auth-card">
              <span className="section-eyebrow">NEIGHBORHOOD STARTER ACCESS</span>
              <h2 className="auth-card-title">Create your workspace</h2>
              <p className="auth-card-subtitle">
                {claimToken ? 'Create your account to save your generated campaign.' : 'Already have an account? '}
                <Link href={claimToken ? `/login?claim=${encodeURIComponent(claimToken)}` : '/login'} className="auth-inline-link">
                  Sign in
                </Link>
              </p>

              {isGoogleOAuthEnabled && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleOAuth}
                    className="auth-google-btn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Continue with Google
                  </button>

                  <div className="auth-divider">
                    <span>or sign up with email</span>
                  </div>
                </>
              )}

              <form onSubmit={handleSignup}>
                <div className="auth-form-field">
                  <label className="auth-form-label">Full Name or Operator Name</label>
                  <div className="auth-input-wrapper">
                    <User size={15} className="auth-input-icon" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Arjun Sharma"
                      className="auth-input"
                    />
                  </div>
                </div>

                <div className="auth-form-field">
                  <label className="auth-form-label">Store Operator Email</label>
                  <div className="auth-input-wrapper">
                    <Mail size={15} className="auth-input-icon" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@yourstore.in"
                      className="auth-input"
                    />
                  </div>
                </div>

                <div className="auth-form-field">
                  <label className="auth-form-label">Create Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={15} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="auth-input auth-input-password"
                    />
                    <button
                      type="button"
                      className="auth-input-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="auth-checkbox-input"
                  />
                  <span>
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" className="auth-link">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" target="_blank" className="auth-link">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting || !agreeTerms}
                  className="auth-submit-btn"
                >
                  {isSubmitting ? 'Creating account...' : 'Create Free Workspace'}
                </button>
              </form>
            </div>

            <footer className="auth-security-badge">
              <ShieldCheck size={13} />
              <span>Zero sales commission. You keep 100% of walk-in revenue.</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export function SignupView() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--color-bg)' }} />}>
      <SignupContent />
    </Suspense>
  );
}
