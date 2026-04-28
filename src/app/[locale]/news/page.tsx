import { CalendarArrowUp } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { db } from '@/lib/db';
import { NewsGrid, type NewsGridItem } from '@/components/news/NewsGrid';
import { FeaturedNewsCard } from '@/components/news/FeaturedNewsCard';
import { SupportSection } from '@/components/shared/SupportSection';
import { ContactSection } from '@/components/contact/ContactSection';
import SearchIcon from '@/components/icons/SearchIcon';
import DecorArrowIcon from '@/components/icons/DecorArrowIcon';
import type { NewsArticle } from '@/types/database';

// ─── Mock data ───────────────────────────────────────────────────────────────

type ArticlePreview = Pick<
  NewsArticle,
  | 'id'
  | 'slug'
  | 'title_ua'
  | 'title_en'
  | 'body_ua'
  | 'body_en'
  | 'cover_image'
  | 'category'
  | 'tags'
  | 'is_featured'
  | 'status'
  | 'published_at'
>;

const MOCK_ARTICLES: ArticlePreview[] = [
  {
    id: 'mock-n1',
    slug: 'stay-online',
    title_ua: 'Залишайся Онлайн',
    title_en: 'Stay Online',
    body_ua:
      '27 квітня перегляд кінострічки «Ти — космос» — це досвід, який радше проживаєш, ніж просто дивишся.\n\nФільм огортає глядача тишею, паузами й напівтонами, де кожен кадр дихає самотністю, пошуком і ніжною надією.',
    body_en:
      'On 27 April, watching the film "You Are the Universe" is an experience you live through rather than simply observe.\n\nThe film wraps the viewer in silence, pauses and halftones, where every frame breathes solitude, longing and tender hope.',
    cover_image: null,
    category: 'organiser',
    tags: [],
    is_featured: true,
    status: 'published',
    published_at: '2026-04-27T10:00:00Z',
  },
  {
    id: 'mock-n2',
    slug: 'world-protests-ukraine',
    title_ua: 'Світ протестує проти примусу України до капітуляції',
    title_en: 'The world protests against forcing Ukraine to capitulate',
    body_ua: 'У десятках міст по всьому світу активісти виступили проти примусу, що вимагає Україну поступитись територією та суверенітетом, проводили паралелі з Мюнхенським 1938 року. Світ протестує проти примусу України до капітуляції!',
    body_en: 'In dozens of cities around the world, activists spoke out against coercion that demands Ukraine cede territory and sovereignty.',
    cover_image: null,
    category: 'organiser',
    tags: [],
    is_featured: false,
    status: 'published',
    published_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'mock-n3',
    slug: 'world-protests-ukraine-2',
    title_ua: 'Світ протестує проти примусу України до капітуляції',
    title_en: 'The world protests against forcing Ukraine to capitulate',
    body_ua: 'У десятках міст по всьому світу активісти виступили проти примусу, що вимагає Україну поступитись територією та суверенітетом.',
    body_en: 'In dozens of cities around the world, activists spoke out against coercion that demands Ukraine cede territory and sovereignty.',
    cover_image: null,
    category: 'organiser',
    tags: [],
    is_featured: false,
    status: 'published',
    published_at: '2026-03-08T10:00:00Z',
  },
  {
    id: 'mock-n4',
    slug: 'world-protests-ukraine-3',
    title_ua: 'Світ протестує проти примусу України до капітуляції',
    title_en: 'The world protests against forcing Ukraine to capitulate',
    body_ua: 'У десятках міст по всьому світу активісти виступили проти примусу, що вимагає Україну поступитись територією та суверенітетом.',
    body_en: 'In dozens of cities around the world, activists spoke out against coercion that demands Ukraine cede territory and sovereignty.',
    cover_image: null,
    category: 'organiser',
    tags: [],
    is_featured: false,
    status: 'published',
    published_at: '2026-03-05T10:00:00Z',
  },
  {
    id: 'mock-n5',
    slug: 'world-protests-ukraine-3',
    title_ua: 'Світ протестує проти примусу України до капітуляції',
    title_en: 'The world protests against forcing Ukraine to capitulate',
    body_ua: 'У десятках міст по всьому світу активісти виступили проти примусу, що вимагає Україну поступитись територією та суверенітетом.',
    body_en: 'In dozens of cities around the world, activists spoke out against coercion that demands Ukraine cede territory and sovereignty.',
    cover_image: null,
    category: 'organiser',
    tags: [],
    is_featured: false,
    status: 'published',
    published_at: '2026-03-05T10:00:00Z',
  },
  {
    id: 'mock-n6',
    slug: 'world-protests-ukraine-3',
    title_ua: 'Світ протестує проти примусу України до капітуляції',
    title_en: 'The world protests against forcing Ukraine to capitulate',
    body_ua: 'У десятках міст по всьому світу активісти виступили проти примусу, що вимагає Україну поступитись територією та суверенітетом.',
    body_en: 'In dozens of cities around the world, activists spoke out against coercion that demands Ukraine cede territory and sovereignty.',
    cover_image: null,
    category: 'organiser',
    tags: [],
    is_featured: false,
    status: 'published',
    published_at: '2026-03-05T10:00:00Z',
  },
  {
    id: 'mock-n7',
    slug: 'world-protests-ukraine-3',
    title_ua: 'Світ протестує проти примусу України до капітуляції',
    title_en: 'The world protests against forcing Ukraine to capitulate',
    body_ua: 'У десятках міст по всьому світу активісти виступили проти примусу, що вимагає Україну поступитись територією та суверенітетом.',
    body_en: 'In dozens of cities around the world, activists spoke out against coercion that demands Ukraine cede territory and sovereignty.',
    cover_image: null,
    category: 'some one else',
    tags: [],
    is_featured: false,
    status: 'published',
    published_at: '2026-03-05T10:00:00Z',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractPlainText(richText: unknown): string {
  if (typeof richText === 'string') return richText;
  if (!richText || typeof richText !== 'object') return '';

  const doc = richText as { content?: Array<{ content?: Array<{ text?: string }> }> };
  if (!doc.content) return '';

  return doc.content
    .flatMap((block) => block.content?.map((inline) => inline.text ?? '') ?? [])
    .join(' ')
    .slice(0, 300);
}

function getCategoryLabel(category: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    organiser: t('news.category_organiser'),
  };
  return map[category] ?? category;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  // Fetch articles from Supabase, fall back to mock data
  let articles: ArticlePreview[] = [];

  try {
    const fetched = await db.newsArticle.findMany({ where: { status: 'PUBLISHED' } });
    articles = fetched as unknown as ArticlePreview[];
  } catch {
    // DB not reachable
  }

  if (articles.length === 0) articles = MOCK_ARTICLES;

  const titleKey = locale === 'ua' ? 'title_ua' : 'title_en';
  const bodyKey = locale === 'ua' ? 'body_ua' : 'body_en';

  // Featured = first featured article, or first article
  const featured = articles.find((a) => a.is_featured) ?? articles[0];
  const rest = articles.filter((a) => a.id !== featured?.id);

  return (
    <>
      {/* ── Hero section ────────────────────────────────────────── */}
      <section className="py-10 lg:pt-16 lg:pb-16">
        <div className="container-page">
          <div className="relative">
            {/* Eyebrow + title + description.
                Left-aligned on mobile/tablet (squiggle hangs off the h1 line).
                Centered with a constrained measure on desktop. */}
            <div className="max-w-[68%] sm:max-w-[64%] md:max-w-[60%] lg:mx-auto lg:max-w-[760px] lg:text-center">
              <p className="text-body-sm mb-2 font-semibold text-text-strong">
                Dreams branch of UWAA
              </p>

              {/* h1 wrapper is the anchor for the squiggle on every breakpoint.
                  On mobile/tablet it's inline-block so it shrinks to the title's
                  text width; on desktop it's a full-width block in the centred
                  column. Both squiggles use `top-full` to sit at the h1's
                  bottom edge — the desktop variant uses a negative `right` to
                  hang past the centred column to the page's right edge. */}
              <div className="relative mb-4 inline-block md:mb-6 lg:mb-8 lg:block">
                <h1 className="text-display text-secondary">
                  {t('news.title')}
                </h1>

                {/* Mobile/tablet squiggle: bottom-right of h1 text */}
                <DecorArrowIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute top-full left-full h-[140px] w-[140px] -translate-x-[30%] -translate-y-[35%] sm:h-[180px] sm:w-[180px] md:h-[210px] md:w-[210px] lg:hidden"
                />

                {/* Desktop squiggle: top sits at h1's bottom; offset right pushes
                    past the 760px centred column to the page's right edge. */}
                <DecorArrowIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute top-full hidden h-[210px] w-[210px] -translate-y-[30%] lg:right-[-92px] lg:block xl:right-[-228px]"
                />
              </div>

              <p className="text-body text-text-primary lg:mx-auto lg:max-w-[60ch]">
                {t('news.description')}
              </p>
            </div>
          </div>

          {/* Search + sort row */}
          <div className="relative z-[1] mt-8 flex items-center gap-3 sm:gap-4 lg:mt-16">
            <div className="relative flex-1">
              <SearchIcon
                size={20}
                className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-text-secondary"
              />
              <input
                type="text"
                placeholder={t('news.search')}
                className="h-[52px] w-full rounded-full border border-border bg-white pr-5 pl-12 text-body text-text-strong outline-none transition-colors focus:border-secondary lg:h-[54px]"
              />
            </div>

            {/* Tablet/mobile: circular icon-only button */}
            <button
              type="button"
              aria-label={t('news.sort_date')}
              className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-secondary text-white transition-opacity hover:opacity-90 lg:hidden"
            >
              <CalendarArrowUp size={22} strokeWidth={1.75} />
            </button>

            {/* Desktop: full-text pill button */}
            <button
              type="button"
              className="hidden h-[54px] shrink-0 items-center justify-center gap-2 rounded-full bg-secondary px-8 text-body font-medium text-white transition-opacity hover:opacity-90 lg:inline-flex"
            >
              <CalendarArrowUp size={20} strokeWidth={1.75} />
              {t('news.sort_date')}
            </button>
          </div>
        </div>
      </section>

      {/* ── Featured article ─────────────────────────────────────── */}
      {featured && (
        <section className=" pb-8">
          <div className="container-page">
            <FeaturedNewsCard
              slug={featured.slug}
              locale={locale}
              title={featured[titleKey]}
              description={extractPlainText(featured[bodyKey])}
              coverImage={featured.cover_image}
              publishedAt={featured.published_at}
              brandLabel="Dreams branch of UWAA"
              tagNewsLabel={t('news.tag_news')}
              learnMoreLabel={t('news.learn_more')}
            />
          </div>
        </section>
      )}

      {/* ── News grid ────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section className="section pt-0">
          <div className="container-page">
            <NewsGrid
              locale={locale}
              brandLabel="Dreams branch of UWAA"
              showMoreLabel={t('news.show_more')}
              items={rest.map<NewsGridItem>((article) => ({
                id: article.id,
                slug: article.slug,
                title: article[titleKey],
                description: extractPlainText(article[bodyKey]),
                coverImage: article.cover_image,
                categoryLabel: getCategoryLabel(article.category, t),
                publishedAt: article.published_at,
              }))}
            />
          </div>
        </section>
      )}

      {/* ── Support section (reusable) ───────────────────────────── */}
      <SupportSection locale={locale} />

      {/* ── Contact form (reusable) ──────────────────────────────── */}
      <ContactSection
        title={t('news.contact_title')}
        description={t('news.contact_description')}
      />
    </>
  );
}
