"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { MaskedImage } from "@/components/shared/MaskedImage";

export type CarouselSlide = { src: string; alt: string };

type Props = {
  slides: CarouselSlide[];
  intervalMs?: number;
  aspectRatio?: string | null;
  className?: string;
  sizes?: string;
  masked?: boolean;
};

export function MaskedImageCarousel({
  slides,
  intervalMs = 5000,
  aspectRatio = "716/500",
  className = "",
  sizes = "(max-width: 1024px) 100vw, 50vw",
  masked = true,
}: Props) {
  const [index, setIndex] = useState(0);

  // Only download slides as they're needed (current + the one queued next),
  // instead of fetching every hero image up front. Loading all slides at
  // once saturates the connection and delays the LCP/Speed Index. Indices
  // only ever get added, so already-loaded slides stay mounted for the
  // cross-fade.
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));

  const goTo = useCallback(
    (next: number) => {
      setIndex(next);
      setLoaded((prev) => {
        const ahead = (next + 1) % slides.length;
        if (prev.has(next) && prev.has(ahead)) return prev;
        return new Set(prev).add(next).add(ahead);
      });
    },
    [slides.length],
  );

  const indexRef = useRef(index);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Preload the second slide shortly after mount — ready before the first
  // transition, but kept out of the initial-load critical path (LCP/SI).
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setTimeout(() => {
      setLoaded((prev) => (prev.has(1) ? prev : new Set(prev).add(1)));
    }, 2500);
    return () => clearTimeout(t);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => goTo((indexRef.current + 1) % slides.length), intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs, goTo]);

  if (slides.length === 0) return null;

  return (
    <div className={`flex h-full w-full flex-col items-center gap-4 ${className}`}>
      <div
        className="relative w-full flex-1"
        style={aspectRatio ? { aspectRatio: aspectRatio.replace("/", " / "), flex: "0 0 auto" } : undefined}
      >
        {slides.map((s, i) => (
          <div
            key={s.src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            {!loaded.has(i) ? null : masked ? (
              <MaskedImage src={s.src} alt={s.alt} className="h-full w-full" priority={i === 0} sizes={sizes} />
            ) : (
              <div className="relative h-full w-full overflow-hidden rounded-[20px]">
                <Image src={s.src} alt={s.alt} fill priority={i === 0} sizes={sizes} quality={70} className="object-cover" />
              </div>
            )}
          </div>
        ))}

        {masked && slides.length > 1 && (
          <div className="absolute bottom-6 left-6 z-10 flex items-center gap-[17px]">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
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

      {!masked && slides.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 w-2 rounded-full transition-all ${
                i === index ? "bg-secondary" : "bg-grey-10"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
