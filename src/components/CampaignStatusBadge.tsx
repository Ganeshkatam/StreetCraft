import React from 'react';
import { CampaignStatus, ChannelStatus } from '../types/campaign';
import { Loader2, CheckCircle2, AlertCircle, Clock, Archive } from 'lucide-react';

interface CampaignStatusBadgeProps {
  status: CampaignStatus | ChannelStatus;
  size?: 'sm' | 'md';
}

export const CampaignStatusBadge: React.FC<CampaignStatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  if (normalized === 'generating') {
    return (
      <span className="status-badge status-generating" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <Loader2 size={size === 'sm' ? 12 : 14} className="spin-animate" />
        Generating
      </span>
    );
  }

  if (normalized === 'ready') {
    return (
      <span className="status-badge status-published" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <CheckCircle2 size={size === 'sm' ? 12 : 14} />
        Ready
      </span>
    );
  }

  if (normalized === 'published') {
    return (
      <span className="status-badge status-published" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <CheckCircle2 size={size === 'sm' ? 12 : 14} />
        Published
      </span>
    );
  }

  if (normalized === 'completed') {
    return (
      <span className="status-badge status-completed" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <Clock size={size === 'sm' ? 12 : 14} />
        Completed
      </span>
    );
  }

  if (normalized === 'archived') {
    return (
      <span className="status-badge status-archived" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <Archive size={size === 'sm' ? 12 : 14} />
        Archived
      </span>
    );
  }

  if (normalized === 'failed') {
    return (
      <span className="status-badge status-failed" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <AlertCircle size={size === 'sm' ? 12 : 14} />
        Failed
      </span>
    );
  }

  return (
    <span className="status-badge status-draft">
      {status}
    </span>
  );
};
