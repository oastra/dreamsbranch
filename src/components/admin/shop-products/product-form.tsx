'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { BilingualTabs } from '@/components/admin/shared/bilingual-tabs';
import { ImageUpload } from '@/components/admin/shared/image-upload';
import { MultiImageUpload } from '@/components/admin/shared/multi-image-upload';
import { useCancelWithConfirm } from '@/components/admin/shared/use-cancel-with-confirm';
import {
  createShopProduct,
  updateShopProduct,
} from '@/lib/actions/shop-products';

const SECTIONS = [
  { value: 'handmade', label: 'Handmade' },
  { value: 'from_ukraine', label: 'From Ukraine' },
  { value: 'cuisine', label: 'Ukrainian cuisine' },
  { value: 'catering', label: 'Catering' },
] as const;

const CURRENCIES = ['AUD', 'USD', 'EUR', 'UAH'] as const;
const STATUSES = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const;

// Product blurb on the product page renders at 16px — a couple of short
// paragraphs reads best.
const DESCRIPTION_IDEAL_CHARS = 400;

// The catalog card keeps the title to a single line. The narrowest title
// slot is the mobile card: 280px − 32px padding − (12px gap + 40px bag
// button) ≈ 196px ÷ ~8px per 16px-semibold char ≈ 24 chars. Hard-capped so
// titles never overflow / get cut off with an ellipsis.
const TITLE_MAX_CHARS = 24;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProductForm({ product }: { product?: Record<string, any> }) {
  const router = useRouter();
  const isEdit = !!product?.id;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    titleUa: product?.title_ua ?? '',
    titleEn: product?.title_en ?? '',
    descriptionUa: product?.description_ua ?? '',
    descriptionEn: product?.description_en ?? '',
    priceAmount: product?.price_amount ?? 0,
    priceCurrency: product?.price_currency ?? 'AUD',
    section: product?.section ?? 'handmade',
    coverImage: (product?.cover_image ?? '') as string,
    galleryImages: (product?.gallery_images ?? []) as string[],
    status: product?.status ?? 'DRAFT',
    order: product?.sort_order ?? 0,
    stock: product?.stock ?? '',
  });

  const [dirty, setDirty] = useState(false);
  const handleCancel = useCancelWithConfirm('/admin/products', dirty);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = isEdit
      ? await updateShopProduct(product!.id, form)
      : await createShopProduct(form);
    setSaving(false);
    if (result.success) {
      toast.success(isEdit ? 'Product updated' : 'Product created');
      router.push('/admin/products');
    } else {
      toast.error(result.error ?? 'Something went wrong');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <BilingualTabs
        ua={
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titleUa">Title (UA)</Label>
              <Input
                id="titleUa"
                value={form.titleUa}
                maxLength={TITLE_MAX_CHARS}
                onChange={(e) => set('titleUa', e.target.value)}
              />
              <p className="text-xs text-text-tertiary">
                {form.titleUa.length}/{TITLE_MAX_CHARS} — one line on the
                catalog card
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descUa">Description (UA)</Label>
              <p className="mb-1 text-xs text-text-secondary">
                Shown on the product page. Aim for around{' '}
                {DESCRIPTION_IDEAL_CHARS} characters.
              </p>
              <Textarea
                id="descUa"
                rows={5}
                value={form.descriptionUa}
                onChange={(e) => set('descriptionUa', e.target.value)}
              />
              <p className="mt-1 text-xs text-text-tertiary">
                {form.descriptionUa.length} characters (ideal: ~
                {DESCRIPTION_IDEAL_CHARS})
              </p>
            </div>
          </div>
        }
        en={
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titleEn">Title (EN)</Label>
              <Input
                id="titleEn"
                value={form.titleEn}
                maxLength={TITLE_MAX_CHARS}
                onChange={(e) => set('titleEn', e.target.value)}
              />
              <p className="text-xs text-text-tertiary">
                {form.titleEn.length}/{TITLE_MAX_CHARS} — one line on the
                catalog card
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descEn">Description (EN)</Label>
              <p className="mb-1 text-xs text-text-secondary">
                Shown on the product page. Aim for around{' '}
                {DESCRIPTION_IDEAL_CHARS} characters.
              </p>
              <Textarea
                id="descEn"
                rows={5}
                value={form.descriptionEn}
                onChange={(e) => set('descriptionEn', e.target.value)}
              />
              <p className="mt-1 text-xs text-text-tertiary">
                {form.descriptionEn.length} characters (ideal: ~
                {DESCRIPTION_IDEAL_CHARS})
              </p>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step="0.01"
            value={form.priceAmount}
            onChange={(e) => set('priceAmount', Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Currency</Label>
          <Select
            value={form.priceCurrency}
            onValueChange={(v) => set('priceCurrency', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Shop section</Label>
          <Select value={form.section} onValueChange={(v) => set('section', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => set('status', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="order">Sort order</Label>
          <Input
            id="order"
            type="number"
            value={form.order}
            onChange={(e) => set('order', Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            min={0}
            placeholder="Unlimited"
            value={form.stock}
            onChange={(e) => set('stock', e.target.value)}
          />
          <p className="text-xs text-text-secondary">
            Leave blank for unlimited. Drops automatically as orders are paid.
          </p>
        </div>
      </div>

      <ImageUpload
        label="Cover image — shown on the catalog card and as the first product photo. Upload at 1000 × 1000 px (1:1, square) for an exact, no-crop fit."
        folder="shop"
        value={form.coverImage}
        onChange={(url) => set('coverImage', url ?? '')}
      />

      <MultiImageUpload
        label="Gallery images (optional) — extra product photos on the product page. Upload at 1000 × 1000 px (1:1, square)."
        folder="shop"
        minImages={0}
        value={form.galleryImages}
        onChange={(urls) => set('galleryImages', urls)}
      />

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          size="lg"
          variant="default"
          className="rounded-full"
          disabled={saving}
        >
          {saving ? (
            <>
              <Spinner size="sm" aria-hidden />
              Saving...
            </>
          ) : isEdit ? (
            'Save changes'
          ) : (
            'Create product'
          )}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="rounded-full"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
