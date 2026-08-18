'use server';

import { redirect } from 'next/navigation';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { SwitchStorefrontSchema } from '../../domain/account/accountSchemas';

export type SwitchStorefrontActionState = {
  success: boolean;
  message?: string;
  activeBusinessId?: string;
};

export async function switchStorefrontAction(
  prevState: SwitchStorefrontActionState,
  formData: FormData
): Promise<SwitchStorefrontActionState> {
  const claims = await requireAuthenticatedClaims('/user/account/storefronts');

  const rawBusinessId = formData.get('businessId');
  const parsed = SwitchStorefrontSchema.safeParse({ businessId: rawBusinessId });

  if (!parsed.success) {
    return {
      success: false,
      message: 'Invalid storefront identifier.',
    };
  }

  const business = await resolveAuthorizedBusiness(claims.userId, parsed.data.businessId);
  if (!business) {
    return {
      success: false,
      message: 'You are not authorized to access this storefront.',
    };
  }

  redirect(`/user/account/storefronts?biz=${encodeURIComponent(business.id)}`);
}
