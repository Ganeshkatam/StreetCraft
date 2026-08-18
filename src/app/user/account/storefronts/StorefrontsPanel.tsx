'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Plus } from 'lucide-react';
import { AccountBusinessMembership, AccountEntitlement } from '../../../../lib/server/account/getAccountProfile';

interface StorefrontsPanelProps {
  businesses: AccountBusinessMembership[];
  entitlement: AccountEntitlement;
}

export const StorefrontsPanel: React.FC<StorefrontsPanelProps> = ({ businesses, entitlement }) => {
  const router = useRouter();

  return (
    <div className="account-pane-fields">
      <div className="account-stores-header">
        <div className="account-field-meta-label">
          AUTHORIZED BUSINESSES ({businesses.length} OF {entitlement.businessLimit ?? '\u221E'})
        </div>

        <button
          type="button"
          onClick={() => router.push('/setup')}
          className="account-field-edit-action"
        >
          <Plus size={14} />
          <span>Add Storefront</span>
        </button>
      </div>

      {businesses.length === 0 ? (
        <div className="account-empty-state">
          <p>No storefronts linked to this account yet.</p>
          <button
            type="button"
            onClick={() => router.push('/setup')}
            className="btn-primary"
          >
            Complete Store Setup
          </button>
        </div>
      ) : (
        <div className="account-stores-list">
          {businesses.map((biz, index) => {
            const numberPrefix = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;
            return (
              <div key={biz.id} className="account-store-row">
                <div className="account-store-left">
                  <span className="account-store-index">{numberPrefix}</span>
                  <div>
                    <div className="account-store-name-row">
                      <span className="account-store-name">{biz.name}</span>
                      <span className="account-store-role-badge">
                        {biz.role.toUpperCase()}
                      </span>
                    </div>
                    <div className="account-store-meta">
                      Active &bull; {entitlement.planName || 'Neighborhood Starter'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(`/user/business?biz=${biz.id}`)}
                  className="account-field-edit-action"
                >
                  <span>Open</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
