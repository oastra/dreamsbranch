import Image from 'next/image';
import Link from 'next/link';

export interface FeaturedNewsCardProps {
  slug: string;
  locale: string;
  title: string;
  description: string;
  coverImage: string | null;
  category: string;
  categoryLabel: string;
  tagNewsLabel: string;
  learnMoreLabel: string;
}

export function FeaturedNewsCard({
  slug,
  locale,
  title,
  description,
  coverImage,
  categoryLabel,
  tagNewsLabel,
  learnMoreLabel,
}: FeaturedNewsCardProps) {
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-4/3 md:aspect-auto md:min-h-[360px]">
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
          {/* News badge on image */}
          <span className="badge absolute bottom-4 left-4 bg-secondary text-white">
            {tagNewsLabel}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 p-6 lg:p-8">
          <h3 className="text-h3 font-medium text-text-strong">&ldquo;{title}&rdquo;</h3>

          {/* Category badge */}
          <div>
            <span className="badge-active">{categoryLabel}</span>
          </div>

          <p className="text-body text-text-secondary line-clamp-4">{description}</p>

          {/* CTA */}
          <div className="mt-auto">
            <Link
              href={`/${locale}/news/${slug}`}
              className="inline-flex items-center justify-center rounded-full bg-secondary px-6 py-2.5 text-body font-medium text-white transition-opacity hover:opacity-90"
            >
              {learnMoreLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
