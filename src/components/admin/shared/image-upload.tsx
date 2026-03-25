'use client';
import { useRef, useState } from 'react';
import { uploadFileAction } from '@/lib/actions/upload';
import { Loader2, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, folder = 'general', label = 'Image' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image must be under 4 MB');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    const result = await uploadFileAction(fd);
    setUploading(false);
    if (result.url) onChange(result.url);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-2">
      <p className="text-body-sm font-medium">{label}</p>
      {value ? (
        <div className="relative w-40 h-28 rounded-lg overflow-hidden border border-border group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-40 h-28 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-text-tertiary hover:border-brand-blue hover:text-brand-blue transition-colors"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          <span className="text-caption">{uploading ? 'Uploading...' : 'Upload'}</span>
        </button>
      )}
      <p className="text-caption text-text-tertiary">Max 4 MB</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
