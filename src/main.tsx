import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './styles.css';

import { ThemeProvider } from './theme/ThemeProvider';
import { useAuth } from './hooks/useAuth';
import { useBusiness } from './hooks/useBusiness';
import { useUsage } from './hooks/useUsage';
import { DynamicOpportunity } from './engine/briefing/opportunityEngine';

import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { UpgradeModal } from './components/UpgradeModal';

import { LandingPage } from './pages/LandingPage';
import { FreeToolPage } from './pages/FreeToolPage';
import { PricingPage } from './pages/PricingPage';
import { LoginPage } from './pages/LoginPage';

import { DashboardPage } from './pages/app/DashboardPage';
import { BusinessPage } from './pages/app/BusinessPage';
import { CreateCampaignPage } from './pages/app/CreateCampaignPage';
import { CampaignVaultPage } from './pages/app/CampaignVaultPage';
import { SettingsPage } from './pages/app/SettingsPage';
import { LayoutDashboard, Sparkles, FolderArchive, Store, Settings } from 'lucide-react';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, signOut } = useAuth();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [campaignPreset, setCampaignPreset] = useState<DynamicOpportunity | null>(null);

  const { profile } = useBusiness(session.activeBusinessId);
  const { usage } = useUsage(session.activeBusinessId);

  const isAppView = location.pathname.startsWith('/app');

  const handleLaunchOpportunity = (opp: DynamicOpportunity) => {
    setCampaignPreset(opp);
    navigate('/app/create');
  };

  const handleOpenAuthWithClaim = (token: string) => {
    setClaimToken(token);
    navigate('/login');
  };

  return (
    <div className="app-container">
      <Navigation
        session={session}
        usage={usage}
        onOpenUpgrade={() => setUpgradeModalOpen(true)}
        onSignOut={async () => {
          await signOut();
          navigate('/');
        }}
      />

      {!isAppView ? (
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/free-tool"
              element={<FreeToolPage onOpenAuthWithClaim={handleOpenAuthWithClaim} />}
            />
            <Route
              path="/pricing"
              element={<PricingPage onOpenUpgrade={() => setUpgradeModalOpen(true)} />}
            />
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
                <LoginPage
                  claimToken={claimToken}
                  onSuccess={() => setClaimToken(null)}
                />
              }
            />
            <Route
              path="/forgot-password"
              element={<LoginPage />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      ) : (
        <div className="workspace-layout">
          {/* Modern Workspace Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-nav">
              <button
                className={`sidebar-link ${location.pathname === '/app/dashboard' ? 'active' : ''}`}
                onClick={() => navigate('/app/dashboard')}
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
                className={`sidebar-link ${location.pathname === '/app/campaigns' ? 'active' : ''}`}
                onClick={() => navigate('/app/campaigns')}
              >
                <FolderArchive size={16} /> Campaigns
              </button>

              <button
                className={`sidebar-link ${location.pathname === '/app/business' ? 'active' : ''}`}
                onClick={() => navigate('/app/business')}
              >
                <Store size={16} /> Store Memory
              </button>
            </div>

            <div>
              <button
                className={`sidebar-link ${location.pathname === '/app/settings' ? 'active' : ''}`}
                style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginBottom: '16px' }}
                onClick={() => navigate('/app/settings')}
              >
                <Settings size={15} /> Settings & Quota
              </button>

              <div className="sidebar-tenant-card">
                <div className="sidebar-tenant-name">{profile?.name || 'The Roasted Bean'}</div>
                <div className="sidebar-tenant-sub">
                  {profile?.neighborhood ? `${profile.neighborhood}` : 'ACTIVE STORE'}
                </div>
              </div>
            </div>
          </aside>

          {/* Main View Area */}
          <main className="main-content">
            <Routes>
              <Route
                path="/app/dashboard"
                element={
                  <DashboardPage
                    businessId={session.activeBusinessId}
                    onLaunchPreset={handleLaunchOpportunity}
                    onOpenUpgrade={() => setUpgradeModalOpen(true)}
                  />
                }
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
                path="/app/business"
                element={<BusinessPage businessId={session.activeBusinessId} />}
              />
              <Route
                path="/app/settings"
                element={
                  <SettingsPage
                    businessId={session.activeBusinessId}
                    session={session}
                    onOpenUpgrade={() => setUpgradeModalOpen(true)}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      )}

      <Footer />

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
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ThemeProvider>
  );
}
