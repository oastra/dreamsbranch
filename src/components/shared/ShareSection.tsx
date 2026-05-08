'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import FacebookColorIcon from '@/components/icons/FacebookIcon-color';
import InstagramColorIcon from '@/components/icons/InstagramIcon-color';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import XTwitterIcon from '@/components/icons/XTwitterIcon';
import { Button } from '@/components/ui/button';

interface ShareSectionProps {
  copyLinkLabel: string;
  copiedLabel: string;
  shareLabel: string;
}

const POPUP = 'noopener,noreferrer,width=600,height=520';

export function ShareSection({ copyLinkLabel, copiedLabel, shareLabel }: ShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareTitle, setShareTitle] = useState('');

  useEffect(() => {
    setShareUrl(window.location.href);
    setShareTitle(document.title);
  }, []);

  async function copy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback for clipboard-blocked contexts: select-and-copy via a hidden textarea.
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openShare(url: string) {
    if (!shareUrl) return;
    window.open(url, '_blank', POPUP);
  }

  const enc = encodeURIComponent;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`;
  const xHref = `https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${enc(shareTitle)}`;
  const waHref = `https://wa.me/?text=${enc(`${shareTitle} ${shareUrl}`)}`;

  return (
    <div className="mt-12 flex flex-col items-stretch gap-4 rounded-2xl bg-secondary-10 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6 lg:px-8">
      <Button
        type="button"
        size="xl"
        shape="pill"
        onClick={copy}
        aria-live="polite"
      >
        {copied ? (
          <>
            <Check className="size-4" aria-hidden />
            {copiedLabel}
          </>
        ) : (
          copyLinkLabel
        )}
      </Button>

      <div className="flex items-center justify-between gap-4 rounded-full bg-white px-5 py-2.5 sm:justify-end sm:gap-5">
        <span className="text-body text-text-strong">{shareLabel}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openShare(fbHref)}
            className="transition-opacity hover:opacity-70"
            aria-label="Facebook"
          >
            <FacebookColorIcon size={32} />
          </button>
          {/* Instagram has no web share intent. Treat the icon as a
              "copy link" shortcut so the user can paste it into a story
              or DM, which is how IG shares typically happen. */}
          <button
            type="button"
            onClick={copy}
            className="transition-opacity hover:opacity-70"
            aria-label="Instagram"
          >
            <InstagramColorIcon size={32} />
          </button>
          <button
            type="button"
            onClick={() => openShare(waHref)}
            className="transition-opacity hover:opacity-70"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon size={32} />
          </button>
          <button
            type="button"
            onClick={() => openShare(xHref)}
            className="transition-opacity hover:opacity-70"
            aria-label="X"
          >
            <XTwitterIcon size={32} />
          </button>
        </div>
      </div>
    </div>
  );
}
