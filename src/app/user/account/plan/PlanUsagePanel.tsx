'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { AccountEntitlement, AccountBusinessMembership } from '../../../../lib/server/account/getAccountProfile';

interface PlanUsagePanelProps {
  entitlement: AccountEntitlement;
  businesses: AccountBusinessMembership[];
}

export const PlanUsagePanel: React.FC<PlanUsagePanelProps> = ({ entitlement, businesses }) => {
  const planTitle = entitlement.planName || 'Neighborhood Starter';
  const businessLimit = entitlement.businessLimit ?? 2;
  const storeCount = businesses.length;

  return (
    <div className="account-pane-fields">
      {/* PLAN TIER ROW */}
      <div className="account-field-row">
        <div className="account-field-meta-label">
          ACTIVE PLAN
        </div>

        <div className="account-field-content-row">
          <div>
            <div className="account-plan-title">{entitlement.planName || 'Neighborhood Starter'}</div>
            <div className="account-plan-status">
              Active subscription tier &bull; Status: {entitlement.status || 'Active'}
            </div>
          </div>

          <div className="account-plan-status-pill">
            <Sparkles size={11} />
            <span>ACTIVE</span>
          </div>
        </div>

        <div className="account-field-row-divider" />
      </div>

      {/* STOREFRONT USAGE ROW */}
      <div className="account-field-row">
        <div className="account-field-meta-label">
          STOREFRONTS
        </div>

        <div className="account-field-content-row">
          <div>
            <div className="account-plan-title">
              {storeCount} / {businessLimit} connected
            </div>
            <div className="account-plan-sub">
              Authorized storefront capacity for this workspace
            </div>
          </div>

          <div className="account-plan-ratio-badge">
            {storeCount} OF {businessLimit}
          </div>
        </div>

        <div className="account-field-row-divider" />
      </div>

      {/* BILLING REDIRECTION ROW */}
      <div className="account-field-row">
        <div className="account-field-meta-label">
          COMMERCIAL BILLING & INVOICES
        </div>

        <div className="account-field-content-row">
          <div>
            <div className="account-plan-title">Commercial subscription management</div>
            <div className="account-plan-sub">Invoices, payment methods, and tier upgrades</div>
          </div>

          <Link href="/user/myplan" className="account-field-edit-action">
            <span>Manage My Plan</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="account-field-row-divider" />
      </div>
    </div>
  );
};
