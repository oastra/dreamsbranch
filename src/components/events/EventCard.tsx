import Image from "next/image";
import Link from "next/link";
import ArrowRightUp from "../icons/ArrowRightUp";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { EventBadges } from "./EventBadges";

export interface EventCardProps {
  slug: string;
  locale: string;
  title: string;
  subtitle?: string;
  coverImage: string | null;
  tags: string[];
  isArchived?: boolean;
  tagLabels: Record<string, string>;
  /** Set on the first card in a row when it can be the LCP. */
  priority?: boolean;
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
  priority = false,
}: EventCardProps) {
  return (
    <Link
      href={`/${locale}/events/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white transition-shadow hover:shadow-card-hover"
    >
      {/* Text + badges — inset (Figma px-5 pt-5, 16px gaps) */}
      <div className="px-5 pt-5">
        <h3 className="text-h3 font-medium text-text-strong line-clamp-1">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-4 line-clamp-2 text-body text-text-primary">
            {subtitle}
          </p>
        )}

        <EventBadges
          isArchived={isArchived}
          tags={tags}
          labels={{
            active: tagLabels.active,
            archived: tagLabels.archived,
            looking_for_partners: tagLabels.looking_for_partners,
            looking_for_volunteers: tagLabels.looking_for_volunteers,
          }}
          className="mt-4 min-h-18.5 content-start"
        />
      </div>

      {/* Image — full-bleed at the bottom (the card's rounded corners clip
          it), with the arrow overlay pinned to its top-right. mt-auto keeps
          the image bottom-aligned so cards in a row stay the same height. */}
      <div className="relative mt-auto pt-5">
        <div className="relative aspect-4/3 w-full overflow-hidden bg-secondary-10">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              priority={priority}
              className="object-cover"
              quality={70}
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
