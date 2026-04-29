"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownNarrowWide, ArrowDownWideNarrow } from "lucide-react";
import { ProductCard, type ProductCardProduct } from "./ProductCard";
import { FilterPills, type FilterOption } from "./FilterPills";

const ALL_VALUE = "__all__";
const PAGE_SIZE = 4;

type Sort = "asc" | "desc";

export type CatalogProduct = ProductCardProduct & {
  categorySlug: string | null;
  priceAmount: number;
};

type Props = {
  locale: string;
  products: CatalogProduct[];
  categories: FilterOption[];
  // i18n labels
  allLabel: string;
  showMoreLabel: string;
  addLabel: string;
  filtersAriaLabel: string;
  sortButtonLabel: string;
  sortAriaAsc: string;
  sortAriaDesc: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyCtaLabel: string;
  emptyCtaHref: string;
};

export function CategoryCatalog({
  locale,
  products,
  categories,
  allLabel,
  showMoreLabel,
  addLabel,
  filtersAriaLabel,
  sortButtonLabel,
  sortAriaAsc,
  sortAriaDesc,
  emptyTitle,
  emptyDescription,
  emptyCtaLabel,
  emptyCtaHref,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_VALUE);
  const [sort, setSort] = useState<Sort>("asc");
  const [visible, setVisible] = useState<number>(PAGE_SIZE);

  const filterOptions: FilterOption[] = useMemo(
    () => [{ value: ALL_VALUE, label: allLabel }, ...categories],
    [allLabel, categories],
  );

  const items = useMemo(() => {
    const filtered =
      activeCategory === ALL_VALUE
        ? products
        : products.filter((p) => p.categorySlug === activeCategory);
    return [...filtered].sort((a, b) =>
      sort === "asc" ? a.priceAmount - b.priceAmount : b.priceAmount - a.priceAmount,
    );
  }, [products, activeCategory, sort]);

  const shown = items.slice(0, visible);
  const hasMore = visible < items.length;

  function handleFilterChange(next: string) {
    setActiveCategory(next);
    setVisible(PAGE_SIZE);
  }

  function toggleSort() {
    setSort((current) => (current === "asc" ? "desc" : "asc"));
    setVisible(PAGE_SIZE);
  }

  const SortIcon = sort === "asc" ? ArrowDownNarrowWide : ArrowDownWideNarrow;
  const sortAriaLabel = sort === "asc" ? sortAriaAsc : sortAriaDesc;

  return (
    <section className="section bg-white" aria-label={filtersAriaLabel}>
      <div className="container-page">
        {/* ── Filter row ────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-4 lg:mb-10 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          <div className="min-w-0 flex-1">
            {filterOptions.length > 1 && (
              <FilterPills
                options={filterOptions}
                value={activeCategory}
                onChange={handleFilterChange}
                ariaLabel={filtersAriaLabel}
              />
            )}
          </div>

          {/* ── Sort toggle (asc ↔ desc) ────────────────────────── */}
          <button
            type="button"
            onClick={toggleSort}
            aria-label={sortAriaLabel}
            aria-pressed={sort === "desc"}
            className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-full bg-secondary px-5 text-body-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <SortIcon size={16} strokeWidth={2} aria-hidden />
            <span>{sortButtonLabel}</span>
          </button>
        </div>

        {/* ── Grid ──────────────────────────────────────────────── */}
        {shown.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            ctaLabel={emptyCtaLabel}
            ctaHref={emptyCtaHref}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {shown.map((p) => (
                <ProductCard key={p.slug} locale={locale} product={p} addLabel={addLabel} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center sm:mt-10">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-secondary px-8 text-body font-medium text-white transition-opacity hover:opacity-90"
                >
                  {showMoreLabel}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center">
      <h3 className="text-h3 font-semibold text-text-strong">{title}</h3>
      <p className="text-body text-text-secondary">{description}</p>
      <Link
        href={ctaHref}
        className="mt-2 inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-secondary px-8 text-body font-medium text-white transition-opacity hover:opacity-90"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
