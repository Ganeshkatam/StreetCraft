import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { getAccessibleBusinesses, AccessibleBusiness } from '../business/getAccessibleBusinesses';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { createClient } from '../../supabase/server';

export interface StorefrontItemViewModel {
  id: string;
  name: string;
  category: string;
  city?: string;
  neighborhood?: string;
  role: string;
  isActive: boolean;
}

export interface AccountStorefrontsViewModel {
  storefronts: StorefrontItemViewModel[];
  activeBusiness: AccessibleBusiness | null;
  totalStorefrontsCount: number;
}

export async function getAccountStorefronts(candidateBizId?: string): Promise<AccountStorefrontsViewModel> {
  const claims = await requireAuthenticatedClaims('/user/account/storefronts');
  const supabase = await createClient();

  const [accessibleList, activeBusiness] = await Promise.all([
    getAccessibleBusinesses(claims.userId),
    resolveAuthorizedBusiness(claims.userId, candidateBizId),
  ]);

  // Fetch business_profiles for neighborhood & city details
  const bizIds = accessibleList.map((b) => b.id);
  const { data: profiles } = await supabase
    .from('business_profiles')
    .select('business_id, category, neighborhood, city')
    .in('business_id', bizIds.length > 0 ? bizIds : ['00000000-0000-0000-0000-000000000000']);

  const profileMap = new Map((profiles || []).map((p) => [p.business_id, p]));

  const storefronts: StorefrontItemViewModel[] = accessibleList.map((b) => {
    const p = profileMap.get(b.id);
    return {
      id: b.id,
      name: b.name,
      category: p?.category || b.category,
      neighborhood: p?.neighborhood,
      city: p?.city,
      role: b.role,
      isActive: activeBusiness?.id === b.id,
    };
  });

  return {
    storefronts,
    activeBusiness,
    totalStorefrontsCount: storefronts.length,
  };
}
