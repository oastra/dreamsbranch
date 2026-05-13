"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  prevAriaLabel: string;
  nextAriaLabel: string;
};

/**
 * Desktop / tablet layout (Figma "Фото-звіти"):
 *   row 1 — 3 equal-width tiles
 *   row 2 — 4 equal-width tiles
 * Mobile: a single image at a time with prev / next buttons in the
 * header row (rendered by the parent section). The first 7 URLs are
 * laid out into the desktop grid; the carousel cycles through ALL
 * supplied images.
 */
export function HomePhotoReports({
  images,
  prevAriaLabel,
  nextAriaLabel,
}: Props) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const desktopImages = images.slice(0, 7);
  const top = desktopImages.slice(0, 3);
  const bottom = desktopImages.slice(3, 7);

  function goPrev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }
  function goNext() {
    setIndex((i) => (i + 1) % images.length);
  }

  return (
    <>
      {/* Mobile: single image with prev/next arrows below */}
      <div className="sm:hidden">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-white">
          <Image
            src={images[index]}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        {images.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              aria-label={prevAriaLabel}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-secondary transition-colors hover:bg-secondary hover:text-white"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={nextAriaLabel}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-secondary transition-colors hover:bg-secondary hover:text-white"
            >
              <ChevronRight size={20} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      {/* Tablet/desktop: 3 + 4 grid */}
      <div className="hidden gap-4 sm:flex sm:flex-col sm:gap-4 lg:gap-6">
        {top.length > 0 && (
          <div className="grid grid-cols-3 gap-4 lg:gap-6">
            {top.map((src, i) => (
              <div
                key={`top-${i}`}
                className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-white"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 33vw, 30vw"
                />
              </div>
            ))}
          </div>
        )}
        {bottom.length > 0 && (
          <div className="grid grid-cols-4 gap-4 lg:gap-6">
            {bottom.map((src, i) => (
              <div
                key={`bot-${i}`}
                className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 25vw, 22vw"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
