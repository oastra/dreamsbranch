import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroCarousel, type HeroSlide } from "@/components/home/HeroCarousel";
import { ContactSection } from "@/components/contact/ContactSection";
import { SupportSection } from "@/components/shared/SupportSection";
import { ResultsSection } from "@/components/shared/ResultsSection";
import { db } from "@/lib/db";
import type { AboutPageSettings } from "@/types/database";

const HERO_SLIDES: HeroSlide[] = [
  {
    src: "/images/fundaraising/backup-power-station-mobile-gadgets-charged-outdoor.webp",
    alt: "",
  },
  {
    src: "/images/events/pray-peace-ukraine-hands-with-heart-no-war.webp",
    alt: "",
  },
  { src: "/images/report/report.webp", alt: "" },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const tAbout = await getTranslations({ locale, namespace: "about" });

  // Reuse the about-page settings as the single source of truth for the
  // headline numbers — they're already editable via /admin/about-settings.
  const settings = (await db.aboutSetting.findFirst()) as AboutPageSettings | null;
  const yearsValue = settings?.years_value || tAbout("results.years_value");
  const membersValue = settings?.members_value || tAbout("results.members_value");
  const raisedValue = settings?.raised_value || tAbout("results.raised_value");
  const transparencyValue =
    settings?.transparency_value || tAbout("results.transparency_value");

  return (
    <>
      <section className="bg-brand-blue text-grey-100 py-16 lg:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-body-sm mb-2">Dreams branch of UWAA</p>
            <h1 className="text-display mb-4 text-secondary">
              {t("hero.title")}
            </h1>
            <p className="text-h3 font-normal mb-4">{t("hero.subtitle")}</p>
            <p className="text-body-lg max-w-2xl mb-8 text-white/80">
              {t("hero.description")}
            </p>
            <div className="flex gap-4">
              <a href="#campaigns" className="btn-secondary">
                {t("hero.cta_campaigns")}
              </a>
              <Link
                href="/donate"
                className="btn bg-white text-brand-blue hover:bg-gray-100"
              >
                {t("hero.cta_donate")}
              </Link>
            </div>
          </div>
          <HeroCarousel slides={HERO_SLIDES} />
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────────────── */}
      <ResultsSection
        title={t("results.title")}
        description={
          <>
            <span className="block whitespace-pre-line">
              {t("results.description_p1")}
            </span>
            <span className="mt-3 block whitespace-pre-line">
              {t("results.description_p2")}
            </span>
          </>
        }
        stats={[
          {
            value: yearsValue,
            unit: t("results.years_unit"),
            label: t("results.years_label"),
            heightClass: "lg:min-h-[200px]",
          },
          {
            value: membersValue,
            unit: t("results.members_unit"),
            label: t("results.members_label"),
            heightClass: "lg:min-h-[266px]",
          },
          {
            value: raisedValue,
            unit: t("results.raised_unit"),
            label: t("results.raised_label"),
            heightClass: "lg:min-h-[228px]",
          },
          {
            value: transparencyValue,
            unit: t("results.transparency_unit"),
            label: t("results.transparency_label"),
            heightClass: "lg:min-h-[342px]",
          },
        ]}
      />

      <section id="campaigns" className="section">
        <div className="container-page">
          <h2 className="text-h2 mb-8">{t("sections.active_campaigns")}</h2>
          <p className="text-text-secondary">
            Campaign cards — will load from database
          </p>
        </div>
      </section>

      <section className="section bg-surface-secondary">
        <div className="container-page">
          <h2 className="text-h2 mb-8">{t("sections.events")}</h2>
          <p className="text-text-secondary">
            Event cards — will load from database
          </p>
        </div>
      </section>

      {/* ── Support section (reusable) ───────────────────────────── */}
      <SupportSection locale={locale} />

      <ContactSection
        title={t("events.contact_title")}
        description={t("events.contact_description")}
      />
    </>
  );
}
