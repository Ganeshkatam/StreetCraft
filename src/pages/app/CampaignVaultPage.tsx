import React, { useState } from 'react';
import { useCampaign } from '../../hooks/useCampaign';
import { CampaignStatus } from '../../types/campaign';
import { CampaignStatusBadge } from '../../components/CampaignStatusBadge';
import { ChannelCard } from '../../components/ChannelCard';
import { ChevronDown, ChevronUp, Edit3 } from 'lucide-react';

interface CampaignVaultPageProps {
  businessId: string;
  navigate: (route: string) => void;
}

export const CampaignVaultPage: React.FC<CampaignVaultPageProps> = ({ businessId, navigate }) => {
  const { campaigns, loading, updateStatus } = useCampaign(businessId);
  const [filter, setFilter] = useState<'ALL' | 'PUBLISHED' | 'COMPLETED' | 'ARCHIVED'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  const filteredCampaigns = campaigns.filter((item) => {
    if (filter === 'ALL') return true;
    return item.campaign.status.toUpperCase() === filter;
  });

  const handleSaveNotes = async (campaignId: string, currentStatus: CampaignStatus) => {
    await updateStatus(campaignId, currentStatus, tempNotes);
    setEditingNotesId(null);
  };

  return (
    <div style={{ maxWidth: '880px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <span className="section-eyebrow">STORE CAMPAIGN ARCHIVE</span>
          <h1 className="section-title">Campaign Archive</h1>
          <p className="section-subtitle">
            All generated proofs, multi-channel outputs, and store walk-in notes.
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('app/create')}>
          + New campaign
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', borderBottom: '1px solid var(--border-editorial)', paddingBottom: '12px' }}>
        {(['ALL', 'PUBLISHED', 'COMPLETED', 'ARCHIVED'] as const).map((tab) => (
          <button
            key={tab}
            style={{
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              color: filter === tab ? 'var(--color-ink)' : 'var(--color-muted)',
              fontWeight: filter === tab ? 600 : 400,
              borderBottom: filter === tab ? '2px solid var(--color-primary)' : 'none',
              paddingBottom: '4px',
            }}
            onClick={() => setFilter(tab)}
          >
            {tab === 'ALL' ? 'All Promotions' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-muted)' }}>
          Loading campaign archive...
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '8px' }}>
            No Campaigns Recorded
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', maxWidth: '380px', margin: '0 auto 20px' }}>
            {filter === 'ALL'
              ? 'You have not created any campaign packs yet. Create your first promotion to build your archive.'
              : `No campaigns with status ${filter.toLowerCase()} found.`}
          </p>
          <button className="btn-primary" onClick={() => navigate('app/create')}>
            Create first campaign &rarr;
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredCampaigns.map((item) => {
            const isExpanded = expandedId === item.campaign.id;
            const isEditingNotes = editingNotesId === item.campaign.id;

            return (
              <div key={item.campaign.id} className="vault-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span className="vault-type">{item.campaign.type.replace(/_/g, ' ')}</span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginTop: '2px' }}>
                      {item.campaign.offer.title || item.campaign.offer.description}
                    </h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--color-muted)', marginTop: '2px' }}>
                      Timing: {item.campaign.schedule.timingLabel} &bull; Created: {new Date(item.campaign.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

                    <button
                      className="btn-ghost"
                      style={{ fontSize: '12px' }}
                      onClick={() => setExpandedId(isExpanded ? null : item.campaign.id)}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Hide Proofs' : 'View Proofs'}
                    </button>
                  </div>
                </div>

                {/* Operator Note */}
                <div style={{ background: 'var(--bg-elevated)', padding: '12px 16px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-editorial)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, marginRight: '16px' }}>
                    <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', fontSize: '10.5px' }}>WALK-IN RESULT NOTE</small>
                    {isEditingNotes ? (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '5px 10px', fontSize: '13px' }}
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="e.g. Added ~14 table covers on Tuesday afternoon"
                        />
                        <button className="btn-primary" style={{ fontSize: '12px', padding: '5px 10px' }} onClick={() => handleSaveNotes(item.campaign.id, item.campaign.status)}>
                          Save
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: item.campaign.performanceNotes ? 'var(--color-ink)' : 'var(--color-subtle)', marginTop: '2px' }}>
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

                {/* Expanded 4 Channels */}
                {isExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-editorial)' }}>
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
};
