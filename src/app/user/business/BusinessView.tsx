'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Plus, ShieldCheck } from 'lucide-react';
import { WorkspaceTodayViewModel } from '../../../lib/server/workspace/getWorkspaceTodayData';
import { StoreRail, StoreTabId } from './components/StoreRail';
import { StoreProfileHeader } from './components/StoreProfileHeader';
import { StoreIdentityPanel } from './panels/StoreIdentityPanel';
import { StoreRhythmPanel } from './panels/StoreRhythmPanel';
import { StoreOfferPanel } from './panels/StoreOfferPanel';
import { StoreContactPanel } from './panels/StoreContactPanel';
import { computeStoreProgress } from '../../../lib/domain/business/storeProgress';

export function BusinessView({ initialData }: { initialData: WorkspaceTodayViewModel | null }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StoreTabId>('identity');

  // Zero-store state: Do not render empty forms if user has no store
  if (!initialData || !initialData.business) {
    return (
      <div className="account-uninitialized-box">
        <div className="account-uninitialized-card">
          <div className="account-uninitialized-icon">
            <Store size={26} />
          </div>
          <h2>No Storefront Configured</h2>
          <p>
            You have not set up a store profile yet. Complete the quick onboarding setup to configure your store identity, neighborhood, and operating rhythm.
          </p>
          <button
            onClick={() => router.push('/setup')}
            className="btn-primary"
          >
            <Plus size={16} />
            <span>Set Up Your Storefront</span>
          </button>
        </div>
      </div>
    );
  }

  const { business, profile } = initialData;
  const currentProfile = profile || {
    id: business.id,
    business_id: business.id,
    name: business.name,
    category: business.category,
    neighborhood: '',
    city: '',
    landmarks: '',
    target_customer: '',
    style_voice: '',
    signature_items: '',
    primary_goal: '',
    peak_hours: '',
    slow_hours: '',
    default_offer: '',
    avg_ticket_inr: null,
    target_monthly_customers: null,
    phone_whatsapp: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const tabHeaders: Record<StoreTabId, { eyebrow: string; title: string; subtitle: string }> = {
    identity: {
      eyebrow: 'STORE IDENTITY',
      title: business.name || 'Storefront Identity',
      subtitle: `${business.category || 'Retail Store'}${currentProfile.city ? ` • ${currentProfile.city}` : ''}`,
    },
    rhythm: {
      eyebrow: 'OPERATING RHYTHM',
      title: 'Operating Rhythm & Hours',
      subtitle: 'Peak rush windows, slow hours, and demographic targeting',
    },
    offer: {
      eyebrow: 'ECONOMICS & OFFERINGS',
      title: 'Offer & Pricing Economics',
      subtitle: 'Signature menu items, default promotional offers, and average ticket size',
    },
    contact: {
      eyebrow: 'COMMUNICATION',
      title: 'Store Contact & Channels',
      subtitle: 'Direct customer contact and WhatsApp order routing numbers',
    },
  };

  const currentHeader = tabHeaders[activeTab];
  const progress = computeStoreProgress(currentProfile);

  return (
    <div className="account-workspace-container">
      <div className="account-workspace-grid">
        {/* Left Navigation Rail */}
        <StoreRail
          business={business}
          profile={currentProfile}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Right Stage (Active Control Surface) */}
        <main className="account-stage-workspace" role="main" aria-label="Store Preferences Stage">
          {/* Contextual Tab Header */}
          <StoreProfileHeader
            eyebrow={currentHeader.eyebrow}
            title={currentHeader.title}
            subtitle={currentHeader.subtitle}
            progressPercentage={progress.percentage}
            isComplete={progress.isComplete}
          />

          {/* Dynamic Content Surface */}
          <div className="account-stage-content" key={activeTab}>
            {activeTab === 'identity' && (
              <StoreIdentityPanel
                businessId={business.id}
                profile={currentProfile}
              />
            )}

            {activeTab === 'rhythm' && (
              <StoreRhythmPanel
                businessId={business.id}
                profile={currentProfile}
              />
            )}

            {activeTab === 'offer' && (
              <StoreOfferPanel
                businessId={business.id}
                profile={currentProfile}
              />
            )}

            {activeTab === 'contact' && (
              <StoreContactPanel
                businessId={business.id}
                profile={currentProfile}
              />
            )}
          </div>

          {/* Fixed Security & Brand Anchor Footer */}
          <div className="account-workspace-footer">
            <div className="account-workspace-security-notice">
              <ShieldCheck size={14} className="account-footer-shield-icon" />
              <span>Store parameters shape automated campaign intelligence and copy generation</span>
            </div>

            <div className="account-workspace-copyright">
              STREETCRAFT &bull; 2026 &nbsp; All rights reserved.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
