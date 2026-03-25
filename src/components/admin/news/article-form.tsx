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
import { createArticle, updateArticle } from '@/lib/actions/news';

const CATEGORIES = ['Fundraising', 'Events', 'Announcements', 'Reports', 'News', 'Other'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ArticleForm({ article }: { article?: Record<string, any> }) {
  const router = useRouter();
  const isEdit = !!article?.id;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    titleUa: article?.title_ua ?? '',
    titleEn: article?.title_en ?? '',
    slug: article?.slug ?? '',
    bodyUa: article?.body_ua ?? '',
    bodyEn: article?.body_en ?? '',
    coverImage: article?.cover_image ?? '',
    category: article?.category ?? '',
    isFeatured: article?.is_featured ?? false,
    status: article?.status ?? 'DRAFT',
  });

  function set(key: string, value: unknown) { setForm(f => ({ ...f, [key]: value })); }
  function autoSlug(title: string) { return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  function handleTitleUaChange(value: string) {
    set('titleUa', value);
    if (!isEdit || !form.slug) set('slug', autoSlug(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = isEdit ? await updateArticle(article.id, form) : await createArticle(form);
    setSaving(false);
    if (result.success) { toast.success(isEdit ? 'Article updated' : 'Article created'); router.push('/admin/news'); }
    else toast.error(result.error ?? 'Something went wrong');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-body font-semibold">General</h2>

        <div>
          <Label>Title (UA) *</Label>
          <Input value={form.titleUa} onChange={e => handleTitleUaChange(e.target.value)} required />
        </div>

        <div>
          <Label>Slug *</Label>
          <Input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="article-name" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
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

        <div className="flex items-center gap-2">
          <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="rounded" />
          <Label htmlFor="featured">Featured article</Label>
        </div>

        <ImageUpload value={form.coverImage} onChange={url => set('coverImage', url ?? '')} folder="news" label="Cover image" />
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-body font-semibold mb-4">Content</h2>
        <BilingualTabs
          ua={
            <>
              <div>
                <Label>Body (UA)</Label>
                <Textarea rows={14} value={form.bodyUa} onChange={e => set('bodyUa', e.target.value)} />
              </div>
            </>
          }
          en={
            <>
              <div>
                <Label>Title (EN) *</Label>
                <Input value={form.titleEn} onChange={e => set('titleEn', e.target.value)} required />
              </div>
              <div>
                <Label>Body (EN)</Label>
                <Textarea rows={14} value={form.bodyEn} onChange={e => set('bodyEn', e.target.value)} />
              </div>
            </>
          }
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="default" className="rounded-full" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create article'}</Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={() => router.push('/admin/news')}>Cancel</Button>
      </div>
    </form>
  );
}
