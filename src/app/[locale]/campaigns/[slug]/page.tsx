import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';

import { db } from '@/lib/db';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import FacebookColorIcon from '@/components/icons/FacebookIcon-color';
import InstagramColorIcon from '@/components/icons/InstagramIcon-color';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import XTwitterIcon from '@/components/icons/XTwitterIcon';
import LinkIcon from '@/components/icons/LinkIcon';
import type { Campaign, Donation } from '@/types/database';

// ─── Types ───────────────────────────────────────────────────────────────────

type FaqItem = { question: string; answer: string };

type DonorPreview = Pick<Donation, 'id' | 'donor_name' | 'amount' | 'is_anonymous' | 'created_at'>;

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_CAMPAIGN: Campaign = {
  id: 'mock-c1',
  slug: 'ecoflow-power-station',
  title_ua: 'Збір на EcoFlow',
  title_en: 'EcoFlow Power Station',
  description_ua: {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Допоможемо військовим отримати EcoFlow' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Наші військові щодня виконують надскладні завдання, захищаючи Україну. На позиціях часто немає стабільного електропостачання, а енергія потрібна постійно — для зв\'язку, заряджки техніки, роботи дронів та іншого критично важливого обладнання.' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Ми відкриваємо збір на портативну зарядну станцію EcoFlow, яка допоможе забезпечити автономне живлення на позиціях. Такі станції дозволять швидко заряджати рації, телефони, планшети, дрони та іншу техніку, що прямо впливає на безпеку та ефективність роботи наших військових.' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Кожен донат наближає нас до мети.' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Навіть невеличкий внесок має значення. Разом ми можемо забезпечити наших захисників енергією, яка допоможе їм виконувати бойові завдання та зберігати життя.' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Дякуємо кожному, хто долучається до збору.' }] },
    ],
  } as unknown as Campaign['description_ua'],
  description_en: {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Help our military get an EcoFlow' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Our military performs extremely complex tasks every day, defending Ukraine. At positions there is often no stable power supply, and energy is needed constantly — for communications, charging equipment, operating drones and other critically important equipment.' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'We are opening a fundraiser for a portable EcoFlow charging station that will help provide autonomous power at positions.' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Every donation brings us closer to the goal. Even a small contribution matters. Together we can provide our defenders with the energy they need.' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Thank you to everyone who contributes to this campaign.' }] },
    ],
  } as unknown as Campaign['description_en'],
  faq_ua: [
    { question: 'Куди підуть кошти?', answer: 'Всі зібрані кошти підуть на закупівлю портативної зарядної станції EcoFlow для потреб ЗСУ.' },
    { question: 'Як я можу допомогти?', answer: 'Ви можете зробити донат будь-якої суми на цій сторінці або поділитися збором з друзями.' },
    { question: 'Коли буде закупка?', answer: 'Закупка буде здійснена одразу після досягнення мети збору. Звіт буде опублікований на сайті.' },
  ] as unknown as Campaign['faq_ua'],
  faq_en: [
    { question: 'Where will the funds go?', answer: 'All collected funds will go towards purchasing a portable EcoFlow charging station for the Armed Forces.' },
    { question: 'How can I help?', answer: 'You can make a donation of any amount on this page or share the campaign with friends.' },
    { question: 'When will the purchase be made?', answer: 'The purchase will be made immediately after reaching the campaign goal. A report will be published on the website.' },
  ] as unknown as Campaign['faq_en'],
  cover_image: null,
  gallery_images: [],
  goal_amount: 4000,
  current_amount: 800,
  preset_amounts: [10, 30, 50],
  status: 'active',
  sort_order: 0,
  published_at: '2026-01-10T10:00:00Z',
  created_at: '2026-01-10T10:00:00Z',
  updated_at: '2026-01-10T10:00:00Z',
};

const MOCK_ARCHIVED_CAMPAIGN: Campaign = {
  ...MOCK_CAMPAIGN,
  id: 'mock-c-archived',
  slug: 'evacuation-straps',
  title_ua: 'Стропи для евакуаційної машини',
  title_en: 'Recovery Straps for Evacuation Vehicle',
  current_amount: 4070,
  goal_amount: 3700,
  status: 'archived',
  gallery_images: [],
};

