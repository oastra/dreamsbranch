'use client';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/admin/shared/image-upload';

export type EditorImage = {
  url: string;
  kind: 'product' | 'proof' | 'chat';
  position: number;
  captionUa?: string;
  captionEn?: string;
};

type Props = {
  value: EditorImage[];
  onChange: (next: EditorImage[]) => void;
};

const KIND_OPTIONS: Array<{ value: EditorImage['kind']; label: string }> = [
  { value: 'product', label: 'Product photo' },
  { value: 'proof',   label: 'Payment proof' },
  { value: 'chat',    label: 'Chat screenshot' },
];

export function PhotoReportImagesEditor({ value, onChange }: Props) {
  function update(i: number, patch: Partial<EditorImage>) {
    onChange(value.map((img, idx) => (idx === i ? { ...img, ...patch } : img)));
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function addEmpty(kind: EditorImage['kind']) {
    const next: EditorImage = {
      url: '',
      kind,
      position: value.filter((v) => v.kind === kind).length + 1,
    };
    onChange([...value, next]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {KIND_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addEmpty(opt.value)}
          >
            + {opt.label}
          </Button>
        ))}
      </div>

      {value.length === 0 && (
        <p className="text-body-sm text-text-secondary">
          Add product photos, payment proofs and chat screenshots above.
        </p>
      )}

      <div className="space-y-3">
        {value.map((img, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-white p-4 md:grid-cols-[140px_1fr_auto]"
          >
            <div className="space-y-2">
              {img.url ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-grey-40">
                  <Image src={img.url} alt="" fill sizes="140px" className="object-cover" />
                </div>
              ) : (
                <div className="aspect-square w-full rounded-lg bg-grey-40" />
              )}
              <ImageUpload
                value={img.url}
                onChange={(url) => update(i, { url: url ?? '' })}
                folder="shop-photo-reports"
                label=""
              />
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Kind</Label>
                  <Select
                    value={img.kind}
                    onValueChange={(v) => update(i, { kind: v as EditorImage['kind'] })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {KIND_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Position</Label>
                  <Input
                    type="number"
                    min={0}
                    value={img.position}
                    onChange={(e) => update(i, { position: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Caption (UA)</Label>
                  <Input
                    value={img.captionUa ?? ''}
                    onChange={(e) => update(i, { captionUa: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Caption (EN)</Label>
                  <Input
                    value={img.captionEn ?? ''}
                    onChange={(e) => update(i, { captionEn: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Move up"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(i, 1)}
                disabled={i === value.length - 1}
                aria-label="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(i)}
                aria-label="Remove"
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
