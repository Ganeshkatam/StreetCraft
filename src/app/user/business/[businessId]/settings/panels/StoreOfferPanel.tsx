'use client';

import React from 'react';
import { EditableField } from '../../../../components/EditableField';
import { BusinessProfile } from '../../../../../../lib/server/business/getBusinessProfile';
import { updateBusinessProfile } from '../../../../../../lib/server/business/updateBusinessProfile';
import { getOfferOptionsForCategory, getSignatureItemsPlaceholder } from '../../../../../../config/storeOptions';

interface StoreOfferPanelProps {
  profile: BusinessProfile;
}

export const StoreOfferPanel: React.FC<StoreOfferPanelProps> = ({ profile }) => {
  const businessId = profile.business_id;
  const offerOptions = getOfferOptionsForCategory(profile.category);
  const signatureItemsPlaceholder = getSignatureItemsPlaceholder(profile.category);

  const saveField = async (field: keyof BusinessProfile, value: string): Promise<{ success: boolean; error?: string }> => {
    const formData = new FormData();
    formData.set('name', profile.name || '');
    formData.set('category', profile.category || '');
    formData.set('neighborhood', profile.neighborhood || '');
    formData.set('city', profile.city || '');
    formData.set('landmarks', profile.landmarks || '');
    formData.set('target_customer', profile.target_customer || '');
    formData.set('style_voice', profile.style_voice || '');
    formData.set('signature_items', field === 'signature_items' ? value : profile.signature_items || '');
    formData.set('primary_goal', profile.primary_goal || '');
    formData.set('peak_hours', profile.peak_hours || '');
    formData.set('slow_hours', profile.slow_hours || '');
    formData.set('default_offer', field === 'default_offer' ? value : profile.default_offer || '');
    formData.set('avg_ticket_inr', field === 'avg_ticket_inr' ? value : (profile.avg_ticket_inr ? String(profile.avg_ticket_inr) : ''));
    formData.set('target_monthly_customers', field === 'target_monthly_customers' ? value : (profile.target_monthly_customers ? String(profile.target_monthly_customers) : ''));
    formData.set('phone_whatsapp', profile.phone_whatsapp || '');

    const res = await updateBusinessProfile(businessId, { success: false }, formData);
    if (!res.success) {
      const err = res.errors?.[field as string]?.[0] || res.message || 'Failed to update offer economics.';
      return { success: false, error: err };
    }
    return { success: true };
  };

  return (
    <div className="account-pane">
      <div className="account-pane-header">
        <span className="account-pane-tag">OFFER &amp; ECONOMICS</span>
        <h1 className="account-pane-title">Promotions &amp; Pricing</h1>
        <p className="account-pane-subtitle">
          Manage signature menu bestsellers, default promotional offers, and monthly target walk-ins.
        </p>
      </div>

      <div className="account-pane-fields">
        <EditableField
          label="Signature Menu Items / Bestsellers"
          value={profile.signature_items || ''}
          placeholder={signatureItemsPlaceholder}
          type="text"
          onSave={async (val) => { await saveField('signature_items', String(val)); }}
        />

        <EditableField
          label="Default Promotional Offer"
          value={profile.default_offer || ''}
          placeholder="Select a promotional offer or create custom"
          type="select"
          options={offerOptions}
          onSave={async (val) => { await saveField('default_offer', String(val)); }}
        />

        <EditableField
          label="Average Order Value (INR)"
          value={profile.avg_ticket_inr ? String(profile.avg_ticket_inr) : ''}
          placeholder="e.g. 450"
          type="text"
          onSave={async (val) => { await saveField('avg_ticket_inr', String(val)); }}
        />

        <EditableField
          label="Monthly Walk-in Target"
          value={profile.target_monthly_customers ? String(profile.target_monthly_customers) : ''}
          placeholder="e.g. 1500"
          type="text"
          onSave={async (val) => { await saveField('target_monthly_customers', String(val)); }}
        />
      </div>
    </div>
  );
};
