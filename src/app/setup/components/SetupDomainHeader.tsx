'use client';

import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface SetupDomainHeaderProps {
  stepNumber: string;
  domainName: string;
  title: string;
  subtitle: string;
  businessId?: string;
}

export function SetupDomainHeader({
  stepNumber,
  domainName,
  title,
  subtitle,
  businessId,
}: SetupDomainHeaderProps) {
  const exitHref = businessId ? `/user/today?biz=${encodeURIComponent(businessId)}` : '/user/today';

  return (
    <div className="setup-canvas-header">
      <div>
        <span className="setup-eyebrow">
          STEP {stepNumber} &bull; {domainName.toUpperCase()}
        </span>
        <h1 className="setup-title">{title}</h1>
        <p className="setup-subtitle">{subtitle}</p>
      </div>

      <Link
        href={exitHref}
        className="setup-exit-pill"
        title="Exit to Today Workspace"
      >
        <X size={14} />
        <span>Exit</span>
      </Link>
    </div>
  );
}
