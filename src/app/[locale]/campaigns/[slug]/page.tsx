import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

import { db } from "@/lib/db";
import { findMockPreview, MOCK_ACTIVE } from "../_mocks";
import { CampaignsCarousel } from "@/components/campaigns/CampaignsCarousel";
import { CampaignTabs } from "@/components/campaigns/CampaignTabs";
import {
  CampaignShareCard,
  ShareSocials,
} from "@/components/campaigns/CampaignShareCard";
import { CampaignDonorsList } from "@/components/campaigns/CampaignDonorsList";
import { CopyLinkButton } from "@/components/campaigns/CopyLinkButton";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import type { Campaign, Donation } from "@/types/database";

// ─── Types ───────────────────────────────────────────────────────────────────

type FaqItem = { question: string; answer: string };

type DonorPreview = Pick<
  Donation,
  "id" | "donor_name" | "amount" | "is_anonymous" | "created_at"
>;

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_CAMPAIGN: Campaign = {
  id: "mock-c1",
  slug: "ecoflow-power-station",
  title_ua: "Збір на EcoFlow",
  title_en: "EcoFlow Power Station",
  description_ua: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [
          {
            type: "text",
            marks: [{ type: "bold" }],
            text: "Допоможемо військовим отримати EcoFlow",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Наші військові щодня виконують надскладні завдання, захищаючи Україну. На позиціях часто немає стабільного електропостачання, а енергія потрібна постійно — для зв'язку, заряджки техніки, роботи дронів та іншого критично важливого обладнання.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Ми відкриваємо збір на портативну зарядну станцію EcoFlow, яка допоможе забезпечити автономне живлення на позиціях. Такі станції дозволять швидко заряджати рації, телефони, планшети, дрони та іншу техніку, що прямо впливає на безпеку та ефективність роботи наших військових.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Кожен донат наближає нас до мети." }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Навіть невеличкий внесок має значення. Разом ми можемо забезпечити наших захисників енергією, яка допоможе їм виконувати бойові завдання та зберігати життя.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Дякуємо кожному, хто долучається до збору." },
        ],
      },
    ],
  } as unknown as Campaign["description_ua"],
  description_en: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [
          {
            type: "text",
            marks: [{ type: "bold" }],
            text: "Help our military get an EcoFlow",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Our military performs extremely complex tasks every day, defending Ukraine. At positions there is often no stable power supply, and energy is needed constantly — for communications, charging equipment, operating drones and other critically important equipment.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "We are opening a fundraiser for a portable EcoFlow charging station that will help provide autonomous power at positions.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Every donation brings us closer to the goal. Even a small contribution matters. Together we can provide our defenders with the energy they need.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Thank you to everyone who contributes to this campaign.",
          },
        ],
      },
    ],
  } as unknown as Campaign["description_en"],
  faq_ua: [
    {
      question: "Куди підуть кошти?",
      answer:
        "Всі зібрані кошти підуть на закупівлю портативної зарядної станції EcoFlow для потреб ЗСУ.",
    },
    {
      question: "Як я можу допомогти?",
      answer:
        "Ви можете зробити донат будь-якої суми на цій сторінці або поділитися збором з друзями.",
    },
    {
      question: "Коли буде закупка?",
      answer:
        "Закупка буде здійснена одразу після досягнення мети збору. Звіт буде опублікований на сайті.",
    },
  ] as unknown as Campaign["faq_ua"],
  faq_en: [
    {
      question: "Where will the funds go?",
      answer:
        "All collected funds will go towards purchasing a portable EcoFlow charging station for the Armed Forces.",
    },
    {
      question: "How can I help?",
      answer:
        "You can make a donation of any amount on this page or share the campaign with friends.",
    },
    {
      question: "When will the purchase be made?",
      answer:
        "The purchase will be made immediately after reaching the campaign goal. A report will be published on the website.",
    },
  ] as unknown as Campaign["faq_en"],
  cover_image:
    "/images/fundaraising/backup-power-station-mobile-gadgets-charged-outdoor.webp",
  gallery_images: [],
  goal_amount: 4000,
  current_amount: 800,
  preset_amounts: [10, 30, 50],
  short_description_ua:
    "Забезпечуємо незалежність від електромережі для цивільних ініціатив. Портативна станція EcoFlow дозволить заряджати засоби зв'язку та освітлення, необхідні для координації допомоги в постраждалих регіонах.",
  short_description_en:
    "We provide independence from the power grid for civilian initiatives. A portable EcoFlow station will charge communication tools and lighting needed to coordinate aid in affected regions.",
  status: "active",
  sort_order: 0,
  published_at: "2026-01-10T10:00:00Z",
  created_at: "2026-01-10T10:00:00Z",
  updated_at: "2026-01-10T10:00:00Z",
};

