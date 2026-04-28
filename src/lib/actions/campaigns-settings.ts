'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { campaignsSettingsSchema } from '@/lib/validations';

export async function updateCampaignsSettings(formData: unknown) {
  await requireAdmin();
  const parsed = campaignsSettingsSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const d = parsed.data;
  const row = {
    hero_images: d.heroImages,
    delivered_items: d.deliveredItems,
  };
  const result = await db.campaignsSetting.update({ data: row });
  if (!result) return { success: false, error: 'Failed to update campaigns settings' };
  revalidatePath('/admin/campaigns-settings');
  revalidatePath('/[locale]/campaigns', 'page');
  return { success: true };
}
