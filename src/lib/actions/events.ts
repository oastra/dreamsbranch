'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/helpers';
import { eventSchema } from '@/lib/validations';

function toSnake(input: Record<string, unknown>) {
  return {
    title_ua: input.titleUa,
    title_en: input.titleEn,
    slug: input.slug,
    description_ua: input.descriptionUa ?? null,
    description_en: input.descriptionEn ?? null,
    cover_image: input.coverImage ?? null,
    gallery_images: input.galleryImages ?? [],
    event_date: input.date instanceof Date ? input.date.toISOString().split('T')[0] : input.date,
    start_time: input.startTime ?? null,
    end_time: input.endTime ?? null,
    location: input.location ?? null,
    location_map_url: input.locationMapUrl || null,
    tags: input.tags ?? [],
    status: (input.status as string).toLowerCase(),
    show_volunteer_cta: input.volunteerCta ?? false,
    financial_report: input.financialReport ?? null,
  };
}

export async function createEvent(formData: unknown) {
  await requireAdmin();
  const parsed = eventSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const row = toSnake(parsed.data as Record<string, unknown>);
  const result = await db.event.create({ data: row });
  if (!result) return { success: false, error: 'Failed to create event' };
  revalidatePath('/admin/events');
  return { success: true, id: (result as Record<string, unknown>).id };
}

export async function updateEvent(id: string, formData: unknown) {
  await requireAdmin();
  const parsed = eventSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const row = toSnake(parsed.data as Record<string, unknown>);
  const result = await db.event.update({ where: { id }, data: row });
  if (!result) return { success: false, error: 'Failed to update event' };
  revalidatePath('/admin/events');
  return { success: true };
}

export async function deleteEvent(id: string) {
  await requireSuperAdmin();
  await db.event.delete({ where: { id } });
  revalidatePath('/admin/events');
  return { success: true };
}

export async function setEventStatus(id: string, status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED') {
  await requireAdmin();
  const result = await db.event.update({ where: { id }, data: { status } });
  if (!result) return { success: false, error: 'Failed to update status' };
  revalidatePath('/admin/events');
  return { success: true };
}
