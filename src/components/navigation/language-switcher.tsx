"use client";

import { useState } from "react";
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
  const [hovered, setHovered] = useState(false);

  const otherLocale: Locale = currentLocale === "ua" ? "en" : "ua";

  return (
    // Outer div is exactly the size of one button — anchors layout, never shifts
    <div
      className={cn("relative h-12 w-12", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* White pill: absolutely positioned from top-0, expands downward on hover */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex flex-col items-center overflow-hidden rounded-[999px] bg-white ",
          "transition-all duration-300 ease-out",
          hovered ? "pb-2 gap-1" : "pb-0 gap-0",
        )}
      >
        {/* CURRENT */}
        <button
          type="button"
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
            "text-body leading-[120%] font-bold uppercase transition-colors duration-200 bg-secondary-10 text-text-primary",
          )}
        >
          {currentLocale}
        </button>

        {/* OTHER */}
        <button
          type="button"
          onClick={() => onSwitch(otherLocale)}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full w-12",
            "text-body leading-[120%] font-bold uppercase",
            "bg-secondary-10 text-text-primary transition-all duration-300",
            "hover:bg-secondary hover:text-white",
            hovered ? "h-12 opacity-100" : "h-0 opacity-0 pointer-events-none",
          )}
        >
          {otherLocale}
        </button>
      </div>
    </div>
  );
}
