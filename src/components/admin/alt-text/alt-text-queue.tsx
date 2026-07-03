'use client';
import { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  approveAltTextAction,
  rejectAltTextAction,
  runAltTextBacklogAction,
} from '@/lib/actions/alt-text';
import type { ImageAltTextRow } from '@/lib/alt-text/types';
import { cn } from '@/lib/utils';

// Each click generates this many images synchronously. Kept small so the server
// action finishes quickly and reliably (Sonnet vision ≈ a few seconds each) —
// click again for more, or use scripts/run-alt-text-backlog.ts for a bulk drain.
const GENERATE_BATCH = 5;
// Soft screen-reader ceiling for alt text — over this, screen readers get
// verbose. Shown as a live counter so reviewers can trim before approving.
const ALT_LIMIT = 125;

interface Props {
  pending: ImageAltTextRow[];
  backlogCount: number;
}

export function AltTextQueue({ pending, backlogCount }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(pending);
  const [generating, startGenerating] = useTransition();

  // Re-sync with the server whenever it sends fresh pending rows (after a
  // router.refresh() following a generate run). Without this, useState keeps its
  // initial snapshot and newly generated cards never appear.
  useEffect(() => {
    setRows(pending);
  }, [pending]);

  function removeRow(url: string) {
    setRows((r) => r.filter((row) => row.url !== url));
  }

  function handleGenerate() {
    startGenerating(async () => {
      const res = await runAltTextBacklogAction(GENERATE_BATCH);
      if (!res.success) {
        toast.error(res.error ?? 'Generation failed');
        return;
      }
      toast.success(
        `Generated ${res.processed} image${res.processed === 1 ? '' : 's'}` +
          (res.failed ? `, ${res.failed} failed` : '') +
          `. ${res.remaining} still need alt text.`,
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-body text-text-secondary">
          <span className="font-medium text-text-primary">{rows.length}</span> awaiting review
          {backlogCount > 0 && (
            <>
              {' · '}
              <span className="font-medium text-text-primary">{backlogCount}</span> not generated yet
            </>
          )}
        </div>
        <Button
          variant="secondary"
          size="lg"
          className="rounded-full"
          disabled={generating || backlogCount === 0}
          onClick={handleGenerate}
        >
          <Sparkles className="w-4 h-4" />
          {generating
            ? 'Generating…'
            : backlogCount === 0
              ? 'All images generated'
              : `Generate ${Math.min(GENERATE_BATCH, backlogCount)} more`}
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-body text-text-secondary">
          Nothing to review right now.
          {backlogCount > 0 && ' Generate a batch above to get started.'}
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <AltTextCard key={row.url} row={row} onDone={removeRow} />
          ))}
        </div>
      )}
    </div>
  );
}

function AltTextCard({
  row,
  onDone,
}: {
  row: ImageAltTextRow;
  onDone: (url: string) => void;
}) {
  const [altUa, setAltUa] = useState(row.alt_ua ?? '');
  const [altEn, setAltEn] = useState(row.alt_en ?? '');
  const [captionUa, setCaptionUa] = useState(row.caption_ua ?? '');
  const [captionEn, setCaptionEn] = useState(row.caption_en ?? '');
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);

  async function handleApprove() {
    setBusy('approve');
    const res = await approveAltTextAction({
      url: row.url,
      alt_ua: altUa,
      alt_en: altEn,
      caption_ua: captionUa,
      caption_en: captionEn,
    });
    if (res.success) {
      toast.success('Approved');
      onDone(row.url);
    } else {
      toast.error(res.error ?? 'Could not approve');
      setBusy(null);
    }
  }

  async function handleReject() {
    setBusy('reject');
    const res = await rejectAltTextAction(row.url);
    if (res.success) {
      toast.success('Rejected — image returned to the backlog');
      onDone(row.url);
    } else {
      toast.error(res.error ?? 'Could not reject');
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-5 rounded-xl border border-border bg-white p-4 md:grid-cols-[220px_1fr]">
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface-secondary">
          <Image
            src={row.url}
            alt=""
            fill
            sizes="220px"
            className="object-contain"
            unoptimized
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Alt text (UA)" hint="Screen-reader text" current={altUa.length} max={ALT_LIMIT}>
            <Input value={altUa} onChange={(e) => setAltUa(e.target.value)} />
          </Field>
          <Field label="Alt text (EN)" hint="Screen-reader text" current={altEn.length} max={ALT_LIMIT}>
            <Input value={altEn} onChange={(e) => setAltEn(e.target.value)} />
          </Field>
          <Field label="Caption (UA)" hint="Longer description" current={captionUa.length}>
            <Textarea rows={2} value={captionUa} onChange={(e) => setCaptionUa(e.target.value)} />
          </Field>
          <Field label="Caption (EN)" hint="Longer description" current={captionEn.length}>
            <Textarea rows={2} value={captionEn} onChange={(e) => setCaptionEn(e.target.value)} />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-caption text-text-tertiary" title={row.url}>
            {row.url.split('/').pop()}
          </p>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={handleReject} disabled={busy !== null}>
              <X className="w-4 h-4" />
              {busy === 'reject' ? 'Rejecting…' : 'Reject'}
            </Button>
            <Button variant="default" onClick={handleApprove} disabled={busy !== null}>
              <Check className="w-4 h-4" />
              {busy === 'approve' ? 'Approving…' : 'Approve'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  current,
  max,
  children,
}: {
  label: string;
  hint?: string;
  current?: number;
  max?: number;
  children: React.ReactNode;
}) {
  const over = max !== undefined && current !== undefined && current > max;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-body-sm font-medium text-text-secondary">
          {label}
          {hint && <span className="ml-1 font-normal text-text-tertiary">· {hint}</span>}
        </Label>
        {current !== undefined && (
          <span
            className={cn(
              'shrink-0 text-caption tabular-nums',
              over ? 'text-red-600' : 'text-text-tertiary',
            )}
          >
            {current}
            {max !== undefined ? ` / ${max}` : ''}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
