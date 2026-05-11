'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BilingualTabs } from '@/components/admin/shared/bilingual-tabs';
import { ImageUpload } from '@/components/admin/shared/image-upload';
import { createCampaign, updateCampaign } from '@/lib/actions/campaigns';
import { slugify } from '@/lib/slug';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CampaignForm({ campaign }: { campaign?: Record<string, any> }) {
  const router = useRouter();
  const isEdit = !!campaign?.id;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    titleUa: campaign?.title_ua ?? '',
    titleEn: campaign?.title_en ?? '',
    slugUa: campaign?.slug_ua ?? campaign?.slug ?? '',
    slugEn: campaign?.slug_en ?? campaign?.slug ?? '',
    descriptionUa: typeof campaign?.description_ua === 'string' ? campaign.description_ua : '',
    descriptionEn: typeof campaign?.description_en === 'string' ? campaign.description_en : '',
    coverImage: campaign?.cover_image ?? '',
    goalAmount: campaign?.goal_amount ?? 0,
    status: campaign?.status ?? 'DRAFT',
    order: campaign?.sort_order ?? 0,
  });

  function set(key: string, value: unknown) { setForm(f => ({ ...f, [key]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = isEdit ? await updateCampaign(campaign.id, form) : await createCampaign(form);
    setSaving(false);
    if (result.success) { toast.success(isEdit ? 'Campaign updated' : 'Campaign created'); router.push('/admin/campaigns'); }
    else toast.error(result.error ?? 'Something went wrong');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-body font-semibold">General</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Goal Amount (AUD) *</Label>
            <Input
              type="number"
              value={form.goalAmount}
              onChange={e => set('goalAmount', Number(e.target.value))}
              min={1}
              step="0.01"
              required
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Sort Order</Label>
            <Input
              type="number"
              value={form.order}
              onChange={e => set('order', Number(e.target.value))}
              min={0}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Slug (UA) *</Label>
            <Input value={form.slugUa} onChange={e => set('slugUa', e.target.value)} placeholder="kampaniia" required />
            <p className="text-xs text-text-secondary mt-1">URL: /ua/campaigns/{form.slugUa || '...'}</p>
          </div>
          <div>
            <Label>Slug (EN) *</Label>
            <Input value={form.slugEn} onChange={e => set('slugEn', e.target.value)} placeholder="campaign-name" required />
            <p className="text-xs text-text-secondary mt-1">URL: /en/campaigns/{form.slugEn || '...'}</p>
          </div>
        </div>
        <ImageUpload value={form.coverImage} onChange={url => set('coverImage', url ?? '')} folder="campaigns" label="Cover image" />
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-body font-semibold mb-4">Content</h2>
        <BilingualTabs
          ua={
            <>
              <div>
                <Label>Title (UA) *</Label>
                <Input value={form.titleUa} onChange={e => { set('titleUa', e.target.value); if (!form.slugUa) set('slugUa', slugify(e.target.value)); }} required />
              </div>
              <div>
                <Label>Description (UA)</Label>
                <Textarea rows={5} value={form.descriptionUa} onChange={e => set('descriptionUa', e.target.value)} />
              </div>
            </>
          }
          en={
            <>
              <div>
                <Label>Title (EN) *</Label>
                <Input value={form.titleEn} onChange={e => { set('titleEn', e.target.value); if (!form.slugEn) set('slugEn', slugify(e.target.value)); }} required />
              </div>
              <div>
                <Label>Description (EN)</Label>
                <Textarea rows={5} value={form.descriptionEn} onChange={e => set('descriptionEn', e.target.value)} />
              </div>
            </>
          }
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" variant="default" className="rounded-full" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create campaign'}</Button>
        <Button type="button" size="lg" variant="outline" className="rounded-full" onClick={() => router.push('/admin/campaigns')}>Cancel</Button>
      </div>
    </form>
  );
}
