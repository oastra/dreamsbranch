import { getTranslations, setRequestLocale } from 'next-intl/server';

import { db } from '@/lib/db';
import { NewsCard } from '@/components/news/NewsCard';
import { FeaturedNewsCard } from '@/components/news/FeaturedNewsCard';
import { SupportSection } from '@/components/home/SupportSection';
import { ContactSection } from '@/components/contact/ContactSection';
import SearchIcon from '@/components/icons/SearchIcon';
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
    body_ua: 'Перегляд кінострічки «Ти — космос» — це досвід, який рідко приживається, ніж просто дивитись. Фільм остоголі слідити тишею, глухою й напівхвилюючою, дає кожен кадр даному глядачеві відчуття, показуючи і наскази неруш.',
    body_en: 'Watching the film "You Are the Universe" is an experience that rarely takes hold, more than just watching. The film follows silence, deaf and half-exciting, giving each frame to the given viewer a feeling.',
    cover_image: null,
    category: 'organiser',
    tags: [],
    is_featured: true,
    status: 'published',
    published_at: '2026-03-15T10:00:00Z',
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
      <section className="bg-secondary py-12 text-center text-white lg:py-16">
        <div className="container-page">
          <p className="text-body-sm mb-2 text-white/70">Dreams branch of UWAA</p>
          <h1 className="text-display mb-4">{t('news.title')}</h1>
          <div className="relative mx-auto max-w-2xl">
            <p className="text-body text-white/80">
              {t('news.description')}
            </p>
            {/* Decorative squiggle */}
            <svg
              className="absolute -right-12 -bottom-2 hidden text-primary lg:block"
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
            >
              <path
                d="M8 40C12 20 20 12 28 16C36 20 24 32 20 24C16 16 28 8 40 8"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M36 4L40 8L36 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Search + sort bar ────────────────────────────────────── */}
      <section className="bg-white py-6">
        <div className="container-page">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <SearchIcon
                size={20}
                className="absolute top-1/2 left-4 -translate-y-1/2 text-text-secondary"
              />
              <input
                type="text"
                placeholder={t('news.search')}
                className="w-full rounded-full border border-border bg-white py-3 pr-4 pl-11 text-body text-text-strong outline-none transition-colors focus:border-secondary"
              />
            </div>

            <button className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-body-sm font-medium text-text-strong transition-opacity hover:opacity-90">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
              {t('news.sort_date')}
            </button>
          </div>
        </div>
      </section>

      {/* ── Featured article ─────────────────────────────────────── */}
      {featured && (
        <section className="bg-white pb-8">
          <div className="container-page">
            <FeaturedNewsCard
              slug={featured.slug}
              locale={locale}
              title={featured[titleKey]}
              description={extractPlainText(featured[bodyKey])}
              coverImage={featured.cover_image}
              category={featured.category}
              categoryLabel={getCategoryLabel(featured.category, t)}
              tagNewsLabel={t('news.tag_news')}
              learnMoreLabel={t('news.learn_more')}
            />
          </div>
        </section>
      )}

      {/* ── News grid ────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section className="section bg-white pt-0">
          <div className="container-page">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {rest.map((article) => (
                <NewsCard
                  key={article.id}
                  slug={article.slug}
                  locale={locale}
                  title={article[titleKey]}
                  description={extractPlainText(article[bodyKey])}
                  coverImage={article.cover_image}
                  category={article.category}
                  categoryLabel={getCategoryLabel(article.category, t)}
                  publishedAt={article.published_at}
                />
              ))}
            </div>
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
