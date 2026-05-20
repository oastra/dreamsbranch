'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BilingualTabs } from '@/components/admin/shared/bilingual-tabs';
import { MultiImageUpload } from '@/components/admin/shared/multi-image-upload';
import { useCancelWithConfirm } from '@/components/admin/shared/use-cancel-with-confirm';
import {
  createCateringEvent,
  updateCateringEvent,
} from '@/lib/actions/catering-events';
import { CATERING_EVENT_LIMITS } from '@/lib/validations';
import type { CateringEvent } from '@/types/database';

function CharCount({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span
      className={`text-caption ${over ? 'text-red-600' : 'text-text-tertiary'}`}
    >
      {value.length} / {max}
    </span>
  );
}

function FieldLabel({
  children,
  value,
  max,
}: {
  children: React.ReactNode;
  value: string;
  max: number;
}) {
  return (
    <div className="mb-1 flex items-baseline justify-between gap-2">
      <Label className="mb-0">{children}</Label>
      <CharCount value={value} max={max} />
    </div>
  );
}

type Props = {
  event?: CateringEvent;
};

export function CateringEventForm({ event }: Props) {
  const router = useRouter();
  const isEdit = !!event?.id;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    titleUa: event?.title_ua ?? '',
    titleEn: event?.title_en ?? '',
    descriptionUa: event?.description_ua ?? '',
    descriptionEn: event?.description_en ?? '',
    locationUa: event?.location_ua ?? '',
    locationEn: event?.location_en ?? '',
    sortOrder: event?.sort_order ?? 0,
  });
  const [images, setImages] = useState<string[]>(event?.images ?? []);

  const [dirty, setDirty] = useState(false);
  const handleCancel = useCancelWithConfirm('/admin/catering-page', dirty);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  function handleImagesChange(next: string[]) {
    setImages(next);
    setDirty(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (images.length !== 5) {
      toast.error('Exactly 5 images are required');
      return;
    }
    setSaving(true);
    const payload = { ...form, images };
    const result = isEdit
      ? await updateCateringEvent(event!.id, payload)
      : await createCateringEvent(payload);
    setSaving(false);
    if (result.success) {
      toast.success(isEdit ? 'Event updated' : 'Event created');
      setDirty(false);
      if (!isEdit && 'id' in result && result.id) {
        router.push(`/admin/catering-page/events/${result.id}`);
      } else {
        router.refresh();
      }
    } else {
      toast.error(result.error ?? 'Something went wrong');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl space-y-6">
      {/* Bilingual content */}
      <div className="rounded-xl border border-border bg-white p-6 space-y-4">
        <h2 className="text-body font-semibold">Event content</h2>
        <BilingualTabs
          ua={
            <>
              <div>
                <FieldLabel value={form.titleUa} max={CATERING_EVENT_LIMITS.title}>
                  Title (UA) *
                </FieldLabel>
                <Input
                  value={form.titleUa}
                  onChange={(e) => set('titleUa', e.target.value)}
                  placeholder="Ювілей Надії"
                  maxLength={CATERING_EVENT_LIMITS.title}
                  required
                />
              </div>
              <div>
                <FieldLabel
                  value={form.descriptionUa}
                  max={CATERING_EVENT_LIMITS.description}
                >
                  Description (UA) *
                </FieldLabel>
                <Textarea
                  rows={4}
                  value={form.descriptionUa}
                  onChange={(e) => set('descriptionUa', e.target.value)}
                  maxLength={CATERING_EVENT_LIMITS.description}
                  required
                />
              </div>
              <div>
                <FieldLabel value={form.locationUa} max={CATERING_EVENT_LIMITS.location}>
                  Location (UA) *
                </FieldLabel>
                <Input
                  value={form.locationUa}
                  onChange={(e) => set('locationUa', e.target.value)}
                  placeholder="Сідней, Австралія"
                  maxLength={CATERING_EVENT_LIMITS.location}
                  required
                />
              </div>
            </>
          }
          en={
            <>
              <div>
                <FieldLabel value={form.titleEn} max={CATERING_EVENT_LIMITS.title}>
                  Title (EN) *
                </FieldLabel>
                <Input
                  value={form.titleEn}
                  onChange={(e) => set('titleEn', e.target.value)}
                  placeholder="Nadiya's anniversary"
                  maxLength={CATERING_EVENT_LIMITS.title}
                  required
                />
              </div>
              <div>
                <FieldLabel
                  value={form.descriptionEn}
                  max={CATERING_EVENT_LIMITS.description}
                >
                  Description (EN) *
                </FieldLabel>
                <Textarea
                  rows={4}
                  value={form.descriptionEn}
                  onChange={(e) => set('descriptionEn', e.target.value)}
                  maxLength={CATERING_EVENT_LIMITS.description}
                  required
                />
              </div>
              <div>
                <FieldLabel value={form.locationEn} max={CATERING_EVENT_LIMITS.location}>
                  Location (EN) *
                </FieldLabel>
                <Input
                  value={form.locationEn}
                  onChange={(e) => set('locationEn', e.target.value)}
                  placeholder="Sydney, Australia"
                  maxLength={CATERING_EVENT_LIMITS.location}
                  required
                />
              </div>
            </>
          }
        />
      </div>

      {/* Images */}
      <div className="rounded-xl border border-border bg-white p-6">
        <h2 className="text-body font-semibold mb-1">Photos</h2>
        <p className="mb-4 text-caption text-text-tertiary">
          Exactly 5 photos. The first photo is used as the cover on mobile.
        </p>
        <MultiImageUpload
          value={images}
          onChange={handleImagesChange}
          folder="catering-events"
          label="Event photos (min 5, max 5)"
          minImages={5}
          maxImages={5}
        />
      </div>

      {/* Meta */}
      <div className="rounded-xl border border-border bg-white p-6">
        <h2 className="text-body font-semibold mb-4">Display</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Sort order</Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', Number(e.target.value))}
            />
            <p className="mt-1 text-caption text-text-tertiary">
              Lower numbers appear first.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          size="lg"
          variant="default"
          className="rounded-full"
          disabled={saving}
        >
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create event'}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="destructive"
          className="rounded-full"
          disabled={saving}
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
