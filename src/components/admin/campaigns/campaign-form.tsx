'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BilingualTabs } from '@/components/admin/shared/bilingual-tabs';
import { ImageUpload } from '@/components/admin/shared/image-upload';
import { createCampaign, updateCampaign } from '@/lib/actions/campaigns';
import { slugify } from '@/lib/slug';
import { useCancelWithConfirm } from '@/components/admin/shared/use-cancel-with-confirm';
import uaMessages from '../../../../messages/ua.json';
import enMessages from '../../../../messages/en.json';

type FaqItem = { q_ua: string; a_ua: string; q_en: string; a_en: string };
type DbFaqEntry = { question?: string; answer?: string };

// Pre-filled on every new campaign. Sourced from messages/{ua,en}.json so the
// content manager (or translator) can change the defaults without touching code.
function getDefaultFaqItems(): FaqItem[] {
  const ua = (uaMessages.campaigns?.default_faq ?? []) as DbFaqEntry[];
  const en = (enMessages.campaigns?.default_faq ?? []) as DbFaqEntry[];
  const length = Math.max(ua.length, en.length);
  const out: FaqItem[] = [];
  for (let i = 0; i < length; i++) {
    out.push({
      q_ua: ua[i]?.question ?? '',
      a_ua: ua[i]?.answer ?? '',
      q_en: en[i]?.question ?? '',
      a_en: en[i]?.answer ?? '',
    });
  }
  return out;
}

