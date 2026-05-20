'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { homeSettingsSchema } from '@/lib/validations';
import { revalidateLocalizedPath } from '@/lib/revalidate';

export async function updateHomeSettings(formData: unknown) {
  await requireAdmin();
  const parsed = homeSettingsSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const d = parsed.data;
  const row = {
    hero_images: d.heroImages,
    years_value: d.yearsValue,
    members_value: d.membersValue,
    raised_value: d.raisedValue,
    transparency_value: d.transparencyValue,
  };
  const result = await db.homeSetting.update({ data: row });
  if (!result) return { success: false, error: 'Failed to update home settings' };
  revalidatePath('/admin/home-settings');
  revalidateLocalizedPath('');
  revalidateLocalizedPath('/about');
  return { success: true };
}
