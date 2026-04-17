import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

import { db } from '@/lib/db';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { TransparencyBanner } from '@/components/campaigns/TransparencyBanner';
import { SupportSection } from '@/components/home/SupportSection';
import { ContactSection } from '@/components/contact/ContactSection';
import type { Campaign } from '@/types/database';

// ─── Mock data (shown when Supabase returns no campaigns) ─────────────────────

type CampaignPreview = Pick<
  Campaign,
  'id' | 'slug' | 'title_ua' | 'title_en' | 'cover_image' | 'goal_amount' | 'current_amount' | 'status'
>;

const MOCK_ACTIVE: CampaignPreview[] = [
  {
    id: 'mock-a1',
    slug: 'recon-drone-93',
    title_ua: 'Дрон-розвідник для 93-ї бригади',
    title_en: 'Recon Drone for 93rd Brigade',
    cover_image: null,
    goal_amount: 4000,
    current_amount: 800,
    status: 'active',
  },
  {
    id: 'mock-a2',
    slug: 'ecoflow-power-station',
    title_ua: 'Зарядна станція для підрозділу',
    title_en: 'Power Station for Military Unit',
    cover_image: null,
    goal_amount: 4000,
    current_amount: 800,
    status: 'active',
  },
  {
    id: 'mock-a3',
    slug: 'field-hospital-inverter',
    title_ua: 'Інвертор для польового госпіталю',
    title_en: 'Inverter for Field Hospital',
    cover_image: null,
    goal_amount: 4000,
    current_amount: 800,
    status: 'active',
  },
];

const MOCK_ARCHIVED: CampaignPreview[] = [
  {
    id: 'mock-r1',
    slug: 'evacuation-straps',
    title_ua: 'Стропи для евакуаційної машини',
    title_en: 'Recovery Straps for Evacuation Vehicle',
    cover_image: null,
    goal_amount: 3700,
    current_amount: 4070,
    status: 'archived',
  },
  {
    id: 'mock-r2',
    slug: 'thermal-imager',
    title_ua: 'Тепловізор для розвідки',
    title_en: 'Thermal Imager for Reconnaissance',
    cover_image: null,
    goal_amount: 5000,
    current_amount: 5250,
    status: 'archived',
  },
  {
    id: 'mock-r3',
    slug: 'medical-kits',
    title_ua: 'Медичне спорядження для батальйону',
    title_en: 'Medical Kits for Battalion',
    cover_image: null,
    goal_amount: 2500,
    current_amount: 2500,
    status: 'archived',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  // Fetch campaigns from Supabase, fall back to mock data if empty or on error
  let active: CampaignPreview[] = [];
  let archived: CampaignPreview[] = [];

  try {
    const [fetchedActive, fetchedArchived] = await Promise.all([
      db.campaign.findMany({ where: { status: 'ACTIVE' } }),
      db.campaign.findMany({ where: { status: 'ARCHIVED' } }),
    ]);
    active = fetchedActive as CampaignPreview[];
    archived = fetchedArchived as CampaignPreview[];
  } catch {
    // DB not reachable — use mock data
  }

  if (active.length === 0) active = MOCK_ACTIVE;
  if (archived.length === 0) archived = MOCK_ARCHIVED;

  // Stats
  const totalRaised = [...active, ...archived].reduce(
    (sum, c) => sum + Number(c.current_amount),
    0,
  );
  const totalHelped = Math.round(totalRaised / 50); // rough approximation

  const cardProps = {
    locale,
    raisedLabel: t('campaigns.raised'),
    goalLabel: t('campaigns.goal'),
    donateBtnLabel: t('campaigns.donate_btn'),
  };

  const titleKey = locale === 'ua' ? 'title_ua' : 'title_en';

  return (
    <>
      {/* ── Page hero ────────────────────────────────────────────── */}
      <section className="bg-white py-12 lg:py-16">
        <div className="container-page">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            {/* Left: text */}
            <div>
              <p className="text-body-sm mb-2 text-text-secondary">Dreams branch of UWAA</p>
              <h1 className="text-display mb-4 text-secondary">{t('campaigns.title')}</h1>
              <p className="text-body mb-8 max-w-xl text-text-secondary">
                {t('campaigns.description')}
              </p>

              {/* Stats badges */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 rounded-xl bg-primary px-5 py-3">
                  <span className="text-caption uppercase tracking-wide text-text-strong/70">
                    {t('campaigns.stats_raised')}
                  </span>
                  <span className="text-h3 font-medium text-text-strong">
                    ${totalRaised.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-secondary px-5 py-3">
                  <span className="text-caption uppercase tracking-wide text-white/70">
                    {t('campaigns.stats_helped')}
                  </span>
                  <span className="text-h3 font-medium text-white">
                    {totalHelped.toLocaleString()} {locale === 'ua' ? 'людям' : 'people'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: hero image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/fundaraising/backup-power-station-mobile-gadgets-charged-outdoor.webp"
                alt={t('campaigns.title')}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Active campaigns ─────────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <h2 className="text-h2 mb-8 text-text-strong">{t('campaigns.active')}</h2>
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
      <TransparencyBanner
        title={t('campaigns.transparency_title')}
        description={t('campaigns.transparency_description')}
        cta={t('campaigns.transparency_cta')}
        locale={locale}
      />

      {/* ── Archived campaigns ───────────────────────────────────── */}
      <section className="section">
        <div className="container-page">
          <h2 className="text-h2 mb-8 text-text-strong">{t('campaigns.archived')}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {archived.slice(0, 3).map((c) => (
              <CampaignCard
                key={c.id}
                slug={c.slug}
                title={c[titleKey]}
                coverImage={c.cover_image}
                goalAmount={Number(c.goal_amount)}
                currentAmount={Number(c.current_amount)}
                isArchived
                {...cardProps}
              />
            ))}
          </div>

          {archived.length > 3 && (
            <div className="mt-10 flex justify-center">
              <Link
                href={`/${locale}/campaigns/archive`}
                className="inline-flex items-center justify-center rounded-full border border-border bg-white px-10 py-2.5 text-body font-medium text-text-strong transition-colors hover:bg-grey-40"
              >
                {t('campaigns.more')}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Support section (reusable) ───────────────────────────── */}
      <SupportSection locale={locale} />

      {/* ── Contact form (reusable) ──────────────────────────────── */}
      <ContactSection
        title={t('campaigns.contact_title')}
        description={t('campaigns.contact_description')}
      />
    </>
  );
}
