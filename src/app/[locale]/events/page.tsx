import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';

import { db } from '@/lib/db';
import { EventCard } from '@/components/events/EventCard';
import { FeaturedEventCard } from '@/components/events/FeaturedEventCard';
import { SupportSection } from '@/components/home/SupportSection';
import { ContactSection } from '@/components/contact/ContactSection';
import type { Event } from '@/types/database';

// ─── Mock data (shown when Supabase returns no events) ──────────────────────

type EventPreview = Pick<
  Event,
  | 'id'
  | 'slug'
  | 'title_ua'
  | 'title_en'
  | 'description_ua'
  | 'description_en'
  | 'cover_image'
  | 'gallery_images'
  | 'event_date'
  | 'start_time'
  | 'end_time'
  | 'location'
  | 'location_map_url'
  | 'tags'
  | 'status'
>;

const MOCK_ACTIVE: EventPreview[] = [
  {
    id: 'mock-e1',
    slug: 'bunnings-ashfield',
    title_ua: 'Bunnings Ashfield',
    title_en: 'Bunnings Ashfield',
    description_ua: 'Приходьте до нот добою і гарячим напоям — разом робимо добру справу!',
    description_en: 'Come for sausages and hot drinks — together we do good!',
    cover_image: null,
    gallery_images: [],
    event_date: '2026-02-16',
    start_time: '09:00',
    end_time: '12:00',
    location: 'Harbourside Shopping Centre',
    location_map_url: 'https://maps.google.com',
    tags: ['looking_for_partners', 'looking_for_volunteers'],
    status: 'active',
  },
  {
    id: 'mock-e2',
    slug: 'bunnings-kirrawee',
    title_ua: 'Bunnings Kirrawee',
    title_en: 'Bunnings Kirrawee',
    description_ua: 'Тихаємо на всіх зі вірою. Підтримайте наших захисників!',
    description_en: 'Support our defenders at the community barbecue!',
    cover_image: null,
    gallery_images: [],
    event_date: '2026-03-10',
    start_time: '09:00',
    end_time: '14:00',
    location: 'Bunnings Kirrawee',
    location_map_url: null,
    tags: ['looking_for_partners', 'looking_for_volunteers'],
    status: 'active',
  },
  {
    id: 'mock-e3',
    slug: 'bunnings-padstow',
    title_ua: 'Bunnings Padstow',
    title_en: 'Bunnings Padstow',
    description_ua: 'Тихаємо на всіх зі вірою. Підтримайте наших захисників!',
    description_en: 'Support our defenders at the community barbecue!',
    cover_image: null,
    gallery_images: [],
    event_date: '2026-03-22',
    start_time: '09:00',
    end_time: '14:00',
    location: 'Bunnings Padstow',
    location_map_url: null,
    tags: ['looking_for_partners'],
    status: 'active',
  },
  {
    id: 'mock-e4',
    slug: '4-years-of-war',
    title_ua: '4 роки війни',
    title_en: '4 Years of War',
    description_ua: 'Тихаємо на всіх зі вірою. Підтримайте наших захисників!',
    description_en: 'We stand united. Support our defenders!',
    cover_image: null,
    gallery_images: [],
    event_date: '2026-02-24',
    start_time: '17:00',
    end_time: null,
    location: 'Martin Place, Sydney',
    location_map_url: 'https://maps.google.com',
    tags: ['looking_for_partners', 'looking_for_volunteers'],
    status: 'active',
  },
];

