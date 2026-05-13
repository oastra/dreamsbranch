import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroCarousel, type HeroSlide } from "@/components/home/HeroCarousel";
import { ContactSection } from "@/components/contact/ContactSection";
import { SupportSection } from "@/components/shared/SupportSection";
import { ResultsSection } from "@/components/shared/ResultsSection";
import { StorySection } from "@/components/home/StorySection";
import { HomeAboutSection } from "@/components/home/HomeAboutSection";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { EventCard } from "@/components/events/EventCard";
import { NewsCard } from "@/components/news/NewsCard";
import { HomePhotoReports } from "@/components/home/HomePhotoReports";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import type {
  AboutPageSettings,
  Campaign,
  Event,
  NewsArticle,
} from "@/types/database";

const HERO_SLIDES: HeroSlide[] = [
  {
    src: "/images/fundaraising/backup-power-station-mobile-gadgets-charged-outdoor.webp",
    alt: "",
  },
  {
    src: "/images/events/hands-with-heart.webp",
    alt: "",
  },
  { src: "/images/report/report.webp", alt: "" },
];

// Lightweight subset of NewsArticle used for the home preview cards.
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
  | "published_at"
>;

// Shown when the news_articles table is empty / unreachable, so the home
// section still has something to render before the content manager
// publishes real articles. Mirrors the fallback used on /news.
const MOCK_HOME_NEWS: ArticlePreview[] = [
  {
    id: "mock-home-n1",
    slug: "stay-online",
    title_ua: "Світ протестує проти примусу України до капітуляції",
    title_en: "The world protests against forcing Ukraine to capitulate",
    body_ua:
      "У десятках міст по всьому світу активісти виступили проти примусу, що вимагає Україну поступитись територією та суверенітетом, проводили паралелі з Мюнхенським 1938 року. Світ протестує проти примусу України до капітуляції!",
    body_en:
      "In dozens of cities around the world, activists spoke out against coercion that demands Ukraine cede territory and sovereignty.",
    cover_image: null,
    category: "organiser",
    published_at: "2026-02-27T10:00:00Z",
  },
  {
    id: "mock-home-n2",
    slug: "world-protests-ukraine",
    title_ua: "Світ протестує проти примусу України до капітуляції",
    title_en: "The world protests against forcing Ukraine to capitulate",
    body_ua:
      "У десятках міст по всьому світу активісти виступили проти примусу, що вимагає Україну поступитись територією та суверенітетом.",
    body_en:
      "In dozens of cities around the world, activists spoke out against coercion that demands Ukraine cede territory and sovereignty.",
    cover_image: null,
    category: "organiser",
    published_at: "2026-02-27T10:00:00Z",
  },
];

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

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const tAbout = await getTranslations({ locale, namespace: "about" });
  const tEvents = await getTranslations({ locale, namespace: "events" });
  const tCampaigns = await getTranslations({ locale, namespace: "campaigns" });
  const tNews = await getTranslations({ locale, namespace: "news" });

  // Reuse the about-page settings as the single source of truth for the
  // headline numbers — they're already editable via /admin/about-settings.
  const settings =
    (await db.aboutSetting.findFirst()) as AboutPageSettings | null;
  const yearsValue = settings?.years_value || tAbout("results.years_value");
  const membersValue =
    settings?.members_value || tAbout("results.members_value");
  const raisedValue = settings?.raised_value || tAbout("results.raised_value");
  const transparencyValue =
    settings?.transparency_value || tAbout("results.transparency_value");

  // Newest 3 active campaigns for the home preview row.
  const activeCampaigns = (await db.campaign.findMany({
    where: { status: "ACTIVE" },
    take: 3,
  })) as unknown as Campaign[];
  const titleKey: "title_ua" | "title_en" =
    locale === "ua" ? "title_ua" : "title_en";

  // Newest 3 active events for the home preview row.
  const activeEvents = (await db.event.findMany({
    where: { status: "ACTIVE" },
    take: 3,
  })) as unknown as Event[];
  const eventTagLabels: Record<string, string> = {
    active: tEvents("tag_active"),
    archived: tEvents("tag_archived"),
    looking_for_partners: tEvents("tag_looking_for_partners"),
    looking_for_volunteers: tEvents("tag_looking_for_volunteers"),
  };

  // Photo-reports grid: pull the newest events that actually have
  // gallery photos and flatten their `gallery_images` into a single
  // de-duped list. Section hides when there's nothing to show.
  const eventsWithPhotos = (await db.event.findMany({
    take: 12,
  })) as unknown as Event[];
  const photoReportImages = Array.from(
    new Set(eventsWithPhotos.flatMap((e) => e.gallery_images ?? [])),
  ).slice(0, 7);

  // Newest 2 published articles for the home news preview. Falls back to
  // mock data so the section still renders before any article is published.
  let newsArticles: ArticlePreview[] = [];
  try {
    const fetched = await db.newsArticle.findMany({
      where: { status: "PUBLISHED" },
      take: 2,
    });
    newsArticles = fetched as unknown as ArticlePreview[];
  } catch {
    // DB not reachable — fall through to mock.
  }
  if (newsArticles.length === 0) newsArticles = MOCK_HOME_NEWS;
  const newsTitleKey: "title_ua" | "title_en" =
    locale === "ua" ? "title_ua" : "title_en";
  const newsBodyKey: "body_ua" | "body_en" =
    locale === "ua" ? "body_ua" : "body_en";
  const newsCategoryLabel = tNews("category_organiser");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────
          Desktop: two columns — title sits at the top of the left
          column, lead/CTAs at the bottom; the masked carousel spans
          both rows on the right. Row 1 is auto-sized to the title;
          row 2 is `1fr` so the lead/CTA cell stretches to the image's
          full remaining height, and `self-end` pins its content to
          the bottom edge — that's how the CTAs end up flush with the
          image's bottom.
          Mobile/tablet: single column — title → image → lead/CTAs. */}
      <section className="py-8 lg:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-10">
          {/* Title block */}
          <div className="text-center lg:text-left">
            <p className="text-subheading mb-3 font-semibold text-text-strong lg:mb-4">
              {t("hero.eyebrow")}
            </p>
            <h1 className="text-display mb-2 text-secondary lg:mb-3">
              {t("hero.title")}
            </h1>
            <p className="text-h3 md:text-[42px] font-medium text-text-strong">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Masked carousel — between text blocks on mobile, right
              column spanning both rows on desktop. The image keeps its
              natural 716/500 aspect ratio (so it has predictable
              dimensions on every viewport); the left text column
              stretches via `lg:row-span-2 lg:justify-between` so the
              CTAs sit at the bottom edge of the column, lining up with
              the image's bottom edge. */}
          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <HeroCarousel slides={HERO_SLIDES} />
          </div>

          {/* Lead + description + CTAs */}
          <div className="text-center lg:self-end lg:text-left lg:col-start-1 lg:row-start-2">
            <p className="text-h2 mb-4 font-medium text-text-primary">
              {t("hero.lead")}
            </p>
            <p className="text-h3 mb-6 text-text-primary lg:mb-8">
              {t("hero.description")}
            </p>
            <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
              <Button
                render={<Link href={`/${locale}/about`} />}
                size="xl"
                shape="pill"
                className="w-70 max-w-full"
              >
                {t("hero.cta_about")}
              </Button>
              <Button
                render={<Link href={`/${locale}/shop`} />}
                variant="outline"
                size="xl"
                shape="pill"
                className="w-70 max-w-full"
              >
                {t("hero.cta_shop")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────────────── */}
      <ResultsSection
        title={t("results.title")}
        description={
          <>
            <span className="block whitespace-pre-line">
              {t("results.description_p1")}
            </span>
            <span className="mt-3 block whitespace-pre-line">
              {t("results.description_p2")}
            </span>
          </>
        }
        stats={[
          {
            value: yearsValue,
            unit: t("results.years_unit"),
            label: t("results.years_label"),
            heightClass: "lg:min-h-[200px]",
          },
          {
            value: membersValue,
            unit: t("results.members_unit"),
            label: t("results.members_label"),
            heightClass: "lg:min-h-[266px]",
          },
          {
            value: raisedValue,
            unit: t("results.raised_unit"),
            label: t("results.raised_label"),
            heightClass: "lg:min-h-[228px]",
          },
          {
            value: transparencyValue,
            unit: t("results.transparency_unit"),
            label: t("results.transparency_label"),
            heightClass: "lg:min-h-[342px]",
          },
        ]}
      />

      {/* ── Story / mission card ────────────────────────────────── */}
      <StorySection
        title={t("story.title")}
        description={t("story.description")}
        ctaLabel={t("story.cta")}
        ctaHref={`/${locale}/about`}
      />

      {/* ── About / founding-story preview ──────────────────────── */}
      <HomeAboutSection
        title={t("about_preview.title")}
        lead={t("about_preview.lead")}
        bodyP1={t("about_preview.body_p1")}
        bodyP2={t("about_preview.body_p2")}
        ctaLabel={t("about_preview.cta")}
        ctaHref={`/${locale}/about`}
        imageAlt={t("about_preview.image_alt")}
      />

      {/* ── Active campaigns — 3 newest ─────────────────────────── */}
      {activeCampaigns.length > 0 && (
        <section id="campaigns" className="section">
          <div className="container-page">
            <h2 className="text-h2 mb-8 text-center font-semibold text-text-strong lg:text-left">
              {t("sections.active_campaigns")}
            </h2>

            {/* Mobile: horizontal scroll-snap, peek of next card.
                Desktop: 3-up grid. */}
            <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {activeCampaigns.map((c) => (
                <div key={c.id} className="w-[85%] shrink-0 snap-start">
                  <CampaignCard
                    slug={c.slug}
                    locale={locale}
                    title={c[titleKey] || ""}
                    coverImage={c.cover_image}
                    goalAmount={Number(c.goal_amount)}
                    currentAmount={Number(c.current_amount)}
                    raisedLabel={tCampaigns("raised")}
                    goalLabel={tCampaigns("goal")}
                    donateBtnLabel={tCampaigns("donate_btn")}
                  />
                </div>
              ))}
            </div>

            <div className="hidden grid-cols-2 gap-6 sm:grid lg:grid-cols-3">
              {activeCampaigns.map((c) => (
                <CampaignCard
                  key={c.id}
                  slug={c.slug}
                  locale={locale}
                  title={c[titleKey] || ""}
                  coverImage={c.cover_image}
                  goalAmount={Number(c.goal_amount)}
                  currentAmount={Number(c.current_amount)}
                  raisedLabel={tCampaigns("raised")}
                  goalLabel={tCampaigns("goal")}
                  donateBtnLabel={tCampaigns("donate_btn")}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Community events — 3 newest active events ─────────────── */}
      {activeEvents.length > 0 && (
        <section className="section">
          <div className="container-page">
            <div className="rounded-3xl bg-secondary-10 p-5 sm:p-8 lg:p-12">
              <div className="mb-6 flex items-center justify-between gap-4 lg:mb-10">
                <h2 className="text-h2 font-semibold text-text-strong">
                  {t("sections.events")}
                </h2>
                <Button
                  render={<Link href={`/${locale}/events`} />}
                  size="xl"
                  shape="pill"
                  className="hidden sm:inline-flex"
                >
                  {t("sections.events_cta")}
                </Button>
              </div>

              {/* Mobile: horizontal scroll-snap. Tablet+: 3-up grid. */}
              <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {activeEvents.map((event, i) => (
                  <div key={event.id} className="w-[85%] shrink-0 snap-start">
                    <EventCard
                      slug={event.slug}
                      locale={locale}
                      title={event[titleKey] || ""}
                      coverImage={event.cover_image}
                      tags={event.tags}
                      tagLabels={eventTagLabels}
                      priority={i === 0}
                    />
                  </div>
                ))}
              </div>

              <div className="hidden grid-cols-2 gap-6 sm:grid lg:grid-cols-3">
                {activeEvents.map((event, i) => (
                  <EventCard
                    key={event.id}
                    slug={event.slug}
                    locale={locale}
                    title={event[titleKey] || ""}
                    coverImage={event.cover_image}
                    tags={event.tags}
                    tagLabels={eventTagLabels}
                    priority={i === 0}
                  />
                ))}
              </div>

              {/* Mobile: "All events" pill below the carousel */}
              <div className="mt-6 flex justify-center sm:hidden">
                <Button
                  render={<Link href={`/${locale}/events`} />}
                  size="xl"
                  shape="pill"
                >
                  {t("sections.events_cta")}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Support section (reusable) ───────────────────────────── */}
      <SupportSection locale={locale} />
      {/* ── Latest news — 2 newest published articles ────────────── */}
      {newsArticles.length > 0 && (
        <section className="section">
          <div className="container-page">
            {/* Light-blue rounded panel wraps the whole block, matching
                the same `bg-secondary-10` surface used on /news. */}
            <div className="rounded-3xl bg-secondary-10 p-5 sm:p-8 lg:p-12">
              <div className="mb-6 flex items-center justify-between gap-4 lg:mb-10">
                <h2 className="text-h2 font-semibold text-text-strong">
                  {t("sections.news")}
                </h2>
                <Link
                  href={`/${locale}/news`}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-body-sm font-medium text-secondary transition-colors hover:bg-grey-40 lg:h-12 lg:px-8"
                >
                  {t("sections.news_cta")}
                </Link>
              </div>

              {/* Mobile: horizontal scroll-snap with a peek of the next card.
                  Tablet+: 2-up grid. Matches the active-campaigns pattern. */}
              <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {newsArticles.map((article) => (
                  <div key={article.id} className="w-[85%] shrink-0 snap-start">
                    <NewsCard
                      slug={article.slug}
                      locale={locale}
                      title={article[newsTitleKey]}
                      description={extractPlainText(article[newsBodyKey])}
                      coverImage={article.cover_image}
                      categoryLabel={newsCategoryLabel}
                      brandLabel="Dreams branch of UWAA"
                      publishedAt={article.published_at}
                    />
                  </div>
                ))}
              </div>

              <div className="hidden grid-cols-2 gap-6 sm:grid">
                {newsArticles.map((article) => (
                  <NewsCard
                    key={article.id}
                    slug={article.slug}
                    locale={locale}
                    title={article[newsTitleKey]}
                    description={extractPlainText(article[newsBodyKey])}
                    coverImage={article.cover_image}
                    categoryLabel={newsCategoryLabel}
                    brandLabel="Dreams branch of UWAA"
                    publishedAt={article.published_at}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Photo reports — gallery aggregated from latest events ─── */}
      {photoReportImages.length > 0 && (
        <section className="section">
          <div className="container-page">
            <div className="p-5 sm:p-8 lg:p-12">
              <div className="mb-6 flex items-center justify-between gap-4 lg:mb-10">
                <h2 className="text-h2 font-semibold text-text-strong">
                  {t("sections.reports")}
                </h2>
                <Button
                  render={<Link href={`/${locale}/reports`} />}
                  size="xl"
                  shape="pill"
                >
                  {t("sections.photo_reports_cta")}
                </Button>
              </div>
              <HomePhotoReports
                images={photoReportImages}
                prevAriaLabel={t("sections.photo_reports_prev")}
                nextAriaLabel={t("sections.photo_reports_next")}
              />
            </div>
          </div>
        </section>
      )}

      <ContactSection
        title={tEvents("contact_title")}
        description={tEvents("contact_description")}
      />
    </>
  );
}
