"use client";

import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  topLeftColor?: string;
  bottomRightColor?: string;
};

// Figma triangle paths (viewBox 120×167). Rounded tips baked into cubic
// beziers at Figma's exact tangent points.
const INNER_TL =
  "M12.8269 163.07C8.89718 168.743 0 165.962 0 159.061L0 7.04C0 3.15193 3.15182 0 7.0399 0H112.356C118.036 0 121.377 6.38011 118.143 11.0491L12.8269 163.07Z";
const INNER_BR =
  "M106.581 3.04415C110.511 -2.6283 119.408 0.152527 119.408 7.0532L119.408 159.074C119.408 162.962 116.256 166.114 112.368 166.114H7.05228C1.37238 166.114 -1.96922 159.734 1.2653 155.065L106.581 3.04415Z";

// Decorative triangle: width 20% of container, height follows 120:167 aspect.
// Image clip uses cqw so both the clip and the triangle scale with container
// width — their hypotenuses stay parallel at any aspect ratio. Clip extends
// 2cqw × ~3.2cqw further than the triangle (≈6px perpendicular gap at a
// typical 700px-wide container, proportionally more/less at other widths).
const CLIP_PATH = [
  "22cqw 0",
  "100% 0",
  "100% calc(100% - 31.75cqw)",
  "calc(100% - 22cqw) 100%",
  "0 100%",
  "0 31.75cqw",
].join(", ");

export function MaskedImage({
  src,
  alt,
  className = "",
  sizes,
  priority,
  topLeftColor = "#FFEF99",
  bottomRightColor = "#CCDDF1",
}: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-[20px] ${className}`}
      style={{ containerType: "inline-size" }}
    >
      <div
        className="absolute inset-0 overflow-hidden rounded-[20px]"
        style={{ clipPath: `polygon(${CLIP_PATH})` }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} quality={70} className="object-cover" />
      </div>

      <svg
        viewBox="0 0 120 167"
        className="pointer-events-none absolute left-0 top-0"
        style={{ width: "20%", aspectRatio: "120 / 167" }}
        aria-hidden
      >
        <path d={INNER_TL} fill={topLeftColor} />
      </svg>

      <svg
        viewBox="0 0 120 167"
        className="pointer-events-none absolute bottom-0 right-0"
        style={{ width: "20%", aspectRatio: "120 / 167" }}
        aria-hidden
      >
        <path d={INNER_BR} fill={bottomRightColor} />
      </svg>
    </div>
  );
}
