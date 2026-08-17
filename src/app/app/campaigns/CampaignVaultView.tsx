'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useCampaign } from '../../../hooks/useCampaign';
import { CampaignStatus } from '../../../types/campaign';
import { CampaignStatusBadge } from '../../../components/CampaignStatusBadge';
import { ChannelCard } from '../../../components/ChannelCard';
import { Edit3, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function CampaignVaultView() {
  const router = useRouter();
  const { session } = useAuth();
  const businessId = session.activeBusinessId || '';

  const { campaigns, loading, updateStatus } = useCampaign(businessId);
  const [filter, setFilter] = useState<'ALL' | 'READY' | 'PUBLISHED' | 'COMPLETED' | 'ARCHIVED'>('ALL');
  const [expandedId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  const filteredCampaigns = campaigns.filter((item) => {
    if (filter === 'ALL') return true;
    return item.campaign.status.toUpperCase() === filter;
  });

  const handleSaveNotes = async (campaignId: string, currentStatus: CampaignStatus) => {
    try {
      await updateStatus(campaignId, currentStatus, tempNotes);
      toast.success('Notes saved successfully.');
      setEditingNotesId(null);
    } catch {
      toast.error('Failed to save notes.');
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="section-eyebrow">PERSISTENT CAMPAIGN VAULT</span>
          <h1 className="section-title">Campaign Vault</h1>
          <p className="section-subtitle">
            All generated proofs, platform outputs, and recorded walk-in results.
          </p>
        </div>
        <button className="btn-primary" onClick={() => router.push('/app/create')}>
          <Plus size={15} /> New Campaign
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {(['ALL', 'READY', 'PUBLISHED', 'COMPLETED', 'ARCHIVED'] as const).map((tab) => (
          <button
            key={tab}
            style={{
              fontSize: '13px',
              fontWeight: filter === tab ? 600 : 400,
              color: filter === tab ? 'var(--color-ink)' : 'var(--color-ink-muted)',
              background: filter === tab ? 'var(--color-surface-raised)' : 'transparent',
              border: filter === tab ? '1px solid var(--color-border)' : '1px solid transparent',
              padding: '6px 14px',
              borderRadius: 'var(--radius-xs)',
              boxShadow: filter === tab ? 'var(--shadow-subtle)' : 'none',
              transition: 'var(--motion-fast)',
              cursor: 'pointer',
            }}
            onClick={() => setFilter(tab)}
          >
            {tab === 'ALL' ? 'All Campaigns' : tab === 'READY' ? 'Ready Proofs' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-ink-muted)' }}>
          Loading campaign vault...
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '8px' }}>
            No Campaigns Found
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', maxWidth: '380px', margin: '0 auto 20px' }}>
            {filter === 'ALL'
              ? 'You have not created any campaigns yet. Create your first promotion to build your vault.'
              : `No campaigns with status ${filter.toLowerCase()} found.`}
          </p>
          <button className="btn-primary" onClick={() => router.push('/app/create')}>
            Create First Campaign
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredCampaigns.map((item) => {
            const isExpanded = expandedId === item.campaign.id;
            const isEditingNotes = editingNotesId === item.campaign.id;

            return (
              <div key={item.campaign.id} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', background: 'var(--color-accent-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-xs)', fontWeight: 600 }}>
                      {item.campaign.type.replace(/_/g, ' ')}
                    </span>
                    <h3
                      style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginTop: '6px', cursor: 'pointer' }}
                      onClick={() => router.push(`/app/campaigns/${item.campaign.id}`)}
                    >
                      {item.campaign.offer.title || item.campaign.offer.description}
                    </h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
                      Timing: {item.campaign.schedule.timingLabel} &bull; Created: {new Date(item.campaign.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      className="btn-primary"
                      style={{ fontSize: '12px', padding: '5px 12px' }}
                      onClick={() => router.push(`/app/campaigns/${item.campaign.id}`)}
                    >
                      Open
                    </button>

                    <CampaignStatusBadge status={item.campaign.status} />

                    <select
                      className="form-select"
                      style={{ fontSize: '12px', padding: '4px 8px', width: 'auto' }}
                      value={item.campaign.status}
                      onChange={(e) => updateStatus(item.campaign.id, e.target.value as CampaignStatus)}
                    >
                      <option value="ready">Ready</option>
                      <option value="published">Published</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Operator Note */}
                <div style={{ background: 'var(--color-surface-raised)', padding: '12px 16px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', marginBottom: isExpanded ? '16px' : 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', fontSize: '10.5px' }}>WALK-IN NOTE</small>
                    {isEditingNotes ? (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '5px 10px', fontSize: '13px' }}
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="e.g. Generated 14 extra table covers on Tuesday"
                        />
                        <button className="btn-primary" style={{ fontSize: '12px', padding: '5px 10px' }} onClick={() => handleSaveNotes(item.campaign.id, item.campaign.status)}>
                          Save
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: item.campaign.performanceNotes ? 'var(--color-ink)' : 'var(--color-ink-muted)', marginTop: '2px' }}>
                        {item.campaign.performanceNotes || 'No walk-in notes recorded yet.'}
                      </div>
                    )}
                  </div>

                  {!isEditingNotes && (
                    <button
                      className="btn-ghost"
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                      onClick={() => {
                        setEditingNotesId(item.campaign.id);
                        setTempNotes(item.campaign.performanceNotes || '');
                      }}
                    >
                      <Edit3 size={12} /> {item.campaign.performanceNotes ? 'Edit' : 'Add Note'}
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="proofs-grid-2x2" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                    <ChannelCard
                      channel="GOOGLE_BUSINESS"
                      status="ready"
                      content={item.outputs.googleBusiness as unknown as Record<string, unknown>}
                    />
                    <ChannelCard
                      channel="INSTAGRAM"
                      status="ready"
                      content={item.outputs.instagram as unknown as Record<string, unknown>}
                    />
                    <ChannelCard
                      channel="WHATSAPP"
                      status="ready"
                      content={item.outputs.whatsapp as unknown as Record<string, unknown>}
                    />
                    {item.outputs.poster && (
                      <ChannelCard
                        channel="IN_STORE_POSTER"
                        status="ready"
                        content={item.outputs.poster as unknown as Record<string, unknown>}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
