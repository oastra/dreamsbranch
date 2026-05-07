import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { EventCard } from "@/components/events/EventCard";
import { EventBadges } from "@/components/events/EventBadges";
import { EventInfoBlocks } from "@/components/events/EventInfoBlocks";
import { RelatedEventsCarousel } from "@/components/events/RelatedEventsCarousel";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { ShareSection } from "@/components/shared/ShareSection";
import { VolunteerCTA } from "@/components/shared/VolunteerCTA";
import { ContactSection } from "@/components/contact/ContactSection";
import type { Event } from "@/types/database";

// ─── Types ───────────────────────────────────────────────────────────────────

type FinancialReport = {
  income: { label: string; amount: number }[];
  expenses: { label: string; amount: number }[];
  profit: number;
  note?: string;
};

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_ACTIVE_EVENT: Event = {
  id: "mock-e1",
  slug: "bunnings-ashfield",
  title_ua: "Bunnings Ashfield",
  title_en: "Bunnings Ashfield",
  description_ua: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Запрошуємо всіх на благодійний продаж смачних сосисок «Сосиска для ЗСУ». Це тепло та дружня подія, до якої може смачно перекусити і водночас зробити добру справу.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Під час заходу ми будемо готувати смачні гарячі смачні сосиски, які можна буде придбати на донат. Всі зібрані кошти будуть передані на підтримку Збройних Сил України. Кожна куплена сосиска — це маленький внесок у велику справу підтримки наших захисників.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Головна мета заходу — зібрати кошти для допомоги ЗСУ. Отримані кошти будуть спрямовані на потреби українських військових. Разом ми можемо зробити більше та підтримати тих, хто щодня захищає нашу країну.",
          },
        ],
      },
    ],
  } as unknown as Event["description_ua"],
  description_en: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: 'We invite everyone to the charity sausage sizzle "Sausage for the Armed Forces". This is a warm and friendly event where you can enjoy a delicious snack and do a good deed at the same time.',
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "During the event, we will be preparing delicious hot sausages available for purchase as a donation. All proceeds will go to support the Armed Forces of Ukraine.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "The main goal is to raise funds for the Armed Forces. Together we can do more and support those who defend our country every day.",
          },
        ],
      },
    ],
  } as unknown as Event["description_en"],
  info_blocks_ua: [
    {
      title: "Що буде на події",
      content: [
        "продаж гарячих смачних сосисок",
        "можливість зробити благодійний донат",
        "дружня атмосфера",
        "можливість поспілкуватись, підтримати один одного та провести час із користю",
      ],
    },
    {
      title: "Хто може долучитися",
      content: [
        "Долучитися може кожен сосисконь",
        "діти та підлітки",
        "сім'ї та подружжя",
        "всі, хто хоче підтримати ЗСУ",
        "Не можете прийти сюди, є рідних або з дрогами",
        "Навіть, невеличкий внесок може мати значення.",
      ],
    },
    {
      title: "Чому варто прийти",
      content: [
        "смачна добра страва",
        "підтримати Збройні Сили України",
        "провести час у дружньому оточенні",
        "долучитись та зміти гарний сосисок",
      ],
    },
  ] as unknown as Event["info_blocks_ua"],
  info_blocks_en: [
    {
      title: "What will be at the event",
      content: [
        "sale of delicious hot sausages",
        "opportunity to make a charity donation",
        "friendly atmosphere",
        "chance to connect and spend time with purpose",
      ],
    },
    {
      title: "Who can join",
      content: [
        "Everyone is welcome!",
        "children and teenagers",
        "families and couples",
        "anyone who wants to support the Armed Forces",
        "Every contribution, no matter how small, matters.",
      ],
    },
    {
      title: "Why you should come",
      content: [
        "delicious food for a good cause",
        "support the Armed Forces of Ukraine",
        "spend time in a friendly environment",
        "enjoy great community spirit",
      ],
    },
  ] as unknown as Event["info_blocks_en"],
  cover_image: "/images/events/events.webp",
  gallery_images: [],
  event_date: "2026-02-16",
  start_time: "12:00",
  end_time: "17:00",
  location: "Harbourside Shopping Centre",
  location_map_url: "https://maps.google.com",
  tags: ["looking_for_partners", "looking_for_volunteers"],
  show_volunteer_cta: true,
  financial_report: null,
  status: "active",
  published_at: "2026-01-20T10:00:00Z",
  created_at: "2026-01-20T10:00:00Z",
  updated_at: "2026-01-20T10:00:00Z",
};

