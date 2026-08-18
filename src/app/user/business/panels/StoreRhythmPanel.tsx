'use client';

import React from 'react';
import { EditableAccountField } from '../../account/identity/EditableAccountField';
import { BusinessProfile } from '../../../../lib/server/business/getBusinessProfile';
import { updateBusinessProfile } from '../../../../lib/server/business/updateBusinessProfile';

import {
  PEAK_HOURS_OPTIONS,
  SLOW_HOURS_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  TARGET_CUSTOMER_OPTIONS,
} from '../../../../config/storeOptions';

interface StoreRhythmPanelProps {
  businessId: string;
  profile: BusinessProfile;
}

export const StoreRhythmPanel: React.FC<StoreRhythmPanelProps> = ({ businessId, profile }) => {
  const saveField = async (field: keyof BusinessProfile, value: string): Promise<{ success: boolean; error?: string }> => {
    const formData = new FormData();
    formData.set('name', profile.name || '');
    formData.set('category', profile.category || '');
    formData.set('neighborhood', profile.neighborhood || '');
    formData.set('city', profile.city || '');
    formData.set('landmarks', profile.landmarks || '');
    formData.set('target_customer', field === 'target_customer' ? value : profile.target_customer || '');
    formData.set('style_voice', profile.style_voice || '');
    formData.set('signature_items', profile.signature_items || '');
    formData.set('primary_goal', field === 'primary_goal' ? value : profile.primary_goal || '');
    formData.set('peak_hours', field === 'peak_hours' ? value : profile.peak_hours || '');
    formData.set('slow_hours', field === 'slow_hours' ? value : profile.slow_hours || '');
    formData.set('default_offer', profile.default_offer || '');
    formData.set('avg_ticket_inr', profile.avg_ticket_inr ? String(profile.avg_ticket_inr) : '');
    formData.set('target_monthly_customers', profile.target_monthly_customers ? String(profile.target_monthly_customers) : '');
    formData.set('phone_whatsapp', profile.phone_whatsapp || '');

    const res = await updateBusinessProfile(businessId, { success: false }, formData);
    if (!res.success) {
      const err = res.errors?.[field as string]?.[0] || res.message || 'Failed to update operating rhythm.';
      return { success: false, error: err };
    }
    return { success: true };
  };

  return (
    <div className="account-pane-fields">
      <EditableAccountField
        label="Peak Operating Hours"
        value={profile.peak_hours || ''}
        placeholder="Select or enter peak hours"
        options={PEAK_HOURS_OPTIONS}
        onSave={(val) => saveField('peak_hours', val)}
      />

      <EditableAccountField
        label="Slow / Quiet Hours"
        value={profile.slow_hours || ''}
        placeholder="Select or enter slow hours"
        options={SLOW_HOURS_OPTIONS}
        onSave={(val) => saveField('slow_hours', val)}
      />

      <EditableAccountField
        label="Primary Business Goal"
        value={profile.primary_goal || ''}
        placeholder="Select primary business goal"
        options={PRIMARY_GOAL_OPTIONS}
        onSave={(val) => saveField('primary_goal', val)}
      />

      <EditableAccountField
        label="Target Customer Demographic"
        value={profile.target_customer || ''}
        placeholder="Select target customer demographic"
        options={TARGET_CUSTOMER_OPTIONS}
        onSave={(val) => saveField('target_customer', val)}
      />
    </div>
  );
};
