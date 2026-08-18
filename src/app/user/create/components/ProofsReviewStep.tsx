'use client';

import React from 'react';
import Link from 'next/link';
import { ChannelCard } from '../../../../components/ChannelCard';
import { ArrowRight, CheckCircle2, FileText, Code, Printer } from 'lucide-react';
import {
  downloadFullCampaignPackTxt,
  downloadFullCampaignPackMarkdown,
  downloadFullCampaignPackJson,
  triggerPrintPoster,
} from '../../../../utils/exportUtils';

interface ProofsReviewStepProps {
  campaignId: string;
  businessId: string;
  storeName: string;
  campaign: any;
  outputs: any;
  onReset: () => void;
}

export function ProofsReviewStep({
  campaignId,
  businessId,
  storeName,
  campaign,
  outputs,
  onReset,
}: ProofsReviewStepProps) {
  const bizQuery = `?biz=${encodeURIComponent(businessId)}`;
  const pack = {
    campaign,
    outputs,
    validationStatus: 'VALID' as const,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
              Campaign Generated &amp; Saved
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', margin: '2px 0 0' }}>
              Coordinated proofs across 4 channels are active and ready for dispatch.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '12.5px', padding: '7px 14px' }}
            onClick={onReset}
          >
            Create Another
          </button>

          <Link
            href={`/user/campaigns/${campaignId}${bizQuery}`}
            className="btn-primary"
            style={{ fontSize: '13px', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Open Campaign Proofs</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 4-Channel Coordinated Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <ChannelCard channel="GOOGLE_BUSINESS" status="ready" content={outputs.googleBusiness} />
        <ChannelCard channel="INSTAGRAM" status="ready" content={outputs.instagram} />
        <ChannelCard channel="WHATSAPP" status="ready" content={outputs.whatsapp} />
        <ChannelCard channel="IN_STORE_POSTER" status="ready" content={outputs.poster} />
      </div>

      {/* Export Toolset Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xs)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
          EXPORT DISPATCH PACKS:
        </span>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => downloadFullCampaignPackTxt(pack, storeName)}
          >
            <FileText size={13} /> Plaintext (.txt)
          </button>

          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => downloadFullCampaignPackMarkdown(pack, storeName)}
          >
            <FileText size={13} /> Markdown (.md)
          </button>

          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => downloadFullCampaignPackJson(pack)}
          >
            <Code size={13} /> JSON (.json)
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => triggerPrintPoster()}
          >
            <Printer size={13} /> Print Counter Poster
          </button>
        </div>
      </div>
    </div>
  );
}