const MOCK_ARCHIVED_EVENT: Event = {
  ...MOCK_ACTIVE_EVENT,
  id: "mock-e-archived",
  slug: "bunnings-ashfield-dec",
  status: "archived",
  event_date: "2025-12-15",
  gallery_images: [
    "/images/events/events.webp",
    "/images/events/hands-with-heart.webp",
    "/images/photoReport/product-01.webp",
    "/images/photoReport/product-02.webp",
    "/images/photoReport/product-03.webp",
    "/images/photoReport/proof-01.webp",
  ],
  financial_report: {
    income: [
      { label: "$2 938-cash", amount: 2938 },
      { label: "$3 249,57-EFTPOS п'ятниця", amount: 3249.57 },
      { label: "$11 628,73-EFTPOS субота", amount: 11628.73 },
      { label: "$680-розмінка", amount: 680 },
    ],
    expenses: [
      { label: "-$3 334- витрати ($784-пампушки)", amount: 3334 },
      { label: "-$1 411,60- оренда будинку", amount: 1411.6 },
      { label: "+$890-PayPal збір на потреби", amount: -890 },
      { label: "-$2 264-вартість місця на маркеті", amount: 2264 },
    ],
    profit: 11016.7,
    note: undefined,
  } as unknown as Event["financial_report"],
  show_volunteer_cta: false,
};

// Listing-only mock entries from /events page that don't have a hand-built
// detail mock. We synthesize an Event from the active or archived template so
// any card on the listing has a working detail page.
const MOCK_LISTING_OVERRIDES: Array<{
  slug: string;
  title_ua: string;
  title_en: string;
  status: "active" | "archived";
  event_date: string;
  start_time: string;
  end_time: string | null;
  location: string;
  location_map_url?: string | null;
  tags?: string[];
}> = [
  // Active (April 2026)
  { slug: "bunnings-kirrawee", title_ua: "Bunnings Kirrawee", title_en: "Bunnings Kirrawee", status: "active", event_date: "2026-04-10", start_time: "09:00", end_time: "14:00", location: "Bunnings Kirrawee", tags: ["looking_for_partners", "looking_for_volunteers"] },
  { slug: "bunnings-padstow", title_ua: "Bunnings Padstow", title_en: "Bunnings Padstow", status: "active", event_date: "2026-04-12", start_time: "09:00", end_time: "14:00", location: "Bunnings Padstow", tags: ["looking_for_partners"] },
  { slug: "4-years-of-war", title_ua: "4 роки війни", title_en: "4 Years of War", status: "active", event_date: "2026-04-15", start_time: "17:00", end_time: null, location: "Martin Place, Sydney", location_map_url: "https://maps.google.com", tags: ["looking_for_partners", "looking_for_volunteers"] },
  { slug: "bunnings-castle-hill-apr", title_ua: "Bunnings Castle Hill", title_en: "Bunnings Castle Hill", status: "active", event_date: "2026-04-18", start_time: "09:00", end_time: "14:00", location: "Bunnings Castle Hill", tags: ["looking_for_volunteers"] },
  { slug: "bunnings-ryde-apr", title_ua: "Bunnings Ryde", title_en: "Bunnings Ryde", status: "active", event_date: "2026-04-22", start_time: "09:00", end_time: "14:00", location: "Bunnings Ryde", tags: ["looking_for_partners"] },
  { slug: "ukraine-vigil-apr", title_ua: "Вечірня вахта пам'яті", title_en: "Evening Vigil", status: "active", event_date: "2026-04-26", start_time: "18:30", end_time: "20:00", location: "Hyde Park, Sydney", location_map_url: "https://maps.google.com", tags: ["looking_for_volunteers"] },
  { slug: "stand-with-ukraine-rally-apr", title_ua: "Stand with Ukraine — Rally", title_en: "Stand with Ukraine — Rally", status: "active", event_date: "2026-04-30", start_time: "11:00", end_time: "14:00", location: "Town Hall Square, Sydney", location_map_url: "https://maps.google.com", tags: ["looking_for_partners", "looking_for_volunteers"] },
  // Archived
  { slug: "bunnings-chatswood-apr", title_ua: "Bunnings Chatswood", title_en: "Bunnings Chatswood", status: "archived", event_date: "2026-04-02", start_time: "09:00", end_time: "14:00", location: "Bunnings Chatswood", tags: ["looking_for_partners", "looking_for_volunteers"] },
  { slug: "bunnings-alexandria-apr", title_ua: "Bunnings Alexandria", title_en: "Bunnings Alexandria", status: "archived", event_date: "2026-04-08", start_time: "09:00", end_time: "13:00", location: "Bunnings Alexandria", tags: ["looking_for_volunteers"] },
  { slug: "stand-with-ukraine-vigil-apr", title_ua: "Вечір пам'яті — Stand with Ukraine", title_en: "Stand with Ukraine — Memorial Evening", status: "archived", event_date: "2026-04-11", start_time: "18:30", end_time: "20:00", location: "Hyde Park, Sydney", location_map_url: "https://maps.google.com", tags: [] },
  { slug: "ukrainian-easter-bake-sale-apr", title_ua: "Великодній благодійний ярмарок", title_en: "Ukrainian Easter Bake Sale", status: "archived", event_date: "2026-04-19", start_time: "10:00", end_time: "15:00", location: "Lidcombe Catholic Club", location_map_url: "https://maps.google.com", tags: ["looking_for_partners"] },
  { slug: "bunnings-warriewood-apr", title_ua: "Bunnings Warriewood", title_en: "Bunnings Warriewood", status: "archived", event_date: "2026-04-25", start_time: "09:00", end_time: "14:00", location: "Bunnings Warriewood", tags: ["looking_for_partners", "looking_for_volunteers"] },
  { slug: "bunnings-castle-hill-dec", title_ua: "Bunnings Castle Hill", title_en: "Bunnings Castle Hill", status: "archived", event_date: "2025-12-15", start_time: "09:00", end_time: "14:00", location: "Bunnings Castle Hill", tags: ["looking_for_partners", "looking_for_volunteers"] },
  { slug: "bunnings-ryde-nov", title_ua: "Bunnings Ryde", title_en: "Bunnings Ryde", status: "archived", event_date: "2025-11-20", start_time: "09:00", end_time: "14:00", location: "Bunnings Ryde", tags: ["looking_for_volunteers"] },
  { slug: "end-the-war-rally", title_ua: 'Мітинг "End the War on Ukraine\'s Terms"', title_en: "End the War on Ukraine's Terms Rally", status: "archived", event_date: "2025-10-24", start_time: "17:00", end_time: null, location: "Martin Place, Sydney", location_map_url: "https://maps.google.com", tags: [] },
];

