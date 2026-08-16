import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../hooks/useBusiness';
import { useCampaign } from '../../hooks/useCampaign';
import { useUsage } from '../../hooks/useUsage';
import { api } from '../../lib/api';
import { generateDynamicBriefing, DynamicOpportunity, FestivalEvent } from '../../engine/briefing/opportunityEngine';
import { CampaignStatusBadge } from '../../components/CampaignStatusBadge';
import { ArrowRight, Plus } from 'lucide-react';

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
    <div style={{ maxWidth: '800px' }}>
      {/* Notebook Header */}
      <div className="notebook-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              TODAY &bull; {briefing.dateString}
            </span>
            <h1 className="notebook-greeting" style={{ marginTop: '4px' }}>
              {briefing.greeting}
            </h1>
            <p className="notebook-sub">
              {briefing.subtitle}
            </p>
          </div>

          <button className="btn-primary" onClick={() => navigate('app/create')}>
            <Plus size={14} /> New campaign
          </button>
        </div>
      </div>

      {/* Notebook Action Entries (01, 02, 03) */}
      <div style={{ marginBottom: '60px' }}>
        {briefing.opportunities.length > 0 ? (
          briefing.opportunities.map((opp, idx) => (
            <div key={opp.id} className="notebook-entry">
              <div className="notebook-num">
                0{idx + 1}
              </div>

              <div className="notebook-body">
                <div className="notebook-tag">{opp.tag}</div>
                <h3 className="notebook-title">{opp.title}</h3>
                <p className="notebook-desc">{opp.description}</p>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '13px', padding: '6px 14px' }}
                  onClick={() => onLaunchPreset(opp)}
                >
                  {opp.actionLabel}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '36px 0', borderBottom: '1px solid var(--border-editorial)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '6px' }}>
              Your store marketing has active coverage
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
              All upcoming time windows and festivals are covered by active campaign packs in your vault.
            </p>
          </div>
        )}
      </div>

      {/* Real Store Status Ledger */}
      <div style={{ borderTop: '1px solid var(--border-editorial)', paddingTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <div>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>STORE PROFILE</span>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '2px' }}>
            {profile?.name || 'Store Profile'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            {profile?.neighborhood ? `${profile.neighborhood}, ${profile.city}` : 'Not set'}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>ACTIVE CAMPAIGNS</span>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '2px' }}>
            {campaigns.length} total in vault
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            {campaigns.filter((c) => c.campaign.status === 'published').length} active right now
          </div>
        </div>

        <div>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>MONTHLY QUOTA</span>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-primary)', marginTop: '2px' }}>
            {usage?.remainingPacks ?? 5} packs available
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            {usage?.planName || 'Starter'} plan
          </div>
        </div>
      </div>

      {/* Recent Campaign Archive Preview */}
      {campaigns.length > 0 && (
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border-editorial)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)' }}>
              Recent Campaigns
            </h3>
            <button className="btn-ghost" style={{ fontSize: '12px' }} onClick={() => navigate('app/campaigns')}>
              Open vault &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {campaigns.slice(0, 3).map((item) => (
              <div
                key={item.campaign.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-editorial)',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                <div>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                    {item.campaign.type.replace(/_/g, ' ')}
                  </span>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>
                    {item.campaign.offer.title || item.campaign.offer.description}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CampaignStatusBadge status={item.campaign.status} />
                  <button className="btn-ghost" style={{ fontSize: '12px' }} onClick={() => navigate('app/campaigns')}>
                    View &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
