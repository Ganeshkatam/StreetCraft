import React, { useState } from 'react';
import { useCampaign } from '../../hooks/useCampaign';
import { CampaignStatus, FullCampaignPack } from '../../types/campaign';
import { CampaignStatusBadge } from '../../components/CampaignStatusBadge';
import { ChannelCard } from '../../components/ChannelCard';
import { FolderArchive, Sparkles, MessageSquare, ChevronDown, ChevronUp, Trash2, Edit3 } from 'lucide-react';

interface CampaignVaultPageProps {
  businessId: string;
  navigate: (route: string) => void;
}

export const CampaignVaultPage: React.FC<CampaignVaultPageProps> = ({ businessId, navigate }) => {
  const { campaigns, loading, updateStatus, deleteCampaign } = useCampaign(businessId);
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
    <div>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="section-eyebrow">POSTGRES DATABASE &bull; REALTIME VAULT</span>
          <h1 className="section-title">Campaign Vault & History</h1>
          <p className="section-subtitle">
            All generated campaigns, multi-channel outputs, and qualitative operator performance notes.
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('app/create')}>
          <Sparkles size={14} /> New Campaign
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['ALL', 'PUBLISHED', 'COMPLETED', 'ARCHIVED'] as const).map((tab) => (
          <button
            key={tab}
            className={`filter-btn ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab === 'ALL' ? 'All Campaigns' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading campaign vault from PostgreSQL...
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FolderArchive size={36} color="var(--accent-emerald)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
            No Campaigns Found
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 20px' }}>
            {filter === 'ALL'
              ? 'You have not created any campaign packs yet. Use the Create Campaign wizard to launch your first multi-channel pack.'
              : `No campaigns with status ${filter.toLowerCase()} found in your vault.`}
          </p>
          <button className="btn-primary" onClick={() => navigate('app/create')}>
            <Sparkles size={14} /> Create First Campaign
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
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {item.campaign.offer.title || item.campaign.offer.description}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
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
                      style={{ fontSize: '12px', padding: '6px 10px' }}
                      onClick={() => setExpandedId(isExpanded ? null : item.campaign.id)}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {isExpanded ? 'Hide Outputs' : 'View Outputs'}
                    </button>
                  </div>
                </div>

                {/* Qualitative Performance Notes (Operator Insight) */}
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, marginRight: '16px' }}>
                    <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>OPERATOR PERFORMANCE NOTE</small>
                    {isEditingNotes ? (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '6px 10px', fontSize: '13px' }}
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="e.g. Generated 14 extra table covers on Tuesday afternoon"
                        />
                        <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => handleSaveNotes(item.campaign.id, item.campaign.status)}>
                          Save
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: item.campaign.performanceNotes ? 'var(--text-primary)' : 'var(--text-muted)', marginTop: '2px' }}>
                        {item.campaign.performanceNotes || 'No performance notes recorded. Click to record walk-in results.'}
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
                      <Edit3 size={13} /> {item.campaign.performanceNotes ? 'Edit' : 'Add Note'}
                    </button>
                  )}
                </div>

                {/* Expanded 4 Channels */}
                {isExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
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