function zipFaqs(ua: unknown, en: unknown): FaqItem[] {
  const uaList = (Array.isArray(ua) ? ua : []) as DbFaqEntry[];
  const enList = (Array.isArray(en) ? en : []) as DbFaqEntry[];
  const length = Math.max(uaList.length, enList.length);
  const out: FaqItem[] = [];
  for (let i = 0; i < length; i++) {
    out.push({
      q_ua: uaList[i]?.question ?? '',
      a_ua: uaList[i]?.answer ?? '',
      q_en: enList[i]?.question ?? '',
      a_en: enList[i]?.answer ?? '',
    });
  }
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CampaignForm({ campaign }: { campaign?: Record<string, any> }) {
  const router = useRouter();
  const isEdit = !!campaign?.id;
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    titleUa: campaign?.title_ua ?? '',
    titleEn: campaign?.title_en ?? '',
    slugUa: campaign?.slug_ua ?? campaign?.slug ?? '',
    slugEn: campaign?.slug_en ?? campaign?.slug ?? '',
    descriptionUa: typeof campaign?.description_ua === 'string' ? campaign.description_ua : '',
    descriptionEn: typeof campaign?.description_en === 'string' ? campaign.description_en : '',
    coverImage: campaign?.cover_image ?? '',
    goalAmount: campaign?.goal_amount ?? 0,
    status: campaign?.status ?? 'DRAFT',
    order: campaign?.sort_order ?? 0,
  });

  // On new campaigns, pre-fill with the shared standard questions so the
  // content manager has a starting point — they can edit, delete, or add
  // campaign-specific questions on top.
  const [faqItems, setFaqItems] = useState<FaqItem[]>(() => {
    const existing = zipFaqs(campaign?.faq_ua, campaign?.faq_en);
    if (existing.length > 0) return existing;
    return campaign?.id ? [] : getDefaultFaqItems();
  });

  const [dirty, setDirty] = useState(false);
  const handleCancel = useCancelWithConfirm('/admin/campaigns', dirty);

  // Drafts can be saved with anything; publish-time fields are only
  // enforced when status leaves DRAFT (also re-checked server-side).
  const publishRequired = form.status !== 'DRAFT';

  function set(key: string, value: unknown) {
    setForm(f => ({ ...f, [key]: value }));
    setDirty(true);
  }

  function addFaq() {
    setFaqItems([...faqItems, { q_ua: '', a_ua: '', q_en: '', a_en: '' }]);
    setDirty(true);
  }
  function removeFaq(i: number) {
    setFaqItems(faqItems.filter((_, idx) => idx !== i));
    setDirty(true);
  }
  function updateFaq(i: number, key: keyof FaqItem, val: string) {
    setFaqItems(faqItems.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
    setDirty(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, faqItems };
    const result = isEdit ? await updateCampaign(campaign.id, payload) : await createCampaign(payload);
    setSaving(false);
    if (result.success) { toast.success(isEdit ? 'Campaign updated' : 'Campaign created'); router.push('/admin/campaigns'); }
    else toast.error(result.error ?? 'Something went wrong');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-body font-semibold">General</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Goal Amount (AUD){publishRequired ? ' *' : ''}</Label>
            <Input
              type="number"
              value={form.goalAmount}
              onChange={e => set('goalAmount', Number(e.target.value))}
              min={publishRequired ? 1 : 0}
              step="0.01"
              required={publishRequired}
            />
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
            <Label>Sort Order</Label>
            <Input
              type="number"
              value={form.order}
              onChange={e => set('order', Number(e.target.value))}
              min={0}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>URL (UA)</Label>
            <p className="mt-1 text-sm text-text-primary break-all">
              /ua/campaigns/<span className="font-medium">{form.slugUa || <span className="text-text-tertiary italic">generated from the UA title on save</span>}</span>
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Generated automatically from the title. Contact the developer to change it.
            </p>
          </div>
          <div>
            <Label>URL (EN)</Label>
            <p className="mt-1 text-sm text-text-primary break-all">
              /en/campaigns/<span className="font-medium">{form.slugEn || <span className="text-text-tertiary italic">generated from the EN title on save</span>}</span>
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              Generated automatically from the title. Contact the developer to change it.
            </p>
          </div>
        </div>
        <ImageUpload value={form.coverImage} onChange={url => set('coverImage', url ?? '')} folder="campaigns" label="Cover image" />
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-body font-semibold mb-4">Content</h2>
        <BilingualTabs
          ua={
            <>
              <div>
                <Label>Title (UA) *</Label>
                <Input value={form.titleUa} onChange={e => { set('titleUa', e.target.value); if (!isEdit) set('slugUa', slugify(e.target.value)); }} required />
              </div>
              <div>
                <Label>Description (UA){publishRequired ? ' *' : ''}</Label>
                <p className="mb-1 text-xs text-text-secondary">Plain text. Separate paragraphs with a blank line. A bit more or less is fine — ~755 characters (including spaces) is the ideal length.</p>
                <Textarea rows={5} value={form.descriptionUa} onChange={e => set('descriptionUa', e.target.value)} required={publishRequired} />
                <p className="mt-1 text-xs text-text-tertiary">
                  {form.descriptionUa.length} characters (ideal: ~755)
                </p>
              </div>
            </>
          }
          en={
            <>
              <div>
                <Label>Title (EN) *</Label>
                <Input value={form.titleEn} onChange={e => { set('titleEn', e.target.value); if (!isEdit) set('slugEn', slugify(e.target.value)); }} required />
              </div>
              <div>
                <Label>Description (EN){publishRequired ? ' *' : ''}</Label>
                <p className="mb-1 text-xs text-text-secondary">Plain text. Separate paragraphs with a blank line. A bit more or less is fine — ~755 characters (including spaces) is the ideal length.</p>
                <Textarea rows={5} value={form.descriptionEn} onChange={e => set('descriptionEn', e.target.value)} required={publishRequired} />
                <p className="mt-1 text-xs text-text-tertiary">
                  {form.descriptionEn.length} characters (ideal: ~755)
                </p>
              </div>
            </>
          }
        />
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-body font-semibold">Common Questions</h2>
            <p className="text-caption text-text-tertiary">
              Shown on the &quot;Часті питання&quot; tab of the active campaign page. New campaigns start with a set of standard questions that apply to every fundraiser — edit, remove, or keep them, and add anything specific to this campaign. Each question needs both UA and EN.
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
                      <Label>Question (UA){publishRequired ? ' *' : ''}</Label>
                      <Input
                        value={item.q_ua}
                        onChange={(e) => updateFaq(i, 'q_ua', e.target.value)}
                        required={publishRequired}
                      />
                    </div>
                    <div>
                      <Label>Answer (UA){publishRequired ? ' *' : ''}</Label>
                      <Textarea
                        rows={3}
                        value={item.a_ua}
                        onChange={(e) => updateFaq(i, 'a_ua', e.target.value)}
                        required={publishRequired}
                      />
                    </div>
                  </>
                }
                en={
                  <>
                    <div>
                      <Label>Question (EN){publishRequired ? ' *' : ''}</Label>
                      <Input
                        value={item.q_en}
                        onChange={(e) => updateFaq(i, 'q_en', e.target.value)}
                        required={publishRequired}
                      />
                    </div>
                    <div>
                      <Label>Answer (EN){publishRequired ? ' *' : ''}</Label>
                      <Textarea
                        rows={3}
                        value={item.a_en}
                        onChange={(e) => updateFaq(i, 'a_en', e.target.value)}
                        required={publishRequired}
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
        <Button type="submit" size="lg" variant="default" className="rounded-full" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create campaign'}</Button>
        <Button type="button" size="lg" variant="destructive" className="rounded-full" onClick={handleCancel}>Cancel</Button>
      </div>
    </form>
  );
}
