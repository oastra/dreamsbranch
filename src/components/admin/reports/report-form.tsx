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
import { createReport, updateReport } from '@/lib/actions/reports';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ReportForm({ report }: { report?: Record<string, any> }) {
  const router = useRouter();
  const isEdit = !!report?.id;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    year: report?.year ?? new Date().getFullYear(),
    titleUa: report?.title_ua ?? '',
    titleEn: report?.title_en ?? '',
    descriptionUa: report?.description_ua ?? '',
    descriptionEn: report?.description_en ?? '',
    coverImage: report?.cover_image ?? '',
    pdfUrl: report?.pdf_url ?? '',
    status: report?.status ?? 'DRAFT',
  });

  function set(key: string, value: unknown) { setForm(f => ({ ...f, [key]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = isEdit ? await updateReport(report.id, form) : await createReport(form);
    setSaving(false);
    if (result.success) { toast.success(isEdit ? 'Report updated' : 'Report created'); router.push('/admin/reports'); }
    else toast.error(result.error ?? 'Something went wrong');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-body font-semibold">General</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Year *</Label>
            <Input type="number" value={form.year} onChange={e => set('year', Number(e.target.value))} min={2020} max={2030} required />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>PDF URL</Label>
          <Input value={form.pdfUrl} onChange={e => set('pdfUrl', e.target.value)} placeholder="https://..." />
          <p className="text-caption text-text-tertiary mt-1">Upload PDF to Supabase Storage and paste the public URL here</p>
        </div>
        <ImageUpload value={form.coverImage} onChange={url => set('coverImage', url ?? '')} folder="reports" label="Cover image" />
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-body font-semibold mb-4">Content</h2>
        <BilingualTabs
          ua={
            <>
              <div><Label>Title (UA) *</Label><Input value={form.titleUa} onChange={e => set('titleUa', e.target.value)} required /></div>
              <div><Label>Description (UA)</Label><Textarea rows={4} value={form.descriptionUa} onChange={e => set('descriptionUa', e.target.value)} /></div>
            </>
          }
          en={
            <>
              <div><Label>Title (EN) *</Label><Input value={form.titleEn} onChange={e => set('titleEn', e.target.value)} required /></div>
              <div><Label>Description (EN)</Label><Textarea rows={4} value={form.descriptionEn} onChange={e => set('descriptionEn', e.target.value)} /></div>
            </>
          }
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" variant="default" className="rounded-full" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create report'}</Button>
        <Button type="button" size="lg" variant="outline" className="rounded-full" onClick={() => router.push('/admin/reports')}>Cancel</Button>
      </div>
    </form>
  );
}
