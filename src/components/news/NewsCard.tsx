import Link from 'next/link';
import { MaskedImage } from '@/components/shared/MaskedImage';

export interface NewsCardProps {
  slug: string;
  locale: string;
  title: string;
  description: string;
  coverImage: string | null;
  category: string;
  categoryLabel: string;
  publishedAt: string | null;
}

function formatDate(dateStr: string | null, locale: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'ua' ? 'uk-UA' : 'en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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
    <Link href={`/${locale}/news/${slug}`} className="card group flex flex-col">
      {/* Image */}
      <div className="relative aspect-4/3 bg-secondary-10">
        {coverImage ? (
          <MaskedImage
            src={coverImage}
            alt={title}
            className="h-full w-full"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-[20px]">
            <div className="h-14 w-14 rounded-full bg-secondary-40 opacity-60" />
          </div>
        )}
        {/* Category badge */}
        <span className="badge-active absolute bottom-3 left-3 z-10">
          {categoryLabel}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-body line-clamp-3 text-text-secondary">{description}</p>
        {publishedAt && (
          <p className="mt-auto text-caption text-text-secondary">
            {formatDate(publishedAt, locale)}
          </p>
        )}
      </div>
    </Link>
  );
}
