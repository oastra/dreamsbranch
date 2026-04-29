'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/helpers';
import { shopPhotoReportSchema } from '@/lib/validations';

function toSnake(input: Record<string, unknown>) {
  const images = (input.images as Array<Record<string, unknown>> | undefined) ?? [];
  return {
    slug: input.slug,
    title_ua: input.titleUa,
    title_en: input.titleEn,
    report_date: input.reportDate,
    images: images.map((img) => ({
      url: img.url,
      kind: img.kind,
      position: img.position ?? 0,
      ...(img.captionUa ? { caption_ua: img.captionUa } : {}),
      ...(img.captionEn ? { caption_en: img.captionEn } : {}),
    })),
    status: (input.status as string).toLowerCase(),
    sort_order: input.sortOrder ?? 0,
  };
}

export async function createShopPhotoReport(formData: unknown) {
  await requireAdmin();
  const parsed = shopPhotoReportSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const row = toSnake(parsed.data as Record<string, unknown>);
  const result = await db.shopPhotoReport.create({ data: row });
  if (!result) return { success: false, error: 'Failed to create photo report' };
  revalidatePath('/admin/shop-photo-reports');
  revalidatePath('/[locale]/shop', 'page');
  return { success: true, id: (result as Record<string, unknown>).id };
}

export async function updateShopPhotoReport(id: string, formData: unknown) {
  await requireAdmin();
  const parsed = shopPhotoReportSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const row = toSnake(parsed.data as Record<string, unknown>);
  const result = await db.shopPhotoReport.update({ where: { id }, data: row });
  if (!result) return { success: false, error: 'Failed to update photo report' };
  revalidatePath('/admin/shop-photo-reports');
  revalidatePath('/[locale]/shop', 'page');
  return { success: true };
}

export async function deleteShopPhotoReport(id: string) {
  await requireSuperAdmin();
  await db.shopPhotoReport.delete({ where: { id } });
  revalidatePath('/admin/shop-photo-reports');
  revalidatePath('/[locale]/shop', 'page');
  return { success: true };
}
