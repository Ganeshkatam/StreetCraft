'use client';

import React from 'react';
import { EditableField } from '../../components/EditableField';
import { BusinessProfile } from '../../../../lib/server/business/getBusinessProfile';
import { updateBusinessProfile } from '../../../../lib/server/business/updateBusinessProfile';

interface StoreContactPanelProps {
  businessId: string;
  profile: BusinessProfile;
}

export const StoreContactPanel: React.FC<StoreContactPanelProps> = ({ businessId, profile }) => {
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
    <div className="account-pane-fields">
      <EditableField
        label="Store WhatsApp & Phone"
        value={profile.phone_whatsapp || ''}
        placeholder="e.g. +91 98765 43210"
        type="text"
        onSave={async (val) => { await saveField('phone_whatsapp', String(val)); }}
      />

      <div className="account-field-row">
        <div className="account-field-meta-label">
          COMMUNICATION DISPATCH
        </div>

        <div className="account-field-content-row">
          <div>
            <div className="account-notif-title">WhatsApp Dispatch Channel</div>
            <div className="account-notif-desc">Campaign notifications and draft confirmations route to this verified business line.</div>
          </div>

          <div className="account-auth-identity-pill">
            <span>Direct Routing</span>
          </div>
        </div>

        <div className="account-field-row-divider" />
      </div>
    </div>
  );
};
