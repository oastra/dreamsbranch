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
import { MultiImageUpload } from '@/components/admin/shared/multi-image-upload';
import { createEvent, updateEvent } from '@/lib/actions/events';
import { slugify } from '@/lib/slug';

type LineItem = { label: string; amount: number };
type FinancialReport = { income: LineItem[]; expenses: LineItem[]; profit: number };

const EMPTY_LINE: LineItem = { label: '', amount: 0 };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EventForm({ event }: { event?: Record<string, any> }) {
  const router = useRouter();
  const isEdit = !!event?.id;
  const [saving, setSaving] = useState(false);

  const initialReport: FinancialReport = (event?.financial_report as FinancialReport) ?? {
    income: [{ ...EMPTY_LINE }],
    expenses: [{ ...EMPTY_LINE }],
    profit: 0,
  };

  const [form, setForm] = useState({
    titleUa: event?.title_ua ?? '',
    titleEn: event?.title_en ?? '',
    slugUa: event?.slug_ua ?? event?.slug ?? '',
    slugEn: event?.slug_en ?? event?.slug ?? '',
    descriptionUa: typeof event?.description_ua === 'string' ? event.description_ua : '',
    descriptionEn: typeof event?.description_en === 'string' ? event.description_en : '',
    coverImage: event?.cover_image ?? '',
    secondaryImage: event?.secondary_image ?? '',
    galleryImages: (event?.gallery_images ?? []) as string[],
    date: event?.event_date ? String(event.event_date).split('T')[0] : event?.date ? String(event.date).split('T')[0] : '',
    startTime: event?.start_time ?? '',
    endTime: event?.end_time ?? '',
    location: event?.location ?? '',
    locationMapUrl: event?.location_map_url ?? '',
    status: event?.status ?? 'DRAFT',
    volunteerCta: event?.show_volunteer_cta ?? event?.volunteer_cta ?? false,
    tags: (event?.tags ?? []) as string[],
    financialReport: initialReport,
  });

  function setLine(kind: 'income' | 'expenses', index: number, key: 'label' | 'amount', value: string) {
    setForm(f => {
      const list = [...f.financialReport[kind]];
      list[index] = { ...list[index], [key]: key === 'amount' ? Number(value) : value };
      return { ...f, financialReport: { ...f.financialReport, [kind]: list } };
    });
  }
  function addLine(kind: 'income' | 'expenses') {
    setForm(f => ({ ...f, financialReport: { ...f.financialReport, [kind]: [...f.financialReport[kind], { ...EMPTY_LINE }] } }));
  }
  function removeLine(kind: 'income' | 'expenses', index: number) {
    setForm(f => ({ ...f, financialReport: { ...f.financialReport, [kind]: f.financialReport[kind].filter((_, i) => i !== index) } }));
  }
  function setProfit(value: string) {
    setForm(f => ({ ...f, financialReport: { ...f.financialReport, profit: Number(value) } }));
  }

  function set(key: string, value: unknown) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function toggleTag(tag: string) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }));
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // Only include the financial report when at least one income line was filled.
    const reportFilled =
      form.financialReport.income.some((l) => l.label.trim() || l.amount) ||
      form.financialReport.expenses.some((l) => l.label.trim() || l.amount);
    const payload = {
      ...form,
      date: new Date(form.date),
      financialReport: reportFilled ? form.financialReport : undefined,
    };
    const result = isEdit ? await updateEvent(event.id, payload) : await createEvent(payload);
    setSaving(false);
    if (result.success) {
      toast.success(isEdit ? 'Event updated' : 'Event created');
      router.push('/admin/events');
    } else {
      toast.error(result.error ?? 'Something went wrong');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-body font-semibold">General</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Date *</Label>
            <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
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
            <Label>Start time</Label>
            <Input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
          </div>
          <div>
            <Label>End time</Label>
            <Input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
          </div>
          <div>
            <Label>Location</Label>
            <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, venue" />
          </div>
          <div>
            <Label>Map URL</Label>
            <Input value={form.locationMapUrl} onChange={e => set('locationMapUrl', e.target.value)} placeholder="https://maps.google.com/..." />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Slug (UA) *</Label>
            <Input value={form.slugUa} onChange={e => set('slugUa', e.target.value)} placeholder="podiia" required />
            <p className="text-xs text-text-secondary mt-1">URL: /ua/events/{form.slugUa || '...'}</p>
          </div>
          <div>
            <Label>Slug (EN) *</Label>
            <Input value={form.slugEn} onChange={e => set('slugEn', e.target.value)} placeholder="event-name" required />
            <p className="text-xs text-text-secondary mt-1">URL: /en/events/{form.slugEn || '...'}</p>
          </div>
        </div>
        <ImageUpload
          value={form.coverImage}
          onChange={url => set('coverImage', url ?? '')}
          folder="events"
          label="Cover image — large hero (.webp, ~16:9)"
        />

        <ImageUpload
          value={form.secondaryImage}
          onChange={url => set('secondaryImage', url ?? '')}
          folder="events"
          label="Secondary image — smaller, shown next to the description (.webp, ~4:3). Leave empty to reuse the cover image."
        />

        <MultiImageUpload
          value={form.galleryImages}
          onChange={urls => set('galleryImages', urls)}
          folder="events"
          label="Gallery images (archived events) — up to 6 photos"
          requirements=".webp, ~1:1 (square). First two appear next to the financial card; the rest fill the row below."
          minImages={0}
        />

        <div>
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { value: 'looking_for_partners', label: 'Looking for partners' },
              { value: 'looking_for_volunteers', label: 'Looking for volunteers' },
            ].map(tag => {
              const active = form.tags.includes(tag.value);
              return (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => toggleTag(tag.value)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    active
                      ? 'border-secondary bg-secondary text-white'
                      : 'border-border bg-white text-text-strong hover:bg-grey-40'
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.volunteerCta}
            onChange={e => set('volunteerCta', e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm">Show volunteer CTA on event page</span>
        </label>
      </div>

      {/* ── Financial report — only used when status = ARCHIVED ───── */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <div>
          <h2 className="text-body font-semibold">Financial report</h2>
          <p className="mt-1 text-xs text-text-secondary">
            Only shown on the public page when status = <strong>Archived</strong>. Leave blank to hide. Each line: a label (the same string is shown to UA + EN visitors) and a numeric amount in AUD. Use <code>+$890 - PayPal збір</code> style labels.
          </p>
        </div>

        {(['income', 'expenses'] as const).map((kind) => (
          <div key={kind} className="space-y-2">
            <Label>{kind === 'income' ? 'Income lines' : 'Expense lines'}</Label>
            {form.financialReport[kind].map((line, i) => (
              <div key={i} className="grid grid-cols-[1fr_140px_auto] gap-2">
                <Input
                  placeholder={kind === 'income' ? "$2 938 - cash" : "-$1 411,60 - оренда будинку"}
                  value={line.label}
                  onChange={(e) => setLine(kind, i, 'label', e.target.value)}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={line.amount || ''}
                  onChange={(e) => setLine(kind, i, 'amount', e.target.value)}
                />
                <Button type="button" variant="outline" onClick={() => removeLine(kind, i)} className="px-3">
                  ✕
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addLine(kind)} className="rounded-full">
              + Add {kind === 'income' ? 'income' : 'expense'} line
            </Button>
          </div>
        ))}

        <div className="max-w-xs">
          <Label>Profit (AUD)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.financialReport.profit || ''}
            onChange={(e) => setProfit(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-body font-semibold mb-4">Content</h2>
        <BilingualTabs
          ua={
            <>
              <div>
                <Label>Title (UA) *</Label>
                <Input value={form.titleUa} onChange={e => { set('titleUa', e.target.value); if (!isEdit && !form.slugUa) set('slugUa', slugify(e.target.value)); }} required />
              </div>
              <div>
                <Label>Description (UA)</Label>
                <p className="mb-1 text-xs text-text-secondary">Plain text. Separate paragraphs with a blank line.</p>
                <Textarea rows={6} value={form.descriptionUa} onChange={e => set('descriptionUa', e.target.value)} />
              </div>
            </>
          }
          en={
            <>
              <div>
                <Label>Title (EN) *</Label>
                <Input value={form.titleEn} onChange={e => { set('titleEn', e.target.value); if (!isEdit && !form.slugEn) set('slugEn', slugify(e.target.value)); }} required />
              </div>
              <div>
                <Label>Description (EN)</Label>
                <p className="mb-1 text-xs text-text-secondary">Plain text. Separate paragraphs with a blank line.</p>
                <Textarea rows={6} value={form.descriptionEn} onChange={e => set('descriptionEn', e.target.value)} />
              </div>
            </>
          }
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" variant="default" className="rounded-full" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create event'}
        </Button>
        <Button type="button" size="lg" variant="outline" className="rounded-full" onClick={() => router.push('/admin/events')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
