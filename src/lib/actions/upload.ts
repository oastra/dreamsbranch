'use server';
import { uploadImage } from '@/lib/supabase/storage';
import { requireAdmin } from '@/lib/auth/helpers';

export async function uploadFileAction(formData: FormData): Promise<{ url: string | null; error?: string }> {
  await requireAdmin();
  const file = formData.get('file') as File;
  if (!file || file.size === 0) return { url: null, error: 'No file provided' };
  const folder = (formData.get('folder') as string) || 'general';
  const url = await uploadImage(file, folder);
  if (!url) return { url: null, error: 'Upload failed' };
  return { url };
}
