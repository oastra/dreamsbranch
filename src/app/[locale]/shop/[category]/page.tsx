import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { InfoBanner } from "@/components/shared/InfoBanner";
import {
  CategoryCatalog,
  type CatalogProduct,
} from "@/components/shop/CategoryCatalog";
import { CategoryHero, type CategoryHeroCollage } from "@/components/shop/CategoryHero";
import { OtherCategoriesSection } from "@/components/shop/OtherCategoriesSection";
import { ShopReviewsSection } from "@/components/shop/ShopReviewsSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { MOCK_SHOP_CATEGORIES, MOCK_SHOP_PRODUCTS } from "@/lib/mocks/shop";
import type { ShopCategory, ShopProduct, ShopSection } from "@/types/database";

// ─── Section catalog ─────────────────────────────────────────────────────────
// Maps the URL slug (kebab-case, used in /shop/[category]) to the DB enum
// value, the i18n title key, and the hero collage. Sections without bespoke
// imagery fall back to a checkerboard placeholder.

type SectionConfig = {
  section: ShopSection;
  titleKey: "handmade_title" | "from_ukraine_title" | "cuisine_title";
  collage: CategoryHeroCollage;
};

const SECTION_BY_SLUG: Record<string, SectionConfig> = {
  handmade: {
    section: "handmade",
    titleKey: "handmade_title",
    collage: {
      left: "/images/shop/handmade/sunflower.webp",
      topMiddle: "/images/shop/handmade/colored-tread-dressmaker.webp",
      bottomMiddle: "/images/shop/handmade/shirt-vushivanka.webp",
      right: "/images/shop/handmade/plush-toy.webp",
    },
  },
  "from-ukraine": {
    section: "from_ukraine",
    titleKey: "from_ukraine_title",
    collage: { left: null, topMiddle: null, bottomMiddle: null, right: null },
  },
  cuisine: {
    section: "cuisine",
    titleKey: "cuisine_title",
    collage: { left: null, topMiddle: null, bottomMiddle: null, right: null },
  },
};

function resolveSection(categorySlug: string): SectionConfig | null {
  return SECTION_BY_SLUG[categorySlug] ?? null;
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const config = resolveSection(category);
  if (!config) return {};
  const t = await getTranslations({ locale });
  const title = t(`shop.sections.${config.titleKey}`);
  return {
    title,
    description: t("shop.description"),
  };
}

// ─── Data helpers ────────────────────────────────────────────────────────────

type ProductRow = Pick<
  ShopProduct,
  | "id"
  | "slug"
  | "section"
  | "title_ua"
  | "title_en"
  | "price_amount"
  | "price_currency"
  | "cover_image"
  | "category_id"
>;

type CategoryRow = Pick<ShopCategory, "section" | "slug" | "name_ua" | "name_en">;

