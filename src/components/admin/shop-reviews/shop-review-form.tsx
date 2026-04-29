'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BilingualTabs } from '@/components/admin/shared/bilingual-tabs';
import { ImageUpload } from '@/components/admin/shared/image-upload';
import {
  createShopReview,
  updateShopReview,
} from '@/lib/actions/shop-reviews';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ShopReviewForm({ review }: { review?: Record<string, any> }) {
  const router = useRouter();
  const isEdit = !!review?.id;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nameUa: review?.name_ua ?? '',
    nameEn: review?.name_en ?? '',
    roleUa: review?.role_ua ?? '',
    roleEn: review?.role_en ?? '',
    quoteUa: review?.quote_ua ?? '',
    quoteEn: review?.quote_en ?? '',
    rating: review?.rating ?? 5,
    avatar: review?.avatar ?? '',
    sortOrder: review?.sort_order ?? 0,
    status: review?.status ?? 'DRAFT',
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form };
    const result = isEdit
      ? await updateShopReview(review!.id, payload)
      : await createShopReview(payload);
    setSaving(false);
    if (result.success) {
      toast.success(isEdit ? 'Review updated' : 'Review created');
      router.push('/admin/shop-reviews');
    } else {
      toast.error(result.error ?? 'Something went wrong');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <div className="space-y-4 rounded-xl border border-border bg-white p-6">
        <h2 className="text-body font-semibold">General</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Rating *</Label>
            <Select
              value={String(form.rating)}
              onValueChange={(v) => set('rating', Number(v))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} stars</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Sort order</Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', Number(e.target.value))}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-6">
        <h2 className="mb-4 text-body font-semibold">Avatar</h2>
        <ImageUpload
          value={form.avatar}
          onChange={(url) => set('avatar', url ?? '')}
          folder="shop-reviews"
          label="Avatar image"
        />
      </div>

      <div className="rounded-xl border border-border bg-white p-6">
        <h2 className="mb-4 text-body font-semibold">Reviewer</h2>
        <BilingualTabs
          ua={
            <div className="space-y-4">
              <div>
                <Label>Name (UA) *</Label>
                <Input
                  value={form.nameUa}
                  onChange={(e) => set('nameUa', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Role (UA)</Label>
                <Input
                  value={form.roleUa}
                  onChange={(e) => set('roleUa', e.target.value)}
                  placeholder="Дизайнер"
                />
              </div>
            </div>
          }
          en={
            <div className="space-y-4">
              <div>
                <Label>Name (EN) *</Label>
                <Input
                  value={form.nameEn}
                  onChange={(e) => set('nameEn', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Role (EN)</Label>
                <Input
                  value={form.roleEn}
                  onChange={(e) => set('roleEn', e.target.value)}
                  placeholder="Designer"
                />
              </div>
            </div>
          }
        />
      </div>

      <div className="rounded-xl border border-border bg-white p-6">
        <h2 className="mb-4 text-body font-semibold">Quote</h2>
        <BilingualTabs
          ua={
            <div>
              <Label>Quote (UA) *</Label>
              <Textarea
                rows={5}
                value={form.quoteUa}
                onChange={(e) => set('quoteUa', e.target.value)}
                required
              />
            </div>
          }
          en={
            <div>
              <Label>Quote (EN) *</Label>
              <Textarea
                rows={5}
                value={form.quoteEn}
                onChange={(e) => set('quoteEn', e.target.value)}
                required
              />
            </div>
          }
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" variant="default" className="rounded-full" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create review'}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="rounded-full"
          onClick={() => router.push('/admin/shop-reviews')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
