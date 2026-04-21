import Link from "next/link";
import ReportIcon from "@/components/icons/ReportIcon";

type ReportsBannerProps = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  className?: string;
};

export function ReportsBanner({
  title,
  description,
  ctaLabel,
  ctaHref,
  className = "",
}: ReportsBannerProps) {
  return (
    <div
      className={`flex flex-col items-start gap-6 rounded-2xl bg-secondary px-8 py-10 lg:flex-row lg:items-center lg:gap-10 lg:px-14 lg:py-10 ${className}`}
    >
      {/* Title + icon row on mobile/tablet; they split apart on desktop via `contents` */}
      <div className="flex w-full items-start justify-between gap-4 lg:contents">
        <h2 className="text-h2 font-medium text-white lg:max-w-[22ch] lg:shrink-0">
          {title}
        </h2>
        <div className="shrink-0 text-white/80 lg:order-3">
          <ReportIcon className="h-12 w-12 lg:h-20 lg:w-20" />
        </div>
      </div>
      <p className="text-body text-white/80 lg:order-2 lg:max-w-[32ch] lg:flex-1">
        {description}
      </p>
      <Link
        href={ctaHref}
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-10 py-[14px] text-body font-medium text-text-strong transition-opacity hover:opacity-90 lg:order-4"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
