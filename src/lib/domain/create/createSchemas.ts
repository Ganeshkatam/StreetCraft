import { z } from 'zod';

export const CampaignTypeEnum = z.enum([
  'WEEKDAY_BOOST',
  'WEEKEND_MAGNET',
  'MENU_LAUNCH',
  'FESTIVAL_SPECIAL',
  'REVIEW_SPOTLIGHT',
  'WIN_BACK_REGULARS',
]);

export const CampaignObjectiveEnum = z.enum([
  'MORE_WALK_INS',
  'MORE_ORDERS',
  'MORE_BOOKINGS',
  'PROMOTE_PRODUCT',
  'BRING_BACK_CUSTOMERS',
  'REPEAT_VISITS',
  'INCREASE_AWARENESS',
  'WEEKEND_CROWD',
  'FESTIVAL_RUSH',
  'MORE_REVIEWS',
  'CUSTOMER_RETENTION',
]);

export const CreatePresetSchema = z.object({
  type: CampaignTypeEnum.optional(),
  objective: CampaignObjectiveEnum.optional(),
  offer_title: z.string().trim().max(100, 'Offer title cannot exceed 100 characters.').optional(),
  offer_desc: z.string().trim().max(300, 'Offer description cannot exceed 300 characters.').optional(),
  offer_value: z.string().trim().max(100, 'Offer value cannot exceed 100 characters.').optional(),
  offer_terms: z.string().trim().max(200, 'Offer terms cannot exceed 200 characters.').optional(),
  timing_label: z.string().trim().max(80, 'Timing label cannot exceed 80 characters.').optional(),
  custom_notes: z.string().trim().max(500, 'Custom notes cannot exceed 500 characters.').optional(),
});

export const CreateCampaignInputSchema = z.object({
  businessId: z.string().uuid('Invalid business identifier.'),
  generationRequestId: z.string().uuid('Invalid generation request identifier.').optional(),
  type: CampaignTypeEnum,
  objective: CampaignObjectiveEnum,
  audience: z.string().trim().max(200, 'Audience description cannot exceed 200 characters.').optional(),
  offer: z.object({
    title: z.string().trim().min(2, 'Offer title must be at least 2 characters.').max(100, 'Offer title cannot exceed 100 characters.'),
    description: z.string().trim().min(5, 'Offer description must be at least 5 characters.').max(300, 'Offer description cannot exceed 300 characters.'),
    value: z.string().trim().max(100).optional(),
    terms: z.string().trim().max(200).optional(),
  }),
  schedule: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    timingLabel: z.string().trim().max(80).optional(),
  }),
  customNotes: z.string().trim().max(500).optional(),
});
