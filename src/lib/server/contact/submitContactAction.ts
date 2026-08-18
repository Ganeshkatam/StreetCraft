'use server';

import {
  ContactSubmissionSchema,
  type ContactActionResult,
} from '../../domain/contact/contactSchema';

export async function submitContactAction(
  _prevState: ContactActionResult | null,
  formData: FormData
): Promise<ContactActionResult> {
  try {
    const rawData = {
      name: formData.get('name') ?? '',
      email: formData.get('email') ?? '',
      storeName: formData.get('storeName') ?? '',
      category: formData.get('category') ?? 'GENERAL',
      subject: formData.get('subject') ?? '',
      message: formData.get('message') ?? '',
    };

    const parseResult = ContactSubmissionSchema.safeParse(rawData);

    if (!parseResult.success) {
      const flattened = parseResult.error.flatten();
      return {
        success: false,
        fieldErrors: flattened.fieldErrors,
        generalError: 'Please correct the highlighted errors in the form.',
      };
    }

    const { name, email, category, subject } = parseResult.data;

    // Log structured event without sensitive raw payload leak
    console.info(`[Contact] Received inquiry from ${email} (${name}) | Cat: ${category} | Subject: ${subject}`);

    return {
      success: true,
      message: 'Your inquiry has been received. Our team will review your message and reply directly to your email.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
    console.error('[Contact Error]', errorMsg);
    return {
      success: false,
      generalError: 'Failed to process inquiry. Please email support@streetcraft.in directly.',
    };
  }
}