const MOCK_ARCHIVED_CAMPAIGN: Campaign = {
  ...MOCK_CAMPAIGN,
  id: "mock-c-archived",
  slug: "evacuation-straps",
  title_ua: "Стропи для евакуаційної машини",
  title_en: "Recovery Straps for Evacuation Vehicle",
  current_amount: 4070,
  goal_amount: 3700,
  status: "archived",
  gallery_images: [],
};

function buildMockDonors(): DonorPreview[] {
  // Mock the last 10 transactions: first 5 render inline, the next 5 are
  // surfaced via the "Подивитись більше" side-panel.
  const now = Date.now();
  const minute = 60_000;
  return Array.from({ length: 10 }, (_, i) => ({
    id: `d${i + 1}`,
    donor_name: "Anna Mert",
    amount: 200,
    is_anonymous: false,
    created_at: new Date(now - (10 + i * 5) * minute).toISOString(),
  }));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string }[];
};

function renderRichText(doc: unknown): React.ReactNode[] {
  if (!doc || typeof doc !== "object") return [];
  const root = doc as { content?: TiptapNode[] };
  if (!root.content) return [];
  return root.content.map((node, i) => {
    switch (node.type) {
      case "heading": {
        const level = (node.attrs?.level as number) ?? 3;
        const text = renderInline(node.content);
        if (level === 2)
          return (
            <h2 key={i} className="text-h3 mt-6 mb-3 text-text-strong">
              {text}
            </h2>
          );
        return (
          <h3 key={i} className="text-h4 mt-4 mb-2 text-text-strong">
            {text}
          </h3>
        );
      }
      case "paragraph":
        return (
          <p
            key={i}
            className="text-body mb-4 text-text-primary leading-relaxed"
          >
            {renderInline(node.content)}
          </p>
        );
      case "image":
        return (
          <div
            key={i}
            className="relative my-6 aspect-video overflow-hidden rounded-xl"
          >
            <Image
              src={node.attrs?.src as string}
              alt={(node.attrs?.alt as string) ?? ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 640px"
            />
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
    if (node.type === "text") {
      const isBold = node.marks?.some((m) => m.type === "bold");
      if (isBold) return <strong key={i}>{node.text}</strong>;
      return <span key={i}>{node.text}</span>;
    }
    return null;
  });
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

      // Fetch recent donors for this campaign — 10 so the inline list shows
      // 5 and the "Подивитись більше" side panel can surface the next 5.
      const fetchedDonors = await db.donation.findMany({
        where: { campaignId: campaign.id, status: "COMPLETED" },
        take: 10,
      });
      donors = fetchedDonors as unknown as DonorPreview[];

      // Sum all completed donations for this campaign and add the
      // admin-managed offline-contributions offset stored in `current_amount`.
      try {
        const agg = await db.donation.aggregate({
          where: { campaignId: campaign.id, status: "COMPLETED" },
          _sum: { amount: true },
        });
        const onlineTotal = agg._sum.amount?.toNumber() ?? 0;
        campaign = {
          ...campaign,
          current_amount: Number(campaign.current_amount) + onlineTotal,
        };
      } catch {
        // ignore – fall back to whatever current_amount the campaign row had
      }

      // Fetch related campaigns (active only — never archived)
      const fetchedRelated = await db.campaign.findMany({
        where: { status: "ACTIVE" },
        take: 12,
      });
      relatedCampaigns = (fetchedRelated as unknown as Campaign[]).filter(
        (c) => c.slug !== slug,
      );
    }
  } catch {
    // DB not reachable
  }

  // Fallback to mock — uses the shared listing catalog so every slug shown on
  // /campaigns has a working detail page even before the DB is populated.
  if (!campaign) {
    if (slug === MOCK_CAMPAIGN.slug) campaign = MOCK_CAMPAIGN;
    else if (slug === MOCK_ARCHIVED_CAMPAIGN.slug)
      campaign = MOCK_ARCHIVED_CAMPAIGN;
    else {
      const preview = findMockPreview(slug);
      if (preview) {
        const base =
          preview.status === "archived"
            ? MOCK_ARCHIVED_CAMPAIGN
            : MOCK_CAMPAIGN;
        campaign = {
          ...base,
          id: preview.id,
          slug: preview.slug,
          title_ua: preview.title_ua,
          title_en: preview.title_en,
          cover_image: preview.cover_image,
          goal_amount: preview.goal_amount,
          current_amount: preview.current_amount,
          status: preview.status,
        };
      }
    }
  }
  if (!campaign) notFound();

  if (donors.length === 0) donors = buildMockDonors();
  if (relatedCampaigns.length === 0) {
    // Build fallback active-only list from the shared listing catalog so the
    // carousel always has multiple cards even before the DB is populated.
    relatedCampaigns = MOCK_ACTIVE.filter((c) => c.slug !== slug).map(
      (c) => ({ ...MOCK_CAMPAIGN, ...c }) as Campaign,
    );
  } else {
    // Defensive: belt-and-braces filter if the DB returned anything archived.
    relatedCampaigns = relatedCampaigns.filter(
      (c) => c.slug !== slug && c.status !== "archived",
    );
  }

  const titleKey = locale === "ua" ? "title_ua" : "title_en";
  const descKey = locale === "ua" ? "description_ua" : "description_en";
  const faqKey = locale === "ua" ? "faq_ua" : "faq_en";

  const title = campaign[titleKey];
  const shortDescription =
    (locale === "ua"
      ? campaign.short_description_ua
      : campaign.short_description_en) ?? "";
  const isArchived = campaign.status === "archived";
  const percentage =
    campaign.goal_amount > 0
      ? Math.round(
          (Number(campaign.current_amount) / Number(campaign.goal_amount)) *
            100,
        )
      : 0;
  const progressWidth = Math.min(percentage, 100);
  const faqItems = (campaign[faqKey] as unknown as FaqItem[]) ?? [];
  const presets = campaign.preset_amounts?.length
    ? campaign.preset_amounts
    : [10, 30, 50];

  const currencyLocale = locale === "ua" ? "uk-UA" : "en-AU";
  const formatAmount = (n: number) =>
    new Intl.NumberFormat(currencyLocale, {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
      currencyDisplay: "narrowSymbol",
    }).format(n);

  return (
    <>
      {/* ── Breadcrumb ───────────────────────────────────────────── */}
      <section className="pt-6 pb-4 lg:pt-8">
        <div className="container-page">
          <Breadcrumb
            crumbs={[
              { label: t("campaigns.breadcrumb_home"), href: `/${locale}` },
              {
                label: t("campaigns.breadcrumb_campaigns"),
                href: `/${locale}/campaigns`,
              },
            ]}
            current={title}
            className="text-body"
          />
        </div>
      </section>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      {/* Mobile/tablet: full-bleed background. Desktop: rounded card inside container. */}
      <section className="bg-secondary-20 pb-10 lg:bg-transparent lg:pb-6">
        <div className="container-page">
          <div className="py-5 sm:py-8 lg:rounded-4xl lg:bg-secondary-20 lg:p-10">
            <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_auto] lg:gap-10">
              {/* Left: badge + title + short description.
                  Mobile centers the text; tablet+ left-aligns. */}
              <div className="max-w-2xl text-center sm:text-left">
                <span
                  className={`mb-6 inline-flex rounded-full px-6 py-2 text-body font-semibold ${
                    isArchived
                      ? "bg-grey-40 text-text-secondary"
                      : "bg-secondary text-white"
                  }`}
                >
                  {isArchived
                    ? t("campaigns.campaign_closed")
                    : t("campaigns.campaign_active")}
                </span>
                <h1 className="text-display mb-5 text-text-strong">{title}</h1>
                {shortDescription && (
                  <p className="text-body text-text-primary">
                    {shortDescription}
                  </p>
                )}
              </div>
              {/* Right: cover image.
                  Mobile = square frame, tablet = wide 16/9, desktop = fixed 450². */}
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl sm:aspect-video lg:aspect-auto lg:h-112.5 lg:w-112.5">
                {campaign.cover_image ? (
                  <Image
                    src={campaign.cover_image}
                    alt={title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 450px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[repeating-conic-gradient(#e9e9ea_0%_25%,#f5f5f6_0%_50%)] bg-size-[32px_32px]" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress row — sits flush below the rounded card.
              Mobile stacks eyebrow above amount inside each column;
              tablet+ inlines them. */}
      <section className="pb-6">
        <div className="container-page">
          <div className="mt-8 lg:mt-10">
            <div className="grid grid-cols-3 items-baseline gap-2 px-1 sm:px-2">
              {/* Raised */}
              <span className="flex flex-col items-start sm:flex-row sm:items-baseline sm:gap-2">
                <span className="order-2 text-body-sm uppercase tracking-wide text-text-primary sm:order-2">
                  {t("campaigns.raised")}
                </span>
                <span className="order-1 text-[28px] font-medium leading-none text-text-strong sm:order-1 sm:text-[32px] lg:text-[40px]">
                  {formatAmount(Number(campaign.current_amount))}
                </span>
              </span>
              {/* Percentage */}
              <span className="text-center text-[28px] font-medium leading-none text-text-strong sm:text-[32px] lg:text-[40px]">
                {percentage}%
              </span>
              {/* Goal */}
              <span className="flex flex-col items-end sm:flex-row sm:items-baseline sm:justify-end sm:gap-2">
                <span className="order-2 text-body-sm uppercase tracking-wide text-text-primary sm:order-1">
                  {t("campaigns.goal")}
                </span>
                <span className="order-1 text-[28px] font-medium leading-none text-text-strong sm:order-2 sm:text-[32px] lg:text-[40px]">
                  {formatAmount(Number(campaign.goal_amount))}
                </span>
              </span>
            </div>
            <div className="relative mt-4 h-1.5 w-full rounded-full bg-primary-40">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-300"
                style={{ width: `${progressWidth}%` }}
              />
              <div className="none lg:absolute -bottom-5 left-0 h-0.5 w-full bg-secondary" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────────── */}
      <section className="section pt-4 ">
        <div className="container-page">
          {/* Mobile / tablet share card — sits above the content panel.
              Hidden on desktop where it lives in the right sidebar. */}
          {!isArchived && (
            <div className="mb-6 lg:hidden">
              <CampaignShareCard
                copyLinkLabel={t("campaigns.copy_link")}
                copiedLabel={t("campaigns.copy_link_copied")}
                shareViaLabel={t("campaigns.share")}
              />
            </div>
          )}

          <div
            className={`grid gap-6 lg:gap-8 ${!isArchived ? "lg:grid-cols-[1fr_340px]" : ""}`}
          >
            {/* Left: Tabs panel + donation amounts */}
            <div>
              {!isArchived ? (
                <div>
                  <CampaignTabs
                    descriptionLabel={t("campaigns.tab_description")}
                    faqLabel={t("campaigns.tab_faq")}
                    description={
                      <DescriptionPanel
                        doc={campaign[descKey]}
                        coverImage={campaign.cover_image}
                        coverAlt={title}
                      />
                    }
                    faq={<FaqPanel items={faqItems} />}
                  />

                  {/* Donation amounts — always visible regardless of tab */}
                  <div className="mt-10 lg:mt-12">
                    <h3 className="text-h3 mb-6 text-center font-semibold text-text-strong">
                      {t("donation.choose_amount")}
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {presets.map((amount) => (
                        <DonationAmountCard
                          key={amount}
                          label={`$${amount}`}
                          ctaLabel={t("campaigns.support_btn")}
                        />
                      ))}
                      <DonationAmountCard
                        label={t("donation.custom").toUpperCase()}
                        ctaLabel={t("campaigns.support_btn")}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Archived branch — keep the prior simple layout */
                <div>
                  <h2 className="text-title-tablet mb-6 lg:mb-10 text-grey-100">
                    {title}
                  </h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]">
                    {campaign.cover_image && (
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl md:w-60">
                        <Image
                          src={campaign.cover_image}
                          alt={title}
                          fill
                          className="object-cover"
                          sizes="240px"
                        />
                      </div>
                    )}
                    <div className="prose-custom">
                      {renderRichText(campaign[descKey])}
                    </div>
                  </div>
                  {campaign.gallery_images.length > 0 && (
                    <div className="mt-10">
                      <h3 className="text-h3 mb-4 text-text-strong">
                        {t("campaigns.report_title")}
                      </h3>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {campaign.gallery_images.map((img, i) => (
                          <div
                            key={i}
                            className="relative aspect-square overflow-hidden rounded-xl"
                          >
                            <Image
                              src={img}
                              alt={`Report ${i + 1}`}
                              fill
                              className="object-cover"
                              sizes="200px"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="mt-10 text-center text-body text-text-secondary italic">
                    {t("campaigns.thank_you_campaign")}
                  </p>
                </div>
              )}
            </div>

            {/* Desktop sidebar — single white card with share section on
                top, then donors below, separated by a thin grey rule. */}
            {!isArchived && (
              <aside className="hidden lg:block">
                <div className="rounded-[24px] border border-grey-40 bg-white p-6">
                  {/* Share */}
                  <h3 className="text-h3 mb-3 font-semibold text-text-strong">
                    {t("campaigns.share_title")}
                  </h3>
                  <CopyLinkButton
                    variant="link"
                    label={t("campaigns.copy_link_short")}
                    copiedLabel={t("campaigns.copy_link_copied")}
                  />
                  <div className="mt-4 flex items-center gap-3">
                    <ShareSocials size={48} />
                  </div>

                  {/* Donors — sidebar variant renders inner content only */}
                  <div className="mt-6  border-grey-40 pt-6">
                    <CampaignDonorsList
                      donors={donors}
                      locale={locale}
                      title={t("donation.donors")}
                      seeMoreLabel={t("campaigns.see_more_donors")}
                      anonymousLabel={t("campaigns.anonymous")}
                      variant="sidebar"
                    />
                  </div>
                </div>
              </aside>
            )}
          </div>

          {/* Mobile / tablet donors block — under the content panel */}
          {!isArchived && (
            <div className="mt-10 lg:hidden">
              <CampaignDonorsList
                donors={donors}
                locale={locale}
                title={t("donation.donors")}
                seeMoreLabel={t("campaigns.see_more_donors")}
                anonymousLabel={t("campaigns.anonymous")}
                variant="grid"
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Related campaigns (active only) ──────────────────────── */}
      {relatedCampaigns.length > 0 && (
        <section className="bg-secondary-10 py-12 lg:py-16">
          <div className="container-page">
            <CampaignsCarousel
              title={t("campaigns.other_campaigns")}
              locale={locale}
              campaigns={relatedCampaigns.map((c) => ({
                id: c.id,
                slug: c.slug,
                title: c[titleKey],
                coverImage: c.cover_image,
                goalAmount: Number(c.goal_amount),
                currentAmount: Number(c.current_amount),
              }))}
              raisedLabel={t("campaigns.raised")}
              goalLabel={t("campaigns.goal")}
              donateBtnLabel={t("campaigns.donate_btn")}
              prevAriaLabel={t("campaigns.carousel_prev")}
              nextAriaLabel={t("campaigns.carousel_next")}
            />
          </div>
        </section>
      )}
    </>
  );
}

// ─── Local sub-components ────────────────────────────────────────────────────

function DescriptionPanel({
  doc,
  coverImage,
  coverAlt,
}: {
  doc: unknown;
  coverImage: string | null;
  coverAlt: string;
}) {
  // Parse the TipTap doc directly so we can interleave the cover image with
  // the first paragraphs (per Figma desktop layout) and style the trailing
  // "Дякуємо…" line as a bold, centered closer.
  const root = (doc as { content?: TiptapNode[] }) ?? {};
  const nodes = root.content ?? [];
  const heading = nodes.find((n) => n.type === "heading");
  const paragraphs = nodes.filter((n) => n.type === "paragraph");
  const last = paragraphs[paragraphs.length - 1];
  const middle = paragraphs.slice(0, -1);
  // The first two paragraphs render alongside the image on `md+`. Anything
  // after that flows full-width below.
  const introParagraphs = middle.slice(0, 2);
  const bodyParagraphs = middle.slice(2);

  return (
    <div className="text-body text-text-primary">
      {heading && (
        <h2 className="text-title-mobile mb-4 text-center  text-grey-100 md:mb-8 md:text-left">
          {renderInline(heading.content)}
        </h2>
      )}

      {/* Image + intro paragraphs — two-column on `md+`, stacked on mobile. */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[280px_1fr] md:gap-8">
        {coverImage && (
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl md:w-75.5 md:aspect-3/2">
            <Image
              src={coverImage}
              alt={coverAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 280px"
            />
          </div>
        )}
        {introParagraphs.length > 0 && (
          <div className="space-y-4">
            {introParagraphs.map((p, i) => (
              <p key={i} className="leading-relaxed">
                {renderInline(p.content)}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Remaining paragraphs flow full-width under the image grid. */}
      {bodyParagraphs.length > 0 && (
        <div className="mt-6 space-y-4">
          {bodyParagraphs.map((p, i) => (
            <p key={i} className="leading-relaxed">
              {renderInline(p.content)}
            </p>
          ))}
        </div>
      )}

      {/* Closing line — bold, left-aligned per Figma. */}
      {last && (
        <p className="mt-6 text-body font-medium md:mt-8">
          {renderInline(last.content)}
        </p>
      )}
    </div>
  );
}

function FaqPanel({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return <FaqAccordion items={items} />;
}

function DonationAmountCard({
  label,
  ctaLabel,
}: {
  label: string;
  ctaLabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-[20px] border border-[#A8B6CC]/40 bg-white px-6 py-6 sm:py-8">
      <span className="text-h2 font-medium text-text-strong">{label}</span>
      <button
        type="button"
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-secondary px-6 text-body-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
