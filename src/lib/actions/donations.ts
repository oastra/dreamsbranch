'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin, canManageFinances } from '@/lib/auth/helpers';
import { manualDonationSchema } from '@/lib/validations';

export async function createManualDonation(formData: unknown) {
  const admin = await requireAdmin();
  if (!canManageFinances(admin.role)) {
    return { success: false, error: 'Not authorised to record donations' };
  }

  const parsed = manualDonationSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const d = parsed.data;

  const created = await db.donation.create({
    data: {
      campaign_id: d.campaignId,
      donor_name: d.donorName,
      donor_email: d.donorEmail || null,
      amount: d.amount,
      currency: 'AUD',
      source: 'MANUAL',
      status: 'COMPLETED',
      is_anonymous: d.isAnonymous,
      note: d.note ?? null,
      added_by_admin_id: admin.id,
      external_payment_id: null,
    },
  });

  if (!created) {
    return { success: false, error: 'Failed to create donation' };
  }

  // The DB trigger will recalculate campaigns.current_amount automatically.
  revalidatePath('/admin/donations');
  revalidatePath('/admin/campaigns');
  revalidatePath('/[locale]/campaigns', 'page');
  return { success: true };
}
