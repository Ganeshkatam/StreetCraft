import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

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

function App() {
  const { session, signOut } = useAuth();
  const [route, setRoute] = useState<string>(location.hash.slice(1) || 'home');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [campaignPreset, setCampaignPreset] = useState<DynamicOpportunity | null>(null);

  const { profile } = useBusiness(session.activeBusinessId);
  const { usage } = useUsage(session.activeBusinessId);

  useEffect(() => {
    const handleHashChange = () => {
      const current = location.hash.slice(1) || 'home';
      setRoute(current);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (next: string) => {
    location.hash = next;
    setRoute(next);
    window.scrollTo(0, 0);
  };

  const handleLaunchOpportunity = (opp: DynamicOpportunity) => {
    setCampaignPreset(opp);
    navigate('app/create');
  };

  const handleOpenAuthWithClaim = (token: string) => {
    setClaimToken(token);
    navigate('login');
  };

  const isAppView = route.startsWith('app');

  useEffect(() => {
    if (isAppView && !session.isAuthenticated) {
      navigate('login');
    }
  }, [isAppView, session.isAuthenticated]);

  return (
    <div className="app-container">
      <Navigation
        currentRoute={route}
        navigate={navigate}
        session={session}
        usage={usage}
        onOpenAuth={() => navigate('login')}
        onOpenUpgrade={() => setUpgradeModalOpen(true)}
        onSignOut={async () => {
          await signOut();
          navigate('home');
        }}
      />

      {!isAppView ? (
        <main>
          {route === 'home' && (
            <LandingPage
              navigate={navigate}
              onOpenAuth={() => navigate('login')}
            />
          )}
          {route === 'free-tool' && (
            <FreeToolPage
              navigate={navigate}
              onOpenAuthWithClaim={handleOpenAuthWithClaim}
            />
          )}
          {route === 'pricing' && (
            <PricingPage
              navigate={navigate}
              onOpenUpgrade={() => setUpgradeModalOpen(true)}
            />
          )}
          {route === 'login' && (
            <LoginPage
              navigate={navigate}
              claimToken={claimToken}
              onSuccess={() => setClaimToken(null)}
            />
          )}
        </main>
      ) : (
        <div className="workspace-layout">
          {/* Restrained Quiet Workspace Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-nav">
              <button
                className={`sidebar-link ${route === 'app/dashboard' ? 'active' : ''}`}
                onClick={() => navigate('app/dashboard')}
              >
                Today
              </button>

              <button
                className={`sidebar-link ${route === 'app/create' ? 'active' : ''}`}
                onClick={() => {
                  setCampaignPreset(null);
                  navigate('app/create');
                }}
              >
                Create
              </button>

              <button
                className={`sidebar-link ${route === 'app/campaigns' ? 'active' : ''}`}
                onClick={() => navigate('app/campaigns')}
              >
                Campaigns
              </button>

              <button
                className={`sidebar-link ${route === 'app/business' ? 'active' : ''}`}
                onClick={() => navigate('app/business')}
              >
                Store Memory
              </button>
            </div>

            <div>
              <button
                className={`sidebar-link ${route === 'app/settings' ? 'active' : ''}`}
                style={{ fontSize: '12.5px', color: 'var(--color-muted)', marginBottom: '16px' }}
                onClick={() => navigate('app/settings')}
              >
                Settings & Ledger
              </button>

              <div className="sidebar-tenant-card">
                <div className="sidebar-tenant-name">{profile?.name || 'The Roasted Bean'}</div>
                <div className="sidebar-tenant-sub">
                  {profile?.neighborhood || 'Indiranagar'}
                </div>
              </div>
            </div>
          </aside>

          {/* Main View Area */}
          <main className="main-content">
            {route === 'app/dashboard' && (
              <DashboardPage
                businessId={session.activeBusinessId}
                navigate={navigate}
                onLaunchPreset={handleLaunchOpportunity}
                onOpenUpgrade={() => setUpgradeModalOpen(true)}
              />
            )}

            {route === 'app/create' && (
              <CreateCampaignPage
                businessId={session.activeBusinessId}
                initialPreset={campaignPreset}
                navigate={navigate}
                onOpenUpgrade={() => setUpgradeModalOpen(true)}
              />
            )}

            {route === 'app/campaigns' && (
              <CampaignVaultPage
                businessId={session.activeBusinessId}
                navigate={navigate}
              />
            )}

            {route === 'app/business' && (
              <BusinessPage
                businessId={session.activeBusinessId}
              />
            )}

            {route === 'app/settings' && (
              <SettingsPage
                businessId={session.activeBusinessId}
                session={session}
                onOpenUpgrade={() => setUpgradeModalOpen(true)}
              />
            )}
          </main>
        </div>
      )}

      <Footer navigate={navigate} />

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
  createRoot(rootElement).render(<App />);
}
