"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CateringEventSlide {
  id: string;
  title: string;
  description: string;
  location: string;
  images: string[];
}

interface Props {
  title: string;
  events: CateringEventSlide[];
  prevAriaLabel: string;
  nextAriaLabel: string;
}

export function CateringEventsCarousel({
  title,
  events,
  prevAriaLabel,
  nextAriaLabel,
}: Props) {
  const [index, setIndex] = useState(0);
  if (events.length === 0) return null;

  const event = events[index];
  const canNavigate = events.length > 1;
  const photos = event.images.slice(0, 5);

  const prev = () => setIndex((i) => (i - 1 + events.length) % events.length);
  const next = () => setIndex((i) => (i + 1) % events.length);

  return (
    <section className="section">
      <div className="container-page">
        {/* Header with title and (desktop) nav arrows */}
        <div className="mb-8 flex items-center justify-between gap-4 lg:mb-10">
          <h2 className="text-title-tablet font-medium text-text-strong max-w-3xl">
            {title}
          </h2>
          {canNavigate && (
            <div className="hidden shrink-0 items-center gap-3 lg:flex">
              <NavButton
                direction="prev"
                onClick={prev}
                ariaLabel={prevAriaLabel}
                filled
              />
              <NavButton
                direction="next"
                onClick={next}
                ariaLabel={nextAriaLabel}
              />
            </div>
          )}
        </div>

        {/* Desktop: two rows with bespoke per-row column proportions
            and heights so the gallery reads as a layout, not a rigid
            grid. Figma:
              Row 1 (h 304px): 436 / 360 / 437
              Row 2 (h 280px): 559 / 327 / 347 */}
        <div className="hidden flex-col gap-4 lg:flex">
          <div className="grid h-[304px] grid-cols-[436fr_360fr_437fr] gap-4">
            <TextCard event={event} />
            <PhotoCard src={photos[0]} alt={event.title} />
            <PhotoCard src={photos[1]} alt={event.title} />
          </div>
          <div className="grid h-[280px] grid-cols-[559fr_327fr_347fr] gap-4">
            <PhotoCard src={photos[2]} alt={event.title} />
            <PhotoCard src={photos[3]} alt={event.title} />
            <PhotoCard src={photos[4]} alt={event.title} />
          </div>
        </div>

        {/* Mobile/tablet: text card on top, swipeable photo strip */}
        <div className="flex flex-col gap-5 lg:hidden">
          <TextCard event={event} centered />

          {photos.length > 0 && (
            <div className="-mx-5 sm:mx-0">
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {photos.map((src, i) => (
                  <div
                    key={`${event.id}-m-${i}`}
                    className="relative aspect-[4/3] w-[85%] shrink-0 snap-start overflow-hidden rounded-2xl bg-grey-40 sm:w-[60%]"
                  >
                    <Image
                      src={src}
                      alt={event.title}
                      fill
                      sizes="(max-width: 640px) 85vw, 60vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile/tablet arrows under the strip */}
          {canNavigate && (
            <div className="mt-2 flex items-center justify-end gap-3">
              <NavButton
                direction="prev"
                onClick={prev}
                ariaLabel={prevAriaLabel}
                filled
              />
              <NavButton
                direction="next"
                onClick={next}
                ariaLabel={nextAriaLabel}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TextCard({
  event,
  centered = false,
}: {
  event: CateringEventSlide;
  centered?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-primary-40 p-6 lg:p-8",
        centered && "text-center sm:text-left",
      )}
    >
      <h3 className="text-h2 font-medium text-text-strong">{event.title}</h3>
      <p className="text-body text-text-primary">{event.description}</p>
      <p
        className={cn(
          "text-body-sm text-text-secondary",
          centered && "mt-auto sm:text-right",
        )}
      >
        {event.location}
      </p>
    </div>
  );
}

function PhotoCard({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-grey-40">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 33vw"
        className="object-cover"
      />
    </div>
  );
}

function NavButton({
  direction,
  onClick,
  ariaLabel,
  filled = false,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  ariaLabel: string;
  filled?: boolean;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors",
        filled
          ? "border-secondary bg-secondary text-white hover:bg-secondary-140"
          : "border-secondary bg-white text-secondary hover:bg-secondary-10",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
