'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/helpers';
import { articleSchema } from '@/lib/validations';

function toSnake(input: Record<string, unknown>) {
  return {
    title_ua: input.titleUa,
    title_en: input.titleEn,
    slug: input.slug,
    body_ua: input.bodyUa ?? null,
    body_en: input.bodyEn ?? null,
    cover_image: input.coverImage ?? null,
    category: input.category ?? null,
    tags: input.tags ?? [],
    is_featured: input.isFeatured ?? false,
    status: (input.status as string).toLowerCase(),
  };
}

export async function createArticle(formData: unknown) {
  await requireAdmin();
  const parsed = articleSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const row = toSnake(parsed.data as Record<string, unknown>);
  const result = await db.newsArticle.create({ data: row });
  if (!result) return { success: false, error: 'Failed to create article' };
  revalidatePath('/admin/news');
  return { success: true, id: (result as Record<string, unknown>).id };
}

export async function updateArticle(id: string, formData: unknown) {
  await requireAdmin();
  const parsed = articleSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const row = toSnake(parsed.data as Record<string, unknown>);
  const result = await db.newsArticle.update({ where: { id }, data: row });
  if (!result) return { success: false, error: 'Failed to update article' };
  revalidatePath('/admin/news');
  return { success: true };
}

export async function deleteArticle(id: string) {
  await requireSuperAdmin();
  await db.newsArticle.delete({ where: { id } });
  revalidatePath('/admin/news');
  return { success: true };
}
