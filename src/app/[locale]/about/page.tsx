import Image from 'next/image';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactSection } from '@/components/contact/ContactSection';
import { MaskedImageCarousel, type CarouselSlide } from '@/components/shared/MaskedImageCarousel';
import { SectionHeading } from '@/components/shared/SectionHeading';

const btnPrimary =
  'inline-flex items-center justify-center rounded-full bg-secondary px-10 py-[14px] text-body font-medium text-white transition-colors duration-300 hover:text-primary';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });

  const heroSlides: CarouselSlide[] = [
    { src: '/images/about/about-us.webp', alt: 'Dreams Branch of UWAA community' },
  ];

  const teamSlides: CarouselSlide[] = [
    { src: '/images/about/about-team.webp', alt: 'Dreams Branch team' },
  ];

  const faqItems = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
  ];

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section>
        <div className="container-page">
          <div className="grid grid-cols-1 items-stretch gap-10 py-12 lg:grid-cols-2 lg:py-16">
            {/* Left */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-body-sm mb-3 text-text-strong">Dreams branch of UWAA</p>
                <h1 className="text-display mb-6 text-secondary">{t('hero.title')}</h1>
              </div>
              <p className="text-secondary text-text-secondary">{t('hero.description_1')}</p>
              <p className="text-secondary text-text-secondary">{t('hero.description_2')}</p>
              <div className="mt-auto pt-2">
                <Link href={`/${locale}/contact`} className={btnPrimary}>
                  {t('hero.cta')}
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
          <SectionHeading className="mb-10">{t('team.title')}</SectionHeading>

          <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left: 2x2 grid of stat cards */}
            <div className="grid auto-rows-fr grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-accent-1 px-6 py-8 text-center text-text-strong">
                <p className="text-body-sm mb-2 text-text-secondary">{t('team.founded_label')}</p>
                <p className="text-h2 font-medium">{t('team.founded_value')}</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl bg-accent-3 px-6 py-8 text-center text-text-strong">
                <p className="text-body-sm mb-2 text-text-secondary">{t('team.location_label')}</p>
                <p className="text-h2 font-medium">{t('team.location_value')}</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl bg-accent-4 px-6 py-8 text-center text-text-strong">
                <p className="text-body-sm mb-2 text-text-secondary">{t('team.volunteers_label')}</p>
                <p className="text-h2 font-medium">{t('team.volunteers_value')}</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-secondary px-6 py-8 text-center">
                <p className="text-body font-medium text-secondary">{t('team.desc_2')}</p>
              </div>
            </div>

            {/* Right: description paragraphs */}
            <div className="flex flex-col gap-6">
              <p className="text-body text-text-strong">{t('team.desc_1')}</p>
              <p className="text-body text-text-strong">{t('team.desc_1b')}</p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <p className="text-body-sm text-text-secondary">{t('team.desc_3')}</p>
                <p className="text-body-sm text-text-secondary">{t('team.desc_4')}</p>
              </div>
              <div className="mt-auto rounded-2xl bg-[#CCDDF1] px-6 py-5 text-center">
                <p className="text-body font-medium text-text-strong">
                  {t('team.banner')}
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
      <section className="section bg-secondary-10">
        <div className="container-page">
          <SectionHeading className="mb-12">{t('story.title')}</SectionHeading>

          <div className="flex flex-col gap-8">
            {/* Chapter 1 — dark card */}
            <div className="grid grid-cols-1 gap-6 overflow-hidden rounded-2xl bg-grey-100 lg:grid-cols-2">
              <div className="flex flex-col justify-center gap-6 p-8 lg:p-10">
                <h3 className="text-h3 text-white">{t('story.ch1_title')}</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-3">
                    <p className="text-body-sm text-white/80">{t('story.ch1_text_a')}</p>
                    <p className="text-h3 font-medium text-white">{t('story.ch1_date')}</p>
                  </div>
                  <p className="text-body-sm text-white/80">{t('story.ch1_text_b')}</p>
                </div>
                <p className="text-body text-center font-medium text-white">
                  {t('story.ch1_highlight')}
                </p>
              </div>
              <div className="relative min-h-[280px]">
                <Image
                  src="/images/about/from-beginning-1.webp"
                  alt={t('story.ch1_title')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Chapter 2 — image left, text right */}
            <div className="grid grid-cols-1 gap-6 overflow-hidden rounded-2xl bg-white lg:grid-cols-2">
              <div className="relative min-h-[280px]">
                <Image
                  src="/images/about/from-beginning-2.webp"
                  alt={t('story.ch2_title')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-col justify-center gap-4 p-8 lg:p-10">
                <h3 className="text-h3 text-text-strong">{t('story.ch2_title')}</h3>
                <p className="text-body text-text-secondary">{t('story.ch2_text')}</p>
                <div className="mt-2 rounded-xl bg-primary px-5 py-4">
                  <p className="text-body font-medium text-text-strong">{t('story.ch2_highlight')}</p>
                </div>
              </div>
            </div>

            {/* Chapter 3 — text left, image right */}
            <div className="grid grid-cols-1 gap-6 overflow-hidden rounded-2xl bg-white lg:grid-cols-2">
              <div className="flex flex-col justify-center gap-4 p-8 lg:p-10">
                <h3 className="text-h3 text-text-strong">{t('story.ch3_title')}</h3>
                <p className="text-body text-text-secondary">{t('story.ch3_text')}</p>
                <div className="mt-2 rounded-xl bg-secondary px-5 py-4">
                  <p className="text-body font-medium text-white">{t('story.ch3_highlight')}</p>
                </div>
              </div>
              <div className="relative min-h-[280px]">
                <Image
                  src="/images/about/from-beginning-3.webp"
                  alt={t('story.ch3_title')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Chapter 4 — image left, text right */}
            <div className="grid grid-cols-1 gap-6 overflow-hidden rounded-2xl bg-white lg:grid-cols-2">
              <div className="relative min-h-[280px]">
                <Image
                  src="/images/about/from-beginning-4.webp"
                  alt={t('story.ch4_title')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-col justify-center gap-4 p-8 lg:p-10">
                <h3 className="text-h3 text-text-strong">{t('story.ch4_title')}</h3>
                <p className="text-body text-text-secondary">{t('story.ch4_text')}</p>
              </div>
            </div>

            {/* Chapter 5 — light card with yellow highlight */}
            <div className="grid grid-cols-1 gap-6 overflow-hidden rounded-2xl bg-white lg:grid-cols-2">
              <div className="flex flex-col justify-center gap-4 p-8 lg:p-10">
                <h3 className="text-h3 text-text-strong">{t('story.ch5_title')}</h3>
                <p className="text-body text-text-secondary">{t('story.ch5_text')}</p>
                <div className="mt-2 rounded-xl bg-primary px-5 py-4">
                  <p className="text-body font-medium text-text-strong">{t('story.ch5_highlight')}</p>
                </div>
              </div>
              <div className="relative min-h-[280px]">
                <Image
                  src="/images/about/from-beginning-5.webp"
                  alt={t('story.ch5_title')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <SectionHeading align="left" className="mb-10" description={t('results.description')}>
            {t('results.title')}
          </SectionHeading>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { value: t('results.years_value'), label: t('results.years_label') },
              { value: t('results.members_value'), label: t('results.members_label') },
              { value: t('results.raised_value'), label: t('results.raised_label') },
              { value: t('results.transparency_value'), label: t('results.transparency_label') },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-2xl bg-secondary-10 p-6 text-text-strong">
                <p className="mb-2 text-[2.5rem] font-medium leading-none lg:text-[3rem]">{value}</p>
                <p className="text-body text-text-secondary">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Transparency ──────────────────────────────────────── */}
      <section className="bg-secondary py-14">
        <div className="container-page">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3">
              <h2 className="text-h2 text-white">{t('transparency.title')}</h2>
              <p className="text-secondary text-white/80">{t('transparency.description')}</p>
            </div>
            <div className="shrink-0">
              <Link href={`/${locale}/reports`} className={btnPrimary}>
                {t('transparency.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <SectionHeading align="left" className="mb-10">{t('faq.title')}</SectionHeading>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {faqItems.map(({ q, a }, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-border bg-white px-6 py-5 open:border-secondary-10 open:bg-secondary-10"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
        title={t('contact_section.title')}
        description={t('contact_section.description')}
      />
    </>
  );
}
