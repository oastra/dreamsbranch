import Image from "next/image";
import Link from "next/link";
import ArrowRightUp from "../icons/ArrowRightUp";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";

export interface EventCardProps {
  slug: string;
  locale: string;
  title: string;
  subtitle?: string;
  coverImage: string | null;
  tags: string[];
  isArchived?: boolean;
  tagLabels: Record<string, string>;
}

export function EventCard({
  slug,
  locale,
  title,
  subtitle,
  coverImage,
  tags,
  isArchived = false,
  tagLabels,
}: EventCardProps) {
  return (
    <Link
      href={`/${locale}/events/${slug}`}
      className="group flex h-full flex-col rounded-2xl bg-white p-4 transition-shadow hover:shadow-md"
    >
      <h3 className="text-h3 font-semibold text-text-strong">{title}</h3>
      {subtitle && (
        <p className="mt-1 line-clamp-2 text-body text-text-secondary">
          {subtitle}
        </p>
      )}

      {/* Tags — min-height reserves space for two rows so images align across cards */}
      <div className="mt-4 flex min-h-18.5 flex-wrap content-start gap-2">
        {isArchived ? (
          <span className="inline-flex items-center rounded-full bg-grey-40 px-4 py-1.5 text-body-sm font-medium text-text-secondary">
            {tagLabels.archived}
          </span>
        ) : (
          <>
            <span className="inline-flex items-center rounded-full bg-[#3DC472] px-4 py-1.5 text-body-sm font-medium text-white">
              {tagLabels.active}
            </span>
            {tags.includes("looking_for_partners") && (
              <span className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-body-sm font-medium text-white">
                {tagLabels.looking_for_partners}
              </span>
            )}
            {tags.includes("looking_for_volunteers") && (
              <span className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-body-sm font-medium text-text-strong">
                {tagLabels.looking_for_volunteers}
              </span>
            )}
          </>
        )}
      </div>

      {/* Image with arrow overlay — mt-auto pins the image to the bottom for consistent alignment */}
      <div className="relative mt-auto pt-5">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-secondary-10">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <ImagePlaceholder size="sm" />
          )}
        </div>

        <span
          aria-hidden
          className="absolute right-3 top-5 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary/40 text-text-strong shadow-[0_4px_8px_0_rgba(0,68,143,0.15)] transition-colors group-hover:bg-secondary group-hover:text-white"
        >
          <ArrowRightUp className="h-5 w-5" strokeWidth={1} />
        </span>
      </div>
    </Link>
  );
}
