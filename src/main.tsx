import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './styles.css';

import { ThemeProvider } from './theme/ThemeProvider';
import { DialogProvider } from './context/DialogContext';
import { useAuth } from './hooks/useAuth';
import { useBusiness } from './hooks/useBusiness';
import { useUsage } from './hooks/useUsage';
import { DynamicOpportunity } from './engine/briefing/opportunityEngine';

import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { UpgradeModal } from './components/UpgradeModal';

import { LandingPage } from './pages/LandingPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { FreeToolPage } from './pages/FreeToolPage';
import { PricingPage } from './pages/PricingPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ErrorPage } from './pages/ErrorPage';

import { DashboardPage } from './pages/app/DashboardPage';
import { BusinessPage } from './pages/app/BusinessPage';
import { CreateCampaignPage } from './pages/app/CreateCampaignPage';
import { CampaignVaultPage } from './pages/app/CampaignVaultPage';
import { CampaignDetailPage } from './pages/app/CampaignDetailPage';
import { BillingSettingsPage } from './pages/app/BillingSettingsPage';
import { AccountSettingsPage } from './pages/app/AccountSettingsPage';
import { LayoutDashboard, Sparkles, FolderArchive, Store, CreditCard, User } from 'lucide-react';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, signOut, loading: authLoading } = useAuth();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [campaignPreset, setCampaignPreset] = useState<DynamicOpportunity | null>(null);

  const { profile } = useBusiness(session.activeBusinessId);
  const { usage } = useUsage(session.activeBusinessId);

  const isAppView = location.pathname.startsWith('/app');
  const isFreeToolView = location.pathname === '/free-tool';
  const isAuthView =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/setup' ||
    location.pathname === '/onboarding' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password';

  const handleLaunchOpportunity = (opp: DynamicOpportunity) => {
    setCampaignPreset(opp);
    navigate('/app/create');
  };

  const handleOpenAuthWithClaim = (token: string) => {
    setClaimToken(token);
    navigate('/login');
  };

  // Strictly block access to /app/* without authenticated session and active business
  if (isAppView) {
    if (authLoading) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-page)' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)' }}>
            Loading store workspace...
          </div>
        </div>
      );
    }

    if (!session.isAuthenticated || !session.userId) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (!session.activeBusinessId) {
      return <Navigate to="/setup" replace />;
    }
  }

  return (
    <div className="app-container">
      {!isAuthView && (
        <Navigation
          session={session}
          usage={usage}
          onOpenUpgrade={() => setUpgradeModalOpen(true)}
          onSignOut={async () => {
            await signOut();
            navigate('/');
          }}
        />
      )}

      {!isAppView ? (
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route
              path="/free-tool"
              element={<FreeToolPage onOpenAuthWithClaim={handleOpenAuthWithClaim} />}
            />
            <Route path="/pricing" element={<PricingPage onOpenUpgrade={() => setUpgradeModalOpen(true)} />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route
              path="/login"
              element={
                <LoginPage
                  claimToken={claimToken}
                  onSuccess={() => setClaimToken(null)}
                />
              }
            />
            <Route
              path="/signup"
              element={
                <SignupPage
                  claimToken={claimToken}
                  onSuccess={() => setClaimToken(null)}
                />
              }
            />
            <Route
              path="/setup"
              element={
                <OnboardingPage
                  claimToken={claimToken}
                  onSuccess={() => setClaimToken(null)}
                />
              }
            />
            <Route
              path="/onboarding"
              element={<Navigate to="/setup" replace />}
            />
            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage />}
            />
            <Route
              path="/reset-password"
              element={<ResetPasswordPage />}
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/not-found" element={<NotFoundPage />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      ) : (
        <div className="workspace-layout">
          {/* Workspace Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-nav">
              <button
                className={`sidebar-link ${location.pathname === '/app/today' || location.pathname === '/app/dashboard' ? 'active' : ''}`}
                onClick={() => navigate('/app/today')}
              >
                <LayoutDashboard size={16} /> Today
              </button>

              <button
                className={`sidebar-link ${location.pathname === '/app/create' ? 'active' : ''}`}
                onClick={() => {
                  setCampaignPreset(null);
                  navigate('/app/create');
                }}
              >
                <Sparkles size={16} /> Create
              </button>

              <button
                className={`sidebar-link ${location.pathname.startsWith('/app/campaigns') ? 'active' : ''}`}
                onClick={() => navigate('/app/campaigns')}
              >
                <FolderArchive size={16} /> Campaigns
              </button>

              <button
                className={`sidebar-link ${location.pathname === '/app/business' ? 'active' : ''}`}
                onClick={() => navigate('/app/business')}
              >
                <Store size={16} /> Business
              </button>
            </div>

            <div>
              <div style={{ padding: '0 8px 8px', fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Settings
              </div>

              <button
                className={`sidebar-link ${location.pathname === '/app/settings/billing' ? 'active' : ''}`}
                style={{ fontSize: '13px', marginBottom: '4px' }}
                onClick={() => navigate('/app/settings/billing')}
              >
                <CreditCard size={14} /> Billing & Usage
              </button>

              <button
                className={`sidebar-link ${location.pathname === '/app/settings/account' ? 'active' : ''}`}
                style={{ fontSize: '13px', marginBottom: '16px' }}
                onClick={() => navigate('/app/settings/account')}
              >
                <User size={14} /> Account Security
              </button>

              <div className="sidebar-tenant-card">
                <div className="sidebar-tenant-name">{profile?.name || 'Your Store'}</div>
                <div className="sidebar-tenant-sub">
                  {profile?.neighborhood ? `${profile.neighborhood}` : 'Active Business'}
                </div>
              </div>
            </div>
          </aside>

          {/* Main View Area */}
          <main className="main-content">
            <Routes>
              <Route
                path="/app/today"
                element={
                  <DashboardPage
                    businessId={session.activeBusinessId}
                    onLaunchPreset={handleLaunchOpportunity}
                    onOpenUpgrade={() => setUpgradeModalOpen(true)}
                  />
                }
              />
              <Route
                path="/app/dashboard"
                element={<Navigate to="/app/today" replace />}
              />
              <Route
                path="/app/create"
                element={
                  <CreateCampaignPage
                    businessId={session.activeBusinessId}
                    initialPreset={campaignPreset}
                    onOpenUpgrade={() => setUpgradeModalOpen(true)}
                  />
                }
              />
              <Route
                path="/app/campaigns"
                element={<CampaignVaultPage businessId={session.activeBusinessId} />}
              />
              <Route
                path="/app/campaigns/:id"
                element={<CampaignDetailPage businessId={session.activeBusinessId} />}
              />
              <Route
                path="/app/business"
                element={<BusinessPage businessId={session.activeBusinessId} />}
              />
              <Route
                path="/app/settings"
                element={<Navigate to="/app/settings/billing" replace />}
              />
              <Route
                path="/app/settings/billing"
                element={
                  <BillingSettingsPage
                    businessId={session.activeBusinessId}
                    session={session}
                    onOpenUpgrade={() => setUpgradeModalOpen(true)}
                  />
                }
              />
              <Route
                path="/app/settings/account"
                element={<AccountSettingsPage session={session} />}
              />
              <Route path="*" element={<Navigate to="/app/today" replace />} />
            </Routes>
          </main>
        </div>
      )}

      {!isAuthView && !isFreeToolView && <Footer />}

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onSuccess={() => {
          setUpgradeModalOpen(false);
        }}
      />
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <ThemeProvider>
      <DialogProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </DialogProvider>
    </ThemeProvider>
  );
}
