'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BilingualTabs } from '@/components/admin/shared/bilingual-tabs';
import {
  PhotoReportImagesEditor,
  type EditorImage,
} from './photo-report-images-editor';
import {
  createShopPhotoReport,
  updateShopPhotoReport,
} from '@/lib/actions/shop-photo-reports';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PhotoReportForm({ report }: { report?: Record<string, any> }) {
  const router = useRouter();
  const isEdit = !!report?.id;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    slug: report?.slug ?? '',
    titleUa: report?.title_ua ?? '',
    titleEn: report?.title_en ?? '',
    reportDate: report?.report_date ?? new Date().toISOString().slice(0, 10),
    sortOrder: report?.sort_order ?? 0,
    status: report?.status ?? 'DRAFT',
    images: ((report?.images ?? []) as Array<Record<string, unknown>>).map((img) => ({
      url: (img.url as string) ?? '',
      kind: (img.kind as EditorImage['kind']) ?? 'product',
      position: (img.position as number) ?? 0,
      captionUa: (img.caption_ua as string) ?? '',
      captionEn: (img.caption_en as string) ?? '',
    })) as EditorImage[],
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form };
    const result = isEdit
      ? await updateShopPhotoReport(report!.id, payload)
      : await createShopPhotoReport(payload);
    setSaving(false);
    if (result.success) {
      toast.success(isEdit ? 'Photo report updated' : 'Photo report created');
      router.push('/admin/shop-photo-reports');
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
            <Label>Slug *</Label>
            <Input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="ecoflow-delta-3-april-2026"
              required
            />
          </div>
          <div>
            <Label>Report date *</Label>
            <Input
              type="date"
              value={form.reportDate}
              onChange={(e) => set('reportDate', e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Sort order</Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', Number(e.target.value))}
            />
          </div>
          <div>
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
        <h2 className="mb-4 text-body font-semibold">Title</h2>
        <BilingualTabs
          ua={
            <div>
              <Label>Title (UA) *</Label>
              <Input
                value={form.titleUa}
                onChange={(e) => set('titleUa', e.target.value)}
                required
              />
            </div>
          }
          en={
            <div>
              <Label>Title (EN) *</Label>
              <Input
                value={form.titleEn}
                onChange={(e) => set('titleEn', e.target.value)}
                required
              />
            </div>
          }
        />
      </div>

      <div className="rounded-xl border border-border bg-white p-6">
        <h2 className="mb-4 text-body font-semibold">Images</h2>
        <PhotoReportImagesEditor
          value={form.images}
          onChange={(next) => set('images', next)}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" variant="default" className="rounded-full" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create photo report'}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="rounded-full"
          onClick={() => router.push('/admin/shop-photo-reports')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
