"use client";

import { useEffect, useRef, useState } from "react";
import { CampaignCard } from "./CampaignCard";

type CarouselCampaign = {
  id: string;
  slug: string;
  title: string;
  coverImage: string | null;
  goalAmount: number;
  currentAmount: number;
};

type Props = {
  title: string;
  campaigns: CarouselCampaign[];
  locale: string;
  raisedLabel: string;
  goalLabel: string;
  donateBtnLabel: string;
  prevAriaLabel: string;
  nextAriaLabel: string;
};

/**
 * Horizontal carousel of related campaigns. Native scroll-snap on mobile,
 * programmatic scroll-by-card via the prev/next chevron buttons on desktop.
 */
export function CampaignsCarousel({
  title,
  campaigns,
  locale,
  raisedLabel,
  goalLabel,
  donateBtnLabel,
  prevAriaLabel,
  nextAriaLabel,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  // Update the enabled state of the chevrons whenever the user scrolls.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollPrev(el.scrollLeft > 4);
      setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [campaigns.length]);

  function scrollByCard(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    // Card width = first child width (cards have a fixed width via `shrink-0`).
    const first = el.querySelector<HTMLElement>(":scope > *");
    const step = first ? first.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="text-h1 text-text-strong">{title}</h2>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            aria-label={prevAriaLabel}
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollPrev}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            aria-label={nextAriaLabel}
            onClick={() => scrollByCard(1)}
            disabled={!canScrollNext}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-secondary bg-white text-secondary transition-colors hover:bg-secondary hover:text-white disabled:opacity-40"
          >
            <Chevron direction="right" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {campaigns.map((c) => (
          <div
            key={c.id}
            className="w-[280px] shrink-0 snap-start sm:w-[340px] lg:w-[380px]"
          >
            <CampaignCard
              slug={c.slug}
              locale={locale}
              title={c.title}
              coverImage={c.coverImage}
              goalAmount={c.goalAmount}
              currentAmount={c.currentAmount}
              raisedLabel={raisedLabel}
              goalLabel={goalLabel}
              donateBtnLabel={donateBtnLabel}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
    </svg>
  );
}
