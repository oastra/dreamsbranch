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
                onChange={(e) => set('titleUa', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descUa">Description (UA)</Label>
              <Textarea
                id="descUa"
                rows={5}
                value={form.descriptionUa}
                onChange={(e) => set('descriptionUa', e.target.value)}
              />
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
                onChange={(e) => set('titleEn', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descEn">Description (EN)</Label>
              <Textarea
                id="descEn"
                rows={5}
                value={form.descriptionEn}
                onChange={(e) => set('descriptionEn', e.target.value)}
              />
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
      </div>

      <ImageUpload
        label="Cover image"
        folder="shop"
        value={form.coverImage}
        onChange={(url) => set('coverImage', url ?? '')}
      />

      <MultiImageUpload
        label="Gallery images"
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
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create product'}
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
