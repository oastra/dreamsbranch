'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/helpers';
import { shopProductSchema } from '@/lib/validations';
import { slugify } from '@/lib/slug';
import { deleteFilesAction } from '@/lib/actions/upload';
import { revalidateLocalizedPath } from '@/lib/revalidate';

const SHOP_CATEGORY_SLUGS = ['handmade', 'from-ukraine', 'cuisine', 'catering'] as const;

function revalidateShopPages() {
  revalidateLocalizedPath('/shop');
  for (const slug of SHOP_CATEGORY_SLUGS) {
    revalidateLocalizedPath(`/shop/${slug}`);
  }
}

// Server actions must never throw — a rejected promise leaves the form's
// spinner stuck. Surface DB exceptions as readable strings.
function dbErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { message?: string; code?: string };
    if (e.code === '23505') return 'A product with this name/slug already exists';
    if (e.code === '23503') return 'Referenced record does not exist';
    if (e.code === '23502') return 'Required field is missing';
    if (e.code === '42501') return 'Permission denied (RLS)';
    if (e.message) return e.message;
  }
  return 'Database write failed';
}

// Shared snake_case mapping (no slug — slug is set on create and preserved
// on update so product URLs stay stable).
function toSnake(input: Record<string, unknown>) {
  return {
    title_ua: input.titleUa,
    title_en: input.titleEn,
    description_ua: (input.descriptionUa as string) || null,
    description_en: (input.descriptionEn as string) || null,
    price_amount: input.priceAmount ?? 0,
    price_currency: (input.priceCurrency as string) || 'AUD',
    section: input.section,
    cover_image: (input.coverImage as string) || null,
    gallery_images: (input.galleryImages as string[]) ?? [],
    status: (input.status as string).toLowerCase(),
    sort_order: input.order ?? 0,
  };
}

export async function createShopProduct(formData: unknown) {
  try {
    await requireAdmin();
    const parsed = shopProductSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join('; ') };
    }
    const data = parsed.data as Record<string, unknown>;
    const slug = slugify(String(data.titleEn || data.titleUa || 'product'));
    const result = await db.shopProduct.create({
      data: { ...toSnake(data), slug, slug_ua: slug, slug_en: slug },
    });
    if (!result) return { success: false, error: 'Failed to create product' };
    revalidatePath('/admin/products');
    revalidateShopPages();
    return { success: true, id: (result as Record<string, unknown>).id };
  } catch (err) {
    return { success: false, error: dbErrorMessage(err) };
  }
}

export async function updateShopProduct(id: string, formData: unknown) {
  try {
    await requireAdmin();
    const parsed = shopProductSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join('; ') };
    }
    const result = await db.shopProduct.update({
      where: { id },
      data: toSnake(parsed.data as Record<string, unknown>),
    });
    if (!result) return { success: false, error: 'Failed to update product' };
    revalidatePath('/admin/products');
    revalidateShopPages();
    return { success: true };
  } catch (err) {
    return { success: false, error: dbErrorMessage(err) };
  }
}

export async function deleteShopProduct(id: string) {
  try {
    await requireSuperAdmin();
    const row = (await db.shopProduct.findUnique({ where: { id } })) as
      | (Record<string, unknown> & {
          cover_image?: string | null;
          gallery_images?: string[] | null;
        })
      | null;
    await db.shopProduct.delete({ where: { id } });
    if (row) {
      void deleteFilesAction([row.cover_image, ...(row.gallery_images ?? [])]);
    }
    revalidatePath('/admin/products');
    revalidateShopPages();
    return { success: true };
  } catch (err) {
    return { success: false, error: dbErrorMessage(err) };
  }
}
