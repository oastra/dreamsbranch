'use server';
import { uploadImage, deleteImage } from '@/lib/supabase/storage';
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

/**
 * Remove an uploaded file from Supabase Storage. URLs that aren't
 * Supabase-storage URLs (or already-missing files) are a no-op — the
 * action never throws, so callers can fire-and-forget. Safe to call
 * with `null` / empty / non-storage URLs; those short-circuit.
 */
export async function deleteFileAction(url: string | null | undefined): Promise<{ ok: boolean }> {
  if (!url) return { ok: true };
  await requireAdmin();
  const ok = await deleteImage(url);
  return { ok };
}

/** Same as `deleteFileAction` but takes a list and removes in parallel. */
export async function deleteFilesAction(urls: Array<string | null | undefined>): Promise<{ ok: boolean }> {
  const real = urls.filter((u): u is string => !!u);
  if (real.length === 0) return { ok: true };
  await requireAdmin();
  const results = await Promise.all(real.map((u) => deleteImage(u)));
  return { ok: results.every(Boolean) };
}
