"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type Locale = "ua" | "en";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  onSwitch: (locale: Locale) => void;
  className?: string;
}

export function LanguageSwitcher({
  currentLocale,
  onSwitch,
  className,
}: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: Locale[] = ["ua", "en"];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch language"
        className={cn(
          "w-9 h-9 rounded-full border border-border text-body font-medium transition-colors uppercase",
          open
            ? "bg-brand-blue text-white border-brand-blue"
            : "bg-surface-primary text-text-primary hover:border-brand-blue hover:text-brand-blue",
        )}
      >
        {currentLocale.toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 rounded-xl border border-border bg-surface-primary shadow-md py-1 z-50 min-w-[4rem]">
          {options.map((locale) => (
            <button
              key={locale}
              onClick={() => {
                onSwitch(locale);
                setOpen(false);
              }}
              className={cn(
                "w-full px-4 py-2 text-body-sm font-medium uppercase transition-colors text-left",
                locale === currentLocale
                  ? "text-brand-blue bg-brand-blue-light"
                  : "text-text-primary hover:bg-surface-secondary",
              )}
            >
              {locale.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
