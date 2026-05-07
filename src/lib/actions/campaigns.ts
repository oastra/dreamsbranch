'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/helpers';
import { campaignSchema } from '@/lib/validations';

function toSnake(input: Record<string, unknown>) {
  return {
    title_ua: input.titleUa,
    title_en: input.titleEn,
    slug: input.slugEn,
    slug_ua: input.slugUa,
    slug_en: input.slugEn,
    description_ua: input.descriptionUa ?? null,
    description_en: input.descriptionEn ?? null,
    cover_image: input.coverImage ?? null,
    gallery_images: input.galleryImages ?? [],
    goal_amount: input.goalAmount,
    status: (input.status as string).toLowerCase(),
    sort_order: input.order ?? 0,
  };
}

export async function createCampaign(formData: unknown) {
  await requireAdmin();
  const parsed = campaignSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const row = toSnake(parsed.data as Record<string, unknown>);
  const result = await db.campaign.create({ data: row });
  if (!result) return { success: false, error: 'Failed to create campaign' };
  revalidatePath('/admin/campaigns');
  return { success: true, id: (result as Record<string, unknown>).id };
}

export async function updateCampaign(id: string, formData: unknown) {
  await requireAdmin();
  const parsed = campaignSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const row = toSnake(parsed.data as Record<string, unknown>);
  const result = await db.campaign.update({ where: { id }, data: row });
  if (!result) return { success: false, error: 'Failed to update campaign' };
  revalidatePath('/admin/campaigns');
  return { success: true };
}

export async function deleteCampaign(id: string) {
  await requireSuperAdmin();
  await db.campaign.delete({ where: { id } });
  revalidatePath('/admin/campaigns');
  return { success: true };
}
