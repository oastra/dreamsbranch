import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { db } from '@/lib/db';
import { EventCard } from '@/components/events/EventCard';
import { ShareSection } from '@/components/shared/ShareSection';
import { ContactSection } from '@/components/contact/ContactSection';
import type { Event } from '@/types/database';

// ─── Types ───────────────────────────────────────────────────────────────────

type InfoBlock = { title: string; content: string[] };

type FinancialReport = {
  income: { label: string; amount: number }[];
  expenses: { label: string; amount: number }[];
  profit: number;
  note?: string;
};

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_ACTIVE_EVENT: Event = {
  id: 'mock-e1',
  slug: 'bunnings-ashfield',
  title_ua: 'Bunnings Ashfield',
  title_en: 'Bunnings Ashfield',
  description_ua: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Запрошуємо всіх на благодійний продаж смачних сосисок «Сосиска для ЗСУ». Це тепло та дружня подія, до якої може смачно перекусити і водночас зробити добру справу.' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Під час заходу ми будемо готувати смачні гарячі смачні сосиски, які можна буде придбати на донат. Всі зібрані кошти будуть передані на підтримку Збройних Сил України. Кожна куплена сосиска — це маленький внесок у велику справу підтримки наших захисників.' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Головна мета заходу — зібрати кошти для допомоги ЗСУ. Отримані кошти будуть спрямовані на потреби українських військових. Разом ми можемо зробити більше та підтримати тих, хто щодня захищає нашу країну.' }],
      },
    ],
  } as unknown as Event['description_ua'],
  description_en: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'We invite everyone to the charity sausage sizzle "Sausage for the Armed Forces". This is a warm and friendly event where you can enjoy a delicious snack and do a good deed at the same time.' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'During the event, we will be preparing delicious hot sausages available for purchase as a donation. All proceeds will go to support the Armed Forces of Ukraine.' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'The main goal is to raise funds for the Armed Forces. Together we can do more and support those who defend our country every day.' }],
      },
    ],
  } as unknown as Event['description_en'],
  info_blocks_ua: [
    { title: 'Що буде на події', content: ['продаж гарячих смачних сосисок', 'можливість зробити благодійний донат', 'дружня атмосфера', 'можливість поспілкуватись, підтримати один одного та провести час із користю'] },
    { title: 'Хто може долучитися', content: ['Долучитися може кожен сосисконь', 'діти та підлітки', 'сім\'ї та подружжя', 'всі, хто хоче підтримати ЗСУ', 'Не можете прийти сюди, є рідних або з дрогами', 'Навіть, невеличкий внесок може мати значення.'] },
    { title: 'Чому варто прийти', content: ['смачна добра страва', 'підтримати Збройні Сили України', 'провести час у дружньому оточенні', 'долучитись та зміти гарний сосисок'] },
  ] as unknown as Event['info_blocks_ua'],
  info_blocks_en: [
    { title: 'What will be at the event', content: ['sale of delicious hot sausages', 'opportunity to make a charity donation', 'friendly atmosphere', 'chance to connect and spend time with purpose'] },
    { title: 'Who can join', content: ['Everyone is welcome!', 'children and teenagers', 'families and couples', 'anyone who wants to support the Armed Forces', 'Every contribution, no matter how small, matters.'] },
    { title: 'Why you should come', content: ['delicious food for a good cause', 'support the Armed Forces of Ukraine', 'spend time in a friendly environment', 'enjoy great community spirit'] },
  ] as unknown as Event['info_blocks_en'],
  cover_image: null,
  gallery_images: [],
  event_date: '2026-02-16',
  start_time: '12:00',
  end_time: '17:00',
  location: 'Harbourside Shopping Centre',
  location_map_url: 'https://maps.google.com',
  tags: ['looking_for_partners', 'looking_for_volunteers'],
  show_volunteer_cta: true,
  financial_report: null,
  status: 'active',
  published_at: '2026-01-20T10:00:00Z',
  created_at: '2026-01-20T10:00:00Z',
  updated_at: '2026-01-20T10:00:00Z',
};

const MOCK_ARCHIVED_EVENT: Event = {
  ...MOCK_ACTIVE_EVENT,
  id: 'mock-e-archived',
  slug: 'bunnings-ashfield-dec',
  status: 'archived',
  event_date: '2025-12-15',
  gallery_images: [],
  financial_report: {
    income: [
      { label: '$2 928 coin', amount: 2928 },
      { label: '$3 295,07 EFTPOS п\'ятниця', amount: 3295.07 },
      { label: '$11 626,73 EFTPOS субота', amount: 11626.73 },
      { label: '$689 онлайну', amount: 689 },
    ],
    expenses: [
      { label: '$13 334 витрати (ЄЛТН-зетінки)', amount: 13334 },
      { label: '$1 411,10 закупки Буннінгс', amount: 1411.10 },
      { label: '$869 Русяль або не потрібно', amount: 869 },
      { label: '$2 204 контуна нашу на маркет', amount: 2204 },
    ],
    profit: 11018.70,
    note: undefined,
  } as unknown as Event['financial_report'],
  show_volunteer_cta: false,
};

