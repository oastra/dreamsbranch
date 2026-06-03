import { Suspense } from "react";
import { CalendarArrowUp } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { db } from "@/lib/db";
import { NewsGrid, type NewsGridItem } from "@/components/news/NewsGrid";
import { NewsSearchInput } from "@/components/news/NewsSearchInput";
import { FeaturedNewsCard } from "@/components/news/FeaturedNewsCard";
import { SupportSection } from "@/components/shared/SupportSection";
import { ContactSection } from "@/components/contact/ContactSection";
import DecorArrowIcon from "@/components/icons/DecorArrowIcon";
import type { NewsArticle } from "@/types/database";

// ─── Mock data ───────────────────────────────────────────────────────────────

type ArticlePreview = Pick<
  NewsArticle,
  | "id"
  | "slug"
  | "title_ua"
  | "title_en"
  | "body_ua"
  | "body_en"
  | "cover_image"
  | "category"
  | "tags"
  | "is_featured"
  | "status"
  | "published_at"
>;

const MOCK_ARTICLES: ArticlePreview[] = [
  {
    id: "mock-n1",
    slug: "stay-online",
    title_ua: "Залишайся Онлайн",
    title_en: "Stay Online",
    body_ua:
      "27 квітня перегляд кінострічки «Ти — космос» — це досвід, який радше проживаєш, ніж просто дивишся.\n\nФільм огортає глядача тишею, паузами й напівтонами, де кожен кадр дихає самотністю, пошуком і ніжною надією.",
    body_en:
      'On 27 April, watching the film "You Are the Universe" is an experience you live through rather than simply observe.\n\nThe film wraps the viewer in silence, pauses and halftones, where every frame breathes solitude, longing and tender hope.',
    cover_image: null,
    category: "organiser",
    tags: [],
    is_featured: true,
    status: "published",
    published_at: "2026-04-27T10:00:00Z",
  },
  {
    id: "mock-n2",
    slug: "world-protests-ukraine",
    title_ua: "Світ протестує проти примусу України до капітуляції",
    title_en: "The world protests against forcing Ukraine to capitulate",
    body_ua:
      "У десятках міст по всьому світу активісти виступили проти примусу, що вимагає Україну поступитись територією та суверенітетом, проводили паралелі з Мюнхенським 1938 року. Світ протестує проти примусу України до капітуляції!",
    body_en:
      "In dozens of cities around the world, activists spoke out against coercion that demands Ukraine cede territory and sovereignty.",
    cover_image: null,
    category: "organiser",
    tags: [],
    is_featured: false,
    status: "published",
    published_at: "2026-03-10T10:00:00Z",
  },
  {
    id: "mock-n3",
    slug: "world-protests-ukraine-2",
    title_ua: "Світ протестує проти примусу України до капітуляції",
    title_en: "The world protests against forcing Ukraine to capitulate",
    body_ua:
      "У десятках міст по всьому світу активісти виступили проти примусу, що вимагає Україну поступитись територією та суверенітетом.",
    body_en:
      "In dozens of cities around the world, activists spoke out against coercion that demands Ukraine cede territory and sovereignty.",
    cover_image: null,
    category: "organiser",
    tags: [],
    is_featured: false,
    status: "published",
    published_at: "2026-03-08T10:00:00Z",
  },
  {
    id: "mock-n4",
    slug: "world-protests-ukraine-3",
    title_ua: "Світ протестує проти примусу України до капітуляції",
    title_en: "The world protests against forcing Ukraine to capitulate",
    body_ua:
      "У десятках міст по всьому світу активісти виступили проти примусу, що вимагає Україну поступитись територією та суверенітетом.",
    body_en:
      "In dozens of cities around the world, activists spoke out against coercion that demands Ukraine cede territory and sovereignty.",
    cover_image: null,
    category: "organiser",
    tags: [],
    is_featured: false,
    status: "published",
    published_at: "2026-03-05T10:00:00Z",
  },
  {
    id: "mock-n5",
    slug: "world-protests-ukraine-3",
    title_ua: "Світ протестує проти примусу України до капітуляції",
    title_en: "The world protests against forcing Ukraine to capitulate",
    body_ua:
      "У десятках міст по всьому світу активісти виступили проти примусу, що вимагає Україну поступитись територією та суверенітетом.",
    body_en:
      "In dozens of cities around the world, activists spoke out against coercion that demands Ukraine cede territory and sovereignty.",
    cover_image: null,
    category: "organiser",
    tags: [],
    is_featured: false,
    status: "published",
    published_at: "2026-03-05T10:00:00Z",
  },
  {
    id: "mock-n6",
    slug: "world-protests-ukraine-3",
    title_ua: "Світ протестує проти примусу України до капітуляції",
    title_en: "The world protests against forcing Ukraine to capitulate",
    body_ua:
      "У десятках міст по всьому світу активісти виступили проти примусу, що вимагає Україну поступитись територією та суверенітетом.",
    body_en:
      "In dozens of cities around the world, activists spoke out against coercion that demands Ukraine cede territory and sovereignty.",
    cover_image: null,
    category: "organiser",
    tags: [],
    is_featured: false,
    status: "published",
    published_at: "2026-03-05T10:00:00Z",
  },
  {
    id: "mock-n7",
    slug: "world-protests-ukraine-3",
    title_ua: "Світ протестує проти примусу України до капітуляції",
    title_en: "The world protests against forcing Ukraine to capitulate",
    body_ua:
      "У десятках міст по всьому світу активісти виступили проти примусу, що вимагає Україну поступитись територією та суверенітетом.",
    body_en:
      "In dozens of cities around the world, activists spoke out against coercion that demands Ukraine cede territory and sovereignty.",
    cover_image: null,
    category: "some one else",
    tags: [],
    is_featured: false,
    status: "published",
    published_at: "2026-03-05T10:00:00Z",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractPlainText(richText: unknown): string {
  if (typeof richText === "string") return richText;
  if (!richText || typeof richText !== "object") return "";

  const doc = richText as {
    content?: Array<{ content?: Array<{ text?: string }> }>;
  };
  if (!doc.content) return "";

  return doc.content
    .flatMap((block) => block.content?.map((inline) => inline.text ?? "") ?? [])
    .join(" ")
    .slice(0, 300);
}

function getCategoryLabel(
  category: string,
  t: (key: string) => string,
): string {
  const map: Record<string, string> = {
    organiser: t("news.category_organiser"),
  };
  return map[category] ?? category;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  // Fetch articles from Supabase, fall back to mock data
  let articles: ArticlePreview[] = [];

  try {
    const fetched = await db.newsArticle.findMany({
      where: { status: "PUBLISHED" },
    });
    articles = fetched as unknown as ArticlePreview[];
  } catch {
    // DB not reachable
  }

  if (articles.length === 0) articles = MOCK_ARTICLES;

  const titleKey = locale === "ua" ? "title_ua" : "title_en";
  const bodyKey = locale === "ua" ? "body_ua" : "body_en";
  const leadKey = locale === "ua" ? "lead_text_ua" : "lead_text_en";

  // Card preview text — prefer the editor-controlled lead_text; fall back
  // to the first body paragraph for legacy articles that don't have one.
  const cardPreview = (a: ArticlePreview): string => {
    const lead = (a as unknown as Record<string, string | null | undefined>)[leadKey];
    if (lead && lead.trim()) return lead.trim();
    return extractPlainText(a[bodyKey]);
  };

  // Filter by the search query (title + body text) when one is present.
  if (query) {
    articles = articles.filter((a) => {
      const haystack = `${a[titleKey]} ${extractPlainText(a[bodyKey])} ${cardPreview(a)}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  // Featured = first featured article, or first article
  const featured = articles.find((a) => a.is_featured) ?? articles[0];
  const rest = articles.filter((a) => a.id !== featured?.id);

  return (
    <>
      {/* ── Hero section ────────────────────────────────────────── */}
      <section className="py-10 lg:pt-16 lg:pb-16">
        <div className="container-page">
          <div className="relative">
            {/* Mobile/tablet squiggle: anchored to the page's right edge (not
                the h1 text) so it sits in the free space beside the heading
                column and never overlaps the title text. The SVG's visible
                drawing lives in the right half of its box, so a small negative
                right pulls it flush to the container edge. */}
            <DecorArrowIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-10 right-0 h-48 w-48 sm:top-12 sm:right-2 sm:h-52 sm:w-52 md:-top-4 md:right-0 md:h-56 md:w-56 lg:hidden"
            />

            {/* Eyebrow + title + description.
                Left-aligned on mobile/tablet (squiggle sits at the page edge).
                Centered with a constrained measure on desktop. */}
            <div className="max-w-[72%] sm:max-w-[78%] md:max-w-full lg:mx-auto lg:max-w-190 lg:text-center">
              <p className="text-subheading mb-2 font-medium text-text-strong">
                Dreams branch of UWAA
              </p>

              {/* h1 wrapper is the anchor for the desktop squiggle. On desktop
                  it's a full-width block in the centred column; the squiggle
                  uses `top-full` to sit at the h1's bottom edge and a negative
                  `right` to hang past the centred column to the page's right
                  edge. */}
              <div className="relative mb-4 inline-block md:mb-6 lg:mb-8 lg:block">
                <h1 className="text-display text-secondary">
                  {t("news.title")}
                </h1>

                {/* Desktop squiggle: top sits at h1's bottom; offset right pushes
                    past the 760px centred column to the page's right edge. */}
                <DecorArrowIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute top-full hidden h-52.5 w-52.5 -translate-y-[30%] lg:-right-23 lg:block xl:-right-57"
                />
              </div>

              <p className="text-text-primary md:text-h3 lg:mx-auto lg:max-w-[60ch]">
                {t("news.description")}
              </p>
            </div>
          </div>

          {/* Search + sort row */}
          <div className="relative z-1 mt-8 flex items-center gap-3 sm:gap-4 lg:mt-16">
            <NewsSearchInput placeholder={t("news.search")} />

            {/* Tablet/mobile: circular icon-only button */}
            <button
              type="button"
              aria-label={t("news.sort_date")}
              className="inline-flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-secondary text-white transition-opacity hover:opacity-90 lg:hidden"
            >
              <CalendarArrowUp size={22} strokeWidth={1.75} />
            </button>

            {/* Desktop: full-text pill button */}
            <button
              type="button"
              className="hidden h-13.5 shrink-0 items-center justify-center gap-2 rounded-full bg-secondary px-8 text-body font-medium text-white transition-opacity hover:opacity-90 lg:inline-flex"
            >
              <CalendarArrowUp size={20} strokeWidth={1.75} />
              {t("news.sort_date")}
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
              description={cardPreview(featured)}
              coverImage={(featured as unknown as { body_image?: string | null }).body_image ?? featured.cover_image}
              publishedAt={featured.published_at ?? (featured as unknown as { created_at?: string }).created_at ?? null}
              brandLabel="Dreams branch of UWAA"
              tagNewsLabel={t("news.tag_news")}
              learnMoreLabel={t("news.learn_more")}
            />
          </div>
        </section>
      )}

      {/* ── News grid ────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <section className="section pt-0">
          <div className="container-page">
            <Suspense fallback={null}>
              <NewsGrid
                locale={locale}
                brandLabel="Dreams branch of UWAA"
                showMoreLabel={t("news.show_more")}
                items={rest.map<NewsGridItem>((article) => ({
                  id: article.id,
                  slug: article.slug,
                  title: article[titleKey],
                  description: cardPreview(article),
                  coverImage: (article as unknown as { body_image?: string | null }).body_image ?? article.cover_image,
                  categoryLabel: getCategoryLabel(article.category, t),
                  publishedAt: article.published_at ?? (article as unknown as { created_at?: string }).created_at ?? null,
                }))}
              />
            </Suspense>
          </div>
        </section>
      )}

      {/* ── No search results ────────────────────────────────────── */}
      {query && articles.length === 0 && (
        <section className="section pt-0">
          <div className="container-page">
            <p className="text-h3 text-text-secondary lg:text-center">
              {t("news.no_results")}
            </p>
          </div>
        </section>
      )}

      {/* ── Support section (reusable) ───────────────────────────── */}
      <SupportSection locale={locale} />

      {/* ── Contact form (reusable) ──────────────────────────────── */}
      <ContactSection
        title={t("news.contact_title")}
        description={t("news.contact_description")}
      />
    </>
  );
}
