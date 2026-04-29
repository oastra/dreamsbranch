"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard, type ProductCardProduct } from "./ProductCard";

type Props = {
  locale: string;
  products: ProductCardProduct[];
  title: string;
  prevAriaLabel: string;
  nextAriaLabel: string;
  addLabel: string;
};

const VISIBLE_DESKTOP = 4;

export function RelatedProducts({
  locale,
  products,
  title,
  prevAriaLabel,
  nextAriaLabel,
  addLabel,
}: Props) {
  // Index of the first card visible on desktop. Each prev/next click
  // shifts the visible window by one card. On tablet/mobile every
  // product renders (2-col grid / horizontal scroll), so this is
  // effectively desktop-only.
  const [start, setStart] = useState(0);

  if (products.length === 0) return null;

  const showNav = products.length > VISIBLE_DESKTOP;
  const canPrev = start > 0;
  const canNext = start + VISIBLE_DESKTOP < products.length;
  const desktopVisible = products.slice(start, start + VISIBLE_DESKTOP);

  function shift(delta: 1 | -1) {
    setStart((current) => {
      const next = current + delta;
      const max = Math.max(0, products.length - VISIBLE_DESKTOP);
      return Math.max(0, Math.min(max, next));
    });
  }

  return (
    <section className="pb-12 sm:pb-16 lg:pb-20">
      <div className="container-page">
        {/* ── Heading + nav ─────────────────────────────────────
            Mobile: centered + underlined.
            Tablet: centered.
            Desktop: left + nav buttons on right (only when paginated). */}
        <div className="mb-6 flex flex-col items-center gap-4 sm:mb-8 lg:mb-10 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-h2 font-semibold text-text-strong text-center underline decoration-secondary decoration-2 underline-offset-4 sm:no-underline lg:text-left">
            {title}
          </h2>

          {showNav && (
            <div className="hidden gap-3 lg:flex">
              <button
                type="button"
                onClick={() => shift(-1)}
                disabled={!canPrev}
                aria-label={prevAriaLabel}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-secondary bg-secondary text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:bg-white disabled:text-secondary disabled:opacity-50"
              >
                <ChevronLeft size={22} strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => shift(1)}
                disabled={!canNext}
                aria-label={nextAriaLabel}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-secondary bg-white text-secondary transition-colors hover:bg-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-secondary"
              >
                <ChevronRight size={22} strokeWidth={2} aria-hidden />
              </button>
            </div>
          )}
        </div>

        {/* ── Mobile + Tablet: full list ─────────────────────────
            Mobile: horizontal scroll-snap with peek.
            Tablet: 2-col grid. */}
        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:justify-items-center sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((p) => (
            <div key={p.slug} className="shrink-0 snap-start sm:shrink">
              <ProductCard locale={locale} product={p} addLabel={addLabel} />
            </div>
          ))}
        </div>

        {/* ── Desktop: paginated 4-card window ───────────────── */}
        <div className="hidden gap-6 lg:grid lg:grid-cols-4 lg:justify-items-center">
          {desktopVisible.map((p) => (
            <ProductCard
              key={p.slug}
              locale={locale}
              product={p}
              addLabel={addLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
