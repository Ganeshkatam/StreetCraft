import { z } from 'zod';

export const RequestCancellationSchema = z.object({
  subscriptionId: z.string().uuid('Invalid subscription identifier.'),
  reason: z.string().trim().max(500).optional(),
});

export const UpgradePlanSchema = z.object({
  targetPlanId: z.enum(['STARTER', 'GROWTH', 'PRO']),
  billingCycle: z.enum(['monthly', 'annual']).default('monthly'),
});
