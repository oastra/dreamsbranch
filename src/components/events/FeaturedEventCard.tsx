import Image from 'next/image';
import Link from 'next/link';

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

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'ua' ? 'uk-UA' : 'en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(start: string, end: string | null): string {
  if (end) return `${start} - ${end.replace(':', '-')}`;
  return start;
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
          {tags.includes('looking_for_partners') && (
            <span className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-body-sm font-medium text-white">
              {tagLabels.looking_for_partners}
            </span>
          )}
          {tags.includes('looking_for_volunteers') && (
            <span className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-body-sm font-medium text-text-strong">
              {tagLabels.looking_for_volunteers}
            </span>
          )}
        </>
      )}
    </div>
  );

  const dateLocation = (
    <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
      <div>
        <p className="text-body-sm text-text-secondary">{dateTimeLabel}</p>
        <p className="mt-1 text-body font-medium text-text-strong">
          {formatDate(eventDate, locale)}
        </p>
        <p className="text-body text-text-strong">{formatTime(startTime, endTime)}</p>
      </div>
      <div>
        <p className="text-body-sm text-text-secondary">{locationLabel}</p>
        <p className="mt-1 text-body font-medium text-text-strong">{location}</p>
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
      <Link
        href={`/${locale}/events/${slug}`}
        className="inline-flex items-center justify-center rounded-full bg-secondary px-8 py-3 text-body font-medium text-white transition-opacity hover:opacity-90"
      >
        {learnMoreLabel}
      </Link>
      <Link
        href={`/${locale}/events/${slug}`}
        className="inline-flex items-center justify-center rounded-full border-2 border-secondary bg-white px-8 py-3 text-body font-medium text-secondary transition-colors hover:bg-secondary-10"
      >
        {joinLabel}
      </Link>
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
    <div className="flex h-full w-full items-center justify-center bg-secondary-10">
      <div className="h-20 w-20 rounded-full bg-secondary-40 opacity-60" />
    </div>
  );

  return (
    <div className="overflow-hidden rounded-3xl bg-secondary-10">
      {/* Desktop: image left, content right */}
      <div className="hidden lg:grid lg:grid-cols-2">
        <div className="relative min-h-[500px]">{imageBlock}</div>

        <div className="flex flex-col gap-5 p-8 lg:p-10">
          <h3 className="text-h2 font-medium text-text-strong">{title}</h3>
          {tagPills}
          <p className="text-body text-text-strong">{description}</p>
          {dateLocation}
          <div className="mt-auto pt-2">{buttons}</div>
        </div>
      </div>

      {/* Mobile/Tablet: stacked — title, tags, description, image, date/loc, buttons */}
      <div className="flex flex-col gap-5 p-6 sm:p-8 lg:hidden">
        <h3 className="text-h3 font-medium text-text-strong">{title}</h3>
        {tagPills}
        <p className="text-body text-text-strong">{description}</p>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
          {imageBlock}
        </div>
        {dateLocation}
        {buttons}
      </div>
    </div>
  );
}
