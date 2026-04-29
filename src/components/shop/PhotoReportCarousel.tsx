"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PhotoReportCard, type PhotoReportCardData } from "./PhotoReportCard";

type Props = {
  reports: PhotoReportCardData[];
  prevLabel: string;
  nextLabel: string;
};

export function PhotoReportCarousel({ reports, prevLabel, nextLabel }: Props) {
  const [index, setIndex] = useState(0);

  if (reports.length === 0) return null;

  const current = reports[index];
  const showNav = reports.length > 1;

  function goPrev() {
    setIndex((i) => (i - 1 + reports.length) % reports.length);
  }

  function goNext() {
    setIndex((i) => (i + 1) % reports.length);
  }

  return (
    <div>
      <PhotoReportCard report={current} />

      {showNav && (
        <div
          role="group"
          aria-label="Photo report navigation"
          className="mt-8 flex items-center justify-center gap-4 sm:mt-10"
        >
          <button
            type="button"
            onClick={goPrev}
            aria-label={prevLabel}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-white transition-opacity hover:opacity-90"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={nextLabel}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-secondary text-secondary transition-colors hover:bg-secondary hover:text-white"
          >
            <ChevronRight size={22} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
