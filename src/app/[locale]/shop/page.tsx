import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { PageHeroHeading } from "@/components/shared/PageHeroHeading";
import { MaskedImageCarousel } from "@/components/shared/MaskedImageCarousel";
import { InfoBanner } from "@/components/shared/InfoBanner";
import { CategoryCard } from "@/components/shop/CategoryCard";
import { ProductSection } from "@/components/shop/ProductSection";
import { CateringSection } from "@/components/shop/CateringSection";
import { PhotoReportSection } from "@/components/shop/PhotoReportSection";
import type { PhotoReportCardData } from "@/components/shop/PhotoReportCard";
import { SupportSection } from "@/components/shared/SupportSection";
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

// ─── Mock data (shown when Supabase returns no products) ─────────────────────

type MockProduct = Pick<
  ShopProduct,
  | "id"
  | "slug"
  | "section"
  | "title_ua"
  | "title_en"
  | "price_amount"
  | "price_currency"
  | "cover_image"
> & { category_slug: string | null };

const MOCK_CATEGORIES: Array<Pick<ShopCategory, "section" | "slug" | "name_ua" | "name_en">> = [
  { section: "handmade",     slug: "jewelry",    name_ua: "Прикраси",        name_en: "Jewelry" },
  { section: "handmade",     slug: "dolls",      name_ua: "Ляльки",          name_en: "Dolls" },
  { section: "handmade",     slug: "home",       name_ua: "Для дому",        name_en: "For home" },
  { section: "handmade",     slug: "gifts",      name_ua: "На подарунок",    name_en: "Gifts" },
  { section: "from_ukraine", slug: "souvenirs",  name_ua: "Сувеніри",        name_en: "Souvenirs" },
  { section: "from_ukraine", slug: "vyshyvanky", name_ua: "Вишиванки",       name_en: "Embroidered" },
  { section: "from_ukraine", slug: "gifts",      name_ua: "На подарунок",    name_en: "Gifts" },
  { section: "cuisine",      slug: "varenyky",   name_ua: "Вареники",        name_en: "Varenyky" },
  { section: "cuisine",      slug: "holubtsi",   name_ua: "Домашні голубці", name_en: "Holubtsi" },
  { section: "cuisine",      slug: "mlyntsi",    name_ua: "Млинці",          name_en: "Mlyntsi" },
];

const MOCK_PRODUCTS: MockProduct[] = [
  // Handmade
  { id: "h1", slug: "beaded-flower-necklace", section: "handmade", title_ua: "Намисто з бісеру",  title_en: "Beaded necklace",  price_amount: 45, price_currency: "AUD", cover_image: null, category_slug: "jewelry" },
  { id: "h2", slug: "pink-quartz-beads",      section: "handmade", title_ua: "Намисто з кварцу",  title_en: "Quartz beads",     price_amount: 60, price_currency: "AUD", cover_image: null, category_slug: "jewelry" },
  { id: "h3", slug: "yellow-bead-earrings",   section: "handmade", title_ua: "Сережки з бісеру",  title_en: "Beaded earrings",  price_amount: 25, price_currency: "AUD", cover_image: null, category_slug: "jewelry" },
  { id: "h4", slug: "purple-stone-necklace",  section: "handmade", title_ua: "Намисто з каменю",  title_en: "Stone necklace",   price_amount: 70, price_currency: "AUD", cover_image: null, category_slug: "gifts" },
  // From Ukraine
  { id: "u1", slug: "embroidered-kerchief",   section: "from_ukraine", title_ua: "Вишита хустка",      title_en: "Embroidered kerchief", price_amount: 35, price_currency: "AUD", cover_image: null, category_slug: "vyshyvanky" },
  { id: "u2", slug: "ukrainian-souvenir-set", section: "from_ukraine", title_ua: "Сувенірний набір",   title_en: "Souvenir set",         price_amount: 50, price_currency: "AUD", cover_image: null, category_slug: "souvenirs" },
  { id: "u3", slug: "gift-box-ukraine",       section: "from_ukraine", title_ua: "Подарунковий набір", title_en: "Gift box",             price_amount: 80, price_currency: "AUD", cover_image: null, category_slug: "gifts" },
  { id: "u4", slug: "magnet-collection",      section: "from_ukraine", title_ua: "Колекція магнітів",  title_en: "Magnet collection",    price_amount: 20, price_currency: "AUD", cover_image: null, category_slug: "souvenirs" },
  // Cuisine
  { id: "c1", slug: "varenyky-cherry",  section: "cuisine", title_ua: "Вареники з вишнею",    title_en: "Cherry varenyky",  price_amount: 18, price_currency: "AUD", cover_image: "/images/shop/varenuky.webp", category_slug: "varenyky" },
  { id: "c2", slug: "varenyky-potato",  section: "cuisine", title_ua: "Вареники з картоплею", title_en: "Potato varenyky",  price_amount: 16, price_currency: "AUD", cover_image: "/images/shop/varenuky.webp", category_slug: "varenyky" },
  { id: "c3", slug: "holubtsi-classic", section: "cuisine", title_ua: "Голубці класичні",     title_en: "Classic holubtsi", price_amount: 22, price_currency: "AUD", cover_image: null, category_slug: "holubtsi" },
  { id: "c4", slug: "mlyntsi-cheese",   section: "cuisine", title_ua: "Млинці з сиром",       title_en: "Cheese mlyntsi",   price_amount: 14, price_currency: "AUD", cover_image: null, category_slug: "mlyntsi" },
];

