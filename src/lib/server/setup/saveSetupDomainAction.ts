'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { createClient } from '../../supabase/server';

// 1. Closed Domain Schemas
const IdentityDomainSchema = z.object({
  name: z.string().trim().min(2, 'Store name must be at least 2 characters'),
  category: z.string().trim().min(2, 'Store category is required'),
});

const LocationDomainSchema = z.object({
  neighborhood: z.string().trim().min(2, 'Neighborhood / Area is required'),
  city: z.string().trim().min(2, 'City is required'),
  landmarks: z.string().trim().optional(),
});

const ProductsDomainSchema = z.object({
  signature_items: z.string().trim().min(2, 'Please specify your key products or specialty items'),
});

const CustomersDomainSchema = z.object({
  target_customer: z.string().trim().min(2, 'Target customer demographic is required'),
  target_monthly_customers: z.coerce.number().int().positive().optional().nullable(),
});

const OfferDomainSchema = z.object({
  default_offer: z.string().trim().min(2, 'Default promotional offer is required'),
  primary_goal: z.string().trim().optional().nullable(),
  avg_ticket_inr: z.coerce.number().int().positive().optional().nullable(),
});

const BrandDomainSchema = z.object({
  style_voice: z.string().trim().optional().nullable(),
});

const OperationsDomainSchema = z.object({
  peak_hours: z.string().trim().optional().nullable(),
  slow_hours: z.string().trim().optional().nullable(),
});

const ContactDomainSchema = z.object({
  phone_whatsapp: z.string().trim().optional().nullable(),
});

export type SetupDomainActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function saveSetupDomainAction(
  businessId: string,
  domain: 'identity' | 'location' | 'products' | 'customers' | 'offer' | 'brand' | 'operations' | 'contact',
  prevState: SetupDomainActionState,
  formData: FormData
): Promise<SetupDomainActionState> {
  try {
    // 1. Authenticate caller
    const claims = await requireAuthenticatedClaims('/setup');

    // 2. Validate tenant authorization
    const business = await resolveAuthorizedBusiness(claims.userId, businessId);
    if (!business) {
      return {
        success: false,
        message: 'Unauthorized: You do not have permission to manage this storefront.',
      };
    }

    const rawData = Object.fromEntries(formData.entries());
    const supabase = await createClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // 3. Closed Discriminated Union Execution
    switch (domain) {
      case 'identity': {
        const parsed = IdentityDomainSchema.safeParse(rawData);
        if (!parsed.success) {
          return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
          };
        }
        updatePayload.name = parsed.data.name;
        updatePayload.category = parsed.data.category;
        break;
      }
      case 'location': {
        const parsed = LocationDomainSchema.safeParse(rawData);
        if (!parsed.success) {
          return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
          };
        }
        updatePayload.neighborhood = parsed.data.neighborhood;
        updatePayload.city = parsed.data.city;
        updatePayload.landmarks = parsed.data.landmarks || null;
        break;
      }
      case 'products': {
        const parsed = ProductsDomainSchema.safeParse(rawData);
        if (!parsed.success) {
          return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
          };
        }
        updatePayload.signature_items = parsed.data.signature_items;
        break;
      }
      case 'customers': {
        const parsed = CustomersDomainSchema.safeParse(rawData);
        if (!parsed.success) {
          return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
          };
        }
        updatePayload.target_customer = parsed.data.target_customer;
        updatePayload.target_monthly_customers = parsed.data.target_monthly_customers || null;
        break;
      }
      case 'offer': {
        const parsed = OfferDomainSchema.safeParse(rawData);
        if (!parsed.success) {
          return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
          };
        }
        updatePayload.default_offer = parsed.data.default_offer;
        updatePayload.primary_goal = parsed.data.primary_goal || null;
        updatePayload.avg_ticket_inr = parsed.data.avg_ticket_inr || null;
        break;
      }
      case 'brand': {
        const parsed = BrandDomainSchema.safeParse(rawData);
        if (!parsed.success) {
          return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
          };
        }
        updatePayload.style_voice = parsed.data.style_voice || null;
        break;
      }
      case 'operations': {
        const parsed = OperationsDomainSchema.safeParse(rawData);
        if (!parsed.success) {
          return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
          };
        }
        updatePayload.peak_hours = parsed.data.peak_hours || null;
        updatePayload.slow_hours = parsed.data.slow_hours || null;
        break;
      }
      case 'contact': {
        const parsed = ContactDomainSchema.safeParse(rawData);
        if (!parsed.success) {
          return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
          };
        }
        updatePayload.phone_whatsapp = parsed.data.phone_whatsapp || null;
        break;
      }
      default: {
        return {
          success: false,
          message: 'Invalid domain requested.',
        };
      }
    }

    // 4. Update authoritative business_profiles
    const { error: updateError } = await supabase
      .from('business_profiles')
      .update(updatePayload)
      .eq('business_id', business.id);

    if (updateError) {
      console.error('saveSetupDomainAction error:', updateError);
      return {
        success: false,
        message: updateError.message,
      };
    }

    // 5. Revalidate affected surfaces
    revalidatePath('/setup');
    revalidatePath(`/setup/${domain}`);
    revalidatePath('/setup/review');
    revalidatePath('/user/business');
    revalidatePath('/user/today');

    return {
      success: true,
      message: 'Saved successfully.',
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REDIRECT_TO_LOGIN') throw err;
    console.error('saveSetupDomainAction unexpected error:', err);
    return {
      success: false,
      message: 'Authentication failed or an unexpected error occurred.',
    };
  }
}
