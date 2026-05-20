'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { cateringPageSettingsSchema } from '@/lib/validations';

export async function updateCateringPageSettings(formData: unknown) {
  await requireAdmin();
  const parsed = cateringPageSettingsSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const row = { faq_items: parsed.data.faqItems };
  const result = await db.cateringSetting.update({ data: row });
  if (!result) return { success: false, error: 'Failed to update catering page' };
  revalidatePath('/admin/catering-page');
  revalidatePath('/[locale]/shop/catering', 'page');
  return { success: true };
}
