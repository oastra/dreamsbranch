import Link from 'next/link';
import { MaskedImage } from '@/components/shared/MaskedImage';

export interface EventCardProps {
  slug: string;
  locale: string;
  title: string;
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
  if (end) return `${start} - ${end}`;
  return start;
}

export function EventCard({
  slug,
  locale,
  title,
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
}: EventCardProps) {
  return (
    <div className="card flex flex-col">
      {/* Image */}
      <div className="relative aspect-video bg-secondary-10">
        {coverImage ? (
          <MaskedImage
            src={coverImage}
            alt={title}
            className="h-full w-full"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-[20px]">
            <div className="h-14 w-14 rounded-full bg-secondary-40 opacity-60" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-body line-clamp-2 font-medium text-text-strong">{title}</h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {!isArchived && (
            <span className="badge-active">{tagLabels.active}</span>
          )}
          {isArchived && (
            <span className="badge-archived">{tagLabels.archive}</span>
          )}
          {tags.includes('looking_for_partners') && (
            <span className="badge bg-accent-2 text-secondary">
              {tagLabels.looking_for_partners}
            </span>
          )}
          {tags.includes('looking_for_volunteers') && (
            <span className="badge bg-accent-4 text-text-strong">
              {tagLabels.looking_for_volunteers}
            </span>
          )}
        </div>

        {/* Date & Location */}
        <div className="mt-auto space-y-2 text-body-sm text-text-secondary">
          <div>
            <span className="font-medium text-text-strong">{dateTimeLabel}: </span>
            {formatDate(eventDate, locale)}, {formatTime(startTime, endTime)}
          </div>
          <div>
            <span className="font-medium text-text-strong">{locationLabel}: </span>
            {location}
            {locationMapUrl && (
              <>
                {' '}
                <a
                  href={locationMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary underline"
                >
                  {viewMapLabel}
                </a>
              </>
            )}
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/${locale}/events/${slug}`}
          className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-body font-medium text-text-strong transition-colors hover:bg-grey-40"
        >
          {learnMoreLabel}
        </Link>
      </div>
    </div>
  );
}
