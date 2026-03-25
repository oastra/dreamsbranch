'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';

export async function markContactRead(id: string) {
  await requireAdmin();
  await db.contactSubmission.update({ where: { id }, data: { is_read: true } });
  revalidatePath('/admin/contacts');
  return { success: true };
}
