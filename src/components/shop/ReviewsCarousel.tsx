"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export type Review = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar: string;
  ratingAriaLabel: string;
};

type Props = {
  reviews: Review[];
  prevAriaLabel: string;
  nextAriaLabel: string;
};

export function ReviewsCarousel({ reviews, prevAriaLabel, nextAriaLabel }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const total = reviews.length;

  // Keep the mobile/tablet scroll track aligned with the active index when
  // the user clicks prev/next.
  useEffect(() => {
    const el = trackRef.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index]);

  function go(delta: number) {
    setIndex((i) => (i + delta + total) % total);
  }

  return (
    <div className="relative">
      {/* ── Mobile + Tablet: snap-scroll track ──────────────────── */}
      <div
        ref={trackRef}
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 sm:gap-6 sm:px-[10%] lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            className="w-[88%] shrink-0 snap-center sm:w-[80%]"
          >
            <ReviewCard review={review} />
          </div>
        ))}
      </div>

      {/* ── Desktop: animated 3-card spotlight ──
          All cards are absolutely positioned and stacked at left-1/2.
          Each card's transform is derived from its relative offset to
          the active index — wrap-around so prev/next always exist.
          The active card sits on top (z-10) and overlaps the side cards;
          only their photo + yellow-frame area peeks past the active edges.
          CSS transitions on transform/opacity give the rotation animation. */}
      <div className="relative hidden min-h-[460px] lg:block">
        {reviews.map((review, i) => {
          let rel = i - index;
          if (rel > total / 2) rel -= total;
          if (rel < -total / 2) rel += total;

          const isActive = rel === 0;
          const isAdjacent = Math.abs(rel) === 1;

          return (
            <div
              key={review.id}
              aria-hidden={!isActive}
              className="absolute left-1/2 top-0 w-[60%] transition-all duration-500 ease-out"
              style={{
                transform: `translate(calc(-50% + ${rel * 40}% - ${rel * 5}px), 0) scale(${
                  isActive ? 1 : 0.85
                })`,
                opacity: isActive ? 1 : isAdjacent ? 1 : 0,
                zIndex: isActive ? 10 : 0,
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              <ReviewCard review={review} />
            </div>
          );
        })}
      </div>

      {/* ── Nav buttons (desktop only; mobile/tablet uses touch swipe) ── */}
      <div className="mt-8 hidden justify-center gap-3 lg:flex">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={prevAriaLabel}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-secondary bg-white text-secondary transition-colors hover:border-[#0057B8] hover:bg-[#0057B8] hover:text-white focus-visible:border-[#0057B8] focus-visible:bg-[#0057B8] focus-visible:text-white focus-visible:outline-none active:border-[#0057B8] active:bg-[#0057B8] active:text-white"
        >
          <ChevronLeft size={22} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label={nextAriaLabel}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-secondary bg-white text-secondary transition-colors hover:border-[#0057B8] hover:bg-[#0057B8] hover:text-white focus-visible:border-[#0057B8] focus-visible:bg-[#0057B8] focus-visible:text-white focus-visible:outline-none active:border-[#0057B8] active:bg-[#0057B8] active:text-white"
        >
          <ChevronRight size={22} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
}

// ─── Review card subcomponent ────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-3xl bg-white p-5 shadow-[0_4px_8px_0_rgba(0,68,143,0.07)] sm:p-8 lg:p-10"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:gap-10">
        {/* Photo with yellow accent box */}
        <div className="relative shrink-0 self-center sm:self-start">
          <div
            aria-hidden
            className="absolute -bottom-2 -left-2 h-full w-full rounded-2xl bg-[#FCF3C3] lg:-bottom-3 lg:-left-3"
          />
          <Image
            src={review.avatar}
            alt={review.name}
            width={264}
            height={264}
            className="relative aspect-square w-[180px] rounded-2xl object-cover sm:w-[220px] lg:w-[264px]"
          />
        </div>

        {/* Quote + meta */}
        <div className="flex flex-1 flex-col">
          <p className="text-body whitespace-pre-line text-text-primary">
            {`«${review.quote}»`}
          </p>

          <div
            className="mt-3 flex items-center gap-1 lg:mt-4"
            role="img"
            aria-label={review.ratingAriaLabel}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                strokeWidth={1.5}
                className={
                  i < review.rating
                    ? "fill-[#FFE766] text-[#FFE766]"
                    : "fill-transparent text-grey-40"
                }
                aria-hidden
              />
            ))}
          </div>

          <hr className="mt-4 border-border lg:mt-6" />

          <h3 className="mt-3 text-h3 font-semibold text-text-strong lg:mt-4">
            {review.name}
          </h3>
          <p className="mt-1 text-body-sm text-text-secondary">{review.role}</p>
        </div>
      </div>
    </article>
  );
}
