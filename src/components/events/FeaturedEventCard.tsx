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
    return `${date.getDate()} ${UA_MONTHS[date.getMonth()]} ${date.getFullYear()} року`;
  }
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Strip seconds from a "HH:mm:ss" or "HH:mm" string so the rendered
// time stays compact ("11:00" not "11:00:00"). Range uses an en-dash
// to match the Figma.
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
  return `${s} – ${trimSeconds(end)}`;
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
  const tagPills = (
    <div className="flex flex-wrap gap-2">
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
  );

  const dateLocation = (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex flex-col gap-[10px]">
        <p className="text-body text-text-primary">{dateTimeLabel}</p>
        <p className="mt-1 text-secondary text-text-primary">
          {formatDate(eventDate, locale)}
        </p>
        <p className="text-secondary text-text-primary">
          {formatTime(startTime, endTime)}
        </p>
      </div>
      <div>
        <p className="text-body-sm text-text-secondary">{locationLabel}</p>
        <p className="mt-1 text-body font-medium text-text-strong">
          {location}
        </p>
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
    <div className="flex flex-wrap gap-3">
      <Button
        render={<Link href={`/${locale}/events/${slug}`} />}
        size="xl"
        shape="pill"
      >
        {learnMoreLabel}
      </Button>
      <Button
        render={<Link href={`/${locale}/events/${slug}`} />}
        variant="outline"
        size="xl"
        shape="pill"
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
    <div className="overflow-hidden rounded-3xl bg-secondary-10">
      {/* Desktop: image left, content right */}
      <div className="hidden lg:grid lg:grid-cols-2">
        <div className="relative min-h-[500px]">{imageBlock}</div>

        <div className="flex flex-col gap-5 p-8 lg:p-10">
          <h3 className="text-h2 text-text-strong">{title}</h3>
          {tagPills}
          <p className="text-body text-text-strong">{firstSentence(description)}</p>
          {dateLocation}
          <div className="mt-auto pt-2">{buttons}</div>
        </div>
      </div>

      {/* Mobile/Tablet: stacked — title, tags, description, image, date/loc, buttons */}
      <div className="flex flex-col gap-5 p-6 sm:p-8 lg:hidden">
        <h3 className="text-h3 font-medium text-text-strong">{title}</h3>
        {tagPills}
        <p className="text-secondary text-text-primary">{firstSentence(description)}</p>
        <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl">
          {imageBlock}
        </div>
        {dateLocation}
        {buttons}
      </div>
    </div>
  );
}
