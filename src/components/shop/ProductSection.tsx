"use client";

import { useMemo, useState } from "react";
import { ProductCard, type ProductCardProduct } from "./ProductCard";
import { FilterPills, type FilterOption } from "./FilterPills";

const ALL_VALUE = "__all__";
const PAGE_SIZE = 4;

type Tone = "light" | "tinted";

type SectionProduct = ProductCardProduct & { categorySlug: string | null };

type Props = {
  id: string;
  locale: string;
  title: string;
  products: SectionProduct[];
  categories: FilterOption[];
  allLabel: string;
  showMoreLabel: string;
  emptyLabel: string;
  addLabel: string;
  filtersAriaLabel: string;
  tone?: Tone;
};

const TONE_BG: Record<Tone, string> = {
  light: "bg-white",
  tinted: "bg-secondary-10",
};

export function ProductSection({
  id,
  locale,
  title,
  products,
  categories,
  allLabel,
  showMoreLabel,
  emptyLabel,
  addLabel,
  filtersAriaLabel,
  tone = "light",
}: Props) {
  const [active, setActive] = useState<string>(ALL_VALUE);
  const [visible, setVisible] = useState<number>(PAGE_SIZE);

  const options: FilterOption[] = useMemo(
    () => [{ value: ALL_VALUE, label: allLabel }, ...categories],
    [allLabel, categories],
  );

  const filtered = useMemo(() => {
    if (active === ALL_VALUE) return products;
    return products.filter((p) => p.categorySlug === active);
  }, [active, products]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  function handleFilterChange(next: string) {
    setActive(next);
    setVisible(PAGE_SIZE);
  }

  return (
    <section id={id} className={`section ${TONE_BG[tone]}`} aria-labelledby={`${id}-title`}>
      <div className="container-page">
        <h2
          id={`${id}-title`}
          className="text-h2 mb-6 text-text-strong sm:mb-8 lg:mb-10"
        >
          {title}
        </h2>

        {options.length > 1 && (
          <div className="mb-6 sm:mb-8">
            <FilterPills
              options={options}
              value={active}
              onChange={handleFilterChange}
              ariaLabel={filtersAriaLabel}
            />
          </div>
        )}

        {shown.length === 0 ? (
          <p className="py-8 text-center text-text-secondary">{emptyLabel}</p>
        ) : (
          <>
            <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0 lg:gap-6">
              {shown.map((p) => (
                <div key={p.slug} className="snap-start">
                  <ProductCard locale={locale} product={p} addLabel={addLabel} />
                </div>
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
