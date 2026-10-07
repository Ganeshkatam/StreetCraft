'use client';

import React from 'react';
import Link from 'next/link';
import { TodayOpportunitySummary } from '../../../../../../lib/domain/today/todayTypes';

interface OpportunitiesPanelProps {
  businessId: string;
  opportunities: TodayOpportunitySummary[];
}

export function OpportunitiesPanel({ businessId, opportunities }: OpportunitiesPanelProps) {
  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-ink-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          WHAT SHOULD YOU DO TODAY?
        </span>
        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
          {opportunities.length > 0 ? `${opportunities.length} action items` : 'All clear'}
        </span>
      </div>

      {opportunities.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {opportunities.map((opp, idx) => {
            const params = new URLSearchParams();
            if (opp.preset.type) params.set('type', opp.preset.type);
            if (opp.preset.objective) params.set('objective', opp.preset.objective);
            if (opp.preset.offerTitle) params.set('offer_title', opp.preset.offerTitle);
            if (opp.preset.offerDescription) params.set('offer_desc', opp.preset.offerDescription);
            if (opp.preset.timingLabel) params.set('timing_label', opp.preset.timingLabel);
            if (opp.preset.customNotes) params.set('custom_notes', opp.preset.customNotes);

            const launchUrl = `/user/business/${encodeURIComponent(businessId)}/create?${params.toString()}`;

            return (
              <div
                key={opp.id}
                style={{
                  paddingBottom: idx === opportunities.length - 1 ? 0 : '20px',
                  borderBottom: idx === opportunities.length - 1 ? 'none' : '1px solid var(--color-border-soft)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-primary)', fontWeight: 700 }}>
                    0{idx + 1}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-accent)',
                        background: 'var(--color-accent-subtle)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-xs)',
                      }}
                    >
                      {opp.tag}
                    </span>
                    {opp.confidence && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          color: opp.confidence === 'HIGH' ? '#059669' : '#d97706',
                          background: opp.confidence === 'HIGH' ? '#ecfdf5' : '#fffbeb',
                          border: `1px solid ${opp.confidence === 'HIGH' ? '#a7f3d0' : '#fde68a'}`,
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-xs)',
                          fontWeight: 600,
                        }}
                      >
                        {opp.confidence} CONFIDENCE {opp.score ? `(${opp.score})` : ''}
                      </span>
                    )}
                  </div>
                </div>

                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '4px' }}>
                  {opp.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '12px', lineHeight: '1.5' }}>
                  {opp.description}
                </p>

                {opp.channelFocus && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '8px',
                      marginBottom: '14px',
                      fontSize: '11.5px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-ink-muted)',
                    }}
                  >
                    <div style={{ background: 'var(--color-surface)', padding: '6px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                      <strong style={{ color: 'var(--color-ink)' }}>Google:</strong> {opp.channelFocus.google}
                    </div>
                    <div style={{ background: 'var(--color-surface)', padding: '6px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                      <strong style={{ color: 'var(--color-ink)' }}>Instagram:</strong> {opp.channelFocus.instagram}
                    </div>
                    <div style={{ background: 'var(--color-surface)', padding: '6px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                      <strong style={{ color: 'var(--color-ink)' }}>WhatsApp:</strong> {opp.channelFocus.whatsapp}
                    </div>
                    <div style={{ background: 'var(--color-surface)', padding: '6px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
                      <strong style={{ color: 'var(--color-ink)' }}>In-Store:</strong> {opp.channelFocus.poster}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--color-surface-raised)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--color-border)',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ fontSize: '12.5px', color: 'var(--color-ink)' }}>
                    <span style={{ color: 'var(--color-ink-muted)' }}>Suggested Offer:</span> <strong>{opp.preset.offerTitle}</strong> &bull; {opp.preset.timingLabel}
                  </div>

                  <Link
                    href={launchUrl}
                    className="btn-primary"
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                  >
                    {opp.actionLabel}
                  </Link>
                </div>
              </div>
            );
          })}
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
  );
}