function formatPrice(amount: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale === "ua" ? "uk-UA" : "en-AU", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

async function loadCatalogData(section: ShopSection) {
  let products: ProductRow[] = [];
  let categories: CategoryRow[] = [];
  const productCategoryById = new Map<string, string>();

  try {
    const [fetchedProducts, fetchedCategories] = await Promise.all([
      db.shopProduct.findMany({ where: { status: "ACTIVE", section } }),
      db.shopCategory.findMany({ where: { section } }),
    ]);
    products = fetchedProducts as unknown as ProductRow[];
    categories = fetchedCategories as unknown as CategoryRow[];
    for (const c of fetchedCategories as unknown as Array<ShopCategory>) {
      productCategoryById.set(c.id, c.slug);
    }
  } catch {
    // DB unreachable — fall through to mocks.
  }

  if (products.length === 0) {
    products = MOCK_SHOP_PRODUCTS.filter((p) => p.section === section).map((p) => ({
      id: p.id,
      slug: p.slug,
      section: p.section,
      title_ua: p.title_ua,
      title_en: p.title_en,
      price_amount: p.price_amount,
      price_currency: p.price_currency,
      cover_image: p.cover_image,
      category_id: null,
    }));
  }
  if (categories.length === 0) {
    categories = MOCK_SHOP_CATEGORIES.filter((c) => c.section === section);
  }

  return { products, categories, productCategoryById };
}

function buildCatalogProducts(
  products: ProductRow[],
  productCategoryById: Map<string, string>,
  locale: string,
): CatalogProduct[] {
  const titleKey = locale === "ua" ? "title_ua" : "title_en";
  // Mock products carry category_slug directly; for DB rows we resolve via
  // the category_id → slug map.
  const productCategoryBySlugMock = new Map<string, string | null>();
  for (const p of MOCK_SHOP_PRODUCTS) productCategoryBySlugMock.set(p.slug, p.category_slug);

  return products.map((p) => {
    const categorySlug =
      (p.category_id ? productCategoryById.get(p.category_id) : null) ??
      productCategoryBySlugMock.get(p.slug) ??
      null;
    return {
      slug: p.slug,
      title: p[titleKey],
      price: formatPrice(Number(p.price_amount), p.price_currency, locale),
      coverImage: p.cover_image,
      categorySlug,
      priceAmount: Number(p.price_amount),
    };
  });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ShopCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  setRequestLocale(locale);

  const config = resolveSection(category);
  if (!config) notFound();

  const t = await getTranslations({ locale });
  const nameKey = locale === "ua" ? "name_ua" : "name_en";

  const { products, categories, productCategoryById } = await loadCatalogData(config.section);
  const catalogProducts = buildCatalogProducts(products, productCategoryById, locale);
  const catalogCategories = categories.map((c) => ({ value: c.slug, label: c[nameKey] }));

  const title = t(`shop.sections.${config.titleKey}`);

  return (
    <>
      <CategoryHero
        locale={locale}
        title={title}
        productCount={catalogProducts.length}
        collage={config.collage}
        breadcrumbHomeLabel={t("shop.catalog.breadcrumb_home")}
        breadcrumbShopLabel={t("shop.catalog.breadcrumb_shop")}
        productsCountLabel={t("shop.catalog.products_count", {
          count: catalogProducts.length,
        })}
        imageAlt={t("shop.catalog.hero_image_alt", { name: title })}
      />

      <section className="px-5 sm:px-0">
        <div className="sm:container-page sm:max-w-none sm:px-0">
          <InfoBanner tone="primary">{t("shop.profit_notice")}</InfoBanner>
        </div>
      </section>

      <Suspense fallback={null}>
        <CategoryCatalog
          locale={locale}
          products={catalogProducts}
          categories={catalogCategories}
          allLabel={t("shop.all_items")}
          showMoreLabel={t("shop.show_more")}
          addLabel={t("shop.add_to_cart")}
          filtersAriaLabel={t("shop.filters_aria")}
          sortButtonLabel={t("shop.catalog.sort_button")}
          sortAriaAsc={t("shop.catalog.sort_aria_asc")}
          sortAriaDesc={t("shop.catalog.sort_aria_desc")}
          emptyTitle={t("shop.catalog.empty_title")}
          emptyDescription={t("shop.catalog.empty_description")}
          emptyCtaLabel={t("shop.catalog.empty_cta")}
          emptyCtaHref={`/${locale}/shop`}
        />
      </Suspense>

      <OtherCategoriesSection
        locale={locale}
        currentSection={config.section}
        title={t("shop.other_categories.title")}
        description={t("shop.other_categories.description")}
        labels={{
          handmade: t("shop.offerings.handmade"),
          from_ukraine: t("shop.offerings.from_ukraine"),
          cuisine: t("shop.offerings.ukrainian_cuisine"),
          catering: t("shop.offerings.catering"),
        }}
      />

      <ShopReviewsSection locale={locale} />

      <ContactSection
        title={t("shop.contact_title")}
        description={t("shop.contact_description")}
      />
    </>
  );
}
