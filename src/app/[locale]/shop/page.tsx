import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { PageHeroWithCarousel } from "@/components/shared/PageHeroWithCarousel";
import { MarqueeBanner } from "@/components/shared/MarqueeBanner";
import { CategoryCard } from "@/components/shop/CategoryCard";
import { ProductSection } from "@/components/shop/ProductSection";
import { CateringSection } from "@/components/shop/CateringSection";
import { PhotoReportSection } from "@/components/shop/PhotoReportSection";
import type { PhotoReportCardData } from "@/components/shop/PhotoReportCard";
import { ContactSection } from "@/components/contact/ContactSection";
import HandmadeIcon from "@/components/icons/HandmadeIcon";
import FromUAIcon from "@/components/icons/FromUAIcon";
import FoodIcon from "@/components/icons/FoodIcon";
import FoodPlateIcon from "@/components/icons/FoodPlateIcon";
import type {
  ShopCategory,
  ShopPhotoReport,
  ShopProduct,
  ShopSection,
} from "@/types/database";

const HERO_SLIDES = [{ src: "/images/shop/varenuky.webp", alt: "" }];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

type ProductRow = Pick<
  ShopProduct,
  "slug" | "section" | "title_ua" | "title_en" | "price_amount" | "price_currency" | "cover_image"
> & { category_id?: string | null; category_slug?: string | null };

type CategoryRow = Pick<ShopCategory, "section" | "slug" | "name_ua" | "name_en">;

function buildSectionData(
  section: ShopSection,
  locale: string,
  products: ProductRow[],
  categories: CategoryRow[],
  productCategoryById: Map<string, string>,
) {
  const titleKey = locale === "ua" ? "title_ua" : "title_en";
  const nameKey = locale === "ua" ? "name_ua" : "name_en";

  const sectionProducts = products
    .filter((p) => p.section === section)
    .map((p) => ({
      slug: p.slug,
      title: p[titleKey],
      price: formatPrice(Number(p.price_amount), p.price_currency, locale),
      coverImage: p.cover_image,
      categorySlug:
        p.category_slug ??
        (p.category_id ? productCategoryById.get(p.category_id) ?? null : null),
    }));

  const sectionCategories = categories
    .filter((c) => c.section === section)
    .map((c) => ({ value: c.slug, label: c[nameKey] }));

  return { products: sectionProducts, categories: sectionCategories };
}

// ─── Page ────────────────────────────────────────────────────────────────────

// Products are edited in admin and seeded directly — re-fetch periodically
// so DB changes appear without a redeploy (admin edits also revalidate
// on-demand). Without this the page is fully static / frozen at build.
export const revalidate = 300;

