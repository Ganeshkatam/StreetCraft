'use client';

import React from 'react';
import { EditableField } from '../../../../components/EditableField';
import { BusinessProfile } from '../../../../../../lib/server/business/getBusinessProfile';
import { updateBusinessProfile } from '../../../../../../lib/server/business/updateBusinessProfile';

interface StoreContactPanelProps {
  profile: BusinessProfile;
}

export const StoreContactPanel: React.FC<StoreContactPanelProps> = ({ profile }) => {
  const businessId = profile.business_id;

  const saveField = async (field: keyof BusinessProfile, value: string): Promise<{ success: boolean; error?: string }> => {
    const formData = new FormData();
    formData.set('name', profile.name || '');
    formData.set('category', profile.category || '');
    formData.set('neighborhood', profile.neighborhood || '');
    formData.set('city', profile.city || '');
    formData.set('landmarks', profile.landmarks || '');
    formData.set('target_customer', profile.target_customer || '');
    formData.set('style_voice', profile.style_voice || '');
    formData.set('signature_items', profile.signature_items || '');
    formData.set('primary_goal', profile.primary_goal || '');
    formData.set('peak_hours', profile.peak_hours || '');
    formData.set('slow_hours', profile.slow_hours || '');
    formData.set('default_offer', profile.default_offer || '');
    formData.set('avg_ticket_inr', profile.avg_ticket_inr ? String(profile.avg_ticket_inr) : '');
    formData.set('target_monthly_customers', profile.target_monthly_customers ? String(profile.target_monthly_customers) : '');
    formData.set('phone_whatsapp', field === 'phone_whatsapp' ? value : profile.phone_whatsapp || '');

    const res = await updateBusinessProfile(businessId, { success: false }, formData);
    if (!res.success) {
      const err = res.errors?.[field as string]?.[0] || res.message || 'Failed to update contact info.';
      return { success: false, error: err };
    }
    return { success: true };
  };

  return (
    <div className="account-pane">
      <div className="account-pane-header">
        <span className="account-pane-tag">STORE CONTACT</span>
        <h1 className="account-pane-title">Direct Communications</h1>
        <p className="account-pane-subtitle">
          Manage verified telephone and WhatsApp dispatch channel for automated campaign notices.
        </p>
      </div>

      <div className="account-pane-fields">
        <EditableField
          label="Store WhatsApp &amp; Phone"
          value={profile.phone_whatsapp || ''}
          placeholder="e.g. +91 98765 43210"
          type="text"
          onSave={async (val) => { await saveField('phone_whatsapp', String(val)); }}
        />

        <div className="account-field-row" style={{ alignItems: 'flex-start' }}>
          <div className="account-field-info" style={{ width: '100%' }}>
            <div className="account-field-label">COMMUNICATION DISPATCH</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', width: '100%' }}>
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-ink)' }}>WhatsApp Dispatch Channel</div>
                <div className="account-field-helper" style={{ marginTop: '2px' }}>
                  Campaign notifications and draft confirmations route to this verified business line.
                </div>
              </div>
              <span className="account-badge-verified">
                Direct Routing
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
