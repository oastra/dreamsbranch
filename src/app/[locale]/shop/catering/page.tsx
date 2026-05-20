import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CateringHero } from "@/components/shop/CateringHero";
import { MarqueeBanner } from "@/components/shared/MarqueeBanner";
import {
  CateringEventsCarousel,
  type CateringEventSlide,
} from "@/components/shop/CateringEventsCarousel";
import { CateringProcess } from "@/components/shop/CateringProcess";
import {
  CateringServices,
  type CateringService,
  type CateringServiceBullet,
} from "@/components/shop/CateringServices";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ShopReviewsSection } from "@/components/shop/ShopReviewsSection";
import { CateringLeadForm } from "@/components/shop/CateringLeadForm";
import { db } from "@/lib/db";
import type { CarouselSlide } from "@/components/shared/MaskedImageCarousel";
import type {
  CateringEvent,
  CateringPageSettings,
  FaqItem,
} from "@/types/database";

const CATERING_SLIDES: CarouselSlide[] = [
  { src: "/images/shop/catering/hero-1.webp", alt: "" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop.catering" });
  return {
    title: t("title"),
    description: t("hero_description"),
  };
}

export default async function CateringPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "shop.catering" });
  const tShop = await getTranslations({ locale, namespace: "shop" });
  const imageAlt = t("image_alt");

  const slides: CarouselSlide[] = CATERING_SLIDES.map((s) => ({
    ...s,
    alt: imageAlt,
  }));

  // Catering events — admin-editable carousel below the hero. DB may
  // fail (e.g. table not yet migrated to remote); fall through to an
  // empty array, which makes the section render nothing.
  let events: CateringEvent[] = [];
  try {
    events = await db.cateringEvent.findMany();
  } catch {
    events = [];
  }

  let cateringSettings: CateringPageSettings | null = null;
  try {
    cateringSettings = await db.cateringSetting.findFirst();
  } catch {
    cateringSettings = null;
  }
  const faqRaw = (cateringSettings?.faq_items ?? []) as unknown as FaqItem[];
  const faqItems = faqRaw
    .map((it) => ({
      question: locale === "en" ? it.q_en : it.q_ua,
      answer: locale === "en" ? it.a_en : it.a_ua,
    }))
    .filter((it) => it.question && it.answer);

  const titleKey = locale === "en" ? "title_en" : "title_ua";
  const descKey = locale === "en" ? "description_en" : "description_ua";
  const locKey = locale === "en" ? "location_en" : "location_ua";
  const eventSlides: CateringEventSlide[] = events
    .filter((e) => e.images && e.images.length > 0)
    .map((e) => ({
      id: e.id,
      title: e[titleKey],
      description: e[descKey],
      location: e[locKey],
      images: e.images,
    }));

  return (
    <>
      <CateringHero
        title={t("title")}
        subtitle={t("hero_subtitle")}
        description={t("hero_description")}
        ctaLabel={t("hero_cta")}
        ctaHref="#services"
        slides={slides}
      />
      {eventSlides.length > 0 && (
        <CateringEventsCarousel
          title={t("events_title")}
          events={eventSlides}
          prevAriaLabel={t("prev_event_aria")}
          nextAriaLabel={t("next_event_aria")}
        />
      )}
      <MarqueeBanner text={tShop("profit_notice")} />
      <div id="services">
        <CateringProcess
          title={t("process_title")}
          steps={{
            step1: { title: t("step_1_title"), text: t("step_1_text") },
            step2: { title: t("step_2_title"), text: t("step_2_text") },
            step3: { title: t("step_3_title"), text: t("step_3_text") },
          }}
        />
      </div>
      <CateringServices
        title={t("services_title")}
        services={(
          [
            {
              id: "full",
              key: "service_full",
              imageSrc: "/images/shop/catering/service-full.webp",
              ctaHref: `/${locale}/contact?topic=catering-full`,
            },
            {
              id: "delivery",
              key: "service_delivery",
              imageSrc: "/images/shop/catering/service-delivery.webp",
              ctaHref: `/${locale}/contact?topic=catering-delivery`,
            },
            {
              id: "kitchen",
              key: "service_kitchen",
              imageSrc: "/images/shop/catering/service-kitchen.webp",
              ctaHref: `/${locale}/contact?topic=catering-kitchen`,
            },
          ] as const
        ).map<CateringService>((s) => ({
          id: s.id,
          title: t(`${s.key}.title`),
          description: t(`${s.key}.description`),
          bullets: t.raw(`${s.key}.bullets`) as CateringServiceBullet[],
          ctaLabel: t(`${s.key}.cta`),
          ctaHref: s.ctaHref,
          imageSrc: s.imageSrc,
          imageAlt: t("service_image_alt"),
        }))}
      />
      <ShopReviewsSection locale={locale} section="catering" />
      {faqItems.length > 0 && (
        <section className="section">
          <div className="container-page">
            <SectionHeading align="left" className="mb-10">
              {t("faq_title")}
            </SectionHeading>
            <FaqAccordion items={faqItems} />
          </div>
        </section>
      )}
      <MarqueeBanner text={tShop("profit_notice")} className="hidden lg:block" />
      <CateringLeadForm
        title={t("cta_title")}
        description={t("cta_description")}
        nameLabel={t("cta_name_label")}
        phoneLabel={t("cta_phone_label")}
        fieldPlaceholder={t("cta_field_placeholder")}
        submitLabel={t("cta_submit")}
        imageSrc="/images/shop/catering/cta.webp"
        imageAlt={t("cta_image_alt")}
        successMessage={t("cta_success")}
        errorMessage={t("cta_error")}
      />
    </>
  );
}
