import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";

export interface NewsCardProps {
  slug: string;
  locale: string;
  title: string;
  description: string;
  coverImage: string | null;
  /** Yellow pill on the image (e.g. "Організатор"). */
  categoryLabel: string;
  /** Accepted for API compatibility but no longer rendered on the small card. */
  brandLabel?: string;
  publishedAt: string | null;
}

const MONTHS_UA = [
  "січня",
  "лютого",
  "березня",
  "квітня",
  "травня",
  "червня",
  "липня",
  "серпня",
  "вересня",
  "жовтня",
  "листопада",
  "грудня",
];

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  if (locale === "ua") {
    return `${d.getDate()} ${MONTHS_UA[d.getMonth()]} ${d.getFullYear()}`;
  }
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function NewsCard({
  slug,
  locale,
  title,
  description,
  coverImage,
  categoryLabel,

  publishedAt,
}: NewsCardProps) {
  return (
    <Link
      href={`/${locale}/news/${slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white transition-shadow hover:shadow-card-hover"
    >
      {/* ── Image with yellow category pill ─────────────────────── */}
      <div className="relative w-[300px] h-[220px] md:w-[576px] md:h-[286px] lg:w-[588px] lg:h-[320px] bg-grey-40">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder size="sm" />
        )}
        <span className="absolute bottom-4 left-4 inline-flex h-9 items-center justify-center rounded-full bg-primary px-5 text-body-sm font-medium text-text-strong">
          {categoryLabel}
        </span>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-3 p-5 lg:p-6">
        {/* Date */}
        <p className="text-h5 font-medium text-secondary-40">
          {formatDate(publishedAt, locale)}
        </p>

        {/* Brand pill
        <div>
          <span className="inline-flex h-9 items-center justify-center rounded-full bg-secondary px-5 text-body-sm font-medium text-white">
            {brandLabel}
          </span>
        </div> */}

        {/* Description preview */}
        <p className="text-body line-clamp-3 text-text-primary/90">
          {description}
        </p>

        {/* Title row with arrow */}
        <div className="mt-auto flex items-start justify-between gap-3 pt-1">
          <h3 className="text-card-title  font-semibold text-text-strong line-clamp-2">
            {title}
          </h3>
          <ArrowUpRight
            size={24}
            className="shrink-0 text-text-strong transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </Link>
  );
}
