"use client";

import * as React from "react";
import { useEffect, useRef } from "react";

type Props = React.SVGProps<SVGSVGElement> & {
  size?: number;
  /** Total stroke draw time in ms. Default 1500. */
  durationMs?: number;
};

/**
 * Yellow squiggle that sits next to the news hero heading. When the
 * SVG enters the viewport, each path animates its `stroke-dashoffset`
 * from full length down to 0, so the arrow draws itself instead of
 * appearing all at once.
 *
 * Respects `prefers-reduced-motion` — the strokes appear immediately
 * for users who've opted out of motion.
 */
export default function DecorArrowIcon({
  size = 285,
  durationMs = 1500,
  ...props
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
    if (!paths.length) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Compute each path's length so the dash math is exact regardless
    // of the source SVG's coordinate system. Initial dashoffset is
    // NEGATIVE so the stroke reveals from the path's END back toward
    // its START — that's top-to-bottom for this squiggle, since the
    // source paths begin at the bottom.
    const lengths = paths.map((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      // Pre-set the "hidden" state directly so SSR / initial paint
      // doesn't briefly flash the full stroke.
      p.style.strokeDashoffset = `${-len}`;
      return len;
    });

    if (prefersReduced) {
      paths.forEach((p) => (p.style.strokeDashoffset = "0"));
      return;
    }

    // Paths are drawn sequentially — equal time per segment, so the
    // short arrowhead doesn't pop in faster than the eye can follow.
    const perPath = durationMs / paths.length;
    const animations: Animation[] = [];

    // Kick off the animation immediately — the initial hidden state
    // is already shipped via JSX attributes, so there's no commit-
    // timing issue with the "from" keyframe.
    paths.forEach((p, i) => {
      const anim = p.animate(
        [
          { strokeDashoffset: `${-lengths[i]}` },
          { strokeDashoffset: "0" },
        ],
        {
          duration: perPath,
          delay: i * perPath,
          easing: "ease-out",
          fill: "forwards",
        },
      );
      animations.push(anim);
    });

    return () => {
      animations.forEach((a) => a.cancel());
    };
  }, [durationMs]);

  // Hard-coded path lengths (rounded up) so SSR can ship the SVG in
  // its "hidden" state — no hydration flash where the full stroke is
  // visible for a frame before the client effect kicks in. The effect
  // re-measures with getTotalLength() to be exact and then animates.
  const CURL_LEN = 580;
  const HEAD_LEN = 86;
  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 285 285"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_742_6994)">
        <path
          d="M117.667 231.364C144.794 235.893 170.581 229.09 188.232 204.293C198.031 190.526 198.867 172.781 195.228 161.606C191.59 150.43 183.806 141.061 175.162 133.099C159.435 118.612 140.366 107.222 119.669 101.55C103.678 97.1696 68.0435 91.0312 60.9553 111.782C55.5786 127.516 70.6171 140.43 83.3917 146.263C98.6793 153.242 115.705 156.414 132.492 155.345C159.354 153.627 198.476 139.546 203.834 109.194C206.802 92.3973 197.324 75.3483 184.075 64.6235C170.825 53.898 154.281 48.2646 138.095 42.9003"
          stroke="#FFD700"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={CURL_LEN}
          strokeDashoffset={-CURL_LEN}
        />
        <path
          d="M127.343 248.885C115.266 241.976 103.19 235.067 91.1139 228.158C105.048 223.713 118.978 219.258 132.912 214.812"
          stroke="#FFD700"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={HEAD_LEN}
          strokeDashoffset={-HEAD_LEN}
        />
      </g>
      <defs>
        <clipPath id="clip0_742_6994">
          <rect
            width="202"
            height="200"
            fill="white"
            transform="translate(137.227 0) rotate(43.3248)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
