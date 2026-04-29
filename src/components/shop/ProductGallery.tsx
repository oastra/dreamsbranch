"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";

type Props = {
  images: string[];
  productName: string;
  mainAltTemplate: string;
  thumbAltTemplate: string;
  thumbAriaTemplate: string;
};

const PLACEHOLDER_THUMBS = 5;

export function ProductGallery({
  images,
  productName,
  mainAltTemplate,
  thumbAltTemplate,
  thumbAriaTemplate,
}: Props) {
  const [active, setActive] = useState(0);
  const hasImages = images.length > 0;
  const mainSrc = hasImages ? images[active] : null;
  const thumbCount = hasImages ? images.length : PLACEHOLDER_THUMBS;

  const mainAlt = mainAltTemplate.replace("{name}", productName);

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      {/* ── Main image ────────────────────────────────────────── */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-grey-40 lg:rounded-3xl">
        {mainSrc ? (
          <Image
            src={mainSrc}
            alt={mainAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder size="md" />
        )}
      </div>

      {/* ── Thumbnails ────────────────────────────────────────────
          Mobile: horizontal scroll with overflow visible.
          Tablet: 4-up grid. Desktop: 5-up grid. */}
      <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {Array.from({ length: thumbCount }).map((_, i) => {
          const src = hasImages ? images[i] : null;
          const isActive = hasImages && i === active;
          const ariaLabel = thumbAriaTemplate.replace("{index}", String(i + 1));
          const alt = thumbAltTemplate
            .replace("{name}", productName)
            .replace("{index}", String(i + 1));

          return (
            <button
              key={i}
              type="button"
              onClick={() => hasImages && setActive(i)}
              aria-label={ariaLabel}
              aria-pressed={isActive}
              disabled={!hasImages}
              className={`shrink-0 snap-start rounded-2xl border-2 p-1 transition-colors sm:w-full ${
                isActive
                  ? "border-[#0057B8]"
                  : "border-transparent hover:border-grey-40"
              } ${hasImages ? "cursor-pointer" : "cursor-default"}`}
            >
              <span className="relative block aspect-square w-[84px] overflow-hidden rounded-xl bg-grey-40 sm:w-full">
                {src ? (
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="92px"
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder size="sm" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
