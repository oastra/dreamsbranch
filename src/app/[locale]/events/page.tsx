import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { db } from "@/lib/db";
import { isEventPast } from "@/lib/events";

// Past-vs-upcoming classification is time-sensitive. Re-fetch every
// 5 minutes so an event that ends between deploys still flips to
// archived without anyone touching admin.
export const revalidate = 300;
import { EventsList, type EventListItem } from "@/components/events/EventsList";
import { SupportSection } from "@/components/shared/SupportSection";
import { ContactSection } from "@/components/contact/ContactSection";
import {
  MaskedImageCarousel,
  type CarouselSlide,
} from "@/components/shared/MaskedImageCarousel";
import { PageHeroHeading } from "@/components/shared/PageHeroHeading";
import type { Event } from "@/types/database";

// ─── Types ──────────────────────────────────────────────────────────────────

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
    // Treat ACTIVE events whose end-of-window is in the past as
    // archived. Admin can keep status=ACTIVE; visitors see the right
    // bucket without needing a cron sweep.
    const fetchedActiveTyped = fetchedActive as unknown as EventPreview[];
    const fetchedArchivedTyped = fetchedArchived as unknown as EventPreview[];
    const [stillActive, justEnded] = fetchedActiveTyped.reduce<
      [EventPreview[], EventPreview[]]
    >(
      (acc, ev) => {
        (isEventPast(ev) ? acc[1] : acc[0]).push(ev);
        return acc;
      },
      [[], []],
    );
    active = stillActive;
    archived = [...justEnded, ...fetchedArchivedTyped];
  } catch {
    // DB unreachable — render empty state instead of mock fallbacks so
    // editors immediately see when their content isn't loading.
  }

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
      src: "/images/events/hands-with-heart.webp",
      alt: t("events.title"),
    },
  ];

  // Flat list passed to the client component: all active + all archived.
  // The first matching item (per filter/month) becomes the featured card; the
  // rest fill the grid below.
  const toListItem = (
    ev: EventPreview,
    isArchived: boolean,
  ): EventListItem => ({
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
      <section className=" py-8 md:py-16 lg:py-20">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2 lg:items-center lg:gap-10">
            {/* Title — centered on mobile/tablet, left in left column on desktop */}
            <PageHeroHeading
              title={t("events.title")}
              className="text-center lg:col-start-1 lg:row-start-1 lg:text-left"
            />

            {/* Two paragraphs share one grid cell so the gap between
                them stays 16px regardless of the outer grid's rhythm. */}
            <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-2 lg:max-w-xl">
              <p className="text-secondary text-text-primary">
                {t("events.description")}
              </p>
              <p className="text-secondary  text-text-primary">
                {t("events.description_2")}
              </p>
            </div>

            {/* Hero carousel — col 2 spans rows 1–2 on desktop */}
            <div className="relative w-full lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:h-full">
              <MaskedImageCarousel
                slides={heroSlides}
                aspectRatio="716/500"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Upcoming events ─────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <Suspense fallback={null}>
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
          </Suspense>
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
