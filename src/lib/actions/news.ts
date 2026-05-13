'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/helpers';
import { articleSchema } from '@/lib/validations';
import { deleteFilesAction } from '@/lib/actions/upload';

function toSnake(input: Record<string, unknown>) {
  return {
    title_ua: input.titleUa,
    title_en: input.titleEn,
    slug: input.slugEn,
    slug_ua: input.slugUa,
    slug_en: input.slugEn,
    body_ua: input.bodyUa ?? null,
    body_en: input.bodyEn ?? null,
    cover_image: input.coverImage ?? null,
    gallery_images: (input.galleryImages as string[] | undefined) ?? [],
    category: input.category ?? null,
    tags: input.tags ?? [],
    is_featured: input.isFeatured ?? false,
    status: (input.status as string).toLowerCase(),
  };
}

export async function createArticle(formData: unknown) {
  const admin = await requireAdmin();
  const parsed = articleSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const snake = toSnake(parsed.data as Record<string, unknown>);
  const row = {
    ...snake,
    created_by_admin_id: admin.id,
    updated_by_admin_id: admin.id,
    ...(snake.status === 'published' ? { published_at: new Date().toISOString() } : {}),
  };
  const result = await db.newsArticle.create({ data: row });
  if (!result) return { success: false, error: 'Failed to create article' };
  revalidatePath('/admin/news');
  return { success: true, id: (result as Record<string, unknown>).id };
}

export async function updateArticle(id: string, formData: unknown) {
  const admin = await requireAdmin();
  const parsed = articleSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const snake = toSnake(parsed.data as Record<string, unknown>);
  // First-time publish stamps published_at; re-saving an already-published
  // article keeps the original date.
  let publishedAtPatch: { published_at?: string } = {};
  if (snake.status === 'published') {
    const existing = (await db.newsArticle.findUnique({ where: { id } })) as
      | (Record<string, unknown> & { published_at?: string | null })
      | null;
    if (!existing?.published_at) {
      publishedAtPatch = { published_at: new Date().toISOString() };
    }
  }
  const row = {
    ...snake,
    updated_by_admin_id: admin.id,
    ...publishedAtPatch,
  };
  const result = await db.newsArticle.update({ where: { id }, data: row });
  if (!result) return { success: false, error: 'Failed to update article' };
  revalidatePath('/admin/news');
  return { success: true };
}

export async function deleteArticle(id: string) {
  await requireSuperAdmin();
  const row = (await db.newsArticle.findUnique({ where: { id } })) as
    | (Record<string, unknown> & {
        cover_image?: string | null;
        gallery_images?: string[] | null;
      })
    | null;
  await db.newsArticle.delete({ where: { id } });
  if (row) {
    void deleteFilesAction([row.cover_image, ...(row.gallery_images ?? [])]);
  }
  revalidatePath('/admin/news');
  return { success: true };
}
