import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ReportIcon from "@/components/icons/ReportIcon";
import { db } from "@/lib/db";
import type { Report } from "@/types/database";
import { SupportSection } from "@/components/home/SupportSection";
import { ContactSection } from "@/components/contact/ContactSection";

type ReportItem = {
  key: string;
  year: string;
  yearLabel: string;
  subtitle: string;
  description: string;
  pdfUrl: string | null;
  image: string;
  imageAlt: string;
};

const FALLBACK_IMAGE = "/images/report/report.webp";

const detailsBtnBase =
  "inline-flex items-center justify-center rounded-full px-10 py-[14px] text-body font-medium transition-colors duration-300";
const detailsBtnEnabled = `${detailsBtnBase} bg-secondary text-white hover:bg-secondary/90`;
const detailsBtnDisabled = `${detailsBtnBase} bg-grey-40 text-text-tertiary cursor-not-allowed`;

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "reports" });

  const yearSingular = t("year_singular");

  const dbReports = (await db.report.findMany({
    where: { status: "PUBLISHED" },
  })) as Report[];

  let items: ReportItem[];

  if (dbReports.length > 0) {
    items = dbReports.map((r) => {
      const isEn = locale === "en";
      const localizedPdf = isEn ? r.pdf_url_en : r.pdf_url_ua;
      // Fall back to the other locale's PDF if the requested one isn't uploaded yet,
      // so the user is never left without a document.
      const pdfUrl = localizedPdf || (isEn ? r.pdf_url_ua : r.pdf_url_en);
      return {
        key: r.id,
        year: String(r.year),
        yearLabel: yearSingular,
        subtitle: isEn ? r.title_en : r.title_ua,
        description: (isEn ? r.description_en : r.description_ua) ?? "",
        pdfUrl,
        image: r.cover_image || FALLBACK_IMAGE,
        imageAlt: isEn ? r.title_en : r.title_ua,
      };
    });
  } else {
    // Fallback content from translations until the admin publishes the first report.
    items = [
      {
        key: "2025",
        year: "2025",
        yearLabel: yearSingular,
        subtitle: t("item_2025.subtitle"),
        description: t("item_2025.description"),
        pdfUrl: null,
        image: FALLBACK_IMAGE,
        imageAlt: t("item_2025.subtitle"),
      },
      {
        key: "2024",
        year: "2024",
        yearLabel: yearSingular,
        subtitle: t("item_2024.subtitle"),
        description: t("item_2024.description"),
        pdfUrl: null,
        image: FALLBACK_IMAGE,
        imageAlt: t("item_2024.subtitle"),
      },
      {
        key: "2022-2023",
        year: "2023 - 2022",
        yearLabel: t("year_plural"),
        subtitle: t("item_2022_2023.subtitle"),
        description: t("item_2022_2023.description"),
        pdfUrl: null,
        image: FALLBACK_IMAGE,
        imageAlt: t("item_2022_2023.subtitle"),
      },
    ];
  }

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="pt-6 pb-10 lg:pt-10 lg:pb-16">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-2xl bg-secondary px-6 py-10 sm:px-10 sm:py-12 lg:px-16 lg:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-6 right-4 text-white/90 sm:top-8 sm:right-8 lg:top-1/2 lg:right-16 lg:-translate-y-1/2"
            >
              <ReportIcon className="h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32" />
            </div>

            <div className="relative max-w-[26ch] lg:mx-auto lg:max-w-[60ch] lg:text-center">
              <p className="text-body-sm mb-3 text-white/80 lg:text-body">
                {t("eyebrow")}
              </p>
              <h1 className="text-display mb-6 pr-20 text-white sm:pr-28 lg:pr-0">
                {t("title")}
              </h1>
              <p className="text-body text-white/90 lg:mx-auto">
                {t("description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reports list ──────────────────────────────────────── */}
      <section className="pb-16 lg:pb-24">
        <div className="container-page">
          <div className="flex flex-col gap-12 lg:gap-20">
            {items.map((item, index) => {
              const imageRightOnDesktop = index % 2 === 0;
              return (
                <article
                  key={item.key}
                  className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12"
                >
                  <div
                    className={`relative aspect-[16/11] w-full overflow-hidden rounded-2xl bg-grey-40 ${
                      imageRightOnDesktop ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>

                  <div
                    className={`flex flex-col gap-6 ${
                      imageRightOnDesktop ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <div>
                      <p className="flex items-baseline gap-3 text-text-strong">
                        <span className="text-display">{item.year}</span>
                        <span className="text-h3 text-text-secondary">
                          {item.yearLabel}
                        </span>
                      </p>
                      <hr className="mt-6 border-border" />
                    </div>

                    <h2 className="text-h2 font-medium text-text-strong">
                      {item.subtitle}
                    </h2>

                    {item.description && (
                      <p className="text-body-sm text-text-secondary">
                        {item.description}
                      </p>
                    )}

                    <div className="pt-2 lg:self-start">
                      {item.pdfUrl ? (
                        <a
                          href={item.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={detailsBtnEnabled}
                        >
                          {t("details")}
                        </a>
                      ) : (
                        <span
                          aria-disabled="true"
                          className={detailsBtnDisabled}
                        >
                          {t("details")}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <SupportSection locale={locale} />
      <ContactSection
        title={t("contact_title")}
        description={t("contact_description")}
      />
    </>
  );
}
