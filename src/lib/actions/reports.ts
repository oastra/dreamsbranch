'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/helpers';
import { reportSchema } from '@/lib/validations';

function toSnake(input: Record<string, unknown>) {
  return {
    year: input.year,
    title_ua: input.titleUa,
    title_en: input.titleEn,
    description_ua: input.descriptionUa ?? null,
    description_en: input.descriptionEn ?? null,
    cover_image: input.coverImage ?? null,
    gallery_images: input.galleryImages ?? [],
    pdf_url: input.pdfUrl || null,
    status: (input.status as string).toLowerCase(),
  };
}

export async function createReport(formData: unknown) {
  await requireAdmin();
  const parsed = reportSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };
  const row = toSnake(parsed.data as Record<string, unknown>);
  const result = await db.report.create({ data: row });
  if (!result) return { success: false, error: 'Failed to create report' };
  revalidatePath('/admin/reports');
  return { success: true, id: (result as Record<string, unknown>).id };
}

export async function updateReport(id: string, formData: unknown) {
  await requireAdmin();
  const parsed = reportSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };
  const row = toSnake(parsed.data as Record<string, unknown>);
  const result = await db.report.update({ where: { id }, data: row });
  if (!result) return { success: false, error: 'Failed to update report' };
  revalidatePath('/admin/reports');
  return { success: true };
}

export async function deleteReport(id: string) {
  await requireSuperAdmin();
  await db.report.delete({ where: { id } });
  revalidatePath('/admin/reports');
  return { success: true };
}
