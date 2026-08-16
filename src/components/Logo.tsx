import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showWordmark = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 20,
    md: 26,
    lg: 36,
  };

  const textSizes = {
    sm: { title: '16px', subtitle: '9px' },
    md: { title: '20px', subtitle: '10.5px' },
    lg: { title: '28px', subtitle: '12px' },
  };

  const dim = iconSizes[size];

  return (
    <div
      className={`brand-logo-lockup ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '8px' : size === 'lg' ? '14px' : '10px',
        userSelect: 'none',
      }}
    >
      {/* Precision Vector Emblem: Storefront Awning + 4-Point Street Compass */}
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Storefront Foundation / Awning Structure */}
        <path
          d="M5 13L8 5H24L27 13"
          stroke="var(--color-ink)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Awning Vertical Pleats */}
        <path
          d="M11 5V13M16 5V13M21 5V13"
          stroke="var(--color-border-dark, var(--color-ink-muted))"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Scalloped Awning Edge / Shop Entrance */}
        <path
          d="M5 13C6.5 13 8 11.5 8 13C8 14.5 11 14.5 11 13C11 14.5 14 14.5 14 13C14 14.5 18 14.5 18 13C18 14.5 21 14.5 21 13C21 14.5 24 14.5 24 13C24 11.5 25.5 13 27 13"
          stroke="var(--color-primary)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lower Storefront Boundary */}
        <path
          d="M6 13V26C6 26.5523 6.44772 27 7 27H25C25.5523 27 26 26.5523 26 26V13"
          stroke="var(--color-ink)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Central 4-Direction Street Craft Compass */}
        <path
          d="M16 16L17.5 19.5L21 21L17.5 22.5L16 26L14.5 22.5L11 21L14.5 19.5L16 16Z"
          fill="var(--color-accent)"
          stroke="var(--color-accent)"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="21" r="1.2" fill="var(--color-surface)" />
      </svg>

      {/* Editorial Wordmark */}
      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: textSizes[size].title,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--color-ink)',
            }}
          >
            STREETCRAFT
          </span>
        </div>
      )}
    </div>
  );
};
