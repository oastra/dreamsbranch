'use client';
import { useRef, useState } from 'react';
import { uploadFileAction, deleteFileAction } from '@/lib/actions/upload';
import { Loader2, Upload, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from './delete-confirm-dialog';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
  requirements?: string;
  minImages?: number;
  maxImages?: number;
}

export function MultiImageUpload({
  value,
  onChange,
  folder = 'general',
  label = 'Images',
  requirements,
  minImages = 4,
  maxImages,
}: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmingIndex, setConfirmingIndex] = useState<number | null>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} is over 4 MB — skipped`);
      }
    }
    const valid = files.filter((f) => f.size <= MAX_FILE_SIZE);
    if (!valid.length) {
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of valid) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      const result = await uploadFileAction(fd);
      if (result.url) uploaded.push(result.url);
      else toast.error(`Failed to upload ${file.name}`);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
    if (uploaded.length) {
      const combined = [...value, ...uploaded];
      if (maxImages && combined.length > maxImages) {
        toast.error(`Only ${maxImages} images allowed — extras were discarded`);
      }
      onChange(maxImages ? combined.slice(0, maxImages) : combined);
    }
  }

  function confirmRemove() {
    if (confirmingIndex === null) return;
    const i = confirmingIndex;
    const url = value[i];
    if (url) void deleteFileAction(url);
    onChange(value.filter((_, idx) => idx !== i));
    setConfirmingIndex(null);
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  const countBelowMin = value.length < minImages;
  const atMax = maxImages !== undefined && value.length >= maxImages;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="text-body-sm font-medium">{label}</p>
        {minImages > 0 ? (
          <p
            className={`text-caption ${countBelowMin ? 'text-red-600' : 'text-text-tertiary'}`}
          >
            {value.length} / {maxImages !== undefined && maxImages === minImages
              ? maxImages
              : `min ${minImages}${maxImages !== undefined ? `, max ${maxImages}` : ''}`}
          </p>
        ) : value.length > 0 ? (
          <p className="text-caption text-text-tertiary">
            {value.length} {value.length === 1 ? 'image' : 'images'}
          </p>
        ) : null}
      </div>
      <p className="text-caption text-text-tertiary">
        Any format (JPG, PNG, HEIC, WebP) — auto-converted to WebP. Max 4 MB each.
      </p>
      {requirements && (
        <p className="text-caption text-text-tertiary">{requirements}</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {value.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="relative aspect-video rounded-lg overflow-hidden border border-border group bg-surface-secondary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <button
              type="button"
              onClick={() => setConfirmingIndex(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="absolute bottom-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center disabled:opacity-30"
                aria-label="Move left"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === value.length - 1}
                className="w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center disabled:opacity-30"
                aria-label="Move right"
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <span className="absolute top-1 left-1 rounded bg-black/60 text-white text-caption px-1.5">
              {i + 1}
            </span>
          </div>
        ))}
        {!atMax && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-video rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-text-tertiary hover:border-brand-blue hover:text-brand-blue transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            <span className="text-caption">
              {uploading ? 'Uploading...' : 'Add image(s)'}
            </span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <DeleteConfirmDialog
        open={confirmingIndex !== null}
        onOpenChange={(o) => !o && setConfirmingIndex(null)}
        onConfirm={confirmRemove}
        itemName="image"
      />
    </div>
  );
}
