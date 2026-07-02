'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/helpers';
import { altTextSchema } from '@/lib/validations';
import { processAltTextBacklog } from '@/lib/alt-text/backlog';

// Surface any DB exception as a readable string. Server actions must NEVER
// throw — a rejected promise leaves an admin form spinner stuck forever.
function dbErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { message?: string; code?: string };
    if (e.code === '23505') return 'A record with this URL already exists';
    if (e.code === '42501') return 'Permission denied (RLS)';
    if (e.message) return e.message;
  }
  return 'Database write failed';
}

/**
 * The `updateAltText` write path (the agent's tool + the admin queue's save).
 * Upserts one image's alt text by URL and stamps the editing admin. `status`
 * is respected when provided (e.g. flipping 'pending' → 'approved').
 */
export async function upsertAltTextAction(input: unknown) {
  try {
    const admin = await requireAdmin();
    const parsed = altTextSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join('; ') };
    }
    const { url, ...fields } = parsed.data;
    await db.imageAltText.upsert({
      url,
      data: { ...fields, updated_by_admin_id: admin.id },
    });
    revalidatePath('/admin/alt-text');
    return { success: true };
  } catch (err) {
    return { success: false, error: dbErrorMessage(err) };
  }
}

/**
 * Approve one image's alt text (optionally with the reviewer's edits). Flips
 * status to 'approved' so the public site can read it.
 */
export async function approveAltTextAction(input: unknown) {
  const parsed = altTextSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join('; ') };
  }
  return upsertAltTextAction({ ...parsed.data, status: 'approved' });
}

/**
 * Reject one image's alt text — delete the row so the image drops back into the
 * backlog and can be regenerated later.
 */
export async function rejectAltTextAction(url: string) {
  try {
    await requireAdmin();
    await db.imageAltText.delete({ where: { url } });
    revalidatePath('/admin/alt-text');
    return { success: true };
  } catch (err) {
    return { success: false, error: dbErrorMessage(err) };
  }
}

/**
 * Trigger the batch agent for one chunk of the backlog. Returns counts so the
 * caller can show progress and re-run until `remaining` is 0. Bounded by
 * `limit` so a single invocation stays well under serverless time limits.
 */
export async function runAltTextBacklogAction(limit = 25) {
  try {
    const admin = await requireAdmin();
    const result = await processAltTextBacklog({ adminId: admin.id, limit });
    revalidatePath('/admin/alt-text');
    return { success: true as const, ...result };
  } catch (err) {
    return { success: false as const, error: dbErrorMessage(err) };
  }
}
