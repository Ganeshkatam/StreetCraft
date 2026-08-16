import React, { useState } from 'react';
import { ChannelType, ChannelStatus } from '../types/campaign';
import { CHANNELS } from '../config/channels';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import { Copy, Check, Newspaper, Image, MessageSquare, Send } from 'lucide-react';

interface ChannelCardProps {
  channel: ChannelType;
  status: ChannelStatus;
  content: Record<string, unknown>;
  onCopyAll?: () => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  status,
  content,
}) => {
  const meta = CHANNELS[channel];
  const [copied, setCopied] = useState(false);

  const getChannelIcon = () => {
    switch (channel) {
      case 'GOOGLE_BUSINESS':
        return <Newspaper size={16} />;
      case 'INSTAGRAM':
        return <Image size={16} />;
      case 'WHATSAPP':
        return <MessageSquare size={16} />;
      case 'IN_STORE_POSTER':
        return <Send size={16} />;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderChannelBody = () => {
    if (status === 'generating') {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="spin-animate" style={{ fontSize: '20px', marginBottom: '8px' }}>&bull;</div>
          <p style={{ fontSize: '13px' }}>Generating verified local copy and constraints...</p>
        </div>
      );
    }

    if (status === 'pending') {
      return (
        <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          Queued in generation pipeline...
        </div>
      );
    }

    if (channel === 'GOOGLE_BUSINESS') {
      const headline = (content.headline as string) || '';
      const body = (content.body as string) || '';
      const ctaType = (content.ctaType as string) || 'Visit Us';
      const offerSummary = (content.offerSummary as string) || '';

      return (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>HEADLINE</small>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {headline}
            </div>
          </div>

          <div className="channel-content-preview">
            {body}
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div><strong>Action:</strong> {ctaType}</div>
            <div><strong>Offer Summary:</strong> {offerSummary}</div>
          </div>
        </div>
      );
    }

    if (channel === 'INSTAGRAM') {
      const reelHook = (content.reelHook as string) || '';
      const caption = (content.caption as string) || '';
      const localTags = (content.localTags as string[]) || [];

      return (
        <div>
          <div style={{ marginBottom: '12px', background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <small style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-indigo)' }}>REEL / HOOK</small>
            <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
              {reelHook}
            </div>
          </div>

          <div className="channel-content-preview">
            {caption}
          </div>

          <div className="channel-tags">
            {localTags.map((tag, i) => (
              <span key={i} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (channel === 'WHATSAPP') {
      const broadcastMessage = (content.broadcastMessage as string) || '';
      const cta = (content.cta as string) || '';

      return (
        <div>
          <div className="channel-content-preview" style={{ background: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            {broadcastMessage}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            <strong>Action CTA:</strong> {cta}
          </div>
        </div>
      );
    }

    if (channel === 'IN_STORE_POSTER') {
      const headline = (content.headline as string) || '';
      const subheading = (content.subheading as string) || '';
      const body = (content.body as string) || '';
      const cta = (content.cta as string) || '';

      return (
        <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '12px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-amber)', marginBottom: '8px' }}>
            {headline}
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
            {subheading}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto 12px' }}>
            {body}
          </p>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '4px', display: 'inline-block' }}>
            {cta}
          </div>
        </div>
      );
    }

    return null;
  };

  const getFullCopyText = (): string => {
    if (channel === 'GOOGLE_BUSINESS') {
      return `${content.headline}\n\n${content.body}\n\nCTA: ${content.ctaType}`;
    }
    if (channel === 'INSTAGRAM') {
      const tags = Array.isArray(content.localTags) ? content.localTags.join(' ') : '';
      return `${content.caption}\n\n${tags}`;
    }
    if (channel === 'WHATSAPP') {
      return `${content.broadcastMessage}`;
    }
    if (channel === 'IN_STORE_POSTER') {
      return `${content.headline}\n${content.subheading}\n\n${content.body}\n\n${content.cta}`;
    }
    return '';
  };

  return (
    <div className="channel-card">
      <div>
        <div className="channel-card-header">
          <span className={`channel-name ${meta?.badgeClass || 'channel-badge-google'}`}>
            {getChannelIcon()} {meta?.displayName || channel}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CampaignStatusBadge status={status} size="sm" />
            {status === 'ready' && (
              <button className="btn-secondary" style={{ fontSize: '12px', padding: '5px 10px' }} onClick={() => handleCopy(getFullCopyText())}>
                {copied ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
        </div>

        {renderChannelBody()}
      </div>

      <div className="channel-footer">
        <span className="char-counter">{meta?.description || 'Validated Schema'}</span>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: status === 'ready' ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
          {status === 'ready' ? 'VALIDATED' : status.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
