import { getTranslations, setRequestLocale } from "next-intl/server";

import { db } from "@/lib/db";
import { EventsList, type EventListItem } from "@/components/events/EventsList";
import { SupportSection } from "@/components/shared/SupportSection";
import { ContactSection } from "@/components/contact/ContactSection";
import {
  MaskedImageCarousel,
  type CarouselSlide,
} from "@/components/shared/MaskedImageCarousel";
import { PageHeroHeading } from "@/components/shared/PageHeroHeading";
import type { Event } from "@/types/database";

// ─── Mock data (shown when Supabase returns no events) ──────────────────────

type EventPreview = Pick<
  Event,
  | "id"
  | "slug"
  | "title_ua"
  | "title_en"
  | "description_ua"
  | "description_en"
  | "cover_image"
  | "gallery_images"
  | "event_date"
  | "start_time"
  | "end_time"
  | "location"
  | "location_map_url"
  | "tags"
  | "status"
>;

const MOCK_ACTIVE: EventPreview[] = [
  // 8 active events in April 2026 (current month) so the grid fills with
  // featured (soonest) + 6 cards + a "Показати більше" button (PAGE_SIZE=6).
  {
    id: "mock-e1",
    slug: "bunnings-ashfield",
    title_ua: "Bunnings Ashfield",
    title_en: "Bunnings Ashfield",
    description_ua:
      "Приходьте за хот-догом і гарним настроєм — разом робимо добру справу!",
    description_en: "Come for sausages and hot drinks — together we do good!",
    cover_image: null,
    gallery_images: [],
    event_date: "2026-04-05",
    start_time: "09:00",
    end_time: "12:00",
    location: "Harbourside Shopping Centre",
    location_map_url: "https://maps.google.com",
    tags: ["looking_for_partners", "looking_for_volunteers"],
    status: "active",
  },
  {
    id: "mock-e2",
    slug: "bunnings-kirrawee",
    title_ua: "Bunnings Kirrawee",
    title_en: "Bunnings Kirrawee",
    description_ua: "Стаємо на варті зі вірою. Підтримайте наших захисників!",
    description_en: "Support our defenders at the community barbecue!",
    cover_image: null,
    gallery_images: [],
    event_date: "2026-04-10",
    start_time: "09:00",
    end_time: "14:00",
    location: "Bunnings Kirrawee",
    location_map_url: null,
    tags: ["looking_for_partners", "looking_for_volunteers"],
    status: "active",
  },
  {
    id: "mock-e3",
    slug: "bunnings-padstow",
    title_ua: "Bunnings Padstow",
    title_en: "Bunnings Padstow",
    description_ua: "Долучайтесь до благодійного барбекю на користь ЗСУ.",
    description_en: "Join our charity barbecue in support of Ukraine's army.",
    cover_image: null,
    gallery_images: [],
    event_date: "2026-04-12",
    start_time: "09:00",
    end_time: "14:00",
    location: "Bunnings Padstow",
    location_map_url: null,
    tags: ["looking_for_partners"],
    status: "active",
  },
  {
    id: "mock-e4",
    slug: "4-years-of-war",
    title_ua: "4 роки війни",
    title_en: "4 Years of War",
    description_ua: "Чекаємо на вас завтра. Підтримайте мітинг.",
    description_en: "We stand united. Support our defenders!",
    cover_image: null,
    gallery_images: [],
    event_date: "2026-04-15",
    start_time: "17:00",
    end_time: null,
    location: "Martin Place, Sydney",
    location_map_url: "https://maps.google.com",
    tags: ["looking_for_partners", "looking_for_volunteers"],
    status: "active",
  },
  {
    id: "mock-e5",
    slug: "bunnings-castle-hill-apr",
    title_ua: "Bunnings Castle Hill",
    title_en: "Bunnings Castle Hill",
    description_ua: "Благодійний ярмарок. Запрошуємо волонтерів та партнерів.",
    description_en: "Charity fair. Volunteers and partners welcome.",
    cover_image: null,
    gallery_images: [],
    event_date: "2026-04-18",
    start_time: "09:00",
    end_time: "14:00",
    location: "Bunnings Castle Hill",
    location_map_url: null,
    tags: ["looking_for_volunteers"],
    status: "active",
  },
  {
    id: "mock-e6",
    slug: "bunnings-ryde-apr",
    title_ua: "Bunnings Ryde",
    title_en: "Bunnings Ryde",
    description_ua: "Спільне барбекю задля підтримки України. Долучайтесь!",
    description_en: "Community barbecue in support of Ukraine. Join us!",
    cover_image: null,
    gallery_images: [],
    event_date: "2026-04-22",
    start_time: "09:00",
    end_time: "14:00",
    location: "Bunnings Ryde",
    location_map_url: null,
    tags: ["looking_for_partners"],
    status: "active",
  },
  {
    id: "mock-e7",
    slug: "ukraine-vigil-apr",
    title_ua: "Вечірня вахта пам'яті",
    title_en: "Evening Vigil",
    description_ua:
      "Запалимо свічки за полеглих. Долучайтесь до тихої молитви.",
    description_en:
      "Lighting candles for the fallen. Join us for a moment of silence.",
    cover_image: null,
    gallery_images: [],
    event_date: "2026-04-26",
    start_time: "18:30",
    end_time: "20:00",
    location: "Hyde Park, Sydney",
    location_map_url: "https://maps.google.com",
    tags: ["looking_for_volunteers"],
    status: "active",
  },
  {
    id: "mock-e8",
    slug: "stand-with-ukraine-rally-apr",
    title_ua: "Stand with Ukraine — Rally",
    title_en: "Stand with Ukraine — Rally",
    description_ua: "Велика хода солідарності. Підтримайте Україну разом з нами.",
    description_en: "Solidarity march. Stand with Ukraine alongside us.",
    cover_image: null,
    gallery_images: [],
    event_date: "2026-04-30",
    start_time: "11:00",
    end_time: "14:00",
    location: "Town Hall Square, Sydney",
    location_map_url: "https://maps.google.com",
    tags: ["looking_for_partners", "looking_for_volunteers"],
    status: "active",
  },
];

