"use client";

import { useState } from "react";
import LinkIcon from "@/components/icons/LinkIcon";

type Props = {
  label: string;
  copiedLabel: string;
  variant?: "filled" | "link";
};

export function CopyLinkButton({
  label,
  copiedLabel,
  variant = "filled",
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — clipboard API blocked or unavailable
    }
  }

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 text-body text-secondary-40 underline-offset-4 transition-opacity hover:opacity-70"
      >
        <span className="underline">{copied ? copiedLabel : label}</span>
        <LinkIcon size={14} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-12 items-center justify-center rounded-full bg-secondary px-8 text-body font-medium text-white transition-opacity hover:opacity-90"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
