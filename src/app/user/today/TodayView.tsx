'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateDynamicBriefing, DynamicOpportunity, resolveUpcomingFestivals } from '../../../engine/briefing/opportunityEngine';
import { CampaignStatusBadge } from '../../../components/CampaignStatusBadge';
import { UsageMeter } from '../../../components/UsageMeter';
import { UpgradeModal } from '../../../components/UpgradeModal';
import { ErrorStateCard } from '../../../components/ErrorStateCard';
import { Plus, Store } from 'lucide-react';
import { WorkspaceTodayViewModel } from '../../../lib/server/workspace/getWorkspaceTodayData';
import { FestivalEvent } from '../../../engine/briefing/opportunityEngine'; // Need to cast from backend format

export function TodayView({ initialData }: { initialData: WorkspaceTodayViewModel | null }) {
  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (!initialData) {
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
            You haven't set up a store profile yet. Complete the quick onboarding setup to activate your daily workspace and AI campaign briefing.
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

  const { profile, usagePeriod, campaigns, festivals } = initialData;

  // The backend models are slightly different from the old frontend models.
  // Opportunity engine expects certain formats. 
  // Map backend models back to what the engine expects if needed.
  // Engine expects profile to have signatureItems, etc.
  const mappedProfile = profile ? {
    name: profile.name,
    neighborhood: profile.neighborhood,
    city: profile.city,
    signatureItems: profile.signature_items, // Map snake_case back
  } : null;

  // Engine expects FestivalEvent to have id, name, starts_at, ends_at, marketing_relevance, suggested_offer
  const mappedFestivals: FestivalEvent[] = festivals.map(f => ({
    id: f.id,
    name: f.name,
    region: f.region,
    starts_at: f.starts_at,
    ends_at: f.ends_at,
    marketing_relevance: f.marketing_relevance,
    suggested_offer: f.suggested_offer
  }));

  const upcomingFestivalsList = resolveUpcomingFestivals(mappedFestivals, new Date(), 3);

  // generateDynamicBriefing expects profile, rawCampaigns, festivals
  // rawCampaigns expects { type, status, offer, schedule }
  const briefing = generateDynamicBriefing(
    mappedProfile as any,
    campaigns as any,
    mappedFestivals
  );

  const bizQuery = profile?.business_id ? `?biz=${encodeURIComponent(profile.business_id)}` : '';

  const handleLaunchPreset = (opportunity: DynamicOpportunity) => {
    const params = new URLSearchParams();
    if (profile?.business_id) params.set('biz', profile.business_id);
    if (opportunity.preset.type) params.set('type', opportunity.preset.type);
    if (opportunity.preset.objective) params.set('objective', opportunity.preset.objective);
    if (opportunity.preset.offer?.title) params.set('offer_title', opportunity.preset.offer.title);
    if (opportunity.preset.offer?.description) params.set('offer_desc', opportunity.preset.offer.description);
    if (opportunity.preset.offer?.value) params.set('offer_value', opportunity.preset.offer.value);
    if (opportunity.preset.offer?.terms) params.set('offer_terms', opportunity.preset.offer.terms);
    if (opportunity.preset.schedule?.timingLabel) params.set('timing_label', opportunity.preset.schedule.timingLabel);
    if (opportunity.preset.customNotes) params.set('custom_notes', opportunity.preset.customNotes);

    router.push(`/user/create?${params.toString()}`);
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
          <button className="btn-secondary" onClick={() => router.push(`/user/campaigns${bizQuery}`)}>
            Vault ({campaigns.length})
          </button>
          <button className="btn-primary" onClick={() => router.push(`/user/create${bizQuery}`)}>
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
              <button className="btn-ghost" style={{ fontSize: '12px' }} onClick={() => router.push(`/user/campaigns${bizQuery}`)}>
                View all in vault ({campaigns.length})
              </button>
            </div>

            {campaigns.length === 0 ? (
              <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', padding: '16px 0' }}>
                No campaign drops yet. Click &apos;Create promotion&apos; to draft your first campaign.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {campaigns.slice(0, 4).map((c: any) => {
                  // Type casting since we bypassed standard models
                  const cpn = c as any;
                  return (
                    <div
                      key={c.id}
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
                            {c.type.replace(/_/g, ' ')}
                          </span>
                          <CampaignStatusBadge status={c.status} size="sm" />
                        </div>
                        <h4 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-ink)', lineHeight: '1.4' }}>
                          {cpn.offer?.title || cpn.offer?.description}
                        </h4>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--color-ink-muted)', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                        <span>{cpn.schedule?.timingLabel || 'Active'}</span>
                        <button className="btn-ghost" style={{ padding: '0', fontSize: '11.5px', color: 'var(--color-primary)' }} onClick={() => router.push(`/user/campaigns/${c.id}${bizQuery}`)}>
                          Proofs
                        </button>
                      </div>
                    </div>
                  );
                })}
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
              <button className="btn-ghost" style={{ fontSize: '12px', padding: 0, color: 'var(--color-primary)' }} onClick={() => router.push(`/user/business${bizQuery}`)}>
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
              {profile?.signature_items || 'Not specified yet'}
            </div>
          </div>

          {!usagePeriod ? (
            <ErrorStateCard
              title="Entitlement Unavailable"
              message="Your usage and plan data is currently missing or unavailable. Please contact support to restore your entitlement."
              actionLabel="Contact Support"
              onRetry={() => { }}
            />
          ) : (
            <UsageMeter 
              usage={{ 
                periodId: usagePeriod.id,
                businessId: usagePeriod.business_id,
                plan: usagePeriod.plan as any,
                planName: usagePeriod.plan,
                priceINR: 0,
                monthlyLimit: usagePeriod.campaign_limit,
                usedCampaigns: usagePeriod.campaigns_used,
                remainingCampaigns: Math.max(0, usagePeriod.campaign_limit - usagePeriod.campaigns_used),
                usedPacks: usagePeriod.campaigns_used,
                remainingPacks: Math.max(0, usagePeriod.campaign_limit - usagePeriod.campaigns_used),
                percentUsed: Math.min(100, Math.round((usagePeriod.campaigns_used / (usagePeriod.campaign_limit || 1)) * 100)),
                periodStart: usagePeriod.period_start,
                periodEnd: usagePeriod.period_end,
                canGenerate: usagePeriod.campaign_limit > usagePeriod.campaigns_used,
              }} 
              onUpgrade={() => setShowUpgradeModal(true)} 
            />
          )}

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
              {upcomingFestivalsList.map((f: any) => (
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
                        const params = new URLSearchParams();
                        if (profile?.business_id) params.set('biz', profile.business_id);
                        params.set('type', 'FESTIVAL_SPECIAL');
                        params.set('objective', 'FESTIVAL_CELEBRATION');
                        params.set('offer_title', f.suggested_offer || `${f.name} Special`);
                        params.set('offer_desc', `${f.name} celebration special at our storefront.`);
                        params.set('timing_label', `${f.name} (${f.formattedDate})`);
                        params.set('custom_notes', `Focus on ${f.marketing_relevance}.`);

                        router.push(`/user/create?${params.toString()}`);
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

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          currentPlanId={usagePeriod?.plan || 'FREE'}
          onClose={() => setShowUpgradeModal(false)}
          onPlanUpdated={() => router.refresh()}
        />
      )}
    </div>
  );
}
