'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { createAdminClient } from '@/lib/supabase/server';
import { contactSchema, type ContactInput } from '@/lib/validations';

export async function submitContact(input: ContactInput) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: 'Invalid data' };

  const sb = createAdminClient();
  const { error } = await sb.from('contact_submissions').insert({
    name: parsed.data.name,
    phone: parsed.data.phone ?? null,
    email: parsed.data.email,
    message: parsed.data.message,
    tag: parsed.data.tag.toLowerCase(),
  });

  if (error) return { success: false as const, error: 'Failed to submit' };
  return { success: true as const };
}

export async function markContactRead(id: string) {
  await requireAdmin();
  await db.contactSubmission.update({ where: { id }, data: { is_read: true } });
  revalidatePath('/admin/contacts');
  return { success: true };
}
