'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { NewsCard, type NewsCardProps } from '@/components/news/NewsCard';

const PAGE_SIZE = 4;

export type NewsGridItem = Omit<NewsCardProps, 'locale' | 'brandLabel'> & {
  id: string;
};

interface Props {
  locale: string;
  items: NewsGridItem[];
  brandLabel: string;
  showMoreLabel: string;
}

export function NewsGrid({ locale, items, brandLabel, showMoreLabel }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const visibleParam = Number(sp.get('visible'));
  const visible = Number.isFinite(visibleParam) && visibleParam > 0 ? visibleParam : PAGE_SIZE;

  const shown = items.slice(0, visible);
  const hasMore = visible < items.length;

  function showMore() {
    const next = new URLSearchParams(sp.toString());
    next.set('visible', String(visible + PAGE_SIZE));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="rounded-3xl bg-secondary-10 p-4 sm:p-6 lg:p-10">
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
        {shown.map((item) => (
          <NewsCard
            key={item.id}
            slug={item.slug}
            locale={locale}
            title={item.title}
            description={item.description}
            coverImage={item.coverImage}
            categoryLabel={item.categoryLabel}
            brandLabel={brandLabel}
            publishedAt={item.publishedAt}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center lg:mt-10">
          <button
            type="button"
            onClick={showMore}
            className="inline-flex h-[52px] items-center justify-center rounded-full bg-secondary px-10 text-body font-medium text-white transition-opacity hover:opacity-90 lg:h-[54px]"
          >
            {showMoreLabel}
          </button>
        </div>
      )}
    </div>
  );
}
