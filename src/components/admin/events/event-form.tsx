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
import { createEvent, updateEvent } from '@/lib/actions/events';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EventForm({ event }: { event?: Record<string, any> }) {
  const router = useRouter();
  const isEdit = !!event?.id;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    titleUa: event?.title_ua ?? '',
    titleEn: event?.title_en ?? '',
    slug: event?.slug ?? '',
    descriptionUa: event?.description_ua ?? '',
    descriptionEn: event?.description_en ?? '',
    coverImage: event?.cover_image ?? '',
    date: event?.date ? String(event.date).split('T')[0] : '',
    startTime: event?.start_time ?? '',
    endTime: event?.end_time ?? '',
    location: event?.location ?? '',
    locationMapUrl: event?.location_map_url ?? '',
    status: event?.status ?? 'DRAFT',
    volunteerCta: event?.volunteer_cta ?? false,
  });

  function set(key: string, value: unknown) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function autoSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, date: new Date(form.date) };
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
        <div>
          <Label>Slug *</Label>
          <Input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="event-name" required />
        </div>
        <ImageUpload value={form.coverImage} onChange={url => set('coverImage', url ?? '')} folder="events" label="Cover image" />
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-body font-semibold mb-4">Content</h2>
        <BilingualTabs
          ua={
            <>
              <div>
                <Label>Title (UA) *</Label>
                <Input value={form.titleUa} onChange={e => { set('titleUa', e.target.value); if (!isEdit && !form.slug) set('slug', autoSlug(e.target.value)); }} required />
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
                <Input value={form.titleEn} onChange={e => set('titleEn', e.target.value)} required />
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
