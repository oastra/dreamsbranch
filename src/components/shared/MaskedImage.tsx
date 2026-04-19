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

const MASK_HOLES =
  "M0 0 L0.25 0 L0 0.52 Z " +
  "M1 1 L0.75 1 L1 0.48 Z";

// Triangles with small rounded tips (~7-8px) on the two non-outer corners.
// Outer corner (0,0 for TL / 157,216 for BR) is left sharp and gets rounded
// to 20px by the parent container's rounded-[20px] + overflow-hidden.
const INNER_TL =
  "M0 0 L148 0 Q157 0 153.5 8 L4 208 Q0 216 0 208 L0 0 Z";
const INNER_BR =
  "M157 216 L9 216 Q0 216 3.5 208 L153 8 Q157 0 157 8 L157 216 Z";

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
  const maskId = `masked-image-mask-${rawId.replace(/[:]/g, "")}`;

  return (
    <div className={`relative overflow-hidden rounded-[20px] ${className}`}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <mask id={maskId} maskContentUnits="objectBoundingBox">
            <rect x="0" y="0" width="1" height="1" fill="white" />
            <path d={MASK_HOLES} fill="black" />
          </mask>
        </defs>
      </svg>

      <div
        className="absolute inset-0 overflow-hidden rounded-[20px]"
        style={{ mask: `url(#${maskId})`, WebkitMask: `url(#${maskId})` }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>

      <svg
        viewBox="0 0 157 216"
        preserveAspectRatio="none"
        className="pointer-events-none absolute left-0 top-0"
        style={{
          width: "25%",
          height: "52%",
          transform: "scale(0.96)",
          transformOrigin: "0 0",
        }}
        aria-hidden
      >
        <path d={INNER_TL} fill={topLeftColor} />
      </svg>

      <svg
        viewBox="0 0 157 216"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-0 right-0"
        style={{
          width: "25%",
          height: "52%",
          transform: "scale(0.96)",
          transformOrigin: "100% 100%",
        }}
        aria-hidden
      >
        <path d={INNER_BR} fill={bottomRightColor} />
      </svg>
    </div>
  );
}
