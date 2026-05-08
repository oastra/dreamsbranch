"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import FacebookColorIcon from "@/components/icons/FacebookIcon-color";
import InstagramColorIcon from "@/components/icons/InstagramIcon-color";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import XTwitterIcon from "@/components/icons/XTwitterIcon";
import { Button } from "@/components/ui/button";

interface ShareSectionProps {
  copyLinkLabel: string;
  copiedLabel: string;
  shareLabel: string;
  /** Accessible name for the section landmark, e.g. "Share this event". */
  ariaLabel: string;
}

const POPUP = "noopener,noreferrer,width=600,height=520";
const enc = encodeURIComponent;

export function ShareSection({
  copyLinkLabel,
  copiedLabel,
  shareLabel,
  ariaLabel,
}: ShareSectionProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for clipboard-blocked contexts: select-and-copy via a hidden textarea.
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareTo(builder: (url: string, title: string) => string) {
    const url = window.location.href;
    const title = document.title;
    window.open(builder(url, title), "_blank", POPUP);
  }

  const fb = (url: string) =>
    `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
  const x = (url: string, title: string) =>
    `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`;
  const wa = (url: string, title: string) =>
    `https://wa.me/?text=${enc(`${title} ${url}`)}`;

  return (
    <section
      aria-label={ariaLabel}
      className="mt-12 flex flex-col items-stretch gap-4 rounded-2xl bg-secondary-10 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6 lg:px-8"
    >
      <Button
        type="button"
        size="xl"
        shape="pill"
        onClick={copy}
        aria-live="polite"
        className="w-full sm:w-[280px]"
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
            onClick={() => shareTo(fb)}
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
            onClick={() => shareTo(wa)}
            className="transition-opacity hover:opacity-70"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon size={32} />
          </button>
          <button
            type="button"
            onClick={() => shareTo(x)}
            className="transition-opacity hover:opacity-70"
            aria-label="X"
          >
            <XTwitterIcon size={32} />
          </button>
        </div>
      </div>
    </section>
  );
}
