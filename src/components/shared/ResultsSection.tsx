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

/**
 * Pulls the numeric target out of a display string and remembers any
 * decorative bits around it. Examples:
 *   "4"        → { prefix: "",  target: 4,     suffix: "" }
 *   "1 200"    → { prefix: "",  target: 1200,  suffix: "" }
 *   "$12 000"  → { prefix: "$", target: 12000, suffix: "" }
 *   "100%"     → { prefix: "",  target: 100,   suffix: "%" }
 *   "—"        → null (no number to animate; render as-is)
 */
function parseValue(
  raw: string,
): { prefix: string; target: number; suffix: string } | null {
  const match = raw.match(/^(\D*?)([\d\s  ]+)(.*)$/);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const cleaned = digits.replace(/[\s  ]/g, "");
  const target = Number.parseInt(cleaned, 10);
  if (Number.isNaN(target)) return null;
  return { prefix, target, suffix };
}

/** "uk-UA" formats 1200 as "1 200" using a narrow NBSP. Normalise to
 *  a regular space so the rendered number matches the source string. */
function formatNumber(n: number): string {
  return Math.round(n)
    .toLocaleString("uk-UA")
    .replace(/[  ]/g, " ");
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
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
    target >= 1000 ? formatNumber(current) : Math.round(current).toString();
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
          {stats.map(({ value, unit, label, heightClass }, i) => (
            <div
              key={label}
              className={`flex flex-col justify-between rounded-2xl bg-secondary-10 p-6 text-text-strong transition-all duration-500 ease-out motion-reduce:transition-none ${heightClass ?? ""} ${started ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`.trim()}
              style={{ transitionDelay: started ? `${i * STAGGER_MS}ms` : "0ms" }}
            >
              <p className="whitespace-pre-line text-body text-text-strong">{label}</p>
              <p className="flex items-baseline justify-end gap-2 text-[2.5rem] font-medium leading-none sm:justify-start lg:text-[3rem]">
                <CountUp
                  value={value}
                  started={started}
                  delayMs={i * STAGGER_MS}
                />
                {unit && (
                  <span className="text-body font-normal text-text-primary">
                    {unit}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
