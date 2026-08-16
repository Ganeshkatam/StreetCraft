import React, { useState } from 'react';
import { ChannelType, ChannelStatus } from '../types/campaign';
import { CHANNELS } from '../config/channels';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import { Copy, Check, Newspaper, Image, MessageSquare, Send, QrCode } from 'lucide-react';

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
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const getChannelIcon = () => {
    switch (channel) {
      case 'GOOGLE_BUSINESS':
        return <Newspaper size={16} color="#60A5FA" />;
      case 'INSTAGRAM':
        return <Image size={16} color="#F472B6" />;
      case 'WHATSAPP':
        return <MessageSquare size={16} color="#4ADE80" />;
      case 'IN_STORE_POSTER':
        return <Send size={16} color="#FBBF24" />;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const renderChannelBody = () => {
    if (status === 'generating') {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div className="spin-animate" style={{ display: 'inline-block', width: '28px', height: '28px', border: '2px solid rgba(16, 185, 129, 0.2)', borderTopColor: 'var(--accent-emerald)', borderRadius: '50%', marginBottom: '12px' }} />
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Generating {meta?.displayName}...</div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Enforcing character limits and local neighborhood context</p>
        </div>
      );
    }

    if (status === 'pending') {
      return (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          Queued in multi-channel sequence...
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
          <div style={{ background: '#0B1220', border: '1px solid rgba(96, 165, 250, 0.25)', borderRadius: 'var(--radius-sm)', padding: '18px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#93C5FD' }}>Google Search & Maps Update</span>
              </div>
              <span style={{ fontSize: '10.5px', background: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>VERIFIED LISTING</span>
            </div>

            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.4' }}>
              {headline}
            </div>

            <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '14px' }}>
              {body}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', color: '#93C5FD', fontWeight: 600 }}>{offerSummary}</span>
              <button
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => handleCopy(`${headline}\n\n${body}\n\nAction: ${ctaType}`)}
              >
                {ctaType} &rarr;
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (channel === 'INSTAGRAM') {
      const reelHook = (content.reelHook as string) || '';
      const caption = (content.caption as string) || '';
      const storyFrames = (content.storyFrames as string[]) || [];
      const localTags = (content.localTags as string[]) || [];

      return (
        <div>
          <div style={{ background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.1) 0%, #0B1220 100%)', border: '1px solid rgba(244, 114, 182, 0.25)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: '14px' }}>
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#F472B6', textTransform: 'uppercase' }}>
              REEL / STORY HOOK
            </span>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
              "{reelHook}"
            </div>
          </div>

          {storyFrames.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${storyFrames.length}, 1fr)`, gap: '8px', marginBottom: '14px' }}>
              {storyFrames.map((frame, idx) => (
                <div key={idx} style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '10px', fontSize: '11.5px', color: '#E2E8F0', lineHeight: '1.4' }}>
                  <span style={{ display: 'block', fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: '#F472B6', marginBottom: '2px' }}>STORY 0{idx + 1}</span>
                  {frame}
                </div>
              ))}
            </div>
          )}

          <div className="channel-content-preview">
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>POST CAPTION</div>
            {caption}
          </div>

          {localTags.length > 0 && (
            <div className="channel-tags">
              {localTags.map((tag, i) => (
                <button
                  key={i}
                  className="channel-tag"
                  onClick={() => handleCopyTag(tag)}
                  title="Click to copy hashtag"
                >
                  {copiedTag === tag ? 'Copied' : tag}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (channel === 'WHATSAPP') {
      const broadcastMessage = (content.broadcastMessage as string) || '';
      const cta = (content.cta as string) || '';

      return (
        <div>
          <div style={{ background: '#081414', border: '1px solid rgba(74, 222, 128, 0.25)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#4ADE80' }}>WhatsApp Broadcast</span>
              <span style={{ fontSize: '10px', background: 'rgba(74, 222, 128, 0.15)', color: '#4ADE80', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>DIRECT PUSH</span>
            </div>

            <div style={{ background: '#07362E', borderRadius: '8px 8px 8px 2px', padding: '12px 14px', color: '#E9EDEF', fontSize: '13.5px', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '10px' }}>
              {broadcastMessage}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>CTA: <strong>{cta}</strong></span>
              <button className="btn-ghost" style={{ fontSize: '11px', color: '#4ADE80' }} onClick={() => handleCopy(broadcastMessage)}>
                Copy text
              </button>
            </div>
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
        <div>
          <div style={{ background: 'linear-gradient(135deg, #1A1A12 0%, #0F1626 100%)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: 'var(--radius-sm)', padding: '20px', textAlign: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#FBBF24', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {headline}
            </span>

            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '6px 0 8px' }}>
              {subheading}
            </h4>

            <p style={{ fontSize: '13px', color: '#CBD5E1', maxWidth: '400px', margin: '0 auto 14px', lineHeight: '1.5' }}>
              {body}
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '6px 14px', borderRadius: 'var(--radius-xs)', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>
              <QrCode size={13} color="#FBBF24" />
              <span>{cta}</span>
            </div>
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
      <div className="channel-card-header">
        <span className="channel-name">
          {getChannelIcon()} {meta?.displayName || channel}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CampaignStatusBadge status={status} size="sm" />
          {status === 'ready' && (
            <button
              className="btn-secondary"
              style={{ fontSize: '11.5px', padding: '4px 10px' }}
              onClick={() => handleCopy(getFullCopyText())}
            >
              {copied ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {renderChannelBody()}

      <div className="channel-meta-bar">
        <span>{meta?.description || 'Validated schema'}</span>
        <span style={{ color: status === 'ready' ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
          {status === 'ready' ? 'READY' : status.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
