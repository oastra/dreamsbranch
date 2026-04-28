import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactSection } from "@/components/contact/ContactSection";
import {
  MaskedImageCarousel,
  type CarouselSlide,
} from "@/components/shared/MaskedImageCarousel";
import { ReportsBanner } from "@/components/shared/ReportsBanner";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { db } from "@/lib/db";
import type { AboutPageSettings, FaqItem } from "@/types/database";

const btnPrimary =
  "inline-flex items-center justify-center rounded-full bg-secondary px-10 py-[14px] text-body font-medium text-white transition-colors duration-300 hover:text-primary";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });

  const settings =
    (await db.aboutSetting.findFirst()) as AboutPageSettings | null;

  const heroSlides: CarouselSlide[] =
    (settings?.hero_images ?? []).length > 0
      ? settings!.hero_images.map((src, i) => ({
          src,
          alt: `Dreams Branch of UWAA — ${i + 1}`,
        }))
      : [
          {
            src: "/images/about/about-us.webp",
            alt: "Dreams Branch of UWAA community",
          },
        ];

  const teamSlides: CarouselSlide[] =
    (settings?.team_images ?? []).length > 0
      ? settings!.team_images.map((src, i) => ({
          src,
          alt: `Dreams Branch team — ${i + 1}`,
        }))
      : [{ src: "/images/about/about-team.webp", alt: "Dreams Branch team" }];

  const dbFaq: FaqItem[] = settings?.faq_items ?? [];
  const faqItems =
    dbFaq.length > 0
      ? dbFaq.map((it) => ({
          q: locale === "en" ? it.q_en : it.q_ua,
          a: locale === "en" ? it.a_en : it.a_ua,
        }))
      : [
          { q: t("faq.q1"), a: t("faq.a1") },
          { q: t("faq.q2"), a: t("faq.a2") },
          { q: t("faq.q3"), a: t("faq.a3") },
          { q: t("faq.q4"), a: t("faq.a4") },
          { q: t("faq.q5"), a: t("faq.a5") },
        ];

  const yearsValue = settings?.years_value || t("results.years_value");
  const membersValue = settings?.members_value || t("results.members_value");
  const raisedValue = settings?.raised_value || t("results.raised_value");
  const transparencyValue =
    settings?.transparency_value || t("results.transparency_value");

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section>
        <div className="container-page">
          <div className="grid grid-cols-1 items-stretch gap-10 py-12 lg:grid-cols-2 lg:py-16">
            {/* Left */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-body-sm mb-3 text-text-strong">
                  Dreams branch of UWAA
                </p>
                <h1 className="text-display mb-6 text-secondary">
                  {t("hero.title")}
                </h1>
              </div>
              <p className="text-secondary text-text-secondary">
                {t("hero.description_1")}
              </p>
              <p className="text-secondary text-text-secondary">
                {t("hero.description_2")}
              </p>
              <div className="mt-auto pt-2">
                <Link href={`/${locale}/contact`} className={btnPrimary}>
                  {t("hero.cta")}
                </Link>
              </div>
            </div>

            {/* Right: hero carousel — fills column fully */}
            <div className="relative min-h-[400px] w-full lg:min-h-0">
              <MaskedImageCarousel
                slides={heroSlides}
                aspectRatio={null}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── About the Team ────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <SectionHeading className="mb-10">{t("team.title")}</SectionHeading>

          <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left: 2x2 grid of stat cards */}
            <div className="grid auto-rows-fr grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-accent-1 px-6 py-8 text-center text-text-strong">
                <p className="text-body-sm mb-2 text-text-secondary">
                  {t("team.founded_label")}
                </p>
                <p className="text-h2 font-medium">{t("team.founded_value")}</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl bg-accent-3 px-6 py-8 text-center text-text-strong">
                <p className="text-body-sm mb-2 text-text-secondary">
                  {t("team.location_label")}
                </p>
                <p className="text-h2 font-medium">
                  {t("team.location_value")}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl bg-accent-4 px-6 py-8 text-center text-text-strong">
                <p className="text-body-sm mb-2 text-text-secondary">
                  {t("team.volunteers_label")}
                </p>
                <p className="text-h2 font-medium">
                  {t("team.volunteers_value")}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-secondary px-6 py-8 text-center">
                <p className="text-body font-medium text-secondary">
                  {t("team.desc_2")}
                </p>
              </div>
            </div>

            {/* Right: description paragraphs */}
            <div className="flex flex-col gap-6">
              <p className="text-body text-text-strong">{t("team.desc_1")}</p>
              <p className="text-body text-text-strong">{t("team.desc_1b")}</p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <p className="text-body-sm text-text-secondary">
                  {t("team.desc_3")}
                </p>
                <p className="text-body-sm text-text-secondary">
                  {t("team.desc_4")}
                </p>
              </div>
              <div className="mt-auto rounded-2xl bg-[#CCDDF1] px-6 py-5 text-center">
                <p className="text-body font-medium text-text-strong">
                  {t("team.banner")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width team carousel */}
        <div className="mt-10">
          <MaskedImageCarousel
            slides={teamSlides}
            aspectRatio="1280/540"
            sizes="100vw"
            masked={false}
            className="mx-auto max-w-[1280px]"
          />
        </div>
      </section>

      {/* ── Story: Our Beginning ──────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <SectionHeading className="mb-12">{t("story.title")}</SectionHeading>

          <div className="flex flex-col gap-8">
            {/* Chapter 1 — dark card */}
            <div className="grid grid-cols-1 gap-6 rounded-2xl bg-grey-100 p-6 lg:grid-cols-[3fr_2fr] lg:p-8">
              <div className="flex flex-col justify-center gap-6 p-2 lg:p-4">
                <h3 className="text-h2 text-white">{t("story.ch1_title")}</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-3">
                    <p className="text-body-sm text-white/80">
                      {t("story.ch1_text_a")}
                    </p>
                    <p className="text-h3 font-medium text-white">
                      {t("story.ch1_date")}
                    </p>
                  </div>
                  <p className="text-body-sm text-white/80">
                    {t("story.ch1_text_b")}
                  </p>
                </div>
                <p className="text-h3 text-center font-medium text-white">
                  {t("story.ch1_highlight")}
                </p>
              </div>
              <div className="relative min-h-[280px] overflow-hidden rounded-2xl">
                <Image
                  src="/images/about/form-beginning.webp"
                  alt={t("story.ch1_title")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>

            {/* Chapter 2 — desktop: images left | text right. Mobile: heading, text_a, images, text_b, highlight */}
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-6">
              <div className="order-3 grid grid-cols-2 gap-4 lg:order-1 lg:self-stretch">
                <div className="relative aspect-[1/1] overflow-hidden rounded-2xl lg:aspect-auto">
                  <Image
                    src="/images/about/from-beginning-1.webp"
                    alt={t("story.ch2_title")}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="relative aspect-[1/1] overflow-hidden rounded-2xl lg:aspect-auto">
                  <Image
                    src="/images/about/from-beginning-2.webp"
                    alt={t("story.ch2_title")}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </div>
              <div className="contents lg:order-2 lg:flex lg:flex-col lg:gap-4">
                <h3 className="order-1 text-h2 text-text-strong">
                  {t("story.ch2_title")}
                </h3>
                <p className="order-2 text-body text-text-secondary">
                  {t("story.ch2_text_a")}
                </p>
                <p className="order-4 text-body text-text-secondary">
                  {t("story.ch2_text_b")}
                </p>
                <div className="order-5 rounded-2xl bg-primary px-6 py-5">
                  <p className="text-h3 text-center text-text-strong">
                    {t("story.ch2_highlight")}
                  </p>
                </div>
              </div>
            </div>

            {/* Chapter 3 — desktop: text left | image right. Mobile: heading, image, text_a, text_b(bold date), highlight */}
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-6">
              <div className="contents lg:order-1 lg:flex lg:flex-col lg:gap-4">
                <h3 className="order-1 flex flex-col text-h2 text-text-strong">
                  <span>{t("story.ch3_title_a")}</span>
                  <span className="self-end">{t("story.ch3_title_b")}</span>
                </h3>
                <p className="order-3 text-body text-text-secondary">
                  {t("story.ch3_text_a")}
                </p>
                <p className="order-4 text-body text-text-secondary">
                  <strong className="font-medium text-text-strong">
                    {t("story.ch3_date")}
                  </strong>{" "}
                  {t("story.ch3_text_b")}
                </p>
                <div className="order-5 rounded-2xl bg-secondary px-6 py-5">
                  <p className="text-h3 font-medium text-white">
                    {t("story.ch3_highlight")}
                  </p>
                </div>
              </div>
              <div className="order-2 relative aspect-[16/9] overflow-hidden rounded-2xl lg:order-2 lg:aspect-auto lg:min-h-[400px] lg:self-stretch">
                <Image
                  src="/images/about/from-beginning-3.webp"
                  alt={t("story.ch3_title_a")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Chapter 4 — desktop: image left | text right. Mobile: heading, image, 3 paragraphs */}
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-6">
              <div className="order-2 relative aspect-[16/9] overflow-hidden rounded-2xl lg:order-1 lg:aspect-auto lg:min-h-[400px] lg:self-stretch">
                <Image
                  src="/images/about/from-beginning-4.webp"
                  alt={t("story.ch4_title")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="contents lg:order-2 lg:flex lg:flex-col lg:gap-4">
                <h3 className="order-1 text-h2 text-text-strong">
                  {t("story.ch4_title")}
                </h3>
                <p className="order-3 text-body text-text-secondary">
                  {t("story.ch4_text_a")}
                </p>
                <p className="order-4 text-body text-text-secondary">
                  {t("story.ch4_text_b")}
                </p>
                <p className="order-5 text-body text-text-secondary">
                  {t("story.ch4_text_c")}
                </p>
              </div>
            </div>

            {/* Chapter 5 — desktop: text left | image right. Mobile: heading, image, 2 paragraphs, small paragraph, highlight */}
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-6">
              <div className="contents lg:order-1 lg:flex lg:flex-col lg:gap-4">
                <h3 className="order-1 text-h2 text-text-strong">
                  {t("story.ch5_title")}
                </h3>
                <p className="order-3 text-body text-text-secondary">
                  {t("story.ch5_text_a")}
                </p>
                <p className="order-4 text-body text-text-secondary">
                  {t("story.ch5_text_b")}
                </p>
                <p className="order-5 text-body-sm text-text-secondary">
                  {t("story.ch5_text_c")}
                </p>
                <div className="order-6 rounded-2xl bg-primary px-6 py-5">
                  <p className="text-h3 text-center font-medium text-text-strong">
                    {t("story.ch5_highlight")}
                  </p>
                </div>
              </div>
              <div className="order-2 relative aspect-[16/9] overflow-hidden rounded-2xl lg:order-2 lg:aspect-auto lg:min-h-[400px] lg:self-stretch">
                <Image
                  src="/images/about/from-beginning-5.webp"
                  alt={t("story.ch5_title")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Transition note — blue banner */}
            <div className="rounded-2xl bg-secondary px-6 py-5 text-center">
              <p className="text-body font-medium text-white">
                {t("story.ch6_note")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <SectionHeading
            align="left"
            className="mb-10"
            description={t("results.description")}
          >
            {t("results.title")}
          </SectionHeading>

          <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                value: yearsValue,
                unit: t("results.years_unit"),
                label: t("results.years_label"),
                height: "lg:min-h-[200px]",
              },
              {
                value: membersValue,
                unit: t("results.members_unit"),
                label: t("results.members_label"),
                height: "lg:min-h-[266px]",
              },
              {
                value: raisedValue,
                unit: t("results.raised_unit"),
                label: t("results.raised_label"),
                height: "lg:min-h-[228px]",
              },
              {
                value: transparencyValue,
                unit: t("results.transparency_unit"),
                label: t("results.transparency_label"),
                height: "lg:min-h-[342px]",
              },
            ].map(({ value, unit, label, height }) => (
              <div
                key={label}
                className={`flex flex-col justify-between rounded-2xl bg-secondary-10 p-6 text-text-strong ${height}`}
              >
                <p className="text-body text-text-secondary">{label}</p>
                <p className="flex items-baseline justify-end gap-2 text-[2.5rem] font-medium leading-none sm:justify-start lg:text-[3rem]">
                  {value}
                  {unit && (
                    <span className="text-body font-normal text-text-secondary">
                      {unit}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Transparency ──────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <ReportsBanner
            title={t("transparency.title")}
            description={t("transparency.description")}
            ctaLabel={t("transparency.cta")}
            ctaHref={`/${locale}/reports`}
          />
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <SectionHeading align="left" className="mb-10">
            {t("faq.title")}
          </SectionHeading>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {faqItems.map(({ q, a }, i) => (
              <details
                key={i}
                className="group h-fit rounded-2xl border border-border bg-white px-6 py-5 open:border-secondary-10 open:bg-secondary-10"
              >
                <summary className="flex min-h-[66px] cursor-pointer list-none items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-small font-medium text-white">
                      {i + 1}
                    </span>
                    <span className="text-h3 text-text-strong">{q}</span>
                  </div>
                  <svg
                    className="h-5 w-5 shrink-0 text-text-secondary transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="mt-4 pl-12 text-body text-text-secondary">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Section ───────────────────────────────────── */}
      <ContactSection
        title={t("contact_section.title")}
        description={t("contact_section.description")}
      />
    </>
  );
}
