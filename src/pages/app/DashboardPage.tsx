import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../hooks/useBusiness';
import { useCampaign } from '../../hooks/useCampaign';
import { useUsage } from '../../hooks/useUsage';
import { api } from '../../lib/api';
import { generateDynamicBriefing, DynamicOpportunity, FestivalEvent } from '../../engine/briefing/opportunityEngine';
import { CampaignStatusBadge } from '../../components/CampaignStatusBadge';
import { UsageMeter } from '../../components/UsageMeter';
import { Plus, Store, Calendar } from 'lucide-react';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            DAILY WORKSPACE &bull; {briefing.dateString.toUpperCase()}
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--color-ink)', marginTop: '2px' }}>
            {briefing.greeting}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-ink-muted)' }}>
            {briefing.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={() => navigate('app/campaigns')}>
            Vault ({campaigns.length})
          </button>
          <button className="btn-primary" onClick={() => navigate('app/create')}>
            <Plus size={14} /> Create promotion
          </button>
        </div>
      </div>

      {/* 2-Column Space-Utilizing Grid */}
      <div className="workspace-grid-2col">
        {/* Left Column: Editorial Marketing Opportunities & Active Vault */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Opportunities Section */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-ink-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                PRIORITY PROMOTIONS TO DROP
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                {briefing.opportunities.length} opportunities detected
              </span>
            </div>

            {briefing.opportunities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {briefing.opportunities.map((opp, idx) => (
                  <div
                    key={opp.id}
                    style={{
                      paddingBottom: idx === briefing.opportunities.length - 1 ? 0 : '20px',
                      borderBottom: idx === briefing.opportunities.length - 1 ? 'none' : '1px solid var(--color-border-soft)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-primary)', fontWeight: 700 }}>
                        0{idx + 1}
                      </span>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', background: 'var(--color-accent-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
                        {opp.tag}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '4px' }}>
                      {opp.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '14px', lineHeight: '1.5' }}>
                      {opp.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-raised)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ fontSize: '12.5px', color: 'var(--color-ink)' }}>
                        <span style={{ color: 'var(--color-ink-muted)' }}>Suggested Offer:</span> <strong>{opp.preset.offer.title}</strong> &bull; {opp.preset.schedule.timingLabel}
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
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--color-ink-muted)' }}>
                All current store windows are covered by active campaigns.
              </div>
            )}
          </div>

          {/* Active Vault Grid */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)' }}>
                Active Campaign Vault
              </h3>
              <button className="btn-ghost" style={{ fontSize: '12px' }} onClick={() => navigate('app/campaigns')}>
                View all in vault ({campaigns.length}) &rarr;
              </button>
            </div>

            {campaigns.length === 0 ? (
              <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', padding: '16px 0' }}>
                No campaign drops yet. Click 'Create promotion' to draft your first 4-channel pack.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                {campaigns.slice(0, 4).map((item) => (
                  <div
                    key={item.campaign.id}
                    style={{
                      background: 'var(--color-surface-raised)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                          {item.campaign.type.replace(/_/g, ' ')}
                        </span>
                        <CampaignStatusBadge status={item.campaign.status} size="sm" />
                      </div>
                      <h4 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-ink)', lineHeight: '1.4' }}>
                        {item.campaign.offer.title || item.campaign.offer.description}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--color-ink-muted)', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                      <span>{item.campaign.schedule.timingLabel || 'Active'}</span>
                      <button className="btn-ghost" style={{ padding: '0', fontSize: '11.5px', color: 'var(--color-primary)' }} onClick={() => navigate('app/campaigns')}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                STORE CONTEXT
              </span>
              <button className="btn-ghost" style={{ fontSize: '12px', padding: 0, color: 'var(--color-primary)' }} onClick={() => navigate('app/business')}>
                Edit Memory &rarr;
              </button>
            </div>

            <div style={{ fontSize: '18px', fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
              {profile?.name || 'The Roasted Bean'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginTop: '2px', marginBottom: '14px' }}>
              {profile?.neighborhood ? `${profile.neighborhood}, ${profile.city}` : 'Indiranagar, Bengaluru'}
            </div>

            <div style={{ background: 'var(--color-surface-raised)', padding: '12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '12.5px', color: 'var(--color-ink)', lineHeight: '1.5' }}>
              <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', marginBottom: '3px' }}>TARGET AUDIENCE</div>
              {profile?.targetCustomer || 'Working professionals, freelancers, and local residents'}
            </div>
          </div>

          {/* Live Quota Meter */}
          <UsageMeter usage={usage} onUpgrade={onOpenUpgrade} />

          {/* Festival Calendar */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', textTransform: 'uppercase' }}>
                UPCOMING FESTIVALS
              </span>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>Database</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {festivals.slice(0, 3).map((f) => (
                <div
                  key={f.id}
                  style={{
                    background: 'var(--color-surface-raised)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--color-ink)' }}>{f.name}</strong>
                    <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                      {new Date(f.starts_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '2px' }}>
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