function buildMockFromListing(slug: string): Event | null {
  const entry = MOCK_LISTING_OVERRIDES.find((e) => e.slug === slug);
  if (!entry) return null;
  const template =
    entry.status === "archived" ? MOCK_ARCHIVED_EVENT : MOCK_ACTIVE_EVENT;
  return {
    ...template,
    id: `mock-listing-${slug}`,
    slug: entry.slug,
    title_ua: entry.title_ua,
    title_en: entry.title_en,
    status: entry.status,
    event_date: entry.event_date,
    start_time: entry.start_time,
    end_time: entry.end_time,
    location: entry.location,
    location_map_url: entry.location_map_url ?? null,
    tags: entry.tags ?? template.tags,
  };
}

const MOCK_RELATED: Event[] = [
  {
    ...MOCK_ACTIVE_EVENT,
    id: "mock-r1",
    slug: "bunnings-kirrawee",
    title_ua: "Bunnings Kirrawee",
    title_en: "Bunnings Kirrawee",
  },
  {
    ...MOCK_ACTIVE_EVENT,
    id: "mock-r2",
    slug: "bunnings-padstow",
    title_ua: "Bunnings Padstow",
    title_en: "Bunnings Padstow",
  },
  {
    ...MOCK_ACTIVE_EVENT,
    id: "mock-r3",
    slug: "bunnings-castle-hill-apr",
    title_ua: "Bunnings Castle Hill",
    title_en: "Bunnings Castle Hill",
  },
  {
    ...MOCK_ACTIVE_EVENT,
    id: "mock-r4",
    slug: "bunnings-ryde-apr",
    title_ua: "Bunnings Ryde",
    title_en: "Bunnings Ryde",
  },
  {
    ...MOCK_ACTIVE_EVENT,
    id: "mock-r5",
    slug: "stand-with-ukraine-rally-apr",
    title_ua: "Stand with Ukraine — Rally",
    title_en: "Stand with Ukraine — Rally",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string }[];
};

