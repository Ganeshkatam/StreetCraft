import { z } from 'zod';

export const ContactCategoryEnum = z.enum(['SUPPORT', 'BILLING', 'PARTNERSHIPS', 'GENERAL']);
export type ContactCategory = z.infer<typeof ContactCategoryEnum>;

export const ContactSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name cannot exceed 80 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(120, 'Email cannot exceed 120 characters'),
  storeName: z
    .string()
    .trim()
    .max(100, 'Store name cannot exceed 100 characters')
    .optional()
    .default(''),
  category: ContactCategoryEnum,
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(150, 'Subject cannot exceed 150 characters'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message cannot exceed 2000 characters'),
});

export type ContactSubmissionInput = z.infer<typeof ContactSubmissionSchema>;

export interface ContactActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  generalError?: string;
}
