'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { aboutSettingsSchema } from '@/lib/validations';

export async function updateAboutSettings(formData: unknown) {
  await requireAdmin();
  const parsed = aboutSettingsSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const d = parsed.data;
  const row = {
    hero_images: d.heroImages,
    team_images: d.teamImages,
    faq_items: d.faqItems,
  };
  const result = await db.aboutSetting.update({ data: row });
  if (!result) return { success: false, error: 'Failed to update about settings' };
  revalidatePath('/admin/about-settings');
  revalidatePath('/[locale]/about', 'page');
  return { success: true };
}
