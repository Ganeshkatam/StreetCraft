import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../hooks/useBusiness';
import { useCampaign } from '../../hooks/useCampaign';
import { useUsage } from '../../hooks/useUsage';
import { api } from '../../lib/api';
import { generateDynamicBriefing, DynamicOpportunity, FestivalEvent } from '../../engine/briefing/opportunityEngine';
import { CampaignStatusBadge } from '../../components/CampaignStatusBadge';
import { UsageMeter } from '../../components/UsageMeter';
import { Plus, ArrowRight, Calendar, Store, Clock, Zap, Sparkles } from 'lucide-react';

interface DashboardPageProps {
  businessId: string;
  navigate: (route: string) => void;
  onLaunchPreset: (opportunity: DynamicOpportunity) => void;
  onOpenUpgrade: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  businessId,
  navigate,
  onLaunchPreset,
  onOpenUpgrade,
}) => {
  const { profile } = useBusiness(businessId);
  const { campaigns } = useCampaign(businessId);
  const { usage } = useUsage(businessId);
  const [festivals, setFestivals] = useState<FestivalEvent[]>([]);

  useEffect(() => {
    api.getFestivalCalendar().then((data) => setFestivals(data as FestivalEvent[]));
  }, []);

  const rawCampaigns = campaigns.map((c) => c.campaign);
  const briefing = profile
    ? generateDynamicBriefing(profile, rawCampaigns, festivals)
    : {
        dateString: new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }),
        greeting: 'Good morning.',
        subtitle: 'Here is what deserves your attention today.',
        opportunities: [],
      };

  return (
    <div>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="section-eyebrow">
            STUDIO WORKSPACE &bull; {briefing.dateString.toUpperCase()}
          </span>
          <h1 className="section-title">
            {briefing.greeting}
          </h1>
          <p className="section-subtitle">
            {briefing.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={() => navigate('app/campaigns')}>
            Vault ({campaigns.length})
          </button>
          <button className="btn-primary" onClick={() => navigate('app/create')}>
            <Plus size={15} /> Create Campaign
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Workspace */}
      <div className="workspace-grid-2col">
        {/* Left Column: High-Impact Opportunities & Active Campaigns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Opportunities Section */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--accent-emerald)" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
                  Recommended Opportunities
                </h3>
              </div>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', background: 'var(--accent-emerald-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                {briefing.opportunities.length} Active
              </span>
            </div>

            {briefing.opportunities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {briefing.opportunities.map((opp, idx) => (
                  <div
                    key={opp.id}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '20px',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-sky)', background: 'var(--accent-sky-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                        {opp.tag}
                      </span>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        OPP 0{idx + 1}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                      {opp.title}
                    </h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.5' }}>
                      {opp.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ fontSize: '12.5px', color: '#FFFFFF' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Suggested:</span> {opp.preset.offer.title} ({opp.preset.schedule.timingLabel})
                      </div>
                      <button
                        className="btn-primary"
                        style={{ fontSize: '12px', padding: '6px 14px' }}
                        onClick={() => onLaunchPreset(opp)}
                      >
                        {opp.actionLabel} &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                All current store windows are covered by active campaigns.
              </div>
            )}
          </div>

          {/* Active Vault Grid */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
                Recent Campaign Drops
              </h3>
              <button className="btn-ghost" style={{ fontSize: '12.5px' }} onClick={() => navigate('app/campaigns')}>
                View all in vault ({campaigns.length}) &rarr;
              </button>
            </div>

            {campaigns.length === 0 ? (
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', padding: '16px 0' }}>
                No campaign drops yet. Click 'Create Campaign' to generate your first 4-channel pack.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                {campaigns.slice(0, 4).map((item) => (
                  <div
                    key={item.campaign.id}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {item.campaign.type.replace(/_/g, ' ')}
                        </span>
                        <CampaignStatusBadge status={item.campaign.status} size="sm" />
                      </div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', lineHeight: '1.4' }}>
                        {item.campaign.offer.title || item.campaign.offer.description}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-muted)', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                      <span>{item.campaign.schedule.timingLabel || 'Active'}</span>
                      <button className="btn-ghost" style={{ padding: '0', fontSize: '11.5px', color: 'var(--accent-emerald)' }} onClick={() => navigate('app/campaigns')}>
                        Proofs &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Store Context, Live Quota & Festival Calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Store Snapshot Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Store size={15} color="var(--accent-emerald)" />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  STORE MEMORY
                </span>
              </div>
              <button className="btn-ghost" style={{ fontSize: '12px', padding: 0, color: 'var(--accent-emerald)' }} onClick={() => navigate('app/business')}>
                Edit &rarr;
              </button>
            </div>

            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
              {profile?.name || 'The Roasted Bean'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', marginBottom: '14px' }}>
              {profile?.neighborhood ? `${profile.neighborhood}, ${profile.city}` : 'Indiranagar, Bengaluru'}
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '12.5px', color: '#E2E8F0', lineHeight: '1.5' }}>
              <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '3px' }}>TARGET AUDIENCE</div>
              {profile?.targetCustomer || 'Working professionals, freelancers, and local residents'}
            </div>
          </div>

          {/* Live Quota Meter */}
          <UsageMeter usage={usage} onUpgrade={onOpenUpgrade} />

          {/* Festival Calendar */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="var(--accent-amber)" />
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
                  UPCOMING FESTIVALS
                </span>
              </div>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Realtime</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {festivals.slice(0, 3).map((f) => (
                <div
                  key={f.id}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: '13px', color: '#FFFFFF' }}>{f.name}</strong>
                    <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
                      {new Date(f.starts_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {f.suggested_offer || f.marketing_relevance}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
