import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ImagePlaceholder } from '@/components/shared/ImagePlaceholder';

export interface FeaturedNewsCardProps {
  slug: string;
  locale: string;
  title: string;
  description: string;
  coverImage: string | null;
  /** ISO date string from `news_articles.published_at`. */
  publishedAt: string | null;
  /** Yellow pill label — brand/source tag (e.g. "Dreams branch of UWAA"). */
  brandLabel: string;
  /** Blue pill on the image — e.g. "Новина" / "News". */
  tagNewsLabel: string;
  learnMoreLabel: string;
}

const MONTHS_UA = [
  'січня',
  'лютого',
  'березня',
  'квітня',
  'травня',
  'червня',
  'липня',
  'серпня',
  'вересня',
  'жовтня',
  'листопада',
  'грудня',
];

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  if (locale === 'ua') {
    return `${d.getDate()} ${MONTHS_UA[d.getMonth()]} ${d.getFullYear()}`;
  }
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function FeaturedNewsCard({
  slug,
  locale,
  title,
  description,
  coverImage,
  publishedAt,
  brandLabel,
  tagNewsLabel,
  learnMoreLabel,
}: FeaturedNewsCardProps) {
  const dateLabel = formatDate(publishedAt, locale);

  return (
    <article className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-0">
      {/* ── Image ───────────────────────────────────────────────── */}
      <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-grey-40 md:aspect-auto md:rounded-r-none">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <ImagePlaceholder size="md" />
        )}
        <span className="absolute bottom-4 left-4 inline-flex h-9 items-center justify-center rounded-full bg-secondary px-5 text-body-sm font-medium text-white md:bottom-6 md:left-6">
          {tagNewsLabel}
        </span>
      </div>

      {/* ── Content panel ───────────────────────────────────────── */}
      <div className="flex flex-col gap-4 rounded-2xl bg-secondary-10 p-6 md:rounded-l-none md:p-10 lg:gap-5 lg:p-12">
        {/* Date — order 1 across all breakpoints */}
        <p className="order-1 text-body-sm font-semibold text-secondary lg:text-body">
          {dateLabel}
        </p>

        {/* Title — order 4 on mobile/tablet (after description), order 2 on desktop */}
        <h3 className="order-4 text-h3 font-semibold text-text-strong md:order-2 lg:text-subheading">
          &ldquo;{title}&rdquo;
        </h3>

        {/* Brand pill — order 2 on mobile/tablet, order 3 on desktop */}
        <div className="order-2 md:order-3">
          <span className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-5 text-body-sm font-medium text-text-strong">
            {brandLabel}
          </span>
        </div>

        {/* Description — order 3 on mobile/tablet, order 4 on desktop */}
        <p className="order-3 text-body whitespace-pre-line text-text-primary md:order-4">
          {description}
        </p>

        {/* CTA — always last */}
        <div className="order-5 mt-2 lg:mt-4">
          <Button
            render={<Link href={`/${locale}/news/${slug}`} />}
            size="xl"
            shape="pill"
            className="w-full md:w-auto md:min-w-[220px]"
          >
            {learnMoreLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
