'use server';

import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '../../supabase/server';

export type UploadAvatarActionState = {
  success: boolean;
  avatarUrl?: string;
  message?: string;
};

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadAccountAvatarAction(
  prevState: UploadAvatarActionState,
  formData: FormData
): Promise<UploadAvatarActionState> {
  let uploadedPath: string | null = null;

  try {
    const claims = await requireAuthenticatedClaims('/user/account/identity');
    const supabase = await createClient();

    const file = formData.get('avatar') as File | null;
    if (!file || file.size === 0) {
      return {
        success: false,
        message: 'Please select an image file to upload.',
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        message: 'File size exceeds maximum limit of 5 MB.',
      };
    }

    const extension = ALLOWED_MIME_TYPES[file.type];
    if (!extension) {
      return {
        success: false,
        message: 'Invalid image format. Supported formats: JPG, PNG, WebP, GIF.',
      };
    }

    const fileBuffer = await file.arrayBuffer();
    const uniqueId = crypto.randomUUID();
    uploadedPath = `${claims.userId}/${uniqueId}.${extension}`;

    // 1. Upload to Supabase Storage avatars bucket
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(uploadedPath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('uploadAccountAvatarAction storage error:', uploadError);
      return {
        success: false,
        message: uploadError.message || 'Failed to upload image file to storage.',
      };
    }

    // 2. Resolve public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(uploadedPath);

    const publicUrl = publicUrlData.publicUrl;

    // 3. Update public.profiles.avatar_url
    const { error: dbError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', claims.userId);

    if (dbError) {
      console.error('uploadAccountAvatarAction database error, cleaning up storage:', dbError);
      // Cleanup orphaned storage object
      await supabase.storage.from('avatars').remove([uploadedPath]);
      return {
        success: false,
        message: 'Failed to link avatar to profile: ' + dbError.message,
      };
    }

    revalidatePath('/user/account');
    revalidatePath('/user/account/identity');
    revalidatePath('/user/today');

    return {
      success: true,
      avatarUrl: publicUrl,
      message: 'Profile photo updated.',
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REDIRECT_TO_LOGIN') throw err;
    console.error('uploadAccountAvatarAction unexpected error:', err);
    return {
      success: false,
      message: 'An unexpected error occurred during avatar upload.',
    };
  }
}
