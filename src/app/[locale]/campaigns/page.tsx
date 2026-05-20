import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { db } from "@/lib/db";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { ArchivedCampaignsList } from "@/components/campaigns/ArchivedCampaignsList";
import { SupportSection } from "@/components/shared/SupportSection";
import { ReportsBanner } from "@/components/shared/ReportsBanner";
import { ContactSection } from "@/components/contact/ContactSection";
import { PageHeroWithCarousel } from "@/components/shared/PageHeroWithCarousel";
import type {
  CampaignsPageSettings,
  DeliveredItem,
} from "@/types/database";
import { MOCK_ACTIVE, MOCK_ARCHIVED, type CampaignPreview } from "./_mocks";

const FALLBACK_HERO_SLIDES = [
  "/images/fundaraising/backup-power-station-mobile-gadgets-charged-outdoor.webp",
];

// Background palette for delivered cards (cycled by index)
const CARD_BGS = ["bg-accent-1", "bg-accent-3", "bg-accent-5"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  // Fetch campaigns + page settings from Supabase, fall back to mock/default if empty or on error
  let active: CampaignPreview[] = [];
  let archived: CampaignPreview[] = [];
  let pageSettings: CampaignsPageSettings | null = null;

  try {
    const [fetchedActive, fetchedArchived, fetchedSettings] = await Promise.all(
      [
        db.campaign.findMany({ where: { status: "ACTIVE" } }),
        db.campaign.findMany({ where: { status: "ARCHIVED" } }),
        db.campaignsSetting.findFirst(),
      ],
    );
    // Hide the internal `general-fund` pseudo-campaign that the donate-page
    // CTAs attach to — it's an FK target, not a public campaign.
    active = (fetchedActive as CampaignPreview[]).filter(
      (c) => c.slug !== "general-fund",
    );
    archived = (fetchedArchived as CampaignPreview[]).filter(
      (c) => c.slug !== "general-fund",
    );
    pageSettings = fetchedSettings as CampaignsPageSettings | null;
  } catch {
    // DB not reachable — use mock/default data
  }

  if (active.length === 0) active = MOCK_ACTIVE;
  if (archived.length === 0) archived = MOCK_ARCHIVED;

  const heroSlides =
    pageSettings && pageSettings.hero_images.length > 0
      ? pageSettings.hero_images.map((src) => ({ src, alt: "" }))
      : FALLBACK_HERO_SLIDES.map((src) => ({ src, alt: "" }));

  const dbDelivered = pageSettings?.delivered_items ?? [];
  const fallbackDelivered: DeliveredItem[] = [
    {
      count: 6,
      image: "/images/fundaraising/car.webp",
      label_ua: t("campaigns.delivered_cars"),
      label_en: t("campaigns.delivered_cars"),
    },
    {
      count: 10,
      image: "/images/fundaraising/thermal-camera.webp",
      label_ua: t("campaigns.delivered_thermal"),
      label_en: t("campaigns.delivered_thermal"),
    },
    {
      count: 115,
      image: "/images/fundaraising/tourniquet.webp",
      label_ua: t("campaigns.delivered_tourniquets"),
      label_en: t("campaigns.delivered_tourniquets"),
    },
  ];
  const deliveredSource =
    dbDelivered.length > 0 ? dbDelivered : fallbackDelivered;
  const deliveredItems = deliveredSource.slice(0, 3).map((it, i) => ({
    count: it.count,
    image: it.image,
    label: locale === "ua" ? it.label_ua : it.label_en,
    bg: CARD_BGS[i % CARD_BGS.length],
  }));

  const cardProps = {
    locale,
    raisedLabel: t("campaigns.raised"),
    goalLabel: t("campaigns.goal"),
    donateBtnLabel: t("campaigns.donate_btn"),
  };

  const titleKey = locale === "ua" ? "title_ua" : "title_en";

  return (
    <>
      {/* ── Page hero ────────────────────────────────────────────── */}
      <PageHeroWithCarousel title={t("campaigns.title")} slides={heroSlides}>
        <p className="text-body mb-6 max-w-xl whitespace-pre-line text-text-primary lg:mb-8">
          {t("campaigns.description")}
        </p>

        <p className="text-body-sm mb-3 font-semibold uppercase tracking-wide text-text-strong">
          {t("campaigns.recently_delivered")}
        </p>

        {/* Cards: horizontal scroll on mobile, 3-col grid on tablet+ */}
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0">
          {deliveredItems.map((item) => (
            <div
              key={item.label}
              className={`relative h-[193px] w-[220px] shrink-0 overflow-hidden rounded-2xl ${item.bg} sm:h-[192px] sm:w-full sm:max-w-[183px] lg:max-w-[196px]`}
            >
              {/* Image fills the card (above the bottom label strip) */}
              <div className="absolute inset-x-0 top-0 bottom-12">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 220px, (max-width: 1024px) 183px, 196px"
                  className="object-contain p-2 pl-10 sm:pl-12 lg:pl-14"
                />
              </div>

              {/* Number — top-left, overlays the image */}
              <span className="absolute left-3 top-2 z-10 text-[36px] font-semibold leading-none text-text-strong sm:left-4 sm:top-3 sm:text-[40px] lg:text-[44px]">
                {item.count}
              </span>

              {/* Bottom label strip — full-width, 48px tall */}
              <div className="absolute inset-x-0 bottom-0 flex h-12 items-center justify-center bg-secondary text-body font-medium text-white">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </PageHeroWithCarousel>

      {/* ── Active campaigns ─────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <h2 className="text-h2 mb-8 text-text-strong">
            {t("campaigns.active")}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((c) => (
              <CampaignCard
                key={c.id}
                slug={c.slug}
                title={c[titleKey]}
                coverImage={c.cover_image}
                goalAmount={Number(c.goal_amount)}
                currentAmount={Number(c.current_amount)}
                {...cardProps}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Transparency banner ──────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <ReportsBanner
            title={t("campaigns.transparency_title")}
            description={t("campaigns.transparency_description")}
            ctaLabel={t("campaigns.transparency_cta")}
            ctaHref={`/${locale}/reports`}
          />
        </div>
      </section>

      {/* ── Archived campaigns ───────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <h2 className="text-h2 mb-8 text-text-strong">
            {t("campaigns.archived")}
          </h2>
          <Suspense fallback={null}>
            <ArchivedCampaignsList
              campaigns={archived.map((c) => ({
                id: c.id,
                slug: c.slug,
                title: c[titleKey],
                coverImage: c.cover_image,
                goalAmount: Number(c.goal_amount),
                currentAmount: Number(c.current_amount),
              }))}
              cardProps={cardProps}
              moreLabel={t("campaigns.more")}
            />
          </Suspense>
        </div>
      </section>

      {/* ── Support section (reusable) ───────────────────────────── */}
      <SupportSection locale={locale} />

      {/* ── Contact form (reusable) ──────────────────────────────── */}
      <ContactSection
        title={t("campaigns.contact_title")}
        description={t("campaigns.contact_description")}
      />
    </>
  );
}
