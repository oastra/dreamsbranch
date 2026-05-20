'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MultiImageUpload } from '@/components/admin/shared/multi-image-upload';
import { useCancelWithConfirm } from '@/components/admin/shared/use-cancel-with-confirm';
import { updateHomeSettings } from '@/lib/actions/home';
import type { HomePageSettings } from '@/types/database';

type Props = {
  settings: HomePageSettings | null;
};

export function HomeForm({ settings }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [heroImages, setHeroImages] = useState<string[]>(settings?.hero_images ?? []);
  const [yearsValue, setYearsValue] = useState(settings?.years_value ?? '');
  const [membersValue, setMembersValue] = useState(settings?.members_value ?? '');
  const [raisedValue, setRaisedValue] = useState(settings?.raised_value ?? '');
  const [transparencyValue, setTransparencyValue] = useState(
    settings?.transparency_value ?? '',
  );

  const [dirty, setDirty] = useState(false);
  const skipFirstRun = useRef(true);
  useEffect(() => {
    if (skipFirstRun.current) {
      skipFirstRun.current = false;
      return;
    }
    setDirty(true);
  }, [heroImages, yearsValue, membersValue, raisedValue, transparencyValue]);
  const handleCancel = useCancelWithConfirm('/admin', dirty);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await updateHomeSettings({
      heroImages,
      yearsValue,
      membersValue,
      raisedValue,
      transparencyValue,
    });
    setSaving(false);
    if (result.success) {
      toast.success('Home page updated');
      setDirty(false);
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
          Top of Home page, right column. Landscape images work best.
        </p>
        <MultiImageUpload
          value={heroImages}
          onChange={setHeroImages}
          folder="home-hero"
          label="Hero images (landscape, ~4:3, min 1200 × 900)"
          minImages={4}
        />
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-body font-semibold mb-1">Results</h2>
        <p className="text-caption text-text-tertiary mb-4">
          The four numbers shown in the Results section on both the Home and About pages.
          Labels stay in i18n.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Years (e.g. &quot;4&quot;)</Label>
            <Input value={yearsValue} onChange={(e) => setYearsValue(e.target.value)} />
          </div>
          <div>
            <Label>Members / events (e.g. &quot;1 200&quot;)</Label>
            <Input
              value={membersValue}
              onChange={(e) => setMembersValue(e.target.value)}
            />
          </div>
          <div>
            <Label>Raised (e.g. &quot;$12 000&quot;)</Label>
            <Input value={raisedValue} onChange={(e) => setRaisedValue(e.target.value)} />
          </div>
          <div>
            <Label>Transparency (e.g. &quot;100%&quot;)</Label>
            <Input
              value={transparencyValue}
              onChange={(e) => setTransparencyValue(e.target.value)}
            />
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
          {saving ? 'Saving...' : 'Save changes'}
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
