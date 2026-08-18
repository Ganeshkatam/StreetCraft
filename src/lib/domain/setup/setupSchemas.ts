import { z } from 'zod';

const emptyStringIfEmpty = (val: unknown) => {
  if (typeof val !== 'string') return '';
  return val.trim();
};

export const CreateStoreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Store name must be at least 2 characters')
    .max(60, 'Store name must be less than 60 characters'),
  category: z
    .string()
    .trim()
    .min(2, 'Please select a business category')
    .max(60, 'Category must be less than 60 characters'),
  claimToken: z.preprocess(emptyStringIfEmpty, z.string().optional()),
});

export const IdentityDomainSchema = z.object({
  name: z.string().trim().min(2, 'Store name must be at least 2 characters').max(60),
  category: z.string().trim().min(2, 'Store category is required').max(60),
});

export const LocationDomainSchema = z.object({
  neighborhood: z.string().trim().min(2, 'Neighborhood / Area is required').max(100),
  city: z.string().trim().min(2, 'City is required').max(100),
  landmarks: z.string().trim().max(150).optional(),
});

export const ProductsDomainSchema = z.object({
  signature_items: z.string().trim().min(2, 'Please specify your key products or specialty items'),
});

export const CustomersDomainSchema = z.object({
  target_customer: z.string().trim().min(2, 'Target customer demographic is required'),
  target_monthly_customers: z.coerce.number().int().positive().optional().nullable(),
});

export const OfferDomainSchema = z.object({
  default_offer: z.string().trim().min(2, 'Default promotional offer is required'),
  primary_goal: z.string().trim().optional().nullable(),
  avg_ticket_inr: z.coerce.number().int().positive().optional().nullable(),
});

export const BrandDomainSchema = z.object({
  style_voice: z.string().trim().optional().nullable(),
});

export const OperationsDomainSchema = z.object({
  peak_hours: z.string().trim().optional().nullable(),
  slow_hours: z.string().trim().optional().nullable(),
});

export const ContactDomainSchema = z.object({
  phone_whatsapp: z.string().trim().optional().nullable(),
});
