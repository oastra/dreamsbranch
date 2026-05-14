'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BilingualTabs } from '@/components/admin/shared/bilingual-tabs';
import { ImageUpload } from '@/components/admin/shared/image-upload';
import { MultiImageUpload } from '@/components/admin/shared/multi-image-upload';
import { RichTextEditor } from '@/components/admin/shared/rich-text-editor';
import { useCancelWithConfirm } from '@/components/admin/shared/use-cancel-with-confirm';
import { createArticle, updateArticle } from '@/lib/actions/news';
import { slugify } from '@/lib/slug';

const CATEGORIES = ['Fundraising', 'Events', 'Announcements', 'Reports', 'News', 'Other'];

// Count plain-text characters in a body value that may be either a Tiptap JSON
// doc (new rich-text editor) or a legacy plain string. Headings + bold marks +
// image nodes contribute zero to the count.
function bodyCharCount(value: unknown): number {
  if (!value) return 0;
  if (typeof value === 'string') return value.trim().length;
  if (typeof value !== 'object') return 0;
  type Node = { text?: string; content?: Node[] };
  let count = 0;
  const walk = (node: Node) => {
    if (typeof node.text === 'string') count += node.text.length;
    node.content?.forEach(walk);
  };
  (value as Node).content?.forEach(walk);
  return count;
}

const BODY_IDEAL_CHARS = 1800;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ArticleForm({ article }: { article?: Record<string, any> }) {
  const router = useRouter();
  const isEdit = !!article?.id;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    titleUa: article?.title_ua ?? '',
    titleEn: article?.title_en ?? '',
    slugUa: article?.slug_ua ?? article?.slug ?? '',
    slugEn: article?.slug_en ?? article?.slug ?? '',
    bodyUa: article?.body_ua ?? '',
    bodyEn: article?.body_en ?? '',
    coverImage: article?.cover_image ?? '',
    galleryImages: (article?.gallery_images ?? []) as string[],
    category: article?.category ?? '',
    isFeatured: article?.is_featured ?? false,
    status: article?.status ?? 'DRAFT',
  });

  const [dirty, setDirty] = useState(false);
  const handleCancel = useCancelWithConfirm('/admin/news', dirty);

  function set(key: string, value: unknown) {
    setForm(f => ({ ...f, [key]: value }));
    setDirty(true);
  }

  function handleTitleUaChange(value: string) {
    set('titleUa', value);
    if (!isEdit) set('slugUa', slugify(value));
  }
  function handleTitleEnChange(value: string) {
    set('titleEn', value);
    if (!isEdit) set('slugEn', slugify(value));
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>URL (UA)</Label>
            <p className="mt-1 text-sm text-text-primary break-all">
              /ua/news/<span className="font-medium">{form.slugUa || <span className="text-text-tertiary italic">generated from the UA title on save</span>}</span>
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Generated automatically from the title. Contact the developer to change it.
            </p>
          </div>
          <div>
            <Label>URL (EN)</Label>
            <p className="mt-1 text-sm text-text-primary break-all">
              /en/news/<span className="font-medium">{form.slugEn || <span className="text-text-tertiary italic">generated from the EN title on save</span>}</span>
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Generated automatically from the title. Contact the developer to change it.
            </p>
          </div>
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

        <ImageUpload
          value={form.coverImage}
          onChange={url => set('coverImage', url ?? '')}
          folder="news"
          label="Cover image (~16:11 landscape) — shown in news listings + at the top of the article"
        />

        <MultiImageUpload
          value={form.galleryImages}
          onChange={urls => set('galleryImages', urls)}
          folder="news"
          label="Gallery images (~4:3) — shown in a grid below the article body"
        />
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-body font-semibold mb-4">Content</h2>
        <BilingualTabs
          ua={
            <>
              <div>
                <Label>Title (UA) *</Label>
                <Input value={form.titleUa} onChange={e => handleTitleUaChange(e.target.value)} required />
              </div>
              <div>
                <Label>Body (UA)</Label>
                <p className="mb-1 text-xs text-text-secondary">
                  Use the toolbar for headings and bold/italic. Aim for around {BODY_IDEAL_CHARS} characters (a bit more or less is fine).
                </p>
                <RichTextEditor
                  value={form.bodyUa}
                  onChange={(val) => set('bodyUa', val)}
                  uploadFolder="news"
                />
                <p className="mt-1 text-xs text-text-tertiary">
                  {bodyCharCount(form.bodyUa)} characters (ideal: ~{BODY_IDEAL_CHARS})
                </p>
              </div>
            </>
          }
          en={
            <>
              <div>
                <Label>Title (EN) *</Label>
                <Input value={form.titleEn} onChange={e => handleTitleEnChange(e.target.value)} required />
              </div>
              <div>
                <Label>Body (EN)</Label>
                <p className="mb-1 text-xs text-text-secondary">
                  Use the toolbar for headings and bold/italic. Aim for around {BODY_IDEAL_CHARS} characters (a bit more or less is fine).
                </p>
                <RichTextEditor
                  value={form.bodyEn}
                  onChange={(val) => set('bodyEn', val)}
                  uploadFolder="news"
                />
                <p className="mt-1 text-xs text-text-tertiary">
                  {bodyCharCount(form.bodyEn)} characters (ideal: ~{BODY_IDEAL_CHARS})
                </p>
              </div>
            </>
          }
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" variant="default" className="rounded-full" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create article'}</Button>
        <Button type="button" size="lg" variant="destructive" className="rounded-full" onClick={handleCancel}>Cancel</Button>
      </div>
    </form>
  );
}
