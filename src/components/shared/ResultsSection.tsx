"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SectionHeading } from "@/components/shared/SectionHeading";

export type ResultStat = {
  /** Big number, e.g. "4", "1 200", "$12 000", "100%". */
  value: string;
  /** Optional secondary unit, e.g. "роки", "заходів". */
  unit?: string;
  /** Caption above the value. */
  label: string;
  /** Desktop card height — kept asymmetric to mirror the about page. */
  heightClass?: string;
};

interface Props {
  title: string;
  description: ReactNode;
  stats: ResultStat[];
  /** Defaults match the about-page treatment. */
  className?: string;
}

const COUNT_DURATION_MS = 1400;
const STAGGER_MS = 120;

// Characters an admin might use as a thousands separator. Includes:
//   space, NBSP (U+00A0), narrow NBSP (U+202F), period, comma, apostrophe.
const SEPARATOR_CHARS = [" ", " ", " ", ".", ",", "'"];
const SEPARATOR_RE = new RegExp(
  `[${SEPARATOR_CHARS.map((c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`).join("")}]`,
);
const NUMBER_RE = new RegExp(
  `^([^\\d]*?)(\\d[\\d${SEPARATOR_CHARS.map((c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`).join("")}]*\\d|\\d)(.*)$`,
);

/**
 * Pulls the integer target out of an admin-entered display string.
 * Tolerant of how it's typed — space / NBSP / period / comma / apostrophe
 * are all accepted as thousand separators; the first one used in the
 * source is preserved when re-rendering intermediate values, so the
 * displayed format doesn't change mid-animation.
 *   "4"        → { prefix:"",  target:4,     suffix:"",  separator:" " }
 *   "1 200"    → { prefix:"",  target:1200,  suffix:"",  separator:" " }
 *   "1,200"    → { prefix:"",  target:1200,  suffix:"",  separator:"," }
 *   "1.200"    → { prefix:"",  target:1200,  suffix:"",  separator:"." }
 *   "12000"    → { prefix:"",  target:12000, suffix:"",  separator:" " }
 *   "$12 000"  → { prefix:"$", target:12000, suffix:"",  separator:" " }
 *   "100%"     → { prefix:"",  target:100,   suffix:"%", separator:" " }
 *   "—"        → null (no number to animate; renders as-is)
 */
function parseValue(raw: string): {
  prefix: string;
  target: number;
  suffix: string;
  separator: string;
} | null {
  const match = raw.match(NUMBER_RE);
  if (!match) return null;
  const [, prefix, numPart, suffix] = match;
  const target = Number.parseInt(numPart.replace(/\D/g, ""), 10);
  if (Number.isNaN(target)) return null;
  const separator = numPart.match(SEPARATOR_RE)?.[0] ?? " ";
  return { prefix, target, suffix, separator };
}

/** Format an integer with the given thousands separator. NBSP and
 *  narrow NBSP are normalised to a regular space — they render the
 *  same in HTML but a plain space is friendlier in surrounding copy. */
function formatNumber(n: number, separator: string): string {
  const sep = separator === " " || separator === " " ? " " : separator;
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** "Pop in" effect — the value sits scaled down + invisible, then
 *  springs to full size when `started` flips true (with the same stagger
 *  delay the cards use). Used for stats that should land as a single
 *  beat rather than animate a count.
 *
 *  Uses the Web Animations API instead of a CSS transition so the
 *  initial "scaled down" state doesn't need a paint frame committed
 *  before the animation runs — which would otherwise let the value
 *  pop straight to the final state on visible-at-mount sections. */
function PopValue({
  value,
  started,
  delayMs,
}: {
  value: string;
  started: boolean;
  delayMs: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !started) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      node.style.transform = "scale(1)";
      node.style.opacity = "1";
      return;
    }

    // Three-stop keyframe for a visible "spring" — tiny → overshoot
    // larger than final → settle at the target. With a single from/to
    // the eye reads it as a smooth fade-up; the overshoot is what
    // sells it as a "pop".
    const anim = node.animate(
      [
        { transform: "scale(0.3)", opacity: 0, offset: 0 },
        { transform: "scale(1.3)", opacity: 1, offset: 0.55 },
        { transform: "scale(1)", opacity: 1, offset: 1 },
      ],
      {
        duration: 800,
        delay: delayMs,
        easing: "ease-out",
        fill: "forwards",
      },
    );
    return () => anim.cancel();
  }, [started, delayMs]);

  // Hidden by default on SSR / before the animation runs — the WAAPI
  // animation supplies the final "scale(1) opacity:1" with fill:forwards.
  return (
    <span
      ref={ref}
      className="inline-block origin-bottom"
      style={{ transform: "scale(0.3)", opacity: 0 }}
    >
      {value}
    </span>
  );
}

function CountUp({
  value,
  started,
  delayMs,
}: {
  value: string;
  started: boolean;
  delayMs: number;
}) {
  const parsed = parseValue(value);
  const target = parsed?.target ?? 0;
  const [current, setCurrent] = useState(0);

  // Depend on primitives only — parseValue() returns a fresh object on
  // every render, so depending on `parsed` would re-run the effect on
  // every setCurrent and restart the animation from 0 indefinitely.
  useEffect(() => {
    if (!started || target === 0) return;
    const startAt = performance.now() + delayMs;
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - startAt;
      if (elapsed < 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(elapsed / COUNT_DURATION_MS, 1);
      setCurrent(target * easeOutCubic(t));
      if (t < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, started, delayMs]);

  if (!parsed) return <>{value}</>;
  const shown =
    target >= 1000
      ? formatNumber(current, parsed.separator)
      : Math.round(current).toString();
  return (
    <>
      {parsed.prefix}
      {shown}
      {parsed.suffix}
    </>
  );
}

export function ResultsSection({
  title,
  description,
  stats,
  className = "",
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || started) return;

    // Respect user motion preference — snap straight to the final state.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true);
            observer.disconnect();
            return;
          }
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [started]);

  return (
    <section ref={sectionRef} className={`section ${className}`.trim()}>
      <div className="container-page">
        <SectionHeading
          align="left"
          className="mb-10"
          description={description}
        >
          {title}
        </SectionHeading>

        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ value, unit, label, heightClass }, i) => {
            // First N-1 cards "pop" — short scale-up with overshoot.
            // The LAST card uses the count-up so the final stat reads
            // as the climax of the gesture.
            const isLast = i === stats.length - 1;
            return (
              <div
                key={label}
                className={`flex flex-col justify-between rounded-2xl bg-secondary-10 p-6 text-text-strong transition-all duration-500 ease-out motion-reduce:transition-none ${heightClass ?? ""} ${started ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`.trim()}
                style={{ transitionDelay: started ? `${i * STAGGER_MS}ms` : "0ms" }}
              >
                <p className="whitespace-pre-line text-body text-text-strong">{label}</p>
                <p className="flex items-baseline justify-end gap-2 text-[2.5rem] font-medium leading-none sm:justify-start lg:text-[3rem]">
                  {isLast ? (
                    <CountUp
                      value={value}
                      started={started}
                      delayMs={i * STAGGER_MS}
                    />
                  ) : (
                    <PopValue
                      value={value}
                      started={started}
                      delayMs={i * STAGGER_MS}
                    />
                  )}
                  {unit && (
                    <span className="text-body font-normal text-text-primary">
                      {unit}
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
