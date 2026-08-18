import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { getAccessibleBusinesses } from '../business/getAccessibleBusinesses';
import { createClient } from '../../supabase/server';

export interface AccountNotificationPreferences {
  email: boolean;
  whatsapp: boolean;
  weeklyDigest: boolean;
}

export interface AccountUserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  notificationPreferences: AccountNotificationPreferences;
}

export interface AccountBusinessMembership {
  id: string;
  name: string;
  role: string;
}

export interface AccountEntitlement {
  isAvailable: boolean;
  planId: string | null;
  planName: string | null;
  businessLimit: number | null;
  status: string | null;
}

export interface AccountViewModel {
  profileInitialized: boolean;
  profile: AccountUserProfile | null;
  businesses: AccountBusinessMembership[];
  entitlement: AccountEntitlement;
}

export async function getAccountProfile(): Promise<AccountViewModel> {
  const claims = await requireAuthenticatedClaims('/user/account');
  const supabase = await createClient();

  // Parallelize independent domain reads
  const [profileResult, accessibleBusinesses, subscriptionResult, freePlanResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, phone, notification_preferences, created_at')
      .eq('id', claims.userId)
      .maybeSingle(),
    getAccessibleBusinesses(claims.userId),
    supabase
      .from('subscriptions')
      .select(`
        plan_id,
        status,
        plans (
          id,
          name,
          business_limit
        )
      `)
      .eq('user_id', claims.userId)
      .in('status', ['ACTIVE', 'TRIALING'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('plans')
      .select('id, name, business_limit')
      .eq('id', 'FREE')
      .maybeSingle(),
  ]);

  // Handle missing profile as a domain recovery state
  const rawProfile = profileResult.data;
  if (!rawProfile) {
    return {
      profileInitialized: false,
      profile: null,
      businesses: accessibleBusinesses.map(b => ({ id: b.id, name: b.name, role: b.role })),
      entitlement: {
        isAvailable: false,
        planId: null,
        planName: null,
        businessLimit: null,
        status: null,
      },
    };
  }

  // Map notification preferences safely (supporting both snake_case and camelCase in JSON payload)
  const rawNotifs = (rawProfile.notification_preferences as Record<string, unknown>) || {};
  const notificationPreferences: AccountNotificationPreferences = {
    email: typeof rawNotifs.email === 'boolean' ? rawNotifs.email : true,
    whatsapp: typeof rawNotifs.whatsapp === 'boolean' ? rawNotifs.whatsapp : false,
    weeklyDigest: typeof rawNotifs.weekly_digest === 'boolean'
      ? rawNotifs.weekly_digest
      : typeof rawNotifs.weeklyDigest === 'boolean'
        ? rawNotifs.weeklyDigest
        : true,
  };

  const profile: AccountUserProfile = {
    id: rawProfile.id,
    email: claims.email || '',
    fullName: rawProfile.full_name || '',
    phone: rawProfile.phone || null,
    avatarUrl: rawProfile.avatar_url || null,
    createdAt: rawProfile.created_at,
    notificationPreferences,
  };

  // Derive business limit entitlement strictly from database records
  let entitlement: AccountEntitlement;
  if (subscriptionResult.data) {
    const sub = subscriptionResult.data;
    const plan = Array.isArray(sub.plans) ? sub.plans[0] : sub.plans;
    entitlement = {
      isAvailable: true,
      planId: sub.plan_id,
      planName: plan?.name || sub.plan_id,
      businessLimit: typeof plan?.business_limit === 'number' ? plan.business_limit : null,
      status: sub.status,
    };
  } else if (freePlanResult.data) {
    const freePlan = freePlanResult.data;
    entitlement = {
      isAvailable: true,
      planId: freePlan.id,
      planName: freePlan.name || 'Free Tier',
      businessLimit: typeof freePlan.business_limit === 'number' ? freePlan.business_limit : 2,
      status: 'ACTIVE',
    };
  } else {
    // Entitlement data unavailable
    entitlement = {
      isAvailable: false,
      planId: null,
      planName: null,
      businessLimit: null,
      status: null,
    };
  }

  return {
    profileInitialized: true,
    profile,
    businesses: accessibleBusinesses.map(b => ({ id: b.id, name: b.name, role: b.role })),
    entitlement,
  };
}
