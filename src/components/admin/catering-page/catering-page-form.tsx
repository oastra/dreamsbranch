'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BilingualTabs } from '@/components/admin/shared/bilingual-tabs';
import { useCancelWithConfirm } from '@/components/admin/shared/use-cancel-with-confirm';
import { updateCateringPageSettings } from '@/lib/actions/catering-page';
import type { CateringPageSettings, FaqItem } from '@/types/database';

type Props = {
  settings: CateringPageSettings | null;
};

export function CateringPageForm({ settings }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [faqItems, setFaqItems] = useState<FaqItem[]>(
    (settings?.faq_items ?? []) as unknown as FaqItem[],
  );

  const [dirty, setDirty] = useState(false);
  const skipFirstRun = useRef(true);
  useEffect(() => {
    if (skipFirstRun.current) {
      skipFirstRun.current = false;
      return;
    }
    setDirty(true);
  }, [faqItems]);
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
    const result = await updateCateringPageSettings({ faqItems });
    setSaving(false);
    if (result.success) {
      toast.success('Catering page updated');
      setDirty(false);
      router.refresh();
    } else {
      toast.error(result.error ?? 'Something went wrong');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl space-y-6">
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-body font-semibold">Frequently asked questions</h2>
            <p className="text-caption text-text-tertiary">
              Bilingual Q&amp;A shown in the FAQ block on /shop/catering.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFaq}
            className="rounded-full"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add question
          </Button>
        </div>

        {faqItems.length === 0 && (
          <p className="py-4 text-center text-body-sm text-text-tertiary">
            No questions yet. Click &quot;Add question&quot; to create one.
          </p>
        )}

        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-surface-secondary/40 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-body-sm font-medium">Question {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeFaq(i)}
                  className="text-red-600 hover:text-red-700"
                  aria-label="Remove question"
                >
                  <Trash2 className="h-4 w-4" />
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
