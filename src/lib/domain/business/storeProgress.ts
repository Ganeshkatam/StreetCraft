import { BusinessProfile } from '../../server/business/getBusinessProfile';

export interface StoreProgressInfo {
  percentage: number;
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
  missingFields: string[];
}

export function computeStoreProgress(profile: Partial<BusinessProfile> | null | undefined): StoreProgressInfo {
  if (!profile) {
    return {
      percentage: 0,
      completedCount: 0,
      totalCount: 8,
      isComplete: false,
      missingFields: ['Basic Identity', 'Location', 'Hours', 'Goal', 'Offer', 'Economics', 'Contact', 'Logo'],
    };
  }

  const checklist: Array<{ label: string; done: boolean }> = [
    { label: 'Store Name & Category', done: Boolean(profile.name?.trim() && profile.category?.trim()) },
    { label: 'City & Neighborhood', done: Boolean(profile.city?.trim() || profile.neighborhood?.trim()) },
    { label: 'Brand Voice / Tone', done: Boolean(profile.style_voice?.trim() || profile.landmarks?.trim()) },
    { label: 'Operating Hours', done: Boolean(profile.peak_hours?.trim() || profile.slow_hours?.trim()) },
    { label: 'Growth Goal & Audience', done: Boolean(profile.primary_goal?.trim() || profile.target_customer?.trim()) },
    { label: 'Signature Items & Offer', done: Boolean(profile.signature_items?.trim() || profile.default_offer?.trim()) },
    { label: 'Pricing & Ticket Size', done: Boolean(profile.avg_ticket_inr || profile.target_monthly_customers) },
    { label: 'WhatsApp / Phone', done: Boolean(profile.phone_whatsapp?.trim()) },
    { label: 'Storefront Logo / Photo', done: Boolean(profile.logo_url?.trim()) },
  ];

  const completedCount = checklist.filter((item) => item.done).length;
  const totalCount = checklist.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const missingFields = checklist.filter((item) => !item.done).map((item) => item.label);

  return {
    percentage,
    completedCount,
    totalCount,
    isComplete: percentage === 100,
    missingFields,
  };
}
