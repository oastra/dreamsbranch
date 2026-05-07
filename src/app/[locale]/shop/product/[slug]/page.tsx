import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { resolveLocaleSlug } from "@/lib/slug";
import { ContactSection } from "@/components/contact/ContactSection";
import { OtherCategoriesSection } from "@/components/shop/OtherCategoriesSection";
import { ProductHero } from "@/components/shop/ProductHero";
import { ProductMission } from "@/components/shop/ProductMission";
import { type ProductCardProduct } from "@/components/shop/ProductCard";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { ShareCard } from "@/components/shop/ShareCard";
import { MOCK_SHOP_PRODUCTS } from "@/lib/mocks/shop";
import type { ShopProduct, ShopSection } from "@/types/database";

// ─── Section ↔ URL slug map ─────────────────────────────────────────────────
// The catalog page maps URL slugs → DB enum values; here we need the inverse
// so the breadcrumb can link back to the section index.

const SECTION_TO_SLUG: Record<ShopSection, string> = {
  handmade: "handmade",
  from_ukraine: "from-ukraine",
  cuisine: "cuisine",
  catering: "catering",
};

const SECTION_TITLE_KEY: Record<
  ShopSection,
  "handmade_title" | "from_ukraine_title" | "cuisine_title" | null
> = {
  handmade: "handmade_title",
  from_ukraine: "from_ukraine_title",
  cuisine: "cuisine_title",
  catering: null,
};

// ─── Data loading ───────────────────────────────────────────────────────────

type ProductDetail = Pick<
  ShopProduct,
  | "id"
  | "slug"
  | "section"
  | "title_ua"
  | "title_en"
  | "description_ua"
  | "description_en"
  | "price_amount"
  | "price_currency"
  | "cover_image"
  | "gallery_images"
>;

async function loadProduct(
  slug: string,
  locale: string,
): Promise<{ product: ProductDetail | null; redirectTo: string | null }> {
  try {
    const { row, redirectTo } = await resolveLocaleSlug(
      db.shopProduct,
      slug,
      locale,
      `/${locale}/shop/product`,
    );
    if (redirectTo) return { product: null, redirectTo };
    if (row) return { product: row as unknown as ProductDetail, redirectTo: null };
  } catch {
    // DB unreachable — fall through to mock lookup.
  }

  const mock = MOCK_SHOP_PRODUCTS.find((p) => p.slug === slug);
  if (!mock) return { product: null, redirectTo: null };
  return {
    product: {
      id: mock.id,
      slug: mock.slug,
      section: mock.section,
      title_ua: mock.title_ua,
      title_en: mock.title_en,
      description_ua: mock.description_ua,
      description_en: mock.description_en,
      price_amount: mock.price_amount,
      price_currency: mock.price_currency,
      cover_image: mock.cover_image,
      gallery_images: mock.gallery_images,
    },
    redirectTo: null,
  };
}

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

type RelatedRow = Pick<
  ShopProduct,
  | "id"
  | "slug"
  | "section"
  | "title_ua"
  | "title_en"
  | "price_amount"
  | "price_currency"
  | "cover_image"
>;

const RELATED_LIMIT = 12;

async function loadRelated(
  section: ShopSection,
  excludeId: string,
): Promise<RelatedRow[]> {
  let rows: RelatedRow[] = [];
  try {
    rows = (await db.shopProduct.findMany({
      where: { section, status: "ACTIVE" },
    })) as unknown as RelatedRow[];
  } catch {
    // DB unreachable — fall back to mocks below.
  }
  if (rows.length === 0) {
    rows = MOCK_SHOP_PRODUCTS.filter((p) => p.section === section).map((p) => ({
      id: p.id,
      slug: p.slug,
      section: p.section,
      title_ua: p.title_ua,
      title_en: p.title_en,
      price_amount: p.price_amount,
      price_currency: p.price_currency,
      cover_image: p.cover_image,
    }));
  }
  return rows.filter((r) => r.id !== excludeId).slice(0, RELATED_LIMIT);
}

function toCardProducts(
  rows: RelatedRow[],
  locale: string,
): ProductCardProduct[] {
  const isUA = locale === "ua";
  return rows.map((r) => ({
    slug: r.slug,
    title: isUA ? r.title_ua : r.title_en,
    price: formatPrice(Number(r.price_amount), r.price_currency, locale),
    coverImage: r.cover_image,
  }));
}

function buildGalleryImages(product: ProductDetail): string[] {
  const out: string[] = [];
  if (product.cover_image) out.push(product.cover_image);
  for (const img of product.gallery_images ?? []) {
    if (img && img !== product.cover_image) out.push(img);
  }
  return out;
}