const MOCK_DONORS: DonorPreview[] = [
  { id: 'd1', donor_name: 'Anna Mert', amount: 200, is_anonymous: false, created_at: '2026-04-04T14:30:00Z' },
  { id: 'd2', donor_name: 'Anna Mert', amount: 200, is_anonymous: false, created_at: '2026-04-04T14:20:00Z' },
  { id: 'd3', donor_name: 'Anna Mert', amount: 200, is_anonymous: false, created_at: '2026-04-04T14:10:00Z' },
  { id: 'd4', donor_name: 'Anna Mert', amount: 200, is_anonymous: false, created_at: '2026-04-04T14:00:00Z' },
  { id: 'd5', donor_name: 'Anna Mert', amount: 200, is_anonymous: false, created_at: '2026-04-04T13:50:00Z' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string }[];
};

function renderRichText(doc: unknown): React.ReactNode[] {
  if (!doc || typeof doc !== 'object') return [];
  const root = doc as { content?: TiptapNode[] };
  if (!root.content) return [];
  return root.content.map((node, i) => {
    switch (node.type) {
      case 'heading': {
        const level = (node.attrs?.level as number) ?? 3;
        const text = renderInline(node.content);
        if (level === 2) return <h2 key={i} className="text-h3 mt-6 mb-3 text-text-strong">{text}</h2>;
        return <h3 key={i} className="text-h4 mt-4 mb-2 text-text-strong">{text}</h3>;
      }
      case 'paragraph':
        return <p key={i} className="text-body mb-4 text-text-primary leading-relaxed">{renderInline(node.content)}</p>;
      case 'image':
        return (
          <div key={i} className="relative my-6 aspect-video overflow-hidden rounded-xl">
            <Image src={node.attrs?.src as string} alt={(node.attrs?.alt as string) ?? ''} fill className="object-cover" sizes="(max-width: 768px) 100vw, 640px" />
          </div>
        );
      default:
        return null;
    }
  });
}

function renderInline(nodes?: TiptapNode[]): React.ReactNode {
  if (!nodes) return null;
  return nodes.map((node, i) => {
    if (node.type === 'text') {
      const isBold = node.marks?.some((m) => m.type === 'bold');
      if (isBold) return <strong key={i}>{node.text}</strong>;
      return <span key={i}>{node.text}</span>;
    }
    return null;
  });
}

