'use server';
import { revalidatePath } from 'next/cache';
import { db, DbWriteError } from '@/lib/db';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/helpers';
import { articleSchema } from '@/lib/validations';
import { deleteFilesAction } from '@/lib/actions/upload';
import { revalidateLocalizedPath } from '@/lib/revalidate';

// Map raw Postgres errors to a message a content manager will understand.
function dbErrorMessage(err: unknown): string {
  if (err instanceof DbWriteError) {
    if (err.code === '23505') {
      return 'An article with this URL already exists. Change the title and try again.';
    }
    if (err.code === '23502') {
      return `A required field is empty: ${err.message}`;
    }
    return err.message;
  }
  return 'Failed to save article';
}

// Normalise the admin's date input (an `<input type="date">` "YYYY-MM-DD"
// string) into a UTC-noon ISO timestamp. Noon avoids any timezone-shift
// surprises that could nudge the displayed date by one day in either
// direction depending on the visitor's locale.
function toPublishedAt(value: unknown): string | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Already a full ISO timestamp — use as-is.
  if (trimmed.includes('T')) return trimmed;
  // Plain "YYYY-MM-DD" — anchor at noon UTC.
  return `${trimmed}T12:00:00.000Z`;
}

function toSnake(input: Record<string, unknown>) {
  return {
    title_ua: input.titleUa,
    title_en: input.titleEn,
    slug: input.slugEn,
    slug_ua: input.slugUa,
    slug_en: input.slugEn,
    body_ua: input.bodyUa ?? null,
    body_en: input.bodyEn ?? null,
    lead_text_ua: input.leadTextUa ?? null,
    lead_text_en: input.leadTextEn ?? null,
    post_hero_text_ua: input.postHeroTextUa ?? null,
    post_hero_text_en: input.postHeroTextEn ?? null,
    outro_text_ua: input.outroTextUa ?? null,
    outro_text_en: input.outroTextEn ?? null,
    cover_image: input.coverImage ?? null,
    body_image: input.bodyImage ?? null,
    gallery_images: (input.galleryImages as string[] | undefined) ?? [],
    category: input.category ?? null,
    tags: input.tags ?? [],
    is_featured: input.isFeatured ?? false,
    status: (input.status as string).toLowerCase(),
    published_at: toPublishedAt(input.publishedAt),
  };
}

export async function createArticle(formData: unknown) {
  const admin = await requireAdmin();
  const parsed = articleSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues.map((i) => i.message).join('; ') };
  const row = {
    ...toSnake(parsed.data as Record<string, unknown>),
    created_by_admin_id: admin.id,
    updated_by_admin_id: admin.id,
  };
  try {
    const result = await db.newsArticle.create({ data: row });
    if (!result) return { success: false, error: 'Failed to create article' };
    revalidatePath('/admin/news');
    revalidateLocalizedPath('/news');
    return { success: true, id: (result as Record<string, unknown>).id };
  } catch (err) {
    return { success: false, error: dbErrorMessage(err) };
  }
}

export async function updateArticle(id: string, formData: unknown) {
  const admin = await requireAdmin();
  const parsed = articleSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues.map((i) => i.message).join('; ') };
  const row = {
    ...toSnake(parsed.data as Record<string, unknown>),
    updated_by_admin_id: admin.id,
  };
  try {
    const result = await db.newsArticle.update({ where: { id }, data: row });
    if (!result) return { success: false, error: 'Failed to update article' };
    revalidatePath('/admin/news');
    revalidateLocalizedPath('/news');
    return { success: true };
  } catch (err) {
    return { success: false, error: dbErrorMessage(err) };
  }
}

export async function deleteArticle(id: string) {
  await requireSuperAdmin();
  const row = (await db.newsArticle.findUnique({ where: { id } })) as
    | (Record<string, unknown> & {
        cover_image?: string | null;
        body_image?: string | null;
        gallery_images?: string[] | null;
      })
    | null;
  await db.newsArticle.delete({ where: { id } });
  if (row) {
    void deleteFilesAction([
      row.cover_image,
      row.body_image,
      ...(row.gallery_images ?? []),
    ]);
  }
  revalidatePath('/admin/news');
  revalidateLocalizedPath('/news');
  return { success: true };
}
