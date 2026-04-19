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

// Simple triangles matching the mask hole geometry — sharp 3-point paths
// that stay geometrically parallel to the mask hypotenuse under non-uniform
// (preserveAspectRatio="none") scaling. Rounded outer corner comes from the
// parent container's rounded-[20px] + overflow-hidden.
const INNER_TL = "M0 0 L157 0 L0 216 Z";
const INNER_BR = "M157 216 L0 216 L157 0 Z";

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
