"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import FacebookColorIcon from "@/components/icons/FacebookIcon-color";
import InstagramColorIcon from "@/components/icons/InstagramIcon-color";
import WhatsAppFillIcon from "@/components/icons/WhatsAppFillIcon";
import XTwitterIcon from "@/components/icons/XTwitterIcon";

type Labels = {
  copyLink: string;
  copied: string;
  shareVia: string;
  facebookAria: string;
  instagramAria: string;
  whatsappAria: string;
  xAria: string;
};

type Props = {
  shareTitle: string;
  labels: Labels;
};

const COPY_FEEDBACK_MS = 2000;

export function ShareCard({ shareTitle, labels }: Props) {
  const [copied, setCopied] = useState(false);

  function getShareUrl() {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }

  async function handleCopy() {
    const url = getShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      // Browser blocked clipboard access — silently ignore.
    }
  }

  // Build share targets lazily; window may not exist on first render.
  const url = getShareUrl();
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(shareTitle);

  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const whatsappHref = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;

  return (
    <section className="pb-12 sm:pb-16 lg:pb-20">
      <div className="container-page">
        <div className="flex flex-col items-stretch gap-4 rounded-3xl bg-secondary-10 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:p-8">
          <button
            type="button"
            onClick={handleCopy}
            aria-live="polite"
            className="inline-flex h-12 w-full items-center justify-center gap-2 self-center rounded-full bg-secondary px-8 text-body font-medium text-white transition-opacity hover:opacity-90 sm:w-[280px] lg:h-[54px]"
          >
            {copied ? (
              <>
                <Check size={18} strokeWidth={2.25} aria-hidden />
                <span>{labels.copied}</span>
              </>
            ) : (
              <span>{labels.copyLink}</span>
            )}
          </button>

          <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-4 sm:flex-row sm:justify-center sm:gap-6 sm:px-6 sm:py-3 lg:rounded-full">
            <span className="text-body font-semibold text-text-strong">
              {labels.shareVia}
            </span>
            <ul className="flex items-center gap-3 sm:gap-4">
              <li>
                <a
                  href={facebookHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={labels.facebookAria}
                  className="inline-flex transition-opacity hover:opacity-80"
                >
                  <FacebookColorIcon size={36} />
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={labels.instagramAria}
                  className="inline-flex transition-opacity hover:opacity-80"
                >
                  <InstagramColorIcon size={36} />
                </button>
              </li>
              <li>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={labels.whatsappAria}
                  className="inline-flex transition-opacity hover:opacity-80"
                >
                  <WhatsAppFillIcon size={36} />
                </a>
              </li>
              <li>
                <a
                  href={xHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={labels.xAria}
                  className="inline-flex text-text-strong transition-opacity hover:opacity-80"
                >
                  <XTwitterIcon size={36} />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
