import { createClient } from '../../supabase/server';

export interface AccessibleBusiness {
  id: string;
  name: string;
  category: string;
  role: string;
}

export async function getAccessibleBusinesses(userId: string): Promise<AccessibleBusiness[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('business_members')
    .select(`
      role,
      businesses (
        id,
        name,
        category
      )
    `)
    .eq('user_id', userId);

  if (error || !data) {
    return [];
  }

  return data
    .map((member) => {
      // Handle the fact that `businesses` is selected as a relationship
      const business = Array.isArray(member.businesses) ? member.businesses[0] : member.businesses;

      if (!business) return null;

      return {
        id: business.id,
        name: business.name,
        category: business.category,
        role: member.role,
      };
    })
    .filter((b): b is AccessibleBusiness => b !== null);
}
