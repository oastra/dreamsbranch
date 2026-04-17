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
  tagLabels: Record<string, string>;
  dateTimeLabel: string;
  locationLabel: string;
  viewMapLabel: string;
  learnMoreLabel: string;
  moreInfoLabel: string;
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
  tagLabels,
  dateTimeLabel,
  locationLabel,
  viewMapLabel,
  learnMoreLabel,
  moreInfoLabel,
}: FeaturedEventCardProps) {
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-video md:aspect-auto md:min-h-[360px]">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center bg-secondary-10">
              <div className="h-20 w-20 rounded-full bg-secondary-40 opacity-60" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 p-6 lg:p-8">
          <h3 className="text-h3 font-medium text-text-strong">{title}</h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="badge-active">{tagLabels.active}</span>
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

          <p className="text-body text-text-secondary line-clamp-3">{description}</p>

          {/* Date & Location */}
          <div className="space-y-2 text-body-sm">
            <div className="flex gap-8">
              <div>
                <p className="text-caption uppercase tracking-wide text-text-secondary">
                  {dateTimeLabel}
                </p>
                <p className="mt-1 font-medium text-text-strong">
                  {formatDate(eventDate, locale)}
                </p>
                <p className="text-text-secondary">
                  {formatTime(startTime, endTime)}
                </p>
              </div>
              <div>
                <p className="text-caption uppercase tracking-wide text-text-secondary">
                  {locationLabel}
                </p>
                <p className="mt-1 font-medium text-text-strong">{location}</p>
                {locationMapUrl && (
                  <a
                    href={locationMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary underline"
                  >
                    {viewMapLabel}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-auto flex flex-wrap gap-3">
            <Link
              href={`/${locale}/events/${slug}`}
              className="inline-flex items-center justify-center rounded-full bg-secondary px-6 py-2.5 text-body font-medium text-white transition-opacity hover:opacity-90"
            >
              {learnMoreLabel}
            </Link>
            <Link
              href={`/${locale}/events/${slug}`}
              className="inline-flex items-center justify-center rounded-full border border-border bg-white px-6 py-2.5 text-body font-medium text-text-strong transition-colors hover:bg-grey-40"
            >
              {moreInfoLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
