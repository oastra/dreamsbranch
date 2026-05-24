'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/helpers';
import { campaignSchema } from '@/lib/validations';
import { deleteFilesAction } from '@/lib/actions/upload';
import { revalidateLocalizedPath } from '@/lib/revalidate';

type BilingualFaq = { q_ua: string; a_ua: string; q_en: string; a_en: string };

function toSnake(input: Record<string, unknown>) {
  const faqItems = (input.faqItems as BilingualFaq[] | undefined) ?? [];
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
    faq_ua: faqItems.map((it) => ({ question: it.q_ua, answer: it.a_ua })),
    faq_en: faqItems.map((it) => ({ question: it.q_en, answer: it.a_en })),
  };
}

// Surface any DB exception (RLS, missing column, FK violation, …) as a
// readable string. Server actions must NEVER throw — a rejected promise
// leaves the admin form's spinner stuck forever because the awaited
// `await action(...)` never resolves.
function dbErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { message?: string; code?: string };
    if (e.code === '23505') return 'A record with this slug already exists';
    if (e.code === '23503') return 'Referenced record does not exist';
    if (e.code === '23502') return 'Required field is missing';
    if (e.code === '42501') return 'Permission denied (RLS)';
    if (e.message) return e.message;
  }
  return 'Database write failed';
}

export async function createCampaign(formData: unknown) {
  try {
    const admin = await requireAdmin();
    const parsed = campaignSchema.safeParse(formData);
    if (!parsed.success) return { success: false, error: parsed.error.issues.map((i) => i.message).join('; ') };
    const row = {
      ...toSnake(parsed.data as Record<string, unknown>),
      created_by_admin_id: admin.id,
      updated_by_admin_id: admin.id,
    };
    const result = await db.campaign.create({ data: row });
    if (!result) return { success: false, error: 'Failed to create campaign' };
    revalidatePath('/admin/campaigns');
    revalidateLocalizedPath('/campaigns');
    return { success: true, id: (result as Record<string, unknown>).id };
  } catch (err) {
    return { success: false, error: dbErrorMessage(err) };
  }
}

export async function updateCampaign(id: string, formData: unknown) {
  try {
    const admin = await requireAdmin();
    const parsed = campaignSchema.safeParse(formData);
    if (!parsed.success) return { success: false, error: parsed.error.issues.map((i) => i.message).join('; ') };
    const row = {
      ...toSnake(parsed.data as Record<string, unknown>),
      updated_by_admin_id: admin.id,
    };
    const result = await db.campaign.update({ where: { id }, data: row });
    if (!result) return { success: false, error: 'Failed to update campaign' };
    revalidatePath('/admin/campaigns');
    revalidateLocalizedPath('/campaigns');
    return { success: true };
  } catch (err) {
    return { success: false, error: dbErrorMessage(err) };
  }
}

export async function deleteCampaign(id: string) {
  await requireSuperAdmin();
  // Pick up the row first so we can clean its uploaded files from
  // Storage after the row itself is removed. We always remove the row
  // (even if the storage cleanup partially fails) so the admin UI
  // never gets stuck with a half-deleted campaign.
  const row = (await db.campaign.findUnique({ where: { id } })) as
    | (Record<string, unknown> & {
        cover_image?: string | null;
        gallery_images?: string[] | null;
      })
    | null;
  await db.campaign.delete({ where: { id } });
  if (row) {
    void deleteFilesAction([
      row.cover_image,
      ...(row.gallery_images ?? []),
    ]);
  }
  revalidatePath('/admin/campaigns');
  revalidateLocalizedPath('/campaigns');
  return { success: true };
}
