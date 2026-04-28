'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MultiImageUpload } from '@/components/admin/shared/multi-image-upload';
import { ImageUpload } from '@/components/admin/shared/image-upload';
import { BilingualTabs } from '@/components/admin/shared/bilingual-tabs';
import { updateCampaignsSettings } from '@/lib/actions/campaigns-settings';
import type { CampaignsPageSettings, DeliveredItem } from '@/types/database';

type Props = {
  settings: CampaignsPageSettings | null;
};

const MAX_DELIVERED = 3;

export function CampaignsPageForm({ settings }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [heroImages, setHeroImages] = useState<string[]>(settings?.hero_images ?? []);
  const [deliveredItems, setDeliveredItems] = useState<DeliveredItem[]>(
    settings?.delivered_items ?? [],
  );

  function addItem() {
    if (deliveredItems.length >= MAX_DELIVERED) return;
    setDeliveredItems([
      ...deliveredItems,
      { count: 0, image: '', label_ua: '', label_en: '' },
    ]);
  }

  function removeItem(i: number) {
    setDeliveredItems(deliveredItems.filter((_, idx) => idx !== i));
  }

  function updateItem<K extends keyof DeliveredItem>(
    i: number,
    key: K,
    val: DeliveredItem[K],
  ) {
    setDeliveredItems(
      deliveredItems.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await updateCampaignsSettings({ heroImages, deliveredItems });
    setSaving(false);
    if (result.success) {
      toast.success('Campaigns page updated');
      router.refresh();
    } else {
      toast.error(result.error ?? 'Something went wrong');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {/* Hero carousel */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-body font-semibold mb-1">Hero carousel</h2>
        <p className="text-caption text-text-tertiary mb-4">
          Top of Campaigns page, right column. Landscape images work best.
        </p>
        <MultiImageUpload
          value={heroImages}
          onChange={setHeroImages}
          folder="campaigns-hero"
          label="Hero images"
          requirements="Recommended: min 1200 × 900 px, landscape, JPG / WebP / PNG, under 4 MB each."
          minImages={1}
        />
      </div>

      {/* Recently delivered cards */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-body font-semibold">Recently delivered (max 3)</h2>
            <p className="text-caption text-text-tertiary">
              Number, image and bilingual label for each card under the description.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            disabled={deliveredItems.length >= MAX_DELIVERED}
            className="rounded-full"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add card
          </Button>
        </div>

        {deliveredItems.length === 0 && (
          <p className="text-body-sm text-text-tertiary py-4 text-center">
            No cards yet. Click &quot;Add card&quot; to create one.
          </p>
        )}

        <div className="space-y-4">
          {deliveredItems.map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-border p-4 bg-surface-secondary/40"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-body-sm font-medium">Card {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-red-600 hover:text-red-700"
                  aria-label="Remove card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
                <ImageUpload
                  value={item.image}
                  onChange={(url) => updateItem(i, 'image', url ?? '')}
                  folder="campaigns-delivered"
                  label="Image *"
                />
                <div className="space-y-3">
                  <div>
                    <Label>Number *</Label>
                    <Input
                      type="number"
                      min={0}
                      value={item.count}
                      onChange={(e) =>
                        updateItem(i, 'count', Number(e.target.value) || 0)
                      }
                      required
                    />
                  </div>
                  <BilingualTabs
                    ua={
                      <div>
                        <Label>Label (UA) *</Label>
                        <Input
                          value={item.label_ua}
                          onChange={(e) => updateItem(i, 'label_ua', e.target.value)}
                          placeholder="e.g. авто"
                          required
                        />
                      </div>
                    }
                    en={
                      <div>
                        <Label>Label (EN) *</Label>
                        <Input
                          value={item.label_en}
                          onChange={(e) => updateItem(i, 'label_en', e.target.value)}
                          placeholder="e.g. vehicles"
                          required
                        />
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          ))}
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
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