function renderRichText(doc: unknown): React.ReactNode[] {
  if (!doc) return [];
  // Plain string from textarea — split on blank lines into paragraphs.
  if (typeof doc === "string") {
    return doc
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 0)
      .map((para, i) => (
        <p key={i} className="mb-4 text-body leading-relaxed text-text-primary">
          {para.trim()}
        </p>
      ));
  }
  if (typeof doc !== "object") return [];
  const root = doc as { content?: TiptapNode[] };
  if (!root.content) return [];

  return root.content.map((node, i) => {
    switch (node.type) {
      case "heading": {
        const level = (node.attrs?.level as number) ?? 3;
        const text = renderInline(node.content);
        if (level === 2)
          return (
            <h2 key={i} className="text-h2 mt-8 mb-4 text-text-strong">
              {text}
            </h2>
          );
        return (
          <h3 key={i} className="text-h3 mt-6 mb-3 text-text-strong">
            {text}
          </h3>
        );
      }
      case "paragraph":
        return (
          <p
            key={i}
            className="text-body mb-4 text-text-primary leading-relaxed"
          >
            {renderInline(node.content)}
          </p>
        );
      case "image":
        return (
          <div
            key={i}
            className="relative my-6 aspect-video overflow-hidden rounded-xl"
          >
            <Image
              src={node.attrs?.src as string}
              alt={(node.attrs?.alt as string) ?? ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
        );
      default:
        return null;
    }
  });
}

function renderInline(nodes?: TiptapNode[]): React.ReactNode {
  if (!nodes) return null;
  return nodes.map((node, i) => {
    if (node.type === "text") {
      const isBold = node.marks?.some((m) => m.type === "bold");
      if (isBold) return <strong key={i}>{node.text}</strong>;
      return <span key={i}>{node.text}</span>;
    }
    return null;
  });
}

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === "ua" ? "uk-UA" : "en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(start: string, end: string | null): string {
  if (end) return `${start} – ${end}`;
  return start;
}