// ─── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const { product } = await loadProduct(slug, locale);
  if (!product) return {};
  const isUA = locale === "ua";
  const title = isUA ? product.title_ua : product.title_en;
  const description = (isUA ? product.description_ua : product.description_en) ?? undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.cover_image ? [{ url: product.cover_image }] : undefined,
    },
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const { product, redirectTo } = await loadProduct(slug, locale);
  if (redirectTo) redirect(redirectTo);
  if (!product) notFound();

  const t = await getTranslations({ locale });
  const isUA = locale === "ua";

  const title = isUA ? product.title_ua : product.title_en;
  const description = isUA ? product.description_ua : product.description_en;
  const price = formatPrice(
    Number(product.price_amount),
    product.price_currency,
    locale,
  );
  const galleryImages = buildGalleryImages(product);
  const relatedRows = await loadRelated(product.section, product.id);
  const relatedProducts = toCardProducts(relatedRows, locale);

  // Section breadcrumb crumb. `catering` has no titled section page yet, so
  // fall back to the shop index when the section title key is missing.
  const sectionTitleKey = SECTION_TITLE_KEY[product.section];
  const sectionLabel = sectionTitleKey
    ? t(`shop.sections.${sectionTitleKey}`)
    : t("shop.title");
  const sectionHref = sectionTitleKey
    ? `/${locale}/shop/${SECTION_TO_SLUG[product.section]}`
    : `/${locale}/shop`;

  // Build JSON-LD Product schema for SEO.
  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: title,
    description: description ?? undefined,
    image: product.cover_image ? [product.cover_image] : undefined,
    offers: {
      "@type": "Offer",
      price: Number(product.price_amount),
      priceCurrency: product.price_currency,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <ProductHero
        title={title}
        price={price}
        description={description}
        galleryImages={galleryImages}
        breadcrumb={{
          ariaLabel: t("shop.product.breadcrumb_aria"),
          crumbs: [
            { label: t("shop.catalog.breadcrumb_home"), href: `/${locale}` },
            { label: t("shop.catalog.breadcrumb_shop"), href: `/${locale}/shop` },
            { label: sectionLabel, href: sectionHref },
          ],
          current: title,
        }}
        galleryLabels={{
          mainAltTemplate: t("shop.product.gallery_main_alt", { name: title }),
          thumbAltTemplate: t("shop.product.gallery_thumb_alt", {
            name: title,
            index: "{index}",
          }),
          thumbAriaTemplate: t("shop.product.gallery_thumb_aria", {
            index: "{index}",
          }),
        }}
        buyLabels={{
          quantityLabel: t("shop.product.quantity_label"),
          quantityDecrease: t("shop.product.quantity_decrease"),
          quantityIncrease: t("shop.product.quantity_increase"),
          addToCart: t("shop.add_to_cart"),
          payWithPaypal: t("shop.product.pay_with_paypal"),
          orSeparator: t("shop.product.or_separator"),
          paymentMethodsLabel: t("shop.product.payment_methods_label"),
          deliveryTitle: t("shop.product.delivery_title"),
          deliveryDescription: t("shop.product.delivery_description"),
        }}
      />

      <ProductMission
        title={t("shop.product.mission_title")}
        intro={t("shop.product.mission_intro")}
        reasonsTitle={t("shop.product.mission_reasons_title")}
        reasons={[
          t("shop.product.mission_reason_1"),
          t("shop.product.mission_reason_2"),
          t("shop.product.mission_reason_3"),
        ]}
      />

      <ShareCard
        shareTitle={title}
        labels={{
          copyLink: t("shop.product.share_copy_link"),
          copied: t("shop.product.share_copied"),
          shareVia: t("shop.product.share_via"),
          facebookAria: t("shop.product.share_facebook_aria"),
          instagramAria: t("shop.product.share_instagram_aria"),
          whatsappAria: t("shop.product.share_whatsapp_aria"),
          xAria: t("shop.product.share_x_aria"),
        }}
      />

      <RelatedProducts
        locale={locale}
        products={relatedProducts}
        title={t("shop.product.related_title")}
        prevAriaLabel={t("shop.product.related_prev_aria")}
        nextAriaLabel={t("shop.product.related_next_aria")}
        addLabel={t("shop.add_to_cart")}
      />

      <OtherCategoriesSection
        locale={locale}
        currentSection={product.section}
        title={t("shop.other_categories.title")}
        description={t("shop.other_categories.description")}
        labels={{
          handmade: t("shop.offerings.handmade"),
          from_ukraine: t("shop.offerings.from_ukraine"),
          cuisine: t("shop.offerings.ukrainian_cuisine"),
          catering: t("shop.offerings.catering"),
        }}
      />

      <ContactSection
        title={t("shop.contact_title")}
        description={t("shop.contact_description")}
      />
    </>
  );
}
