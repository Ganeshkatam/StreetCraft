import React from 'react';
import { WorkspaceNavigation } from './components/WorkspaceNavigation';
import { requireAuthenticatedClaims } from '../../lib/server/auth/requireAuthenticatedClaims';
import { getAccessibleBusinesses } from '../../lib/server/business/getAccessibleBusinesses';
import { createClient } from '../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialBusinesses: Array<{ id: string; name: string; category?: string }> = [];
  let userEmail: string | undefined;
  let userName: string | undefined;
  let userAvatarUrl: string | null = null;
  let initialAccountLimit = 2;

  try {
    const claims = await requireAuthenticatedClaims('/user');
    userEmail = claims.email;
    userName = (claims.userMetadata?.full_name as string) || (claims.userMetadata?.name as string) || claims.email?.split('@')[0];
    userAvatarUrl = (claims.userMetadata?.avatar_url as string) || null;

    const [accessible, supabase] = await Promise.all([
      getAccessibleBusinesses(claims.userId),
      createClient(),
    ]);

    initialBusinesses = accessible.map((b) => ({ id: b.id, name: b.name, category: b.category }));

    const { data: subData } = await supabase
      .from('store_subscriptions')
      .select('plans(storefront_limit)')
      .eq('user_id', claims.userId)
      .eq('status', 'ACTIVE')
      .limit(1)
      .maybeSingle();

    if (subData?.plans) {
      const planRecord = Array.isArray(subData.plans) ? subData.plans[0] : subData.plans;
      if (planRecord?.storefront_limit) {
        initialAccountLimit = planRecord.storefront_limit;
      }
    }
  } catch {
    // Non-blocking fallback for unauthenticated previews or edge transitions
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <WorkspaceNavigation
        initialBusinesses={initialBusinesses}
        initialAccountLimit={initialAccountLimit}
        initialUserEmail={userEmail}
        initialUserName={userName}
        initialAvatarUrl={userAvatarUrl}
      />
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
