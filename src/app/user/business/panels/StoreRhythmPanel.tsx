'use client';

import React from 'react';
import { EditableField } from '../../components/EditableField';
import { BusinessProfile } from '../../../../lib/server/business/getBusinessProfile';
import { updateBusinessProfile } from '../../../../lib/server/business/updateBusinessProfile';

import {
  getPeakHoursOptionsForCategory,
  getSlowHoursOptionsForCategory,
  getGoalOptionsForCategory,
  getTargetCustomerOptionsForCategory,
} from '../../../../config/storeOptions';

interface StoreRhythmPanelProps {
  businessId: string;
  profile: BusinessProfile;
}

export const StoreRhythmPanel: React.FC<StoreRhythmPanelProps> = ({ businessId, profile }) => {
  const peakHoursOptions = getPeakHoursOptionsForCategory(profile.category);
  const slowHoursOptions = getSlowHoursOptionsForCategory(profile.category);
  const goalOptions = getGoalOptionsForCategory(profile.category);
  const targetCustomerOptions = getTargetCustomerOptionsForCategory(profile.category);

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
      <EditableField
        label="Peak Operating Hours"
        value={profile.peak_hours || ''}
        placeholder="Select or enter peak hours"
        type="select"
        options={peakHoursOptions}
        onSave={async (val) => { await saveField('peak_hours', String(val)); }}
      />

      <EditableField
        label="Slow / Quiet Hours"
        value={profile.slow_hours || ''}
        placeholder="Select or enter slow hours"
        type="select"
        options={slowHoursOptions}
        onSave={async (val) => { await saveField('slow_hours', String(val)); }}
      />

      <EditableField
        label="Primary Business Goal"
        value={profile.primary_goal || ''}
        placeholder="Select primary business goal"
        type="select"
        options={goalOptions}
        onSave={async (val) => { await saveField('primary_goal', String(val)); }}
      />

      <EditableField
        label="Target Customer Demographic"
        value={profile.target_customer || ''}
        placeholder="Select target customer demographic"
        type="select"
        options={targetCustomerOptions}
        onSave={async (val) => { await saveField('target_customer', String(val)); }}
      />
    </div>
  );
};
