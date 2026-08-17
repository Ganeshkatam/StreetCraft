'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import { useCampaign } from '../../../../hooks/useCampaign';
import { useBusiness } from '../../../../hooks/useBusiness';
import { CampaignStatus } from '../../../../types/campaign';
import { CampaignStatusBadge } from '../../../../components/CampaignStatusBadge';
import { ChannelCard } from '../../../../components/ChannelCard';
import { ArrowLeft, Check, Edit3, Target, Users, Clock, Download, Printer, FileText, Code } from 'lucide-react';
import {
  downloadFullCampaignPackTxt,
  downloadFullCampaignPackMarkdown,
  downloadFullCampaignPackJson,
  triggerPrintPoster,
} from '../../../../utils/exportUtils';

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { session } = useAuth();
  const businessId = session.activeBusinessId || '';

  const { campaigns, loading, updateStatus } = useCampaign(businessId);
  const { profile } = useBusiness(businessId);

  const item = campaigns.find((c) => c.campaign.id === id);

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (item) {
      setNotes(item.campaign.performanceNotes || '');
    }
  }, [item]);

  const handleSaveNotes = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await updateStatus(item.campaign.id, item.campaign.status, notes);
      setIsEditingNotes(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: CampaignStatus) => {
    if (!item) return;
    await updateStatus(item.campaign.id, newStatus, notes);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-ink-muted)' }}>
        Loading campaign details...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px', margin: '40px auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-ink)', marginBottom: '8px' }}>
          Campaign Not Found
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '24px' }}>
          We couldn&apos;t find that campaign. It may have been archived or removed from your vault.
        </p>
        <button className="btn-primary" onClick={() => router.push('/app/campaigns')}>
          &larr; Back to Campaign Vault
        </button>
      </div>
    );
  }

  const { campaign, outputs } = item;

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => router.push('/app/campaigns')}
          className="btn-ghost"
          style={{ padding: 0, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={14} /> Back to Campaigns
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', background: 'var(--color-accent-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-xs)', fontWeight: 600 }}>
                {campaign.type.replace(/_/g, ' ')}
              </span>
              <CampaignStatusBadge status={campaign.status} />
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-ink)', marginTop: '4px', lineHeight: '1.3' }}>
              {campaign.offer.title || campaign.offer.description}
            </h1>

            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginTop: '4px' }}>
              Created on {new Date(campaign.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })} &bull; Timing: <strong>{campaign.schedule.timingLabel || 'Active window'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-ink-muted)' }}>Status:</span>
            <select
              className="form-select"
              style={{ fontSize: '12.5px', padding: '6px 12px', width: 'auto' }}
              value={campaign.status}
              onChange={(e) => handleStatusChange(e.target.value as CampaignStatus)}
            >
              <option value="ready">Ready</option>
              <option value="published">Published (Live)</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
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
            onClick={() => downloadFullCampaignPackTxt(item, profile?.name)}
            title="Download full campaign copy as plain text"
          >
            <FileText size={13} /> Text (.txt)
          </button>

          <button
            className="btn-secondary"
            style={{ fontSize: '12.5px', padding: '6px 14px' }}
            onClick={() => downloadFullCampaignPackMarkdown(item, profile?.name)}
            title="Download full campaign copy as markdown"
          >
            <FileText size={13} /> Markdown (.md)
          </button>

          <button
            className="btn-secondary"
            style={{ fontSize: '12.5px', padding: '6px 14px' }}
            onClick={() => downloadFullCampaignPackJson(item)}
            title="Download raw campaign structure as JSON"
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
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)' }}>
            4 channel formats ready
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          <ChannelCard
            channel="GOOGLE_BUSINESS"
            status="ready"
            content={outputs.googleBusiness as unknown as Record<string, unknown>}
          />
          <ChannelCard
            channel="INSTAGRAM"
            status="ready"
            content={outputs.instagram as unknown as Record<string, unknown>}
          />
          <ChannelCard
            channel="WHATSAPP"
            status="ready"
            content={outputs.whatsapp as unknown as Record<string, unknown>}
          />
          {outputs.poster && (
            <ChannelCard
              channel="IN_STORE_POSTER"
              status="ready"
              content={outputs.poster as unknown as Record<string, unknown>}
            />
          )}
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={16} color="var(--color-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>
              Operator Notes &amp; Response Log
            </h3>
          </div>
          {savedSuccess && (
            <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={14} /> Notes saved
            </span>
          )}
        </div>

        {isEditingNotes ? (
          <div>
            <textarea
              className="form-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record redemptions, foot traffic response, or staff notes..."
              style={{ width: '100%', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-primary"
                style={{ fontSize: '12px', padding: '6px 14px' }}
                disabled={isSaving}
                onClick={handleSaveNotes}
              >
                {isSaving ? 'Saving...' : 'Save Notes'}
              </button>
              <button
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 14px' }}
                onClick={() => setIsEditingNotes(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingNotes(true)}
            style={{
              padding: '12px 16px',
              background: 'var(--color-surface-raised)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-xs)',
              fontSize: '13px',
              color: notes ? 'var(--color-ink)' : 'var(--color-ink-muted)',
              cursor: 'pointer',
              lineHeight: '1.5',
            }}
          >
            {notes || 'Click to log walk-in feedback, number of redemptions, or team notes...'}
          </div>
        )}
      </div>
    </div>
  );
}
