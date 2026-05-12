import Link from "next/link";
import { PhotoReportCarousel } from "./PhotoReportCarousel";
import type { PhotoReportCardData } from "./PhotoReportCard";
import { Button } from "@/components/ui/button";

type Props = {
  id?: string;
  title: string;
  subtitle: string;
  allReportsLabel: string;
  allReportsHref: string;
  reports: PhotoReportCardData[];
  prevLabel: string;
  nextLabel: string;
};

export function PhotoReportSection({
  id,
  title,
  subtitle,
  allReportsLabel,
  allReportsHref,
  reports,
  prevLabel,
  nextLabel,
}: Props) {
  if (reports.length === 0) return null;

  const allReportsLink = (
    <Button
      render={<Link href={allReportsHref} />}
      variant="outline"
      size="xl"
      shape="pill"
    >
      {allReportsLabel}
    </Button>
  );

  return (
    <section id={id} className="section" aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="container-page">
        {/* Heading row */}
        <h2
          id={id ? `${id}-title` : undefined}
          className="text-h2 mb-6 text-center text-text-strong lg:hidden"
        >
          {title}
        </h2>

        {/* Subtitle + "All reports" — centered on mobile, split row on desktop */}
        <div className="mb-8 lg:mb-10 lg:flex lg:items-end lg:justify-between lg:gap-6">
          <div className="text-center lg:text-left">
            <h2
              className="text-h2 mb-4 hidden text-text-strong lg:block"
            >
              {title}
            </h2>
            <p className="max-w-2xl text-body text-text-primary lg:max-w-xl">
              {subtitle}
            </p>
          </div>
          <div className="hidden shrink-0 lg:block">{allReportsLink}</div>
        </div>

        <PhotoReportCarousel
          reports={reports}
          prevLabel={prevLabel}
          nextLabel={nextLabel}
        />

        {/* Mobile/tablet: "All reports" button below the carousel */}
        <div className="mt-6 flex justify-center lg:hidden">
          <Button
            render={<Link href={allReportsHref} />}
            variant="outline"
            size="xl"
            shape="pill"
            className="w-full max-w-sm"
          >
            {allReportsLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
