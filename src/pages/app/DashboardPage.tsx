import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../hooks/useBusiness';
import { useCampaign } from '../../hooks/useCampaign';
import { useUsage } from '../../hooks/useUsage';
import { api } from '../../lib/api';
import { generateDynamicBriefing, DynamicOpportunity, FestivalEvent } from '../../engine/briefing/opportunityEngine';
import { CampaignStatusBadge } from '../../components/CampaignStatusBadge';
import { Sparkles, ArrowRight, Store, Calendar, TrendingUp, Layers, CheckCircle2, Clock } from 'lucide-react';

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
        dateString: new Date().toLocaleDateString('en-IN'),
        greeting: 'Welcome to StreetCraft AI',
        subtitle: 'Configure your Business Memory to unlock personalized morning briefings.',
        opportunities: [],
      };

  return (
    <div>
      {/* Morning Briefing Banner */}
      <section className="briefing-banner">
        <div className="briefing-header">
          <div>
            <span className="briefing-date">LIVE BRIEFING &bull; {briefing.dateString}</span>
            <h2 className="briefing-title">{briefing.greeting}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              {briefing.subtitle}
            </p>
          </div>
          <button className="btn-secondary" style={{ fontSize: '12px', padding: '8px 14px' }} onClick={() => navigate('app/create')}>
            <Sparkles size={14} /> Custom Campaign
          </button>
        </div>

        {briefing.opportunities.length > 0 ? (
          <div className="opportunities-grid">
            {briefing.opportunities.map((opp) => (
              <div key={opp.id} className="opportunity-card">
                <div>
                  <span className="opportunity-tag">{opp.tag}</span>
                  <h3 className="opportunity-heading">{opp.title}</h3>
                  <p className="opportunity-desc">{opp.description}</p>
                </div>
                <button
                  className="btn-primary"
                  style={{ fontSize: '13px', padding: '8px 14px', width: '100%', justifyContent: 'center' }}
                  onClick={() => onLaunchPreset(opp)}
                >
                  {opp.actionLabel}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center', marginTop: '16px' }}>
            <CheckCircle2 size={24} color="var(--accent-emerald)" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '14px', fontWeight: 700 }}>Your Marketing Calendar Has Active Coverage</div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              All upcoming time windows and festivals are covered by active campaign packs in your vault.
            </p>
          </div>
        )}
      </section>

      {/* Stats and Live Quota Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div className="card">
          <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Store Memory</small>
          <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile?.name || 'Configure Store Profile'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {profile?.neighborhood && profile?.city ? `${profile.neighborhood}, ${profile.city}` : 'Click Business Memory to set'}
          </div>
        </div>

        <div className="card">
          <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Database Campaigns</small>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {campaigns.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {campaigns.filter((c) => c.campaign.status === 'published').length} currently published
          </div>
        </div>

        <div className="card">
          <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Monthly Quota</small>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
            {usage?.usedPacks ?? 0} / {usage?.monthlyLimit ?? 5}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {usage?.remainingPacks ?? 5} packs remaining this cycle
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subscription Tier</small>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {usage?.planName || 'Neighborhood Starter'}
            </div>
          </div>
          <button
            className="btn-ghost"
            style={{ fontSize: '12px', padding: '2px 0', color: 'var(--accent-emerald)', justifyContent: 'flex-start' }}
            onClick={onOpenUpgrade}
          >
            Manage Plan &rarr;
          </button>
        </div>
      </div>

      {/* Recent Real Campaigns Vault Preview */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span className="section-eyebrow">DATABASE VAULT</span>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Recent Multi-Channel Drops</h3>
          </div>
          <button className="btn-secondary" style={{ fontSize: '13px' }} onClick={() => navigate('app/campaigns')}>
            Open Vault &rarr;
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              No campaigns created yet for this business account.
            </p>
            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('app/create')}>
              Create Your First Campaign
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {campaigns.slice(0, 3).map((item) => (
              <div key={item.campaign.id} className="vault-item" style={{ padding: '16px 20px', margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="vault-type">{item.campaign.type.replace(/_/g, ' ')}</span>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>
                      {item.campaign.offer.title || item.campaign.offer.description}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Timing: {item.campaign.schedule.timingLabel}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CampaignStatusBadge status={item.campaign.status} />
                    <button className="btn-ghost" onClick={() => navigate('app/campaigns')}>
                      Details &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
