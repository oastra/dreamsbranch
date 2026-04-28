'use client';
import { useRef, useState } from 'react';
import { uploadFileAction } from '@/lib/actions/upload';
import { Loader2, X, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface FileUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
  accept?: string;
  maxSizeMb?: number;
}

export function FileUpload({
  value,
  onChange,
  folder = 'general',
  label = 'File',
  accept = 'application/pdf',
  maxSizeMb = 10,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const maxBytes = maxSizeMb * 1024 * 1024;
  const effectiveMax = Math.min(maxBytes, MAX_FILE_SIZE);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > effectiveMax) {
      toast.error(`File must be under ${maxSizeMb} MB`);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    const result = await uploadFileAction(fd);
    setUploading(false);
    if (result.url) {
      onChange(result.url);
      toast.success('File uploaded');
    } else {
      toast.error(result.error ?? 'Upload failed');
    }
    if (inputRef.current) inputRef.current.value = '';
  }

  const filename = value ? value.split('/').pop()?.split('?')[0] ?? 'File' : null;

  return (
    <div className="space-y-2">
      <p className="text-body-sm font-medium">{label}</p>
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-3">
          <FileText className="h-5 w-5 text-text-secondary shrink-0" />
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-sm text-secondary truncate hover:underline"
          >
            {filename}
          </a>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-caption text-text-secondary hover:text-text-strong"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-full p-1 text-text-secondary hover:bg-grey-40"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-28 w-full max-w-md flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-text-tertiary transition-colors hover:border-brand-blue hover:text-brand-blue"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="text-caption">{uploading ? 'Uploading...' : 'Upload PDF'}</span>
        </button>
      )}
      <p className="text-caption text-text-tertiary">Max {maxSizeMb} MB · {accept.replace('application/', '').toUpperCase()}</p>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
    </div>
  );
}
