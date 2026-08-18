'use client';

import React from 'react';
import { EditableAccountField } from '../../account/identity/EditableAccountField';
import { BusinessProfile } from '../../../../lib/server/business/getBusinessProfile';
import { updateBusinessProfile } from '../../../../lib/server/business/updateBusinessProfile';

interface StoreOfferPanelProps {
  businessId: string;
  profile: BusinessProfile;
}

export const StoreOfferPanel: React.FC<StoreOfferPanelProps> = ({ businessId, profile }) => {
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
    <div className="account-pane-fields">
      <EditableAccountField
        label="Signature Menu Items / Bestsellers"
        value={profile.signature_items || ''}
        placeholder="e.g. Sourdough Croissants, Cold Brew, Truffle Pasta"
        type="text"
        onSave={(val) => saveField('signature_items', val)}
      />

      <EditableAccountField
        label="Default Promotional Offer"
        value={profile.default_offer || ''}
        placeholder="e.g. Complimentary beverage with any dessert after 4 PM"
        type="text"
        onSave={(val) => saveField('default_offer', val)}
      />

      <EditableAccountField
        label="Average Order Value (₹ INR)"
        value={profile.avg_ticket_inr ? String(profile.avg_ticket_inr) : ''}
        placeholder="e.g. 450"
        type="number"
        onSave={(val) => saveField('avg_ticket_inr', val)}
      />

      <EditableAccountField
        label="Target Monthly Footfall / Customers"
        value={profile.target_monthly_customers ? String(profile.target_monthly_customers) : ''}
        placeholder="e.g. 1200"
        type="number"
        onSave={(val) => saveField('target_monthly_customers', val)}
      />
    </div>
  );
};
