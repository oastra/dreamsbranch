"use client";

import Image from "next/image";
import { useId } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  topLeftColor?: string;
  bottomRightColor?: string;
};

const CLIP_PATH =
  "M0 0 H1 V1 H0 Z " +
  "M0 0 L0.25 0 L0 0.52 Z " +
  "M1 1 L0.75 1 L1 0.48 Z";

const INNER_TL =
  "M14.5452 212.429 C10.0421 218.811,0 215.625,0 207.814 " +
  "L0 8.00468 C0 3.58381,3.58377 0,8.00463 0 " +
  "H148.981 C155.471 0,159.263 7.31685,155.522 12.6194 L14.5452 212.429Z";

const INNER_BR =
  "M142.455 3.40505 C146.958 -2.9773,157 0.208777,157 8.01981 " +
  "L157 207.829 C157 212.25,153.416 215.834,148.995 215.834 " +
  "H8.0188 C1.52924 215.834,-2.26305 208.517,1.47822 203.214 L142.455 3.40505Z";

export function MaskedImage({
  src,
  alt,
  className = "",
  sizes,
  priority,
  topLeftColor = "#FFEF99",
  bottomRightColor = "#CCDDF1",
}: Props) {
  const rawId = useId();
  const clipId = `masked-image-clip-${rawId.replace(/[:]/g, "")}`;

  return (
    <div className={`relative rounded-[20px] ${className}`}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={CLIP_PATH} clipRule="evenodd" />
          </clipPath>
        </defs>
      </svg>

      <div
        className="absolute inset-0 overflow-hidden rounded-[20px]"
        style={{ clipPath: `url(#${clipId})`, WebkitClipPath: `url(#${clipId})` }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>

      <svg
        viewBox="0 0 157 216"
        preserveAspectRatio="xMinYMin meet"
        className="pointer-events-none absolute left-0 top-0 w-[23%]"
        style={{ aspectRatio: "157 / 216" }}
        aria-hidden
      >
        <path d={INNER_TL} fill={topLeftColor} />
      </svg>

      <svg
        viewBox="0 0 157 216"
        preserveAspectRatio="xMaxYMax meet"
        className="pointer-events-none absolute bottom-0 right-0 w-[23%]"
        style={{ aspectRatio: "157 / 216" }}
        aria-hidden
      >
        <path d={INNER_BR} fill={bottomRightColor} />
      </svg>
    </div>
  );
}
