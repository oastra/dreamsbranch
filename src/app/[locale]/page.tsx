import { useTranslations } from "next-intl";
import { HeroCarousel, type HeroSlide } from "@/components/home/HeroCarousel";

const HERO_SLIDES: HeroSlide[] = [
  { src: "/images/fundaraising/backup-power-station-mobile-gadgets-charged-outdoor.webp", alt: "" },
  { src: "/images/events/pray-peace-ukraine-hands-with-heart-no-war.webp", alt: "" },
  { src: "/images/report/report.webp", alt: "" },
];

export default function HomePage() {
  const t = useTranslations("home");

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
              <a
                href="#donate"
                className="btn bg-white text-brand-blue hover:bg-gray-100"
              >
                {t("hero.cta_donate")}
              </a>
            </div>
          </div>
          <HeroCarousel slides={HERO_SLIDES} />
        </div>
      </section>

      <section className="section bg-surface-secondary">
        <div className="container-page text-center">
          <p className="text-text-secondary">
            Stats section — will load from HomePageSettings
          </p>
        </div>
      </section>

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

      <section className="section">
        <div className="container-page">
          <h2 className="text-h2 mb-4">{t("sections.support_title")}</h2>
          <p className="text-text-secondary mb-8">
            {t("sections.support_description")}
          </p>
        </div>
      </section>

      <section className="section bg-surface-secondary">
        <div className="container-page">
          <h2 className="text-h2 mb-4">{t("sections.contact_title")}</h2>
          <p className="text-text-secondary">
            {t("sections.contact_description")}
          </p>
        </div>
      </section>
    </>
  );
}