const MOCK_PHOTO_REPORTS: Array<Pick<ShopPhotoReport, "slug" | "title_ua" | "title_en" | "images">> = [
  {
    slug: "ecoflow-delta-3-april-2026",
    title_ua: "EcoFlow Delta 3 1500",
    title_en: "EcoFlow Delta 3 1500",
    images: [
      { url: "/images/photoReport/product-01.webp", kind: "product", position: 1 },
      { url: "/images/photoReport/product-02.webp", kind: "product", position: 2 },
      { url: "/images/photoReport/product-03.webp", kind: "product", position: 3 },
      { url: "/images/photoReport/proof-01.webp",   kind: "proof",   position: 1 },
      { url: "/images/photoReport/proof-02.webp",   kind: "proof",   position: 2 },
      { url: "/images/photoReport/chat-01.webp",    kind: "chat",    position: 1 },
    ],
  },
];

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
    // DB unreachable — fall through to mocks
  }

  if (products.length === 0) products = MOCK_PRODUCTS;
  if (categories.length === 0) categories = MOCK_CATEGORIES;
  if (photoReports.length === 0) photoReports = MOCK_PHOTO_REPORTS;

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

      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-stretch lg:gap-12 xl:gap-16">
            <PageHeroHeading
              title={t("shop.title")}
              className="text-center lg:col-start-1 lg:row-start-1 lg:self-end lg:text-left"
              titleClassName="mb-title-gap"
            />

            <div className="aspect-[716/500] lg:aspect-auto lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-full">
              <MaskedImageCarousel
                slides={HERO_SLIDES}
                aspectRatio={null}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full"
              />
            </div>

            <div className="flex flex-col items-center gap-8 lg:col-start-1 lg:row-start-2 lg:items-start lg:self-start">
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
          </div>
        </div>
      </section>

      <section className="px-5 sm:px-0">
        <div className="sm:container-page sm:max-w-none sm:px-0">
          <InfoBanner tone="primary">{t("shop.profit_notice")}</InfoBanner>
        </div>
      </section>

      <section id="offerings" className="section">
        <div className="container-page">
          <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-12">
            <h2 className="text-h2 mb-4 text-text-strong">
              {t("shop.offerings.title")}
            </h2>
            <p className="text-body whitespace-pre-line text-text-primary">
              {t("shop.offerings.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <CategoryCard
              title={t("shop.offerings.handmade")}
              href={`/${locale}/shop#handmade`}
              bgClass="bg-[#FCF3C3]"
              hoverBgClass="hover:bg-[#FFF0A2]"
              activeBgClass="active:bg-[#FFE664]"
              icon={<HandmadeIcon size={96} />}
            />
            <CategoryCard
              title={t("shop.offerings.from_ukraine")}
              href={`/${locale}/shop#from-ukraine`}
              bgClass="bg-[#BDD8F7]"
              hoverBgClass="hover:bg-[#93C3FA]"
              activeBgClass="active:bg-[#5DA4F5]"
              icon={<FromUAIcon size={96} />}
            />
            <CategoryCard
              title={t("shop.offerings.ukrainian_cuisine")}
              href={`/${locale}/shop#cuisine`}
              bgClass="bg-[#CBFACF]"
              hoverBgClass="hover:bg-[#9FEEA5]"
              activeBgClass="active:bg-[#68EC73]"
              icon={<FoodIcon size={96} />}
            />
            <CategoryCard
              title={t("shop.offerings.catering")}
              href={`/${locale}/shop#catering`}
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
        ctaHref={`/${locale}/contact?topic=catering`}
        imageSrc="/images/shop/catering.webp"
        imageAlt={t("shop.catering.image_alt")}
      />
      <SupportSection locale={locale} />

      <ContactSection
        title={t("shop.contact_title")}
        description={t("shop.contact_description")}
      />
    </>
  );
}
