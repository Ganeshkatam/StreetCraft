import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(80, 'Full name cannot exceed 80 characters.'),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone number cannot exceed 30 characters.')
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
});

export const UpdatePreferencesSchema = z.object({
  email: z.coerce.boolean(),
  whatsapp: z.coerce.boolean(),
  weeklyDigest: z.coerce.boolean(),
});

export const UpdatePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .max(128, 'Password cannot exceed 128 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const SwitchStorefrontSchema = z.object({
  businessId: z.string().uuid('Invalid business ID format.'),
});

export const ALLOWED_AVATAR_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
