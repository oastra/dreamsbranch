'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/helpers';
import { shopReviewSchema } from '@/lib/validations';

function toSnake(input: Record<string, unknown>) {
  return {
    name_ua: input.nameUa,
    name_en: input.nameEn,
    role_ua: input.roleUa || null,
    role_en: input.roleEn || null,
    quote_ua: input.quoteUa,
    quote_en: input.quoteEn,
    rating: input.rating ?? 5,
    avatar: input.avatar || null,
    status: (input.status as string).toLowerCase(),
    sort_order: input.sortOrder ?? 0,
  };
}

export async function createShopReview(formData: unknown) {
  await requireAdmin();
  const parsed = shopReviewSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const row = toSnake(parsed.data as Record<string, unknown>);
  const result = await db.shopReview.create({ data: row });
  if (!result) return { success: false, error: 'Failed to create review' };
  revalidatePath('/admin/shop-reviews');
  revalidatePath('/[locale]/shop/[category]', 'page');
  return { success: true, id: (result as Record<string, unknown>).id };
}

export async function updateShopReview(id: string, formData: unknown) {
  await requireAdmin();
  const parsed = shopReviewSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const row = toSnake(parsed.data as Record<string, unknown>);
  const result = await db.shopReview.update({ where: { id }, data: row });
  if (!result) return { success: false, error: 'Failed to update review' };
  revalidatePath('/admin/shop-reviews');
  revalidatePath('/[locale]/shop/[category]', 'page');
  return { success: true };
}

export async function deleteShopReview(id: string) {
  await requireSuperAdmin();
  await db.shopReview.delete({ where: { id } });
  revalidatePath('/admin/shop-reviews');
  revalidatePath('/[locale]/shop/[category]', 'page');
  return { success: true };
}