function timeAgo(dateStr: string, locale: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return locale === 'ua' ? `${mins} хвилин тому` : `${mins} minute ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return locale === 'ua' ? `${hours} годин тому` : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return locale === 'ua' ? `${days} днів тому` : `${days} days ago`;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  let campaign: Campaign | null = null;
  let donors: DonorPreview[] = [];
  let relatedCampaigns: Campaign[] = [];

  try {
    const fetched = await db.campaign.findUnique({ where: { slug } });
    if (fetched) {
      campaign = fetched as unknown as Campaign;

      // Fetch recent donors for this campaign
      const fetchedDonors = await db.donation.findMany({
        where: { campaignId: campaign.id, status: 'COMPLETED' },
        take: 5,
      });
      donors = fetchedDonors as unknown as DonorPreview[];

      // Fetch related campaigns
      const fetchedRelated = await db.campaign.findMany({
        where: { status: 'ACTIVE' },
        take: 4,
      });
      relatedCampaigns = (fetchedRelated as unknown as Campaign[]).filter(
        (c) => c.slug !== slug,
      );
    }
  } catch {
    // DB not reachable
  }

  // Fallback to mock
  if (!campaign) {
    if (slug === MOCK_CAMPAIGN.slug) campaign = MOCK_CAMPAIGN;
    else if (slug === MOCK_ARCHIVED_CAMPAIGN.slug) campaign = MOCK_ARCHIVED_CAMPAIGN;
  }
  if (!campaign) notFound();

  if (donors.length === 0) donors = MOCK_DONORS;
  if (relatedCampaigns.length === 0) {
    relatedCampaigns = [MOCK_CAMPAIGN, MOCK_ARCHIVED_CAMPAIGN].filter(
      (c) => c.slug !== slug,
    );
  }

  const titleKey = locale === 'ua' ? 'title_ua' : 'title_en';
  const descKey = locale === 'ua' ? 'description_ua' : 'description_en';
  const faqKey = locale === 'ua' ? 'faq_ua' : 'faq_en';

  const title = campaign[titleKey];
  const isArchived = campaign.status === 'archived';
  const percentage = campaign.goal_amount > 0
    ? Math.round((Number(campaign.current_amount) / Number(campaign.goal_amount)) * 100)
    : 0;
  const progressWidth = Math.min(percentage, 100);
  const faqItems = (campaign[faqKey] as unknown as FaqItem[]) ?? [];
  const presets = campaign.preset_amounts?.length ? campaign.preset_amounts : [10, 30, 50];

  return (
    <>
      {/* ── Breadcrumb ───────────────────────────────────────────── */}
      <section className="border-b border-border bg-white py-3">
        <div className="container-page">
          <nav className="flex items-center gap-1 text-body-sm text-text-secondary">
            <Link href={`/${locale}`} className="hover:text-secondary">{t('campaigns.breadcrumb_home')}</Link>
            <span className="text-text-secondary/50">&rarr;</span>
            <Link href={`/${locale}/campaigns`} className="hover:text-secondary">{t('campaigns.breadcrumb_campaigns')}</Link>
            <span className="text-text-secondary/50">&rarr;</span>
            <span className="text-text-strong line-clamp-1">{title}</span>
          </nav>
        </div>
      </section>

      {/* ── Hero section ─────────────────────────────────────────── */}
      <section className="bg-secondary-10 py-10 lg:py-14">
        <div className="container-page">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            {/* Left: text */}
            <div>
              <span className={`badge mb-4 inline-block ${isArchived ? 'bg-grey-40 text-text-secondary' : 'bg-accent-3 text-text-strong'}`}>
                {isArchived ? t('campaigns.campaign_closed') : t('campaigns.campaign_active')}
              </span>
              <h1 className="text-h2 mb-4 text-text-strong lg:text-[40px] lg:leading-[120%]">{title}</h1>
              <p className="text-body max-w-lg text-text-secondary">
                {t('campaigns.description')}
              </p>
            </div>
            {/* Right: cover image */}
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-white">
              {campaign.cover_image ? (
                <Image src={campaign.cover_image} alt={title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-secondary-40 opacity-60" />
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between text-body-sm">
              <span className="font-medium text-text-strong">
                ${Number(campaign.current_amount).toLocaleString()}{' '}
                <span className="text-caption uppercase tracking-wide text-text-secondary">{t('campaigns.raised')}</span>
              </span>
              <span className="text-h4 text-text-strong">{percentage}%</span>
              <span className="font-medium text-text-strong">
                ${Number(campaign.goal_amount).toLocaleString()}{' '}
                <span className="text-caption uppercase tracking-wide text-text-secondary">{t('campaigns.goal')}</span>
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-white">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="container-page">
          <div className={`grid gap-10 ${!isArchived ? 'lg:grid-cols-[1fr_340px]' : ''}`}>
            {/* Left: Description + FAQ */}
            <div>
              {/* Tabs (visual only) */}
              {!isArchived && (
                <div className="mb-8 flex gap-2">
                  <span className="rounded-full bg-secondary px-5 py-2 text-body-sm font-medium text-white">
                    {t('campaigns.tab_description')}
                  </span>
                  <span className="rounded-full border border-border bg-white px-5 py-2 text-body-sm font-medium text-text-strong">
                    {t('campaigns.tab_faq')}
                  </span>
                </div>
              )}

              {/* Description with image */}
              <h2 className="text-h2 mb-6 text-text-strong">{title}</h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]">
                {campaign.cover_image && (
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl md:w-[240px]">
                    <Image src={campaign.cover_image} alt={title} fill className="object-cover" sizes="240px" />
                  </div>
                )}
                <div className="prose-custom">{renderRichText(campaign[descKey])}</div>
              </div>

              {/* FAQ */}
              {faqItems.length > 0 && !isArchived && (
                <div className="mt-10">
                  <h3 className="text-h3 mb-6 text-text-strong">{t('campaigns.faq_title')}</h3>
                  <div className="space-y-4">
                    {faqItems.map((faq, i) => (
                      <div key={i} className="rounded-xl border border-border p-5">
                        <h4 className="text-body mb-2 font-medium text-text-strong">{faq.question}</h4>
                        <p className="text-body-sm text-text-secondary">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Donation amounts (active only) */}
              {!isArchived && (
                <div className="mt-10">
                  <h3 className="text-body mb-4 text-center font-medium text-text-strong">
                    {t('donation.choose_amount')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {presets.map((amount) => (
                      <div key={amount} className="flex flex-col items-center gap-2 rounded-2xl border border-border p-5">
                        <span className="text-h3 font-medium text-text-strong">${amount}</span>
                        <button className="w-full rounded-full bg-secondary px-4 py-2 text-body-sm font-medium text-white transition-opacity hover:opacity-90">
                          {t('campaigns.support_btn')}
                        </button>
                      </div>
                    ))}
                    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border p-5">
                      <span className="text-h3 font-medium text-text-strong">{t('donation.custom')}</span>
                      <button className="w-full rounded-full bg-secondary px-4 py-2 text-body-sm font-medium text-white transition-opacity hover:opacity-90">
                        {t('campaigns.support_btn')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Archived: gallery + thank you */}
              {isArchived && (
                <>
                  {campaign.gallery_images.length > 0 && (
                    <div className="mt-10">
                      <h3 className="text-h3 mb-4 text-text-strong">{t('campaigns.report_title')}</h3>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {campaign.gallery_images.map((img, i) => (
                          <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                            <Image src={img} alt={`Report ${i + 1}`} fill className="object-cover" sizes="200px" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="mt-10 text-center text-body text-text-secondary italic">
                    {t('campaigns.thank_you_campaign')}
                  </p>
                </>
              )}
            </div>

            {/* Right: Sidebar (active only) */}
            {!isArchived && (
              <aside className="space-y-6">
                {/* Share */}
                <div className="rounded-2xl border border-border p-5">
                  <h3 className="text-body mb-3 font-medium text-text-strong">
                    {t('campaigns.share_title')}
                  </h3>
                  <button className="mb-3 inline-flex items-center gap-2 text-body-sm text-secondary hover:opacity-70">
                    <LinkIcon size={14} />
                    {t('campaigns.copy_link')}
                  </button>
                  <div className="flex gap-2">
                    <a href="#" className="transition-opacity hover:opacity-70" aria-label="Facebook"><FacebookColorIcon size={32} /></a>
                    <a href="#" className="transition-opacity hover:opacity-70" aria-label="WhatsApp"><WhatsAppIcon size={32} /></a>
                    <a href="#" className="transition-opacity hover:opacity-70" aria-label="Instagram"><InstagramColorIcon size={32} /></a>
                    <a href="#" className="text-text-strong transition-opacity hover:opacity-70" aria-label="X"><XTwitterIcon size={32} /></a>
                  </div>
                </div>

                {/* Donors */}
                <div className="rounded-2xl border border-border p-5">
                  <h3 className="text-body mb-4 font-medium text-text-strong">
                    {t('donation.donors')}
                  </h3>
                  <div className="space-y-4">
                    {donors.map((donor) => (
                      <div key={donor.id} className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-body-sm font-medium text-text-strong">
                          {donor.is_anonymous ? '?' : (donor.donor_name?.[0] ?? 'A')}
                        </div>
                        <div>
                          <p className="text-body-sm font-medium text-text-strong">
                            {donor.is_anonymous ? (locale === 'ua' ? 'Анонім' : 'Anonymous') : donor.donor_name}
                          </p>
                          <p className="text-body-sm text-text-strong">${Number(donor.amount).toFixed(2)}</p>
                          <p className="text-caption text-text-secondary">{timeAgo(donor.created_at, locale)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full rounded-full border border-border bg-white py-2 text-body-sm font-medium text-text-strong transition-colors hover:bg-grey-40">
                    {t('campaigns.see_more_donors')}
                  </button>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* ── Related campaigns ────────────────────────────────────── */}
      {relatedCampaigns.length > 0 && (
        <section className="section bg-bg">
          <div className="container-page">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-h2 text-text-strong">
                {isArchived ? t('campaigns.active_campaigns') : t('campaigns.other_campaigns')}
              </h2>
              <div className="flex gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {relatedCampaigns.slice(0, 4).map((c) => (
                <CampaignCard
                  key={c.id}
                  slug={c.slug}
                  locale={locale}
                  title={c[titleKey]}
                  coverImage={c.cover_image}
                  goalAmount={Number(c.goal_amount)}
                  currentAmount={Number(c.current_amount)}
                  isArchived={c.status === 'archived'}
                  raisedLabel={t('campaigns.raised')}
                  goalLabel={t('campaigns.goal')}
                  donateBtnLabel={t('campaigns.donate_btn')}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