export default async function ShopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  let products: ProductRow[] = [];
  let categories: CategoryRow[] = [];
  let photoReports: Array<Pick<ShopPhotoReport, "slug" | "title_ua" | "title_en" | "images">> = [];
  const productCategoryById = new Map<string, string>();

  try {
    const [fetchedProducts, fetchedCategories, fetchedReports] = await Promise.all([
      db.shopProduct.findMany({ where: { status: "ACTIVE" } }),
      db.shopCategory.findMany(),
      db.shopPhotoReport.findMany({ where: { status: "ACTIVE" } }),
    ]);
    products = fetchedProducts as unknown as ProductRow[];
    categories = fetchedCategories as unknown as CategoryRow[];
    photoReports = fetchedReports as unknown as typeof photoReports;
    for (const c of fetchedCategories as unknown as Array<ShopCategory>) {
      productCategoryById.set(c.id, c.slug);
    }
  } catch {
    // DB unreachable — render with whatever loaded (possibly empty).
  }

  const reportTitleKey = locale === "ua" ? "title_ua" : "title_en";
  const photoReportCards: PhotoReportCardData[] = photoReports.map((r) => ({
    slug: r.slug,
    title: r[reportTitleKey],
    images: r.images,
  }));

  const handmade = buildSectionData("handmade", locale, products, categories, productCategoryById);
  const fromUkraine = buildSectionData("from_ukraine", locale, products, categories, productCategoryById);
  const cuisine = buildSectionData("cuisine", locale, products, categories, productCategoryById);

  // SEO: ItemList of all visible products
  const titleKey = locale === "ua" ? "title_ua" : "title_en";
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("shop.title"),
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p[titleKey],
        url: `/${locale}/shop/product/${p.slug}`,
        ...(p.cover_image ? { image: p.cover_image } : {}),
        offers: {
          "@type": "Offer",
          price: p.price_amount,
          priceCurrency: p.price_currency,
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <PageHeroWithCarousel title={t("shop.title")} slides={HERO_SLIDES}>
        <div className="flex flex-col items-center gap-8 lg:items-start">
          <p className="max-w-xl text-center text-body whitespace-pre-line text-text-primary lg:text-left">
            {t("shop.description")}
          </p>

          <Link
            href={`/${locale}/shop#offerings`}
            className="inline-flex h-[54px] min-w-[240px] items-center justify-center rounded-full bg-secondary px-10 text-body font-medium text-white transition-opacity hover:opacity-90"
          >
            {t("shop.cta")}
          </Link>
        </div>
      </PageHeroWithCarousel>

      <MarqueeBanner text={t("shop.profit_notice")} />

      <section id="offerings" className="section">
        <div className="container-page">
          <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-12">
            <h2 className="text-title-tablet mb-4 text-text-strong">
              {t("shop.offerings.title")}
            </h2>
            <p className="text-body whitespace-pre-line text-text-primary">
              {t("shop.offerings.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <CategoryCard
              title={t("shop.offerings.handmade")}
              href={`/${locale}/shop/handmade`}
              bgClass="bg-[#FCF3C3]"
              hoverBgClass="hover:bg-[#FFF0A2]"
              activeBgClass="active:bg-[#FFE664]"
              icon={<HandmadeIcon size={96} />}
            />
            <CategoryCard
              title={t("shop.offerings.from_ukraine")}
              href={`/${locale}/shop/from-ukraine`}
              bgClass="bg-[#BDD8F7]"
              hoverBgClass="hover:bg-[#93C3FA]"
              activeBgClass="active:bg-[#5DA4F5]"
              icon={<FromUAIcon size={96} />}
            />
            <CategoryCard
              title={t("shop.offerings.ukrainian_cuisine")}
              href={`/${locale}/shop/cuisine`}
              bgClass="bg-[#CBFACF]"
              hoverBgClass="hover:bg-[#9FEEA5]"
              activeBgClass="active:bg-[#68EC73]"
              icon={<FoodIcon size={96} />}
            />
            <CategoryCard
              title={t("shop.offerings.catering")}
              href={`/${locale}/shop/catering`}
              bgClass="bg-[#DBDDFF]"
              hoverBgClass="hover:bg-[#B3B6F6]"
              activeBgClass="active:bg-[#B3B6F6]"
              icon={<FoodPlateIcon size={96} />}
            />
          </div>
        </div>
      </section>

      <ProductSection
        id="handmade"
        locale={locale}
        title={t("shop.sections.handmade_title")}
        products={handmade.products}
        categories={handmade.categories}
        allLabel={t("shop.all_items")}
        showMoreLabel={t("shop.show_more")}
        emptyLabel={t("shop.no_products")}
        addLabel={t("shop.add_to_cart")}
        filtersAriaLabel={t("shop.filters_aria")}
        tone="tinted"
      />

      <ProductSection
        id="from-ukraine"
        locale={locale}
        title={t("shop.sections.from_ukraine_title")}
        products={fromUkraine.products}
        categories={fromUkraine.categories}
        allLabel={t("shop.all_items")}
        showMoreLabel={t("shop.show_more")}
        emptyLabel={t("shop.no_products")}
        addLabel={t("shop.add_to_cart")}
        filtersAriaLabel={t("shop.filters_aria")}
        tone="light"
      />

      <ProductSection
        id="cuisine"
        locale={locale}
        title={t("shop.sections.cuisine_title")}
        products={cuisine.products}
        categories={cuisine.categories}
        allLabel={t("shop.all_items")}
        showMoreLabel={t("shop.show_more")}
        emptyLabel={t("shop.no_products")}
        addLabel={t("shop.add_to_cart")}
        filtersAriaLabel={t("shop.filters_aria")}
        tone="tinted"
      />


      

      <PhotoReportSection
        id="photo-reports"
        title={t("shop.photo_reports.title")}
        subtitle={t("shop.photo_reports.subtitle")}
        allReportsLabel={t("shop.photo_reports.all_reports")}
        allReportsHref={`/${locale}/reports`}
        reports={photoReportCards}
        prevLabel={t("shop.photo_reports.prev")}
        nextLabel={t("shop.photo_reports.next")}
      />

      <CateringSection
        id="catering"
        title={t("shop.catering.title")}
        description={t("shop.catering.description")}
        whatWeOfferLabel={t("shop.catering.what_we_offer")}
        items={[
          t("shop.catering.item_appetizers"),
          t("shop.catering.item_hot"),
          t("shop.catering.item_sweet"),
          t("shop.catering.item_custom"),
        ]}
        ctaLabel={t("shop.catering.cta")}
        ctaHref={`/${locale}/shop/catering`}
        imageSrc="/images/shop/catering.webp"
        imageAlt={t("shop.catering.image_alt")}
      />

      <ContactSection
        title={t("shop.contact_title")}
        description={t("shop.contact_description")}
      />
    </>
  );
}
