'use client';

import React from 'react';
import Link from 'next/link';
import { TodayFestivalSummary } from '../../../../../../lib/domain/today/todayTypes';

interface UpcomingFestivalsPanelProps {
  businessId: string;
  festivals: TodayFestivalSummary[];
}

export function UpcomingFestivalsPanel({ businessId, festivals }: UpcomingFestivalsPanelProps) {
  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '14px',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', textTransform: 'uppercase' }}>
          UPCOMING FESTIVALS
        </span>
        <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
          Radar ({festivals.length})
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {festivals.map((f) => {
          const params = new URLSearchParams();
          params.set('type', 'FESTIVAL_SPECIAL');
          params.set('objective', 'FESTIVAL_RUSH');
          params.set('offer_title', f.suggestedOffer || `${f.name} Special`);
          params.set('offer_desc', `${f.name} celebration special at our storefront.`);
          params.set('timing_label', `${f.name} (${f.formattedDate})`);
          params.set('custom_notes', `Focus on ${f.marketingRelevance}.`);

          const draftUrl = `/user/business/${encodeURIComponent(businessId)}/create?${params.toString()}`;

          return (
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
                {f.suggestedOffer || f.marketingRelevance}
              </div>

              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                <Link
                  href={draftUrl}
                  className="btn-ghost"
                  style={{ fontSize: '11px', padding: '2px 8px', color: 'var(--color-primary)', fontWeight: 600 }}
                >
                  Draft Promotion
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
