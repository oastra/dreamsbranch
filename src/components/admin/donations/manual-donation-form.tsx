'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createManualDonation } from '@/lib/actions/donations';
import { useCancelWithConfirm } from '@/components/admin/shared/use-cancel-with-confirm';

export type CampaignOption = { id: string; title: string };

type Props = {
  campaigns: CampaignOption[];
};

export function ManualDonationForm({ campaigns }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    campaignId: campaigns[0]?.id ?? '',
    donorName: '',
    donorEmail: '',
    amount: '' as string | number,
    isAnonymous: false,
    note: '',
  });

  const [dirty, setDirty] = useState(false);
  const handleCancel = useCancelWithConfirm('/admin/donations', dirty);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await createManualDonation(form);
    setSaving(false);
    if (result.success) {
      toast.success('Donation recorded');
      router.push('/admin/donations');
      router.refresh();
    } else {
      toast.error(result.error ?? 'Something went wrong');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-body font-semibold">Record a manual donation</h2>
        <p className="text-caption text-text-tertiary">
          Use this for cash, bank transfers or any donation collected outside Stripe / PayPal.
          The campaign&apos;s raised total updates automatically.
        </p>

        <div>
          <Label>Campaign *</Label>
          {campaigns.length === 0 ? (
            <p className="text-body-sm text-text-tertiary py-2">
              No campaigns available. Create a campaign first.
            </p>
          ) : (
            <Select
              value={form.campaignId}
              onValueChange={(v) => set('campaignId', v ?? '')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Donor name *</Label>
            <Input
              value={form.donorName}
              onChange={(e) => set('donorName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Amount (AUD) *</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label>Donor email</Label>
          <Input
            type="email"
            value={form.donorEmail}
            onChange={(e) => set('donorEmail', e.target.value)}
            placeholder="optional"
          />
        </div>

        <label className="flex items-center gap-2 text-body-sm">
          <input
            type="checkbox"
            checked={form.isAnonymous}
            onChange={(e) => set('isAnonymous', e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Show as anonymous on the public site
        </label>

        <div>
          <Label>Internal note</Label>
          <Textarea
            rows={3}
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            placeholder="optional — visible only in admin"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          size="lg"
          variant="default"
          className="rounded-full"
          disabled={saving || campaigns.length === 0}
        >
          {saving ? 'Saving...' : 'Record donation'}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="destructive"
          className="rounded-full"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