const MOCK_ARCHIVED: EventPreview[] = [
  {
    id: 'mock-ea1',
    slug: 'bunnings-castle-hill-dec',
    title_ua: 'Bunnings Castle Hill',
    title_en: 'Bunnings Castle Hill',
    description_ua: 'Тихаємо на всіх зі вірою. Підтримайте наших захисників!',
    description_en: 'Support our defenders at the community barbecue!',
    cover_image: null,
    gallery_images: [],
    event_date: '2025-12-15',
    start_time: '09:00',
    end_time: '14:00',
    location: 'Bunnings Castle Hill',
    location_map_url: null,
    tags: ['looking_for_partners', 'looking_for_volunteers'],
    status: 'archived',
  },
  {
    id: 'mock-ea2',
    slug: 'bunnings-ryde-nov',
    title_ua: 'Bunnings Ryde',
    title_en: 'Bunnings Ryde',
    description_ua: 'Тихаємо на всіх зі вірою. Підтримайте наших захисників!',
    description_en: 'Support our defenders at the community barbecue!',
    cover_image: null,
    gallery_images: [],
    event_date: '2025-11-20',
    start_time: '09:00',
    end_time: '14:00',
    location: 'Bunnings Ryde',
    location_map_url: null,
    tags: ['looking_for_volunteers'],
    status: 'archived',
  },
  {
    id: 'mock-ea3',
    slug: 'end-the-war-rally',
    title_ua: 'Мітинг "End the War on Ukraine\'s Terms"',
    title_en: 'End the War on Ukraine\'s Terms Rally',
    description_ua: 'Мітинг за мир на умовах України.',
    description_en: 'Rally for peace on Ukraine\'s terms.',
    cover_image: null,
    gallery_images: [],
    event_date: '2025-10-24',
    start_time: '17:00',
    end_time: null,
    location: 'Martin Place, Sydney',
    location_map_url: 'https://maps.google.com',
    tags: [],
    status: 'archived',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMonthLabel(locale: string): string {
  const now = new Date();
  return now.toLocaleDateString(locale === 'ua' ? 'uk-UA' : 'en-AU', {
    month: 'long',
    year: 'numeric',
  });
}

function extractPlainText(richText: unknown): string {
  if (typeof richText === 'string') return richText;
  if (!richText || typeof richText !== 'object') return '';

  const doc = richText as { content?: Array<{ content?: Array<{ text?: string }> }> };
  if (!doc.content) return '';

  return doc.content
    .flatMap((block) => block.content?.map((inline) => inline.text ?? '') ?? [])
    .join(' ')
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
      db.event.findMany({ where: { status: 'ACTIVE' } }),
      db.event.findMany({ where: { status: 'ARCHIVED' } }),
    ]);
    active = fetchedActive as unknown as EventPreview[];
    archived = fetchedArchived as unknown as EventPreview[];
  } catch {
    // DB not reachable — use mock data
  }

  if (active.length === 0) active = MOCK_ACTIVE;
  if (archived.length === 0) archived = MOCK_ARCHIVED;

  const titleKey = locale === 'ua' ? 'title_ua' : 'title_en';
  const descKey = locale === 'ua' ? 'description_ua' : 'description_en';

  // Featured event = first active event (soonest)
  const featured = active[0];
  const restActive = active.slice(1);

  const tagLabels = {
    active: t('events.tag_active'),
    archive: t('events.archive'),
    looking_for_partners: t('events.tag_looking_for_partners'),
    looking_for_volunteers: t('events.tag_looking_for_volunteers'),
  };

  const cardProps = {
    locale,
    tagLabels,
    dateTimeLabel: t('events.date_time'),
    locationLabel: t('events.location'),
    viewMapLabel: t('events.view_map'),
    learnMoreLabel: t('events.learn_more'),
  };

  const monthLabel = getMonthLabel(locale);

  return (
    <>
      {/* ── Page hero ────────────────────────────────────────────── */}
      <section className="bg-white py-12 lg:py-16">
        <div className="container-page">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            {/* Left: text */}
            <div>
              <p className="text-body-sm mb-2 text-text-secondary">Dreams branch of UWAA</p>
              <h1 className="text-display mb-4 text-secondary">{t('events.title')}</h1>
              <p className="text-body mb-2 max-w-xl text-text-secondary">
                {t('events.description')}
              </p>
              <p className="text-body max-w-xl text-text-secondary">
                {t('events.description_2')}
              </p>
            </div>

            {/* Right: hero image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/events/events.webp"
                alt={t('events.title')}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Upcoming events header + month ───────────────────────── */}
      <section className="section">
        <div className="container-page">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-h2 text-text-strong">{t('events.upcoming')}</h2>

            {/* Month indicator */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-text-secondary transition-colors hover:bg-grey-40">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </div>
              <span className="rounded-full bg-secondary px-5 py-2 text-body font-medium capitalize text-white">
                {monthLabel}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-text-secondary transition-colors hover:bg-grey-40">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="mb-10 flex gap-2">
            <button className="rounded-full bg-secondary px-5 py-2 text-body-sm font-medium text-white">
              {t('events.all')}
            </button>
            <button className="rounded-full border border-border bg-white px-5 py-2 text-body-sm font-medium text-text-strong transition-colors hover:bg-grey-40">
              {t('events.active')}
            </button>
            <button className="rounded-full border border-border bg-white px-5 py-2 text-body-sm font-medium text-text-strong transition-colors hover:bg-grey-40">
              {t('events.archive')}
            </button>
          </div>

          {/* Featured event */}
          {featured && (
            <div className="mb-10">
              <FeaturedEventCard
                slug={featured.slug}
                title={featured[titleKey]}
                description={extractPlainText(featured[descKey])}
                coverImage={featured.cover_image}
                eventDate={featured.event_date}
                startTime={featured.start_time}
                endTime={featured.end_time}
                location={featured.location}
                locationMapUrl={featured.location_map_url}
                tags={featured.tags}
                moreInfoLabel={t('events.more_info')}
                {...cardProps}
              />
            </div>
          )}

          {/* Active events grid */}
          {restActive.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restActive.map((ev) => (
                <EventCard
                  key={ev.id}
                  slug={ev.slug}
                  title={ev[titleKey]}
                  coverImage={ev.cover_image}
                  eventDate={ev.event_date}
                  startTime={ev.start_time}
                  endTime={ev.end_time}
                  location={ev.location}
                  locationMapUrl={ev.location_map_url}
                  tags={ev.tags}
                  {...cardProps}
                />
              ))}
            </div>
          )}

          {/* Archived events grid */}
          {archived.length > 0 && (
            <div className="mt-16">
              <h3 className="text-h3 mb-6 text-text-strong">{t('events.archive')}</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {archived.slice(0, 6).map((ev) => (
                  <EventCard
                    key={ev.id}
                    slug={ev.slug}
                    title={ev[titleKey]}
                    coverImage={ev.cover_image}
                    eventDate={ev.event_date}
                    startTime={ev.start_time}
                    endTime={ev.end_time}
                    location={ev.location}
                    locationMapUrl={ev.location_map_url}
                    tags={ev.tags}
                    isArchived
                    {...cardProps}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Support section (reusable) ───────────────────────────── */}
      <SupportSection locale={locale} />

      {/* ── Contact form (reusable) ──────────────────────────────── */}
      <ContactSection
        title={t('events.contact_title')}
        description={t('events.contact_description')}
      />
    </>
  );
}
