'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { MultiImageUpload } from '@/components/admin/shared/multi-image-upload';
import { BilingualTabs } from '@/components/admin/shared/bilingual-tabs';
import { useCancelWithConfirm } from '@/components/admin/shared/use-cancel-with-confirm';
import { updateAboutSettings } from '@/lib/actions/about';
import type { AboutPageSettings, FaqItem } from '@/types/database';

type Props = {
  settings: AboutPageSettings | null;
};

export function AboutForm({ settings }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [heroImages, setHeroImages] = useState<string[]>(settings?.hero_images ?? []);
  const [teamImages, setTeamImages] = useState<string[]>(settings?.team_images ?? []);
  const [faqItems, setFaqItems] = useState<FaqItem[]>(
    (settings?.faq_items ?? []) as unknown as FaqItem[],
  );

  // Any change to a tracked field flips `dirty`. The ref skips the
  // initial-mount effect run so an untouched form doesn't claim it's
  // dirty. The Save handler resets it once the row is persisted.
  const [dirty, setDirty] = useState(false);
  const skipFirstRun = useRef(true);
  useEffect(() => {
    if (skipFirstRun.current) {
      skipFirstRun.current = false;
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDirty(true);
  }, [heroImages, teamImages, faqItems]);
  const handleCancel = useCancelWithConfirm('/admin', dirty);

  function addFaq() {
    setFaqItems([...faqItems, { q_ua: '', a_ua: '', q_en: '', a_en: '' }]);
  }
  function removeFaq(i: number) {
    setFaqItems(faqItems.filter((_, idx) => idx !== i));
  }
  function updateFaq(i: number, key: keyof FaqItem, val: string) {
    setFaqItems(faqItems.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await updateAboutSettings({
      heroImages,
      teamImages,
      faqItems,
    });
    setSaving(false);
    if (result.success) {
      toast.success('About page updated');
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
          Top of About page, right column. Landscape images work best.
        </p>
        <MultiImageUpload
          value={heroImages}
          onChange={setHeroImages}
          folder="about-hero"
          label="Hero images (landscape, ~4:3, min 1200 × 900)"
          minImages={4}
        />
      </div>

      {/* Team carousel */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-body font-semibold mb-1">Team carousel (full-width)</h2>
        <p className="text-caption text-text-tertiary mb-4">
          Full-width strip below the About-the-Team section. Wide aspect ratio.
        </p>
        <MultiImageUpload
          value={teamImages}
          onChange={setTeamImages}
          folder="about-team"
          label="Team images (landscape, ≈2.37:1, min 1920 × 810)"
          minImages={4}
        />
      </div>

      {/* Common Questions */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-body font-semibold">Common Questions</h2>
            <p className="text-caption text-text-tertiary">
              Question & answer pairs in Ukrainian and English.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFaq}
            className="rounded-full"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add question
          </Button>
        </div>

        {faqItems.length === 0 && (
          <p className="text-body-sm text-text-tertiary py-4 text-center">
            No questions yet. Click &quot;Add question&quot; to create one.
          </p>
        )}

        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-border p-4 bg-surface-secondary/40"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-body-sm font-medium">Question {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeFaq(i)}
                  className="text-red-600 hover:text-red-700"
                  aria-label="Remove question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <BilingualTabs
                ua={
                  <>
                    <div>
                      <Label>Question (UA) *</Label>
                      <Input
                        value={item.q_ua}
                        onChange={(e) => updateFaq(i, 'q_ua', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Answer (UA) *</Label>
                      <Textarea
                        rows={3}
                        value={item.a_ua}
                        onChange={(e) => updateFaq(i, 'a_ua', e.target.value)}
                        required
                      />
                    </div>
                  </>
                }
                en={
                  <>
                    <div>
                      <Label>Question (EN) *</Label>
                      <Input
                        value={item.q_en}
                        onChange={(e) => updateFaq(i, 'q_en', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Answer (EN) *</Label>
                      <Textarea
                        rows={3}
                        value={item.a_en}
                        onChange={(e) => updateFaq(i, 'a_en', e.target.value)}
                        required
                      />
                    </div>
                  </>
                }
              />
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
          {saving ? (
            <>
              <Spinner size="sm" aria-hidden />
              Saving...
            </>
          ) : (
            'Save changes'
          )}
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
