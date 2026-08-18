'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CampaignDetailViewModel } from '../../../../lib/server/campaigns/getCampaignDetail';
import { CampaignStatusDropdown } from '../CampaignStatusDropdown';
import { CampaignRegenerateButton } from '../CampaignRegenerateButton';
import { CampaignArchiveButton } from '../CampaignArchiveButton';
import { CampaignNotesEditor } from '../CampaignNotesEditor';
import { ChannelCard } from '../../../../components/ChannelCard';
import { Target, Users, Clock, Download, Printer, FileText, Code, AlertTriangle, Archive } from 'lucide-react';
import {
  downloadFullCampaignPackTxt,
  downloadFullCampaignPackMarkdown,
  downloadFullCampaignPackJson,
  triggerPrintPoster,
} from '../../../../utils/exportUtils';

interface CampaignDetailViewProps {
  detailData: CampaignDetailViewModel;
}

export function CampaignDetailView({ detailData }: CampaignDetailViewProps) {
  const router = useRouter();
  const { campaign, outputs, isComplete } = detailData;
  const isArchived = (campaign.status || '').toUpperCase() === 'ARCHIVED';

  // Re-map detailData to expected legacy format for exportUtils
  const exportableItem = {
    campaign,
    outputs: {
      googleBusiness: outputs.googleBusiness?.content,
      instagram: outputs.instagram?.content,
      whatsapp: outputs.whatsapp?.content,
      poster: outputs.poster?.content,
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => router.push('/user/campaigns')}
          className="btn-ghost"
          style={{ padding: 0, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          Back to Campaigns
        </button>
      </div>

      {isArchived && (
        <div
          style={{
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xs)',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Archive size={16} color="var(--color-ink-muted)" />
          <span style={{ fontSize: '13px', color: 'var(--color-ink-muted)' }}>
            <strong>Archived Historical Record</strong> &bull; This campaign is preserved for reference only. It cannot be published, edited, or regenerated.
          </span>
        </div>
      )}

      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', background: 'var(--color-accent-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-xs)', fontWeight: 600 }}>
                {campaign.type.replace(/_/g, ' ')}
              </span>
              {isArchived ? (
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: 'var(--radius-xs)', fontWeight: 600 }}>
                  ARCHIVED
                </span>
              ) : (
                <CampaignStatusDropdown campaignId={campaign.id} currentStatus={campaign.status} />
              )}
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-ink)', marginTop: '4px', lineHeight: '1.3' }}>
              {campaign.offer.title || campaign.offer.description}
            </h1>

            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
              Created on {new Date(campaign.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })} &bull; Timing: <strong>{campaign.schedule.timingLabel || 'Active window'}</strong>
            </p>
          </div>

          {!isArchived && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CampaignRegenerateButton
                campaignId={campaign.id}
                generationRevision={campaign.generationRevision}
                status={campaign.status}
              />
              <CampaignArchiveButton
                campaignId={campaign.id}
                currentStatus={campaign.status}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Target size={15} color="var(--color-primary)" style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>OBJECTIVE</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '2px' }}>
                {campaign.objective.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Users size={15} color="var(--color-accent)" style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>AUDIENCE</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '2px' }}>
                {campaign.audience || 'Neighborhood customers'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Clock size={15} color="var(--color-primary)" style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>TERMS / VALUE</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '2px' }}>
                {campaign.offer.terms || campaign.offer.value || 'Standard terms'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginBottom: '24px',
          padding: '16px 20px',
          background: 'var(--color-surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={16} color="var(--color-primary)" />
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)' }}>
            Export Campaign Pack:
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            style={{ fontSize: '12.5px', padding: '6px 14px' }}
            onClick={() => downloadFullCampaignPackTxt(exportableItem as any, 'Store')}
            title="Download full campaign copy as plain text"
            disabled={!isComplete}
          >
            <FileText size={13} /> Text (.txt)
          </button>

          <button
            className="btn-secondary"
            style={{ fontSize: '12.5px', padding: '6px 14px' }}
            onClick={() => downloadFullCampaignPackMarkdown(exportableItem as any, 'Store')}
            title="Download full campaign copy as markdown"
            disabled={!isComplete}
          >
            <FileText size={13} /> Markdown (.md)
          </button>

          <button
            className="btn-secondary"
            style={{ fontSize: '12.5px', padding: '6px 14px' }}
            onClick={() => downloadFullCampaignPackJson(exportableItem as any)}
            title="Download raw campaign structure as JSON"
            disabled={!isComplete}
          >
            <Code size={13} /> JSON (.json)
          </button>

          {outputs.poster && (
            <button
              className="btn-primary"
              style={{ fontSize: '12.5px', padding: '6px 14px' }}
              onClick={triggerPrintPoster}
              title="Print in-store counter poster directly"
            >
              <Printer size={13} /> Print Counter Card
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)' }}>
            Coordinated Storefront Proofs
          </h2>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: isComplete ? 'var(--color-ink-muted)' : 'var(--color-danger)' }}>
            {isComplete ? '4 channel formats ready' : 'Incomplete campaign pack'}
          </span>
        </div>

        {!isComplete && (
          <div style={{ background: 'var(--color-danger-subtle)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-xs)', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <AlertTriangle size={18} color="var(--color-danger)" style={{ marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-danger)', marginBottom: '4px' }}>Incomplete Historical Record</h4>
              <p style={{ fontSize: '13px', color: 'var(--color-danger)', opacity: 0.9 }}>
                This campaign was generated before strict channel completeness invariants were enforced. Some output channels may be missing.
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {outputs.googleBusiness && (
            <ChannelCard
              channel="GOOGLE_BUSINESS"
              status="ready"
              content={outputs.googleBusiness.content}
            />
          )}
          {outputs.instagram && (
            <ChannelCard
              channel="INSTAGRAM"
              status="ready"
              content={outputs.instagram.content}
            />
          )}
          {outputs.whatsapp && (
            <ChannelCard
              channel="WHATSAPP"
              status="ready"
              content={outputs.whatsapp.content}
            />
          )}
          {outputs.poster && (
            <ChannelCard
              channel="IN_STORE_POSTER"
              status="ready"
              content={outputs.poster.content}
            />
          )}
        </div>
      </div>

      {isArchived ? (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '12px' }}>
            Operator Notes
          </h3>
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--color-surface-raised)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-xs)',
              fontSize: '13px',
              color: campaign.performanceNotes ? 'var(--color-ink)' : 'var(--color-ink-muted)',
              lineHeight: '1.5',
            }}
          >
            {campaign.performanceNotes || 'No walk-in notes recorded.'}
          </div>
        </div>
      ) : (
        <CampaignNotesEditor campaignId={campaign.id} initialNotes={campaign.performanceNotes} />
      )}
    </div>
  );
}
