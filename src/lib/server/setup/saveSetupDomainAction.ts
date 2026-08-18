'use server';

import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { createClient } from '../../supabase/server';
import {
  IdentityDomainSchema,
  LocationDomainSchema,
  ProductsDomainSchema,
  CustomersDomainSchema,
  OfferDomainSchema,
  BrandDomainSchema,
  OperationsDomainSchema,
  ContactDomainSchema,
} from '../../domain/setup/setupSchemas';

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

    // 5. Synchronize businesses table if identity domain was updated
    if (domain === 'identity') {
      await supabase
        .from('businesses')
        .update({
          name: updatePayload.name,
          category: updatePayload.category,
          updated_at: updatePayload.updated_at,
        })
        .eq('id', business.id);
    }

    // 6. Revalidate affected surfaces
    revalidatePath('/setup');
    revalidatePath(`/setup/${business.id}`);
    revalidatePath(`/setup/${business.id}/${domain}`);
    revalidatePath(`/setup/${business.id}/review`);
    revalidatePath(`/user/business/${business.id}`);
    revalidatePath(`/user/business/${business.id}/today`);
    revalidatePath('/user/business');
    revalidatePath('/user/today');
    revalidatePath('/user/account');

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
