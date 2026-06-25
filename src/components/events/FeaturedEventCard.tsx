import Image from "next/image";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { Button } from "@/components/ui/button";

export interface FeaturedEventCardProps {
  slug: string;
  locale: string;
  title: string;
  description: string;
  coverImage: string | null;
  eventDate: string;
  startTime: string;
  endTime: string | null;
  location: string;
  locationMapUrl: string | null;
  tags: string[];
  isArchived?: boolean;
  tagLabels: Record<string, string>;
  dateTimeLabel: string;
  locationLabel: string;
  viewMapLabel: string;
  learnMoreLabel: string;
  joinLabel: string;
}

const UA_MONTHS = [
  "січня", "лютого", "березня", "квітня", "травня", "червня",
  "липня", "серпня", "вересня", "жовтня", "листопада", "грудня",
];

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  if (locale === "ua") {
    return `${date.getDate()} ${UA_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  }
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Strip seconds from a "HH:mm:ss" or "HH:mm" string so the rendered
// time stays compact ("11:00" not "11:00:00").
function trimSeconds(t: string): string {
  return t.split(":").slice(0, 2).join(":");
}

// Take just the first sentence of a description so the featured-card
// preview stays compact. Matches up to and including the first ., !, or ?.
// Falls back to the whole string if there's no sentence-ending punctuation.
function firstSentence(text: string): string {
  if (!text) return "";
  const match = text.match(/^[^.!?]+[.!?]/);
  return (match ? match[0] : text).trim();
}

function formatTime(start: string, end: string | null): string {
  const s = trimSeconds(start);
  if (!end) return s;
  return `${s} - ${trimSeconds(end)}`;
}

export function FeaturedEventCard({
  slug,
  locale,
  title,
  description,
  coverImage,
  eventDate,
  startTime,
  endTime,
  location,
  locationMapUrl,
  tags,
  isArchived = false,
  tagLabels,
  dateTimeLabel,
  locationLabel,
  viewMapLabel,
  learnMoreLabel,
  joinLabel,
}: FeaturedEventCardProps) {
  // Figma: h-8 chips with 16px (rounded-2xl) corners, 16px regular text.
  const badge = "inline-flex h-8 items-center rounded-2xl px-4 text-body font-normal";
  const tagPills = (
    <div className="flex flex-wrap gap-3">
      {isArchived ? (
        <span className={`${badge} bg-grey-40 text-text-secondary`}>
          {tagLabels.archived}
        </span>
      ) : (
        <>
          <span className={`${badge} bg-[#3DC472] text-white`}>
            {tagLabels.active}
          </span>
          {tags.includes("looking_for_partners") && (
            <span className={`${badge} bg-secondary-40 text-white`}>
              {tagLabels.looking_for_partners}
            </span>
          )}
          {tags.includes("looking_for_volunteers") && (
            <span className={`${badge} bg-primary text-text-strong`}>
              {tagLabels.looking_for_volunteers}
            </span>
          )}
        </>
      )}
    </div>
  );

  // Figma: 16px Main-Text labels, 18px Grey-100 values, 10px between lines.
  // Date column is a fixed width and Location fills the rest, so the two
  // columns read as a clean grid instead of bunching together.
  const dateLocation = (
    <div className="flex flex-col gap-5 sm:flex-row sm:gap-8">
      <div className="flex flex-col gap-2.5 sm:w-44 sm:shrink-0">
        <p className="text-body text-text-primary">{dateTimeLabel}</p>
        <p className="text-secondary text-text-strong">
          {formatDate(eventDate, locale)}
        </p>
        <p className="text-secondary text-text-strong">
          {formatTime(startTime, endTime)}
        </p>
      </div>
      <div className="flex flex-col gap-2.5 sm:flex-1">
        <p className="text-body text-text-primary">{locationLabel}</p>
        <p className="text-secondary text-text-strong">{location}</p>
        {locationMapUrl && (
          <a
            href={locationMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body text-secondary underline"
          >
            {viewMapLabel}
          </a>
        )}
      </div>
    </div>
  );

  const buttons = (
    <div className="flex flex-wrap gap-4 lg:gap-6">
      <Button
        render={<Link href={`/${locale}/events/${slug}`} />}
        size="xl"
        shape="pill"
        className="text-lg"
      >
        {learnMoreLabel}
      </Button>
      <Button
        render={<Link href={`/${locale}/events/${slug}`} />}
        variant="outline"
        size="xl"
        shape="pill"
        className="text-lg"
      >
        {joinLabel}
      </Button>
    </div>
  );

  const imageBlock = coverImage ? (
    <Image
      src={coverImage}
      alt={title}
      fill
      className="object-cover"
      sizes="(max-width: 1024px) 100vw, 50vw"
      priority
    />
  ) : (
    <ImagePlaceholder size="md" />
  );

  return (
    <div className="overflow-hidden rounded-3xl bg-secondary-10 lg:rounded-[2.5rem]">
      {/* Desktop: image left (~57%), 24px gap, vertically-centred content.
          Two content groups with 40px between them (Figma), each with its
          own internal rhythm (16px / 32px). */}
      <div className="hidden lg:grid lg:grid-cols-[57%_1fr] lg:items-stretch lg:gap-6">
        <div className="relative min-h-[510px]">{imageBlock}</div>

        <div className="flex flex-col justify-center gap-10 p-10">
          <div className="flex flex-col gap-4">
            <h3 className="text-h2 text-text-strong">{title}</h3>
            {tagPills}
            <p className="text-secondary text-text-primary">
              {firstSentence(description)}
            </p>
          </div>
          <div className="flex flex-col gap-8">
            {dateLocation}
            {buttons}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet: stacked — title, tags, description, image, date/loc, buttons */}
      <div className="flex flex-col gap-5 p-6 sm:p-8 lg:hidden">
        <h3 className="text-h3 font-medium text-text-strong">{title}</h3>
        {tagPills}
        <p className="text-secondary text-text-primary">{firstSentence(description)}</p>
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl">
          {imageBlock}
        </div>
        {dateLocation}
        {buttons}
      </div>
    </div>
  );
}
