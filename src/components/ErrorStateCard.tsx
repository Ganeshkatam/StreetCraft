import React, { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateCardProps {
  title?: string;
  message?: string;
  onRetry?: () => Promise<void> | void;
  actionLabel?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  style?: React.CSSProperties;
}

export const ErrorStateCard: React.FC<ErrorStateCardProps> = ({
  title = 'Unable to load content',
  message = 'We encountered a temporary connection issue while communicating with the server. Please try again.',
  onRetry,
  actionLabel = 'Try Again',
  secondaryAction,
  style,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: '32px 28px',
        textAlign: 'center',
        maxWidth: '520px',
        margin: '24px auto',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-subtle)',
        ...style,
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(197, 48, 48, 0.08)',
          color: '#C53030',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        <AlertCircle size={22} />
      </div>

      <h3
        style={{
          fontSize: '18px',
          fontFamily: 'var(--font-display)',
          color: 'var(--color-ink)',
          marginBottom: '8px',
          fontWeight: 600,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '13.5px',
          color: 'var(--color-ink-muted)',
          lineHeight: '1.5',
          marginBottom: onRetry || secondaryAction ? '20px' : '0',
        }}
      >
        {message}
      </p>

      {(onRetry || secondaryAction) && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {onRetry && (
            <button
              type="button"
              className="btn-primary"
              onClick={handleRetry}
              disabled={isRetrying}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '13px' }}
            >
              <RefreshCw size={14} className={isRetrying ? 'spin' : ''} />
              {isRetrying ? 'Retrying...' : actionLabel}
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              className="btn-secondary"
              onClick={secondaryAction.onClick}
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