const MOCK_ARCHIVED: EventPreview[] = [
  // April 2026 archived events — let the user preview the archive view in the
  // current month before real data is wired up.
  {
    id: "mock-ea-apr-1",
    slug: "bunnings-chatswood-apr",
    title_ua: "Bunnings Chatswood",
    title_en: "Bunnings Chatswood",
    description_ua:
      "Дякуємо всім, хто завітав і підтримав наших захисників разом з нами.",
    description_en:
      "Thank you to everyone who joined us in support of our defenders.",
    cover_image: null,
    gallery_images: [],
    event_date: "2026-04-02",
    start_time: "09:00",
    end_time: "14:00",
    location: "Bunnings Chatswood",
    location_map_url: null,
    tags: ["looking_for_partners", "looking_for_volunteers"],
    status: "archived",
  },
  {
    id: "mock-ea-apr-2",
    slug: "bunnings-alexandria-apr",
    title_ua: "Bunnings Alexandria",
    title_en: "Bunnings Alexandria",
    description_ua: "Подія завершена. Дякуємо за підтримку!",
    description_en: "Event completed. Thank you for your support!",
    cover_image: null,
    gallery_images: [],
    event_date: "2026-04-08",
    start_time: "09:00",
    end_time: "13:00",
    location: "Bunnings Alexandria",
    location_map_url: null,
    tags: ["looking_for_volunteers"],
    status: "archived",
  },
  {
    id: "mock-ea-apr-3",
    slug: "stand-with-ukraine-vigil-apr",
    title_ua: "Вечір пам'яті — Stand with Ukraine",
    title_en: "Stand with Ukraine — Memorial Evening",
    description_ua: "Запалили свічки на знак пам'яті. Дякуємо всім присутнім.",
    description_en: "We lit candles in remembrance. Thank you to all who came.",
    cover_image: null,
    gallery_images: [],
    event_date: "2026-04-11",
    start_time: "18:30",
    end_time: "20:00",
    location: "Hyde Park, Sydney",
    location_map_url: "https://maps.google.com",
    tags: [],
    status: "archived",
  },
  {
    id: "mock-ea-apr-4",
    slug: "ukrainian-easter-bake-sale-apr",
    title_ua: "Великодній благодійний ярмарок",
    title_en: "Ukrainian Easter Bake Sale",
    description_ua: "Зібрали кошти на гумдопомогу. Дякуємо нашим пекарям!",
    description_en:
      "We raised funds for humanitarian aid. Thanks to our wonderful bakers!",
    cover_image: null,
    gallery_images: [],
    event_date: "2026-04-19",
    start_time: "10:00",
    end_time: "15:00",
    location: "Lidcombe Catholic Club",
    location_map_url: "https://maps.google.com",
    tags: ["looking_for_partners"],
    status: "archived",
  },
  {
    id: "mock-ea-apr-5",
    slug: "bunnings-warriewood-apr",
    title_ua: "Bunnings Warriewood",
    title_en: "Bunnings Warriewood",
    description_ua: "Барбекю на користь ЗСУ — дякуємо громаді за підтримку!",
    description_en: "BBQ in support of Ukraine's army — thank you community!",
    cover_image: null,
    gallery_images: [],
    event_date: "2026-04-25",
    start_time: "09:00",
    end_time: "14:00",
    location: "Bunnings Warriewood",
    location_map_url: null,
    tags: ["looking_for_partners", "looking_for_volunteers"],
    status: "archived",
  },
  // Older archived events (other months) — kept for month navigation.
  {
    id: "mock-ea1",
    slug: "bunnings-castle-hill-dec",
    title_ua: "Bunnings Castle Hill",
    title_en: "Bunnings Castle Hill",
    description_ua: "Тихаємо на всіх зі вірою. Підтримайте наших захисників!",
    description_en: "Support our defenders at the community barbecue!",
    cover_image: null,
    gallery_images: [],
    event_date: "2025-12-15",
    start_time: "09:00",
    end_time: "14:00",
    location: "Bunnings Castle Hill",
    location_map_url: null,
    tags: ["looking_for_partners", "looking_for_volunteers"],
    status: "archived",
  },
  {
    id: "mock-ea2",
    slug: "bunnings-ryde-nov",
    title_ua: "Bunnings Ryde",
    title_en: "Bunnings Ryde",
    description_ua: "Тихаємо на всіх зі вірою. Підтримайте наших захисників!",
    description_en: "Support our defenders at the community barbecue!",
    cover_image: null,
    gallery_images: [],
    event_date: "2025-11-20",
    start_time: "09:00",
    end_time: "14:00",
    location: "Bunnings Ryde",
    location_map_url: null,
    tags: ["looking_for_volunteers"],
    status: "archived",
  },
  {
    id: "mock-ea3",
    slug: "end-the-war-rally",
    title_ua: 'Мітинг "End the War on Ukraine\'s Terms"',
    title_en: "End the War on Ukraine's Terms Rally",
    description_ua: "Мітинг за мир на умовах України.",
    description_en: "Rally for peace on Ukraine's terms.",
    cover_image: null,
    gallery_images: [],
    event_date: "2025-10-24",
    start_time: "17:00",
    end_time: null,
    location: "Martin Place, Sydney",
    location_map_url: "https://maps.google.com",
    tags: [],
    status: "archived",
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
    .slice(0, 200);
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  // Fetch events from Supabase, fall back to mock data
  let active: EventPreview[] = [];
  let archived: EventPreview[] = [];

  try {
    const [fetchedActive, fetchedArchived] = await Promise.all([
      db.event.findMany({ where: { status: "ACTIVE" } }),
      db.event.findMany({ where: { status: "ARCHIVED" } }),
    ]);
    active = fetchedActive as unknown as EventPreview[];
    archived = fetchedArchived as unknown as EventPreview[];
  } catch {
    // DB not reachable — use mock data
  }

  if (active.length === 0) active = MOCK_ACTIVE;
  if (archived.length === 0) archived = MOCK_ARCHIVED;

  const titleKey = locale === "ua" ? "title_ua" : "title_en";
  const descKey = locale === "ua" ? "description_ua" : "description_en";

  const tagLabels = {
    active: t("events.tag_active"),
    archive: t("events.archive"),
    archived: t("events.tag_archived"),
    looking_for_partners: t("events.tag_looking_for_partners"),
    looking_for_volunteers: t("events.tag_looking_for_volunteers"),
  };

  const heroSlides: CarouselSlide[] = [
    { src: "/images/events/events.webp", alt: t("events.title") },
    {
      src: "/images/events/pray-peace-ukraine-hands-with-heart-no-war.webp",
      alt: t("events.title"),
    },
  ];

  // Flat list passed to the client component: all active + all archived.
  // The first matching item (per filter/month) becomes the featured card; the
  // rest fill the grid below.
  const toListItem = (ev: EventPreview, isArchived: boolean): EventListItem => ({
    id: ev.id,
    slug: ev.slug,
    title: ev[titleKey],
    subtitle: extractPlainText(ev[descKey]),
    coverImage: ev.cover_image,
    tags: ev.tags,
    isArchived,
    eventDate: ev.event_date,
    startTime: ev.start_time,
    endTime: ev.end_time,
    location: ev.location,
    locationMapUrl: ev.location_map_url,
  });

  const listItems: EventListItem[] = [
    ...active.map((ev) => toListItem(ev, false)),
    ...archived.map((ev) => toListItem(ev, true)),
  ];

  return (
    <>
      {/* ── Page hero ────────────────────────────────────────────── */}
      <section className=" py-8 lg:py-16">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2 lg:items-center lg:gap-10">
            {/* Title — centered on mobile/tablet, left in left column on desktop */}
            <PageHeroHeading
              title={t("events.title")}
              className="text-center lg:col-start-1 lg:row-start-1 lg:text-left"
            />

            {/* First paragraph — appears below title; col 1 row 2 on desktop */}
            <p className="text-body text-text-secondary lg:col-start-1 lg:row-start-2 lg:max-w-xl">
              {t("events.description")}
            </p>

            {/* Hero carousel — col 2 spans rows 1–3 on desktop */}
            <div className="relative w-full lg:col-start-2 lg:row-start-1 lg:row-end-4 lg:h-full">
              <MaskedImageCarousel
                slides={heroSlides}
                aspectRatio="716/500"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Second paragraph — below image on mobile; col 1 row 3 on desktop */}
            <p className="text-body text-text-secondary lg:col-start-1 lg:row-start-3 lg:max-w-xl">
              {t("events.description_2")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Upcoming events ─────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <EventsList
            locale={locale}
            title={t("events.upcoming")}
            events={listItems}
            tagLabels={tagLabels}
            labels={{
              all: t("events.all"),
              active: t("events.active"),
              archive: t("events.archive"),
              showMore: t("events.show_more"),
              noEvents: t("events.no_events"),
              dateTime: t("events.date_time"),
              location: t("events.location"),
              viewMap: t("events.view_map"),
              learnMore: t("events.learn_more"),
              join: t("events.join"),
            }}
          />
        </div>
      </section>

      {/* ── Support section (reusable) ───────────────────────────── */}
      <SupportSection locale={locale} />

      {/* ── Contact form (reusable) ──────────────────────────────── */}
      <ContactSection
        title={t("events.contact_title")}
        description={t("events.contact_description")}
      />
    </>
  );
}
