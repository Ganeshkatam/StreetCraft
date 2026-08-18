'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DomainProgressItem } from '../../../lib/server/setup/deriveSetupProgress';
import { Check, CircleDot, Circle } from 'lucide-react';

interface SetupRailProps {
  businessId?: string;
  domainList: DomainProgressItem[];
}

export function SetupRail({ businessId, domainList }: SetupRailProps) {
  const pathname = usePathname();

  return (
    <div className="setup-rail-container">
      <div className="setup-rail-header">
        <span className="setup-rail-eyebrow">STORE SETUP</span>
        <h3 className="setup-rail-title">Domain Map</h3>
      </div>

      <nav className="setup-rail-nav">
        {domainList.map((item) => {
          const isActive = pathname === item.route;
          const href = businessId ? `${item.route}?biz=${encodeURIComponent(businessId)}` : item.route;
          // If no business has been created yet, domains other than identity are disabled
          const isClickable = Boolean(businessId) || item.key === 'identity';

          return isClickable ? (
            <Link
              key={item.key}
              href={href}
              className={`setup-rail-item ${isActive ? 'active' : ''}`}
            >
              <div className="setup-rail-item-num">{item.stepNumber}</div>
              <div className="setup-rail-item-info">
                <div className="setup-rail-item-label">{item.label}</div>
                <div className="setup-rail-item-class">{item.classification}</div>
              </div>
              <div className="setup-rail-item-status">
                {item.status === 'COMPLETE' ? (
                  <span className="setup-status-badge complete" title="Complete">
                    <Check size={12} strokeWidth={3} />
                  </span>
                ) : item.status === 'PARTIAL' ? (
                  <span className="setup-status-badge partial" title="In Progress">
                    <CircleDot size={12} strokeWidth={2.5} />
                  </span>
                ) : item.status === 'OPTIONAL' ? (
                  <span className="setup-status-badge optional" title="Optional">
                    Opt
                  </span>
                ) : (
                  <span className="setup-status-badge empty" title="Incomplete">
                    <Circle size={10} strokeWidth={2} />
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <div
              key={item.key}
              className="setup-rail-item disabled"
            >
              <div className="setup-rail-item-num">{item.stepNumber}</div>
              <div className="setup-rail-item-info">
                <div className="setup-rail-item-label">{item.label}</div>
                <div className="setup-rail-item-class">{item.classification}</div>
              </div>
              <div className="setup-rail-item-status">
                <span className="setup-status-badge locked">
                  <Circle size={10} />
                </span>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
