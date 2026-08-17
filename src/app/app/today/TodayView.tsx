'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useBusiness } from '../../../hooks/useBusiness';
import { useCampaign } from '../../../hooks/useCampaign';
import { useUsage } from '../../../hooks/useUsage';
import { api } from '../../../lib/api';
import { generateDynamicBriefing, DynamicOpportunity, FestivalEvent, resolveUpcomingFestivals } from '../../../engine/briefing/opportunityEngine';
import { CampaignStatusBadge } from '../../../components/CampaignStatusBadge';
import { UsageMeter } from '../../../components/UsageMeter';
import { UpgradeModal } from '../../../components/UpgradeModal';
import { ErrorStateCard } from '../../../components/ErrorStateCard';
import { Plus, Store } from 'lucide-react';

export function TodayView() {
  const router = useRouter();
  const { session } = useAuth();
  const businessId = session.activeBusinessId || '';

  const { profile, loading, error: businessError, refreshProfile } = useBusiness(businessId);
  const { campaigns } = useCampaign(businessId);
  const { usage } = useUsage(businessId);
  const [festivals, setFestivals] = useState<FestivalEvent[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    api.getFestivalCalendar().then((data) => setFestivals(Array.isArray(data) ? (data as FestivalEvent[]) : []));
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-ink-muted)' }}>
          Loading daily workspace...
        </div>
      </div>
    );
  }

  if (businessError && !profile && businessId) {
    return (
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
        <ErrorStateCard
          title="Unable to load daily workspace"
          message="We encountered an issue connecting to your store profile. Please check your connection and try again."
          onRetry={refreshProfile}
          actionLabel="Retry Loading"
        />
      </div>
    );
  }

  if (!businessId || !profile) {
    return (
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
        <div className="card" style={{ maxWidth: '560px', margin: '60px auto', textAlign: 'center', padding: '48px 36px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Store size={26} />
          </div>
          <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', marginBottom: '8px', color: 'var(--color-ink)' }}>
            No Storefront Selected
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
            You haven&apos;t set up a store profile yet. Complete the quick onboarding setup to activate your daily workspace and AI campaign briefing.
          </p>
          <button
            onClick={() => router.push('/setup')}
            className="btn-primary"
            style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            Set Up Your Storefront
          </button>
        </div>
      </div>
    );
  }

  const upcomingFestivalsList = resolveUpcomingFestivals(Array.isArray(festivals) ? festivals : [], new Date(), 3);

  const rawCampaigns = Array.isArray(campaigns) ? campaigns.map((c) => c.campaign) : [];
  const briefing = generateDynamicBriefing(profile, rawCampaigns, Array.isArray(festivals) ? festivals : []);

  const handleLaunchPreset = (opportunity: DynamicOpportunity) => {
    sessionStorage.setItem('sc_launched_preset', JSON.stringify(opportunity.preset));
    router.push('/app/create');
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '16px' }}>
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
          <button className="btn-secondary" onClick={() => router.push('/app/campaigns')}>
            Vault ({campaigns.length})
          </button>
          <button className="btn-primary" onClick={() => router.push('/app/create')}>
            <Plus size={14} /> Create promotion
          </button>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="workspace-grid-2col">
        {/* Left Column: Opportunities & Vault */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-ink-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                WHAT SHOULD YOU DO TODAY?
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                {briefing.opportunities.length > 0 ? `${briefing.opportunities.length} action items` : 'All clear'}
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
                        onClick={() => handleLaunchPreset(opp)}
                      >
                        {opp.actionLabel}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--color-ink-muted)' }}>
                <p style={{ fontSize: '14px', color: 'var(--color-ink)', fontWeight: 600, marginBottom: '4px' }}>
                  Nothing needs your attention right now.
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', margin: 0 }}>
                  All current store periods are covered by active campaigns.
                </p>
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)' }}>
                Campaign Vault
              </h3>
              <button className="btn-ghost" style={{ fontSize: '12px' }} onClick={() => router.push('/app/campaigns')}>
                View all in vault ({campaigns.length})
              </button>
            </div>

            {campaigns.length === 0 ? (
              <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', padding: '16px 0' }}>
                No campaign drops yet. Click &apos;Create promotion&apos; to draft your first campaign.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
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
                      <button className="btn-ghost" style={{ padding: '0', fontSize: '11.5px', color: 'var(--color-primary)' }} onClick={() => router.push(`/app/campaigns/${item.campaign.id}`)}>
                        Proofs
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Store Context, Quota & Festivals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                STORE CONTEXT
              </span>
              <button className="btn-ghost" style={{ fontSize: '12px', padding: 0, color: 'var(--color-primary)' }} onClick={() => router.push('/app/business')}>
                Edit
              </button>
            </div>

            <div style={{ fontSize: '18px', fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
              {profile?.name || 'Store Name Not Set'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginTop: '2px', marginBottom: '14px' }}>
              {profile?.neighborhood ? `${profile.neighborhood}${profile.city ? `, ${profile.city}` : ''}` : 'Location not set'}
            </div>

            <div style={{ background: 'var(--color-surface-raised)', padding: '12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', fontSize: '12.5px', color: 'var(--color-ink)', lineHeight: '1.5' }}>
              <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', marginBottom: '3px' }}>SPECIALTIES</div>
              {profile?.signatureItems || 'Not specified yet'}
            </div>
          </div>

          <UsageMeter usage={usage} onUpgrade={() => setShowUpgradeModal(true)} />

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', textTransform: 'uppercase' }}>
                UPCOMING FESTIVALS
              </span>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
                Radar ({upcomingFestivalsList.length})
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingFestivalsList.map((f) => (
                <div
                  key={f.id}
                  style={{
                    background: 'var(--color-surface-raised)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '10px 12px',
                    transition: 'var(--motion-fast)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--color-ink)' }}>{f.name}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-xs)',
                          background: f.isTodayOrActive ? 'var(--color-accent-subtle)' : 'var(--color-primary-subtle)',
                          color: f.isTodayOrActive ? 'var(--color-accent)' : 'var(--color-primary)',
                          border: `1px solid ${f.isTodayOrActive ? 'var(--color-accent)' : 'var(--color-primary-border)'}`,
                        }}
                      >
                        {f.relativeTimeLabel}
                      </span>
                      <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
                        {f.formattedDate}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                    {f.suggested_offer || f.marketing_relevance}
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="btn-ghost"
                      style={{ fontSize: '11px', padding: '2px 8px', color: 'var(--color-primary)', fontWeight: 600 }}
                      onClick={() => {
                        sessionStorage.setItem('sc_launched_preset', JSON.stringify({
                          type: 'FESTIVAL_SPECIAL',
                          objective: 'FESTIVAL_RUSH',
                          offer: {
                            title: f.suggested_offer || `${f.name} Special`,
                            description: `${f.name} celebration special at our storefront.`,
                            value: 'Festive Special',
                            terms: `Valid during ${f.name} celebration`,
                          },
                          schedule: {
                            timingLabel: `${f.name} (${f.formattedDate})`,
                          },
                          customNotes: `Focus on ${f.marketing_relevance}.`,
                        }));
                        router.push('/app/create');
                      }}
                    >
                      Draft Promotion
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showUpgradeModal && <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />}
    </div>
  );
}
