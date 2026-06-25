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

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
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
  const localeTag = locale === 'ua' ? 'uk-UA' : 'en-AU';

  // ── State, persisted in the URL so back-navigation restores it ──────────
  const filterParam = sp.get('filter') as Filter | null;
  const filter: Filter = FILTERS.includes(filterParam as Filter)
    ? (filterParam as Filter)
    : 'all';

  const visibleParam = Number(sp.get('visible'));
  const visible =
    Number.isFinite(visibleParam) && visibleParam > 0 ? visibleParam : PAGE_SIZE;

  // Events for the active tab (date-agnostic) — drives both the available
  // periods and the rendered list, so the date pickers stay consistent with
  // whichever tab is selected.
  const tabEvents = useMemo(
    () =>
      events.filter((ev) => {
        if (filter === 'active') return !ev.isArchived;
        if (filter === 'archive') return ev.isArchived;
        return true;
      }),
    [events, filter],
  );

  // Years that actually have events in this tab — so the picker never offers
  // an empty period. Most-recent first.
  const availableYears = useMemo(() => {
    const ys = new Set<number>();
    for (const ev of tabEvents) ys.add(new Date(ev.eventDate).getFullYear());
    return [...ys].sort((a, b) => b - a);
  }, [tabEvents]);

  const yearParam = Number(sp.get('year'));
  const selectedYear = availableYears.includes(yearParam) ? yearParam : null;

  // Populated months within the selected year (ascending).
  const availableMonths = useMemo(() => {
    if (selectedYear == null) return [];
    const ms = new Set<number>();
    for (const ev of tabEvents) {
      const d = new Date(ev.eventDate);
      if (d.getFullYear() === selectedYear) ms.add(d.getMonth());
    }
    return [...ms].sort((a, b) => a - b);
  }, [tabEvents, selectedYear]);

  const monthParamRaw = sp.get('month');
  const monthParam = monthParamRaw == null ? null : Number(monthParamRaw);
  const selectedMonth =
    selectedYear != null &&
    monthParam != null &&
    availableMonths.includes(monthParam)
      ? monthParam
      : null;

  // Narrow by the chosen period, then order by relevance: upcoming events
  // soonest-first, then past events most-recent-first. The first item becomes
  // the featured card — so it's always the next upcoming event, or (on the
  // Archive tab / once everything's past) the most recent one.
  const sorted = useMemo(() => {
    const inPeriod = tabEvents.filter((ev) => {
      if (selectedYear == null) return true;
      const d = new Date(ev.eventDate);
      if (d.getFullYear() !== selectedYear) return false;
      if (selectedMonth != null && d.getMonth() !== selectedMonth) return false;
      return true;
    });
    const upcoming = inPeriod
      .filter((e) => !e.isArchived)
      .sort(
        (a, b) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
      );
    const past = inPeriod
      .filter((e) => e.isArchived)
      .sort(
        (a, b) =>
          new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
      );
    return [...upcoming, ...past];
  }, [tabEvents, selectedYear, selectedMonth]);

  const featured = sorted[0];
  const rest = sorted.slice(1);
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
    // Reset the period when switching tabs so the new tab opens on its full
    // set (e.g. Archive → every past event, newest first).
    pushUrl({
      filter: next === 'all' ? null : next,
      year: null,
      month: null,
      visible: null,
    });
  }

  function changeYear(value: string) {
    pushUrl({ year: value || null, month: null, visible: null });
  }

  function changeMonth(value: string) {
    pushUrl({ month: value === '' ? null : value, visible: null });
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

  const allYearsLabel = locale === 'ua' ? 'Усі роки' : 'All years';
  const allMonthsLabel = locale === 'ua' ? 'Усі місяці' : 'All months';
  const monthName = (m: number) => {
    const s = new Date(2020, m, 1).toLocaleDateString(localeTag, {
      month: 'long',
    });
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const selectClass =
    'appearance-none rounded-full bg-secondary-10 py-2 pl-4 pr-9 text-body-sm font-medium text-text-strong outline-none transition-colors hover:bg-secondary-20 focus-visible:ring-2 focus-visible:ring-secondary';

  return (
    <>
      <h2 className="text-title-tablet mb-4 text-center font-medium text-text-strong md:text-left">
        {title}
      </h2>

      {/* Controls — tabs (what) on the left, period pickers (when) on the
          right; stacks on mobile. The pickers only list periods that have
          events and apply to whichever tab is active. */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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

        {availableYears.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 md:justify-end">
            <div className="relative">
              <select
                value={selectedYear ?? ''}
                onChange={(e) => changeYear(e.target.value)}
                aria-label={locale === 'ua' ? 'Рік' : 'Year'}
                className={selectClass}
              >
                <option value="">{allYearsLabel}</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-strong" />
            </div>

            {selectedYear != null && availableMonths.length > 0 && (
              <div className="relative">
                <select
                  value={selectedMonth ?? ''}
                  onChange={(e) => changeMonth(e.target.value)}
                  aria-label={locale === 'ua' ? 'Місяць' : 'Month'}
                  className={selectClass}
                >
                  <option value="">{allMonthsLabel}</option>
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {monthName(m)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-strong" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Featured event — next upcoming, or most-recent on the Archive tab */}
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
