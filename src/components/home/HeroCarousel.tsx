"use client";

import { useEffect, useState } from "react";
import { MaskedImage } from "@/components/shared/MaskedImage";

export type HeroSlide = { src: string; alt: string };

type Props = {
  slides: HeroSlide[];
  intervalMs?: number;
  className?: string;
};

export function HeroCarousel({ slides, intervalMs = 5000, className = "" }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  if (slides.length === 0) return null;

  return (
    <div className={`relative aspect-[716/500] w-full ${className}`}>
      {slides.map((s, i) => (
        <div
          key={s.src}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <MaskedImage src={s.src} alt={s.alt} className="h-full w-full" priority={i === 0} sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-6 z-10 flex items-center gap-[17px]">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={i === index ? { backgroundColor: "#FFD700" } : undefined}
              className={`rounded-full transition-all ${
                i === index ? "h-3 w-3" : "h-2 w-2 bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
