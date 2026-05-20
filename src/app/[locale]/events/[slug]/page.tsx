import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/db";
import { isEventPast } from "@/lib/events";
import { resolveLocaleSlug } from "@/lib/slug";
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

const UA_MONTHS = [
  "січня", "лютого", "березня", "квітня", "травня", "червня",
  "липня", "серпня", "вересня", "жовтня", "листопада", "грудня",
];

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  if (locale === "ua") {
    return `${date.getDate()} ${UA_MONTHS[date.getMonth()]} ${date.getFullYear()} року`;
  }
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function trimSeconds(t: string): string {
  return t.split(":").slice(0, 2).join(":");
}

function formatTime(start: string, end: string | null): string {
  const s = trimSeconds(start);
  if (!end) return s;
  return `${s} – ${trimSeconds(end)}`;
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

  // resolveLocaleSlug must run OUTSIDE any try/catch — Next's redirect() and
  // notFound() throw a special framework error that any catch would swallow,
  // turning legitimate redirects into 404s.
  const { row, redirectTo } = await resolveLocaleSlug(
    db.event,
    slug,
    locale,
    `/${locale}/events`,
  );
  if (redirectTo) redirect(redirectTo);
  if (row) event = row as unknown as Event;

  try {
    const fetchedRelated = await db.event.findMany({
      where: { status: "ACTIVE" },
      take: 12,
    });
    related = (fetchedRelated as unknown as Event[])
      .filter((e) => e.slug !== slug)
      .filter((e) => !isEventPast(e));
  } catch {
    // Related is best-effort.
  }

  // Real DB data only — no mock fallback. notFound() if the slug doesn't
  // resolve to an actual event so editors immediately see broken links.
  if (!event) notFound();

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

          {/* Hero image — the big 1280×620 banner. `hero_image` is the
              project's "big" image; legacy events that pre-date the rename
              still keep the value in `secondary_image`, so we honour that
              as a fallback. We deliberately do NOT fall back to
              `cover_image` — that's the small floated image used below,
              and showing it here would duplicate the same picture twice. */}
          <div className="relative mb-6 aspect-1280/620 overflow-hidden rounded-2xl bg-secondary-10 lg:mb-8">
            {(() => {
              const legacy = event as Event & {
                hero_image?: string | null;
                secondary_image?: string | null;
              };
              const hero = legacy.hero_image || legacy.secondary_image;
              return hero ? (
                <Image
                  src={hero}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              ) : (
                <ImagePlaceholder size="md" />
              );
            })()}
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
          <h2 className=" mb-8 text-center text-h2 font-bold text-text-strong lg:mb-12 lg:text-[40px]">
            {t("events.charity_event")} &laquo;{title}&raquo;
          </h2>

          <div className="prose-custom text-body text-text-primary">
            {/* Small floated image next to the description.
                Wraps with description on tablet+, stacks on mobile.
                Uses `cover_image` (the small card image). For events
                that pre-date the rename, also accept the legacy
                `secondary_image` column. */}
            {(() => {
              const legacy = event as Event & {
                secondary_image?: string | null;
              };
              const floatedImage = event.cover_image || legacy.secondary_image;
              return floatedImage ? (
                <div className="relative mb-4 aspect-4/3 w-full overflow-hidden rounded-2xl bg-secondary-10 md:float-left md:mr-6 md:mb-4 md:w-[45%] lg:w-[42%]">
                  <Image
                    src={floatedImage}
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
              );
            })()}
            {renderRichText(event[descKey])}
            <div className="clear-both" />
          </div>

          {/* Static info blocks — same content on every event (active + archived) */}
          <EventInfoBlocks />
        </div>
      </section>

      {/* Share */}

      <ShareSection
        copyLinkLabel={t("events.copy_link")}
        copiedLabel={t("events.copy_link_copied")}
        shareLabel={t("events.share")}
        ariaLabel={t("events.share_aria")}
      />

      {/* ── Volunteer CTA (active only) ──────────────────────────── */}
      {!isArchived && event.show_volunteer_cta && (
        <VolunteerCTA
          title={t("shared.volunteer_cta.title")}
          description={t("shared.volunteer_cta.description")}
          ctaLabel={t("shared.volunteer_cta.cta")}
          ctaHref={`/${locale}/contact`}
          imageAlt={t("shared.volunteer_cta.image_alt")}
          className=" lg:h-auto!"
        />
      )}

      {/* ── Archived event report: financial card + photos ─────────
          Show whenever the event is archived AND has a financial
          report or gallery photos. Either piece is rendered on its
          own, so a gallery without a report still appears. */}
      {isArchived && (financialReport || event.gallery_images.length > 0) && (
        <section className="section">
          <div className="container-page">
            <h2 className="mb-8 text-center text-h2 font-bold text-text-strong lg:text-[40px]">
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

                {financialReport ? (
                  event.gallery_images.length > 2 && (
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
                ) : (
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