const MOCK_RELATED: Event[] = [MOCK_ACTIVE_EVENT];

// ─── Helpers ─────────────────────────────────────────────────────────────────

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string }[];
};

function renderRichText(doc: unknown): React.ReactNode[] {
  if (!doc || typeof doc !== 'object') return [];
  const root = doc as { content?: TiptapNode[] };
  if (!root.content) return [];

  return root.content.map((node, i) => {
    switch (node.type) {
      case 'heading': {
        const level = (node.attrs?.level as number) ?? 3;
        const text = renderInline(node.content);
        if (level === 2) return <h2 key={i} className="text-h2 mt-8 mb-4 text-text-strong">{text}</h2>;
        return <h3 key={i} className="text-h3 mt-6 mb-3 text-text-strong">{text}</h3>;
      }
      case 'paragraph':
        return <p key={i} className="text-body mb-4 text-text-primary leading-relaxed">{renderInline(node.content)}</p>;
      case 'image':
        return (
          <div key={i} className="relative my-6 aspect-video overflow-hidden rounded-xl">
            <Image src={node.attrs?.src as string} alt={(node.attrs?.alt as string) ?? ''} fill className="object-cover" sizes="(max-width: 768px) 100vw, 720px" />
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
    if (node.type === 'text') {
      const isBold = node.marks?.some((m) => m.type === 'bold');
      if (isBold) return <strong key={i}>{node.text}</strong>;
      return <span key={i}>{node.text}</span>;
    }
    return null;
  });
}

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'ua' ? 'uk-UA' : 'en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(start: string, end: string | null): string {
  if (end) return `${start} – ${end}`;
  return start;
}

import React from 'react';

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
      where: { status: 'ACTIVE' },
      take: 4,
    });
    related = (fetchedRelated as unknown as Event[]).filter((e) => e.slug !== slug);
  } catch {
    // DB not reachable
  }

  // Fallback to mock
  if (!event) {
    if (slug === MOCK_ACTIVE_EVENT.slug) event = MOCK_ACTIVE_EVENT;
    else if (slug === MOCK_ARCHIVED_EVENT.slug) event = MOCK_ARCHIVED_EVENT;
  }

  if (!event) notFound();

  if (related.length === 0) {
    related = MOCK_RELATED.filter((e) => e.slug !== slug).slice(0, 4);
  }

  const titleKey = locale === 'ua' ? 'title_ua' : 'title_en';
  const descKey = locale === 'ua' ? 'description_ua' : 'description_en';
  const infoKey = locale === 'ua' ? 'info_blocks_ua' : 'info_blocks_en';

  const title = event[titleKey];
  const isArchived = event.status === 'archived';
  const infoBlocks = (event[infoKey] as unknown as InfoBlock[]) ?? [];
  const financialReport = event.financial_report as unknown as FinancialReport | null;

  const tagLabels = {
    active: t('events.tag_active'),
    archive: t('events.archive'),
    looking_for_partners: t('events.tag_looking_for_partners'),
    looking_for_volunteers: t('events.tag_looking_for_volunteers'),
  };

  return (
    <>
      {/* ── Breadcrumb ───────────────────────────────────────────── */}
      <section className="border-b border-border bg-white py-3">
        <div className="container-page">
          <nav className="flex flex-wrap items-center gap-1 text-body-sm text-text-secondary">
            <Link href={`/${locale}`} className="hover:text-secondary">
              {t('events.breadcrumb_home')}
            </Link>
            <span className="text-text-secondary/50">&rarr;</span>
            <Link href={`/${locale}/events`} className="hover:text-secondary">
              {t('events.breadcrumb_events')}
            </Link>
            <span className="text-text-secondary/50">&rarr;</span>
            <span className="text-text-strong">{title}</span>
          </nav>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            {!isArchived && <span className="badge-active">{tagLabels.active}</span>}
            {isArchived && <span className="badge-archived">{tagLabels.archive}</span>}
            {event.tags.includes('looking_for_partners') && (
              <span className="badge bg-accent-2 text-secondary">{tagLabels.looking_for_partners}</span>
            )}
            {event.tags.includes('looking_for_volunteers') && (
              <span className="badge bg-accent-4 text-text-strong">{tagLabels.looking_for_volunteers}</span>
            )}
          </div>
        </div>
      </section>

      {/* ── Title + Cover ────────────────────────────────────────── */}
      <section className="bg-white pt-8">
        <div className="container-page">
          <h1 className="text-h2 mb-6 text-text-strong lg:text-[40px] lg:leading-[120%]">
            {title}
          </h1>

          {/* Cover image */}
          <div className="relative mb-6 aspect-video overflow-hidden rounded-2xl bg-secondary-10">
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
              <div className="flex h-full items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-secondary-40 opacity-60" />
              </div>
            )}
          </div>

          {/* Date/time + Location bar */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-primary-20 p-5">
              <p className="text-caption mb-1 uppercase tracking-wide text-text-secondary">
                {t('events.date_time')}
              </p>
              <p className="text-body font-medium text-text-strong">
                {formatDate(event.event_date, locale)}
              </p>
              <p className="text-body-sm text-text-secondary">
                {formatTime(event.start_time, event.end_time)}
              </p>
            </div>
            <div className="rounded-2xl bg-primary-20 p-5">
              <p className="text-caption mb-1 uppercase tracking-wide text-text-secondary">
                {t('events.location')}
              </p>
              <p className="text-body font-medium text-text-strong">{event.location}</p>
              {event.location_map_url && (
                <a
                  href={event.location_map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-sm text-secondary underline"
                >
                  {t('events.view_map')}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Description section ──────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-page">
          <h2 className="text-h2 mb-8 text-text-strong">
            {t('events.charity_event')} &laquo;{title}&raquo;
          </h2>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr]">
            {/* Left: event image */}
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-secondary-10">
              {event.cover_image ? (
                <Image
                  src={event.cover_image}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-secondary-40 opacity-60" />
                </div>
              )}
            </div>

            {/* Right: rich text description */}
            <div className="prose-custom">
              {renderRichText(event[descKey])}
            </div>
          </div>

          {/* Info blocks (3 columns) */}
          {infoBlocks.length > 0 && (
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {infoBlocks.map((block, i) => (
                <div key={i} className="rounded-2xl bg-primary-20 p-6">
                  <h3 className="text-h4 mb-3 text-text-strong">{block.title}</h3>
                  <ul className="space-y-1.5 text-body-sm text-text-secondary">
                    {block.content.map((item, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Share */}
          <ShareSection
            copyLinkLabel={t('events.copy_link')}
            shareLabel={t('events.share')}
          />
        </div>
      </section>

      {/* ── Volunteer CTA (active only) ──────────────────────────── */}
      {!isArchived && event.show_volunteer_cta && (
        <section className="bg-white pb-16">
          <div className="container-page">
            <div className="overflow-hidden rounded-[40px] bg-secondary">
              <div className="grid grid-cols-1 items-center lg:grid-cols-[1fr_1.5fr]">
                {/* Image */}
                <div className="relative min-h-[200px] lg:min-h-70">
                  <Image
                    src="/images/events/events.webp"
                    alt={t('events.volunteer_cta_title')}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
                {/* Content */}
                <div className="p-8 text-white lg:p-12">
                  <h3 className="text-h3 mb-3 font-medium">{t('events.volunteer_cta_title')}</h3>
                  <p className="mb-6 text-body text-white/80">{t('events.volunteer_cta_desc')}</p>
                  <Link
                    href={`/${locale}/contact`}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-body font-medium text-text-strong transition-opacity hover:opacity-90"
                  >
                    {t('events.volunteer_cta_btn')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Financial report (archived only) ─────────────────────── */}
      {isArchived && financialReport && (
        <section className="section bg-bg">
          <div className="container-page">
            <h2 className="text-h2 mb-8 text-center text-text-strong">
              {t('events.reports')}
            </h2>

            <div className="mx-auto max-w-3xl">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Gallery placeholder / images */}
                <div className="space-y-3">
                  {event.gallery_images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {event.gallery_images.map((img, i) => (
                        <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                          <Image src={img} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="200px" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex aspect-4/3 items-center justify-center rounded-xl bg-secondary-10">
                      <div className="h-16 w-16 rounded-full bg-secondary-40 opacity-60" />
                    </div>
                  )}
                </div>

                {/* Financial data */}
                <div className="rounded-2xl bg-white p-6">
                  <h3 className="text-h4 mb-4 text-text-strong">{t('events.we_raised')}</h3>
                  <div className="space-y-2 text-body-sm">
                    {financialReport.income.map((item, i) => (
                      <div key={`i-${i}`} className="flex justify-between">
                        <span className="text-text-secondary">{item.label}</span>
                        <span className="font-medium text-text-strong">${item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="my-3 border-t border-border" />
                    {financialReport.expenses.map((item, i) => (
                      <div key={`e-${i}`} className="flex justify-between">
                        <span className="text-text-secondary">{item.label}</span>
                        <span className="font-medium text-text-strong">-${item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="my-3 border-t border-border" />
                    <div className="flex justify-between text-body font-medium">
                      <span className="text-text-strong">{t('events.profit')}:</span>
                      <span className="text-secondary">${financialReport.profit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery grid (if images) */}
              {event.gallery_images.length > 4 && (
                <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {event.gallery_images.slice(4).map((img, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                      <Image src={img} alt={`Gallery ${i + 5}`} fill className="object-cover" sizes="120px" />
                    </div>
                  ))}
                </div>
              )}

              {/* Thank you */}
              <p className="mt-10 text-center text-h3 italic text-text-strong">
                {t('events.thank_you')}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── More events ──────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="section bg-bg">
          <div className="container-page">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-h2 text-text-strong">{t('events.more_events')}</h2>
              <div className="flex gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {related.slice(0, 4).map((ev) => (
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
            </div>
          </div>
        </section>
      )}

      {/* ── Contact form ─────────────────────────────────────────── */}
      <ContactSection
        title={t('events.contact_title')}
        description={t('events.contact_description')}
      />
    </>
  );
}
