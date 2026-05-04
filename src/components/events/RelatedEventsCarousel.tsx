"use client";

import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode[];
};

export function RelatedEventsCarousel({ title, children }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateButtons();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [updateButtons]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <section className="section bg-secondary-10">
      <div className="container-page">
        <div className="mb-8 flex items-center justify-between gap-4 lg:mb-12">
          <h2 className="text-h2 font-bold text-text-strong lg:text-[40px]">{title}</h2>
          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canPrev}
              aria-label="Previous"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canNext}
              aria-label="Next"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-secondary bg-white text-secondary transition-colors hover:bg-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="-mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 xl:-mx-20 xl:px-20 [&::-webkit-scrollbar]:hidden"
        >
          {children.map((child, i) => (
            <div
              key={i}
              data-carousel-item
              className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)]"
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
