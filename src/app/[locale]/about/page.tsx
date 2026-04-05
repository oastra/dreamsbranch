import Image from 'next/image';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactSection } from '@/components/contact/ContactSection';

const btnPrimary =
  'inline-flex items-center justify-center rounded-full bg-secondary px-10 py-[14px] text-body font-medium text-white transition-colors duration-300 hover:text-primary';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });

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
      <section className="bg-secondary text-white">
        <div className="container-page">
          <div className="grid min-h-[480px] grid-cols-1 items-center gap-10 py-16 lg:grid-cols-2 lg:py-20">
            {/* Left */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-body-sm mb-3 text-white/70">Dreams branch of UWAA</p>
                <h1 className="text-display mb-6">{t('hero.title')}</h1>
              </div>
              <p className="text-secondary text-white/85">{t('hero.description_1')}</p>
              <p className="text-secondary text-white/85">{t('hero.description_2')}</p>
              <div className="pt-2">
                <Link href={`/${locale}/contact`} className={btnPrimary}>
                  {t('hero.cta')}
                </Link>
              </div>
            </div>

            {/* Right: hero image */}
            <div className="relative hidden aspect-square overflow-hidden rounded-[40px] lg:block">
              <Image
                src="/images/about/about-us.webp"
                alt="Dreams Branch of UWAA community"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 0px, 45vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── About the Team ────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <h2 className="text-h2 mb-10 text-text-strong">{t('team.title')}</h2>

          {/* Stats */}
          <div className="mb-10 flex flex-wrap gap-4">
            <div className="rounded-2xl bg-primary px-8 py-5 text-text-strong">
              <p className="text-body-sm mb-1 text-text-secondary">{t('team.founded_label')}</p>
              <p className="text-h2 font-medium">{t('team.founded_value')}</p>
            </div>
            <div className="rounded-2xl bg-accent-3 px-8 py-5 text-text-strong">
              <p className="text-body-sm mb-1 text-text-secondary">{t('team.location_label')}</p>
              <p className="text-h2 font-medium">{t('team.location_value')}</p>
            </div>
            <div className="rounded-2xl bg-accent-4 px-8 py-5 text-text-strong">
              <p className="text-body-sm mb-1 text-text-secondary">{t('team.volunteers_label')}</p>
              <p className="text-h2 font-medium">{t('team.volunteers_value')}</p>
            </div>
          </div>

          {/* Description columns */}
          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[t('team.desc_1'), t('team.desc_2'), t('team.desc_3'), t('team.desc_4')].map(
              (desc, i) => (
                <p key={i} className="text-body text-text-secondary">
                  {desc}
                </p>
              ),
            )}
          </div>

          {/* Team photo */}
          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl">
            <Image
              src="/images/about/about-team.webp"
              alt="Dreams Branch team"
              fill
              className="object-cover"
              sizes="(max-width: 1440px) 100vw, 1280px"
            />
          </div>
        </div>
      </section>

      {/* ── Story: Our Beginning ──────────────────────────────── */}
      <section className="section bg-secondary-10">
        <div className="container-page">
          <h2 className="text-h2 mb-12 text-center text-text-strong">{t('story.title')}</h2>

          <div className="flex flex-col gap-8">
            {/* Chapter 1 — dark card */}
            <div className="grid grid-cols-1 gap-6 overflow-hidden rounded-2xl bg-secondary lg:grid-cols-2">
              <div className="flex flex-col justify-center gap-4 p-8 lg:p-10">
                <h3 className="text-h3 text-white">{t('story.ch1_title')}</h3>
                <p className="text-body text-white/80">{t('story.ch1_text')}</p>
                <div className="mt-2 rounded-xl bg-primary px-5 py-4">
                  <p className="text-body font-medium text-text-strong">{t('story.ch1_highlight')}</p>
                </div>
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
                <div className="mt-2 rounded-xl bg-primary px-5 py-4">
                  <p className="text-body font-medium text-text-strong">{t('story.ch3_highlight')}</p>
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

            {/* Chapter 5 — dark card */}
            <div className="grid grid-cols-1 gap-6 overflow-hidden rounded-2xl bg-secondary lg:grid-cols-2">
              <div className="flex flex-col justify-center gap-4 p-8 lg:p-10">
                <h3 className="text-h3 text-white">{t('story.ch5_title')}</h3>
                <p className="text-body text-white/80">{t('story.ch5_text')}</p>
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
      <section className="section bg-secondary text-white">
        <div className="container-page">
          <h2 className="text-h2 mb-4 text-white">{t('results.title')}</h2>
          <p className="text-secondary mb-10 text-white/80">{t('results.description')}</p>

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
          <h2 className="text-h2 mb-10 text-text-strong">{t('faq.title')}</h2>

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
