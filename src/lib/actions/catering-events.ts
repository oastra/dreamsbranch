'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/helpers';
import { cateringEventSchema } from '@/lib/validations';
import { deleteFilesAction } from '@/lib/actions/upload';
import type { CateringEvent } from '@/types/database';

function toSnake(input: Record<string, unknown>) {
  return {
    title_ua: input.titleUa,
    title_en: input.titleEn,
    description_ua: input.descriptionUa,
    description_en: input.descriptionEn,
    location_ua: input.locationUa,
    location_en: input.locationEn,
    images: input.images,
    sort_order: input.sortOrder ?? 0,
  };
}

export async function createCateringEvent(formData: unknown) {
  const admin = await requireAdmin();
  const parsed = cateringEventSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const row = {
    ...toSnake(parsed.data as Record<string, unknown>),
    created_by_admin_id: admin.id,
    updated_by_admin_id: admin.id,
  };
  const result = await db.cateringEvent.create({ data: row });
  if (!result) return { success: false, error: 'Failed to create event' };
  revalidatePath('/admin/catering-page');
  revalidatePath('/[locale]/shop/catering', 'page');
  return { success: true, id: (result as CateringEvent).id };
}

export async function updateCateringEvent(id: string, formData: unknown) {
  const admin = await requireAdmin();
  const parsed = cateringEventSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const row = {
    ...toSnake(parsed.data as Record<string, unknown>),
    updated_by_admin_id: admin.id,
  };
  const result = await db.cateringEvent.update({ where: { id }, data: row });
  if (!result) return { success: false, error: 'Failed to update event' };
  revalidatePath('/admin/catering-page');
  revalidatePath('/[locale]/shop/catering', 'page');
  return { success: true };
}

export async function deleteCateringEvent(id: string) {
  await requireSuperAdmin();
  const row = (await db.cateringEvent.findUnique({ where: { id } })) as CateringEvent | null;
  await db.cateringEvent.delete({ where: { id } });
  if (row?.images?.length) void deleteFilesAction(row.images);
  revalidatePath('/admin/catering-page');
  revalidatePath('/[locale]/shop/catering', 'page');
  return { success: true };
}
