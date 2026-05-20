import { ReviewsCarousel, type Review } from "@/components/shop/ReviewsCarousel";
import { MOCK_SHOP_REVIEWS } from "@/lib/mocks/shop-reviews";
import { db } from "@/lib/db";
import type { ShopReview, ShopSection } from "@/types/database";
import { getTranslations } from "next-intl/server";

type Props = {
  locale: string;
  /**
   * Restrict to reviews scoped to this section. When set, only reviews
   * with `section = <value>` are shown — section-less ("All shop pages")
   * reviews are excluded. When omitted, the section falls back to its
   * legacy behaviour: show every review.
   */
  section?: ShopSection;
};

type ReviewSource = {
  id: string;
  name_ua: string;
  name_en: string;
  role_ua: string | null;
  role_en: string | null;
  quote_ua: string;
  quote_en: string;
  rating: number;
  avatar: string | null;
};

export async function ShopReviewsSection({ locale, section }: Props) {
  const t = await getTranslations({ locale });

  // Try DB first; fall back to mocks if empty/unreachable.
  let source: ReviewSource[] = [];
  try {
    const where: Record<string, unknown> = { status: "ACTIVE" };
    if (section) where.section = section;
    const fetched = (await db.shopReview.findMany({
      where,
    })) as unknown as ShopReview[];
    source = fetched.map((r) => ({
      id: r.id,
      name_ua: r.name_ua,
      name_en: r.name_en,
      role_ua: r.role_ua,
      role_en: r.role_en,
      quote_ua: r.quote_ua,
      quote_en: r.quote_en,
      rating: r.rating,
      avatar: r.avatar,
    }));
  } catch {
    // DB unreachable — fall through.
  }

  // Only fall back to mocks for the legacy "all sections" mode. When a
  // specific section is requested, an empty result means "no reviews
  // scoped here yet" — show nothing rather than unrelated mocks.
  if (source.length === 0 && !section) {
    source = MOCK_SHOP_REVIEWS.map((r) => ({
      id: r.id,
      name_ua: r.name_ua,
      name_en: r.name_en,
      role_ua: r.role_ua,
      role_en: r.role_en,
      quote_ua: r.quote_ua,
      quote_en: r.quote_en,
      rating: r.rating,
      avatar: r.avatar,
    }));
  }

  // Don't render the section at all if there are no reviews to show.
  if (source.length === 0) return null;

  const reviews: Review[] = source.map((r) => ({
    id: r.id,
    name: locale === "ua" ? r.name_ua : r.name_en,
    role: (locale === "ua" ? r.role_ua : r.role_en) ?? "",
    quote: locale === "ua" ? r.quote_ua : r.quote_en,
    rating: r.rating,
    avatar: r.avatar ?? "",
    ratingAriaLabel: t("shop.reviews.rating_aria", { rating: r.rating }),
  }));

  return (
    <section className="section bg-secondary-10">
      <div className="container-page">
        <div className="mx-auto mb-10 max-w-3xl text-center lg:mb-12">
          <h2 className="text-h2 font-semibold text-text-strong">
            {t("shop.reviews.title")}
          </h2>
          <p className="mt-4 whitespace-pre-line text-body text-text-secondary lg:mt-5">
            {t("shop.reviews.description")}
          </p>
        </div>

        <ReviewsCarousel
          reviews={reviews}
          prevAriaLabel={t("shop.reviews.prev_aria")}
          nextAriaLabel={t("shop.reviews.next_aria")}
        />
      </div>
    </section>
  );
}
