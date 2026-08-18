import { CommercialSubscriptionSummary, SubscriptionStatus } from './planTypes';

export function deriveCommercialEntitlementStatus(
  sub: { status: string; cancel_at_period_end?: boolean; current_period_end?: string } | null
): { status: SubscriptionStatus; isCancellationScheduled: boolean; isActive: boolean } {
  if (!sub) {
    return { status: 'ACTIVE', isCancellationScheduled: false, isActive: true }; // Free tier
  }

  const isCancelScheduled = Boolean(sub.cancel_at_period_end);
  const now = new Date();
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null;
  const isPeriodExpired = periodEnd ? now > periodEnd : false;

  if (isPeriodExpired && isCancelScheduled) {
    return { status: 'CANCELED', isCancellationScheduled: false, isActive: false };
  }

  if (isCancelScheduled) {
    return { status: 'CANCEL_SCHEDULED', isCancellationScheduled: true, isActive: true };
  }

  const status = (sub.status.toUpperCase() as SubscriptionStatus) || 'ACTIVE';
  return {
    status,
    isCancellationScheduled: false,
    isActive: status === 'ACTIVE' || status === 'TRIALING',
  };
}
