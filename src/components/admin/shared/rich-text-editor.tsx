'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Image as ImageIcon,
  List,
  ListOrdered,
} from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { uploadFileAction } from '@/lib/actions/upload';

type Props = {
  value: unknown;
  onChange: (value: JSONContent) => void;
  placeholder?: string;
  uploadFolder?: string;
  // Off by default — best-practice CMS pattern is a separate gallery upload
  // alongside the editor. Pass `withImages` only when inline images make sense
  // (e.g. a docs-style rich page with embedded screenshots).
  withImages?: boolean;
};

// Tiptap expects a JSON doc. The form may pass us:
//   • null / undefined / '' — start with an empty doc
//   • a plain string from the legacy textarea — convert each blank-line block
//     into a paragraph so existing content opens cleanly in the editor
//   • a Tiptap JSON doc — pass through
function normaliseInitialContent(value: unknown): JSONContent {
  if (!value) return { type: 'doc', content: [{ type: 'paragraph' }] };

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return { type: 'doc', content: [{ type: 'paragraph' }] };
    return {
      type: 'doc',
      content: trimmed.split(/\n{2,}/).map((para) => ({
        type: 'paragraph',
        content: [{ type: 'text', text: para.trim() }],
      })),
    };
  }

  if (typeof value === 'object') return value as JSONContent;
  return { type: 'doc', content: [{ type: 'paragraph' }] };
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  uploadFolder = 'news',
  withImages = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ...(withImages ? [Image.configure({ inline: false, allowBase64: false })] : []),
    ],
    content: normaliseInitialContent(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[300px] focus:outline-none px-4 py-3 text-text-primary [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-[24px] [&_h3]:font-medium [&_h3]:leading-[120%] [&_h3]:my-4 [&_p]:mb-3 [&_strong]:font-semibold [&_img]:rounded-lg [&_img]:my-3 [&_img]:max-w-full [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_li]:mb-1 [&_li_p]:mb-0',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  // If the parent re-loads with different content (rare — happens on async
  // form hydration), sync the editor without re-creating it.
  useEffect(() => {
    if (!editor || !value) return;
    const current = editor.getJSON();
    const incoming = normaliseInitialContent(value);
    if (JSON.stringify(current) !== JSON.stringify(incoming)) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
    // Only resync when the editor instance itself changes — value updates are
    // driven by the editor itself in normal use, so we deliberately skip them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-md border border-input bg-background text-text-secondary">
        Loading editor…
      </div>
    );
  }

  async function handleImageUpload(file: File) {
    if (uploadingRef.current) return;
    uploadingRef.current = true;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', uploadFolder);
    const res = await uploadFileAction(fd);
    uploadingRef.current = false;
    if (!res.url) {
      toast.error(res.error ?? 'Upload failed');
      return;
    }
    editor?.chain().focus().setImage({ src: res.url, alt: file.name }).run();
  }

  return (
    <div className="rounded-md border border-input bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-input px-2 py-2">
        <ToolbarButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          label="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="Bullet list"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        {withImages && (
          <>
            <Divider />
            <ToolbarButton
              onClick={() => fileInputRef.current?.click()}
              label="Insert image"
            >
              {uploadingRef.current ? (
                <Spinner size="sm" aria-hidden />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
            </ToolbarButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImageUpload(file);
                e.target.value = '';
              }}
            />
          </>
        )}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded transition-colors ${
        active
          ? 'bg-secondary text-white'
          : 'text-text-primary hover:bg-grey-10'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-input" aria-hidden />;
}