import React from "react";

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  // Fetch event
  let event: Event | null = null;
  let related: Event[] = [];

  try {
    const fetched = await db.event.findUnique({ where: { slug } });
    if (fetched) event = fetched as unknown as Event;

    const fetchedRelated = await db.event.findMany({
      where: { status: "ACTIVE" },
      take: 12,
    });
    related = (fetchedRelated as unknown as Event[]).filter(
      (e) => e.slug !== slug,
    );
  } catch {
    // DB not reachable
  }

  // Fallback to mock
  if (!event) {
    if (slug === MOCK_ACTIVE_EVENT.slug) event = MOCK_ACTIVE_EVENT;
    else if (slug === MOCK_ARCHIVED_EVENT.slug) event = MOCK_ARCHIVED_EVENT;
    else event = buildMockFromListing(slug);
  }

  if (!event) notFound();

  if (related.length === 0) {
    related = MOCK_RELATED.filter((e) => e.slug !== slug);
  }

  const titleKey = locale === "ua" ? "title_ua" : "title_en";
  const descKey = locale === "ua" ? "description_ua" : "description_en";

  const title = event[titleKey];
  const isArchived = String(event.status).toUpperCase() === "ARCHIVED";
  const financialReport =
    event.financial_report as unknown as FinancialReport | null;

  const tagLabels = {
    active: t("events.tag_active"),
    archive: t("events.archive"),
    archived: t("events.tag_archived"),
    looking_for_partners: t("events.tag_looking_for_partners"),
    looking_for_volunteers: t("events.tag_looking_for_volunteers"),
  };

  return (
    <>
      {/* ── Breadcrumb + badges + title + cover + meta ───────────── */}
      <section className="pt-6 pb-2 lg:pt-8">
        <div className="container-page">
          <Breadcrumb
            crumbs={[
              { label: t("events.breadcrumb_home"), href: `/${locale}` },
              {
                label: t("events.breadcrumb_events"),
                href: `/${locale}/events`,
              },
            ]}
            current={title}
          />

          <EventBadges
            isArchived={isArchived}
            tags={event.tags}
            labels={{
              active: tagLabels.active,
              archived: tagLabels.archived,
              looking_for_partners: tagLabels.looking_for_partners,
              looking_for_volunteers: tagLabels.looking_for_volunteers,
            }}
            className="mt-4"
          />

          <h1 className="mt-4 mb-6 text-h2 font-bold text-text-strong lg:mt-6 lg:mb-8 lg:text-[56px] lg:leading-[110%]">
            {title}
          </h1>

          {/* Cover image */}
          <div className="relative mb-6 aspect-[1280/620] overflow-hidden rounded-2xl bg-secondary-10 lg:mb-8">
            {event.cover_image ? (
              <Image
                src={event.cover_image}
                alt={title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            ) : (
              <ImagePlaceholder size="md" />
            )}
          </div>

          {/* Date/time + Location bar */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
            <div className="rounded-2xl bg-secondary-10 p-6 text-center lg:p-8">
              <p className="text-body text-text-secondary">
                {t("events.date_time")}
              </p>
              <p className="mt-3 text-[20px] font-bold leading-tight text-text-strong lg:text-[24px]">
                {formatDate(event.event_date, locale)}
              </p>
              <p className="mt-3 text-[20px] font-bold leading-tight text-text-strong lg:text-[24px]">
                {formatTime(event.start_time, event.end_time)}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary-10 p-6 text-center lg:p-8">
              <p className="text-body text-text-secondary">
                {t("events.location")}
              </p>
              <p className="mt-3 text-[20px] font-bold leading-tight text-text-strong lg:text-[24px]">
                {event.location}
              </p>
              {event.location_map_url && (
                <a
                  href={event.location_map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-body-sm text-text-secondary underline transition-colors hover:text-secondary"
                >
                  {t("events.view_map")}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Description section ──────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <h2 className="mb-8 text-center text-h2 font-bold text-text-strong lg:mb-12 lg:text-[40px]">
            {t("events.charity_event")} &laquo;{title}&raquo;
          </h2>

          <div className="prose-custom text-body text-text-primary">
            {/* Floated cover so the description text wraps around it on
                desktop / tablet, then stacks on mobile via float-none. */}
            {event.cover_image ? (
              <div className="relative mb-4 aspect-4/3 w-full overflow-hidden rounded-2xl bg-secondary-10 md:float-left md:mr-6 md:mb-4 md:w-[45%] lg:w-[42%]">
                <Image
                  src={event.cover_image}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 45vw"
                />
              </div>
            ) : (
              <div className="relative mb-4 aspect-4/3 w-full overflow-hidden rounded-2xl bg-secondary-10 md:float-left md:mr-6 md:mb-4 md:w-[45%] lg:w-[42%]">
                <ImagePlaceholder size="md" />
              </div>
            )}
            {renderRichText(event[descKey])}
            <div className="clear-both" />
          </div>

          {/* Static info blocks — same content on every event (active + archived) */}
          <EventInfoBlocks />

          {/* Share */}
          <ShareSection
            copyLinkLabel={t("events.copy_link")}
            shareLabel={t("events.share")}
          />
        </div>
      </section>

      {/* ── Volunteer CTA (active only) ──────────────────────────── */}
      {!isArchived && event.show_volunteer_cta && (
        <VolunteerCTA
          title={t("shared.volunteer_cta.title")}
          description={t("shared.volunteer_cta.description")}
          ctaLabel={t("shared.volunteer_cta.cta")}
          ctaHref={`/${locale}/contact`}
          imageAlt={t("shared.volunteer_cta.image_alt")}
          className="lg:!pb-0 lg:!h-auto"
        />
      )}

      {/* ── Archived event report: financial card + photos ─────────
          Show whenever the event is archived AND has a financial
          report or gallery photos. Either piece is rendered on its
          own, so a gallery without a report still appears. */}
      {isArchived &&
        (financialReport || event.gallery_images.length > 0) && (
        <section className="section">
          <div className="container-page">
            <h2 className="mb-8 text-center text-h2 font-bold text-text-strong lg:mb-12 lg:text-[40px]">
              {t("events.reports")}
            </h2>

            {/* Financial card — desktop top row pairs it with first 2 photos.
                Tablet/mobile: card alone full-width. Hidden when no report. */}
            {financialReport && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                <div className="hidden grid-cols-2 gap-4 lg:grid lg:gap-6">
                  {event.gallery_images.slice(0, 2).map((img, i) => (
                    <div
                      key={`top-${i}`}
                      className="relative aspect-square overflow-hidden rounded-2xl bg-secondary-10"
                    >
                      <Image
                        src={img}
                        alt={`${title} — ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="25vw"
                      />
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl bg-secondary-10 p-6 sm:p-8 lg:p-10">
                  <h3 className="mb-6 text-center text-h3 font-bold text-text-strong sm:text-left lg:text-right">
                    {t("events.we_raised")}
                  </h3>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                    <ul className="list-disc space-y-2 pl-5 text-body text-text-strong marker:text-text-strong">
                      {financialReport.income.map((item, i) => (
                        <li key={`i-${i}`}>{item.label}</li>
                      ))}
                    </ul>
                    <ul className="space-y-2 text-body text-text-strong">
                      {financialReport.expenses.map((item, i) => (
                        <li key={`e-${i}`}>{item.label}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="mt-6 text-right text-h3 font-semibold text-text-strong">
                    {t("events.profit")}: $
                    {financialReport.profit.toLocaleString(
                      locale === "ua" ? "uk-UA" : "en-AU",
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Photos.
                Mobile: horizontal scroll-snap. Tablet: 2-up grid.
                Desktop: when financial card is shown, photos 3..6 sit
                under it (the first 2 are next to the card). When no
                card, all photos sit in a single 4-up grid. */}
            {event.gallery_images.length > 0 && (
              <>
                <div className="-mx-5 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {event.gallery_images.map((img, i) => (
                    <div
                      key={`m-${i}`}
                      className="relative aspect-square w-[85%] shrink-0 snap-start overflow-hidden rounded-2xl bg-secondary-10"
                    >
                      <Image
                        src={img}
                        alt={`${title} — ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="85vw"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 hidden grid-cols-2 gap-4 sm:grid lg:hidden">
                  {event.gallery_images.slice(0, 2).map((img, i) => (
                    <div
                      key={`t-${i}`}
                      className="relative aspect-square overflow-hidden rounded-2xl bg-secondary-10"
                    >
                      <Image
                        src={img}
                        alt={`${title} — ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="50vw"
                      />
                    </div>
                  ))}
                </div>

                {financialReport
                  ? event.gallery_images.length > 2 && (
                      <div className="mt-6 hidden grid-cols-4 gap-6 lg:grid">
                        {event.gallery_images.slice(2, 6).map((img, i) => (
                          <div
                            key={`d-${i}`}
                            className="relative aspect-square overflow-hidden rounded-2xl bg-secondary-10"
                          >
                            <Image
                              src={img}
                              alt={`${title} — ${i + 3}`}
                              fill
                              className="object-cover"
                              sizes="25vw"
                            />
                          </div>
                        ))}
                      </div>
                    )
                  : (
                      <div className="mt-6 hidden grid-cols-4 gap-6 lg:grid">
                        {event.gallery_images.slice(0, 8).map((img, i) => (
                          <div
                            key={`d-${i}`}
                            className="relative aspect-square overflow-hidden rounded-2xl bg-secondary-10"
                          >
                            <Image
                              src={img}
                              alt={`${title} — ${i + 1}`}
                              fill
                              className="object-cover"
                              sizes="25vw"
                            />
                          </div>
                        ))}
                      </div>
                    )}
              </>
            )}

            <p className="mt-10 text-center text-h3 font-medium text-text-strong lg:mt-14">
              {t("events.thank_you")}
            </p>
          </div>
        </section>
      )}

      {/* ── More events ──────────────────────────────────────────── */}
      {related.length > 0 && (
        <RelatedEventsCarousel title={t("events.more_events")}>
          {related.map((ev) => (
            <EventCard
              key={ev.id}
              slug={ev.slug}
              locale={locale}
              title={ev[titleKey]}
              coverImage={ev.cover_image}
              tags={ev.tags}
              tagLabels={tagLabels}
            />
          ))}
        </RelatedEventsCarousel>
      )}

      {/* ── Contact form ─────────────────────────────────────────── */}
      <ContactSection
        title={t("events.contact_title")}
        description={t("events.contact_description")}
      />
    </>
  );
}
