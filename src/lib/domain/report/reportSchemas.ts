import { z } from 'zod';

export const StoreReportQuerySchema = z.object({
  businessId: z.string().uuid('Valid business ID is required'),
});

export type StoreReportQuery = z.infer<typeof StoreReportQuerySchema>;
