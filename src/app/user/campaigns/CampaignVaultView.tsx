'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CampaignVaultViewModel } from '../../../lib/server/campaigns/getCampaignVault';
import { CampaignStatusDropdown } from './CampaignStatusDropdown';
import { Plus } from 'lucide-react';

interface CampaignVaultViewProps {
  vaultData: CampaignVaultViewModel;
}

export function CampaignVaultView({ vaultData }: CampaignVaultViewProps) {
  const router = useRouter();
  const { business, campaigns, nextCursor, viewMode } = vaultData;
  const [filter, setFilter] = useState<'ALL' | 'READY' | 'PUBLISHED' | 'COMPLETED'>('ALL');

  const filteredCampaigns = campaigns.filter((item) => {
    if (viewMode === 'archived') return true;
    if (filter === 'ALL') return true;
    return item.status.toUpperCase() === filter;
  });

  const handleSwitchView = (newView: 'active' | 'archived') => {
    const url = new URL(window.location.href);
    if (newView === 'archived') {
      url.searchParams.set('view', 'archived');
    } else {
      url.searchParams.delete('view');
    }
    url.searchParams.delete('cursorCreatedAt');
    url.searchParams.delete('cursorId');
    router.push(url.pathname + url.search);
  };

  const handleNextPage = () => {
    if (!nextCursor) return;
    const url = new URL(window.location.href);
    url.searchParams.set('cursorCreatedAt', nextCursor.createdAt);
    url.searchParams.set('cursorId', nextCursor.id);
    router.push(url.pathname + url.search);
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="section-eyebrow">PERSISTENT CAMPAIGN VAULT</span>
          <h1 className="section-title">Campaign Vault</h1>
          <p className="section-subtitle">
            All generated proofs, platform outputs, and recorded walk-in results for {business.name}.
          </p>
        </div>
        <button className="btn-primary" onClick={() => router.push('/user/create')}>
          <Plus size={15} /> New Campaign
        </button>
      </div>

      {/* Top View Mode: Active vs Archived */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--color-surface-raised)', padding: '3px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
          <button
            style={{
              fontSize: '13px',
              fontWeight: viewMode === 'active' ? 600 : 400,
              color: viewMode === 'active' ? 'var(--color-ink)' : 'var(--color-ink-muted)',
              background: viewMode === 'active' ? 'var(--color-surface)' : 'transparent',
              border: 'none',
              padding: '6px 16px',
              borderRadius: 'calc(var(--radius-xs) - 2px)',
              boxShadow: viewMode === 'active' ? 'var(--shadow-subtle)' : 'none',
              cursor: 'pointer',
              transition: 'var(--motion-fast)',
            }}
            onClick={() => handleSwitchView('active')}
          >
            Active Campaigns
          </button>
          <button
            style={{
              fontSize: '13px',
              fontWeight: viewMode === 'archived' ? 600 : 400,
              color: viewMode === 'archived' ? 'var(--color-ink)' : 'var(--color-ink-muted)',
              background: viewMode === 'archived' ? 'var(--color-surface)' : 'transparent',
              border: 'none',
              padding: '6px 16px',
              borderRadius: 'calc(var(--radius-xs) - 2px)',
              boxShadow: viewMode === 'archived' ? 'var(--shadow-subtle)' : 'none',
              cursor: 'pointer',
              transition: 'var(--motion-fast)',
            }}
            onClick={() => handleSwitchView('archived')}
          >
            Archived
          </button>
        </div>

        {/* Sub Filter for Active view */}
        {viewMode === 'active' && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['ALL', 'READY', 'PUBLISHED', 'COMPLETED'] as const).map((tab) => (
              <button
                key={tab}
                style={{
                  fontSize: '12.5px',
                  fontWeight: filter === tab ? 600 : 400,
                  color: filter === tab ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                  background: filter === tab ? 'var(--color-surface-raised)' : 'transparent',
                  border: filter === tab ? '1px solid var(--color-border)' : '1px solid transparent',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer',
                }}
                onClick={() => setFilter(tab)}
              >
                {tab === 'ALL' ? 'All Active' : tab === 'READY' ? 'Ready' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '8px' }}>
            {viewMode === 'archived' ? 'No Archived Campaigns' : 'No Campaigns Found'}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', maxWidth: '380px', margin: '0 auto 20px' }}>
            {viewMode === 'archived'
              ? 'You have not archived any campaigns yet. Archived promotions will be preserved here.'
              : filter === 'ALL'
              ? 'You have no active campaigns. Create a new campaign to get started.'
              : `No active campaigns with status ${filter.toLowerCase()} found.`}
          </p>
          {viewMode === 'active' && (
            <button className="btn-primary" onClick={() => router.push('/user/create')}>
              Create Campaign
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', background: 'var(--color-accent-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-xs)', fontWeight: 600 }}>
                    {campaign.type.replace(/_/g, ' ')}
                  </span>
                  <h3
                    style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginTop: '6px', cursor: 'pointer' }}
                    onClick={() => router.push(`/user/campaigns/${campaign.id}`)}
                  >
                    {campaign.offer.title || campaign.offer.description}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                    Timing: {campaign.schedule.timingLabel} &bull; Created: {new Date(campaign.createdAt).toLocaleDateString('en-IN')}
                  </p>
                  <p style={{ fontSize: '12.5px', color: campaign.isComplete ? 'var(--color-primary)' : 'var(--color-danger)', marginTop: '4px' }}>
                    {campaign.presentChannels.length} / 4 output channels generated
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    className="btn-primary"
                    style={{ fontSize: '12px', padding: '5px 12px' }}
                    onClick={() => router.push(`/user/campaigns/${campaign.id}`)}
                  >
                    Open
                  </button>
                  <CampaignStatusDropdown campaignId={campaign.id} currentStatus={campaign.status} />
                </div>
              </div>

              {/* Operator Note (Read-Only) */}
              <div style={{ background: 'var(--color-surface-raised)', padding: '12px 16px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', fontSize: '10.5px' }}>WALK-IN NOTE</small>
                  <div style={{ fontSize: '13px', color: campaign.performanceNotes ? 'var(--color-ink)' : 'var(--color-ink-muted)', marginTop: '2px' }}>
                    {campaign.performanceNotes || 'No walk-in notes recorded yet.'}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {nextCursor && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button className="btn-secondary" onClick={handleNextPage}>
                Load Older Campaigns
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
