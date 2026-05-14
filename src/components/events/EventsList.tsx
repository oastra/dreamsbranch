'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { EventCard } from '@/components/events/EventCard';
import { FeaturedEventCard } from '@/components/events/FeaturedEventCard';
import { Button } from '@/components/ui/button';

export type EventListItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  coverImage: string | null;
  tags: string[];
  isArchived: boolean;
  eventDate: string;
  startTime: string;
  endTime: string | null;
  location: string;
  locationMapUrl: string | null;
};

type Filter = 'all' | 'active' | 'archive';

const PAGE_SIZE = 6;
const FILTERS: Filter[] = ['all', 'active', 'archive'];

interface EventsListProps {
  locale: string;
  title: string;
  events: EventListItem[];
  tagLabels: Record<string, string>;
  labels: {
    all: string;
    active: string;
    archive: string;
    showMore: string;
    noEvents: string;
    dateTime: string;
    location: string;
    viewMap: string;
    learnMore: string;
    join: string;
  };
}

export function EventsList({
  locale,
  title,
  events,
  tagLabels,
  labels,
}: EventsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // ── State, persisted in the URL so back-navigation restores it ──────────
  const filterParam = sp.get('filter') as Filter | null;
  const filter: Filter = FILTERS.includes(filterParam as Filter) ? (filterParam as Filter) : 'all';

  const monthParam = sp.get('month');
  const visibleParam = Number(sp.get('visible'));
  const visible = Number.isFinite(visibleParam) && visibleParam > 0 ? visibleParam : PAGE_SIZE;

  const selectedMonth = useMemo(() => {
    if (monthParam) {
      const [y, m] = monthParam.split('-').map(Number);
      if (y && m && m >= 1 && m <= 12) return new Date(y, m - 1, 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, [monthParam]);

  const localeTag = locale === 'ua' ? 'uk-UA' : 'en-AU';
  const monthLabelFull = selectedMonth.toLocaleDateString(localeTag, {
    month: 'long',
    year: 'numeric',
  });
  const monthLabelShort = selectedMonth.toLocaleDateString(localeTag, {
    month: 'long',
  });

  const filtered = useMemo(() => {
    const m = selectedMonth.getMonth();
    const y = selectedMonth.getFullYear();
    return events.filter((ev) => {
      // Archived events ignore the month picker — they're shown regardless
      // so visitors always see them under the featured card. Active events
      // stay month-bounded so the upcoming view doesn't bleed into the past.
      if (filter === 'active') {
        if (ev.isArchived) return false;
        const d = new Date(ev.eventDate);
        return d.getMonth() === m && d.getFullYear() === y;
      }
      if (filter === 'archive') return ev.isArchived;
      // 'all' tab — keep active in the selected month, plus every archived.
      if (ev.isArchived) return true;
      const d = new Date(ev.eventDate);
      return d.getMonth() === m && d.getFullYear() === y;
    });
  }, [events, filter, selectedMonth]);

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const shown = rest.slice(0, visible);
  const hasMore = rest.length > visible;

  // Default values are stripped from the URL so it stays clean.
  function pushUrl(updates: Record<string, string | null>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function changeFilter(next: Filter) {
    pushUrl({
      filter: next === 'all' ? null : next,
      visible: null,
    });
  }

  function changeMonth(delta: number) {
    const nextDate = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + delta,
      1,
    );
    const now = new Date();
    const isCurrentMonth =
      nextDate.getFullYear() === now.getFullYear() &&
      nextDate.getMonth() === now.getMonth();
    const monthStr = isCurrentMonth
      ? null
      : `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    pushUrl({ month: monthStr, visible: null });
  }

  function showMore() {
    pushUrl({ visible: String(visible + PAGE_SIZE) });
  }

  const tabClass = (active: boolean) =>
    `rounded-full px-6 py-2 text-body-sm font-medium transition-colors ${
      active
        ? 'bg-primary text-text-strong'
        : 'bg-primary-40 text-text-strong hover:bg-primary-60'
    }`;

  const renderMonthPill = (extraClass = '') => (
    <div
      className={`flex items-center justify-between gap-2 rounded-full bg-secondary px-2 py-1.5 text-white sm:gap-3 ${extraClass}`}
    >
      <button
        type="button"
        onClick={() => changeMonth(-1)}
        aria-label="Previous month"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-secondary transition-colors hover:bg-grey-40"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span className="px-2 text-body font-medium capitalize whitespace-nowrap">
        <span className="lg:hidden">{monthLabelShort}</span>
        <span className="hidden lg:inline">{monthLabelFull}</span>
      </span>
      <button
        type="button"
        onClick={() => changeMonth(1)}
        aria-label="Next month"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-secondary transition-colors hover:bg-grey-40"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );

  const tabsRow = (
    <div className="flex flex-wrap justify-center gap-3 md:justify-start">
      <button type="button" onClick={() => changeFilter('all')} className={tabClass(filter === 'all')}>
        {labels.all}
      </button>
      <button type="button" onClick={() => changeFilter('active')} className={tabClass(filter === 'active')}>
        {labels.active}
      </button>
      <button type="button" onClick={() => changeFilter('archive')} className={tabClass(filter === 'archive')}>
        {labels.archive}
      </button>
    </div>
  );

  return (
    <>
      {/* Title — centered on mobile/tablet, left-aligned on desktop.
          On desktop the month pill sits on the same row to the right. */}
      <div className="mb-4 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-h2 text-center text-text-strong lg:text-left">
          {title}
        </h2>
        <div className="hidden lg:block">{renderMonthPill()}</div>
      </div>

      {/* Mobile-only: month pill centered between title and tabs */}
      <div className="mb-4 flex justify-center md:hidden">
        {renderMonthPill('min-w-[200px] justify-center')}
      </div>

      {/* Tabs row.
          Mobile: tabs centered (alone — pill is above).
          Tablet: tabs left + month pill right on the same row.
          Desktop: tabs alone (pill is in title row above). */}
      <div className="mb-6 flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between lg:justify-start">
        {tabsRow}
        <div className="hidden md:block lg:hidden">{renderMonthPill()}</div>
      </div>

      {/* Featured event (first event of the filtered list) */}
      {featured && (
        <div className="mb-6 lg:mb-10">
          <FeaturedEventCard
            slug={featured.slug}
            locale={locale}
            title={featured.title}
            description={featured.subtitle}
            coverImage={featured.coverImage}
            eventDate={featured.eventDate}
            startTime={featured.startTime}
            endTime={featured.endTime}
            location={featured.location}
            locationMapUrl={featured.locationMapUrl}
            tags={featured.tags}
            isArchived={featured.isArchived}
            tagLabels={tagLabels}
            dateTimeLabel={labels.dateTime}
            locationLabel={labels.location}
            viewMapLabel={labels.viewMap}
            learnMoreLabel={labels.learnMore}
            joinLabel={labels.join}
          />
        </div>
      )}

      {/* Grid wrapper with light blue section background */}
      {(rest.length > 0 || !featured) && (
        <div className="rounded-3xl bg-secondary-10 p-4 sm:p-6 lg:p-8">
          {shown.length === 0 ? (
            <p className="py-12 text-center text-body text-text-secondary">
              {labels.noEvents}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {shown.map((ev) => (
                <EventCard
                  key={ev.id}
                  slug={ev.slug}
                  locale={locale}
                  title={ev.title}
                  subtitle={ev.subtitle}
                  coverImage={ev.coverImage}
                  tags={ev.tags}
                  isArchived={ev.isArchived}
                  tagLabels={tagLabels}
                />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                onClick={showMore}
                size="xl"
                shape="pill"
                className="w-70 max-w-full"
              >
                {labels.showMore}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
