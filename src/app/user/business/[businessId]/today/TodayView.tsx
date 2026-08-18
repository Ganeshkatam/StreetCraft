'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TodayViewModel } from '../../../../../lib/domain/today/todayTypes';
import { TodayHeader } from './components/TodayHeader';
import { OpportunitiesPanel } from './components/OpportunitiesPanel';
import { CampaignVaultSnippet } from './components/CampaignVaultSnippet';
import { StorefrontContextPanel } from './components/StorefrontContextPanel';
import { StoreQuotaPanel } from './components/StoreQuotaPanel';
import { UpcomingFestivalsPanel } from './components/UpcomingFestivalsPanel';
import { UpgradeModal } from '../../../../../components/UpgradeModal';

interface TodayViewProps {
  data: TodayViewModel;
}

export function TodayView({ data }: TodayViewProps) {
  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { storefront, briefing, opportunities, recentVault, quota, festivals } = data;

  return (
    <div style={{ width: '100%', padding: '24px var(--space-gutter) 80px' }}>
      <TodayHeader
        businessId={storefront.id}
        briefing={briefing}
        vaultCount={recentVault.length}
      />

      {/* 2-Column Dashboard Grid */}
      <div className="workspace-grid-2col">
        {/* Left Column: Action Opportunities & Recent Vault */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <OpportunitiesPanel
            businessId={storefront.id}
            opportunities={opportunities}
          />

          <CampaignVaultSnippet
            businessId={storefront.id}
            vault={recentVault}
          />
        </div>

        {/* Right Column: Store Context, Quota Meter & Festival Radar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <StorefrontContextPanel storefront={storefront} />

          <StoreQuotaPanel
            businessId={storefront.id}
            quota={quota}
            onUpgradeClick={() => setShowUpgradeModal(true)}
          />

          <UpcomingFestivalsPanel
            businessId={storefront.id}
            festivals={festivals}
          />
        </div>
      </div>

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          currentPlanId={quota?.planName || 'FREE'}
          onClose={() => setShowUpgradeModal(false)}
          onPlanUpdated={() => router.refresh()}
        />
      )}
    </div>
  );
}
