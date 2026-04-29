import Link from "next/link";
import { getTranslations } from "next-intl/server";

import CursorDonateIcon from "@/components/icons/CursorDonateIcon";
import BasketDonateIcon from "@/components/icons/BasketDonateIcon";
import LotteryIcon from "@/components/icons/LotteryIcon";
import Support2Icon from "@/components/icons/Support2Icon";
import DonateIcon from "../icons/DonateIcon";

interface SupportSectionProps {
  locale: string;
}

export async function SupportSection({ locale }: SupportSectionProps) {
  const t = await getTranslations({ locale, namespace: "home.sections" });

  // Shared classes for the small tiles. Span behaviour is appended per-tile.
  const tileBase =
    "group relative flex flex-col items-center justify-start overflow-hidden rounded-2xl p-6 text-center transition-colors duration-300 lg:justify-center lg:p-8";
  const titleCls = "text-h3 font-semibold text-text-strong";
  const descCls = "mt-2 text-body-sm text-text-secondary";
  const iconCls =
    "pointer-events-none absolute bottom-4 right-4 text-text-strong opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:bottom-6 lg:right-6";

  return (
    <section className="section">
      <div className="container-page">
        {/* Mobile + tablet: title above the grid (no grey card). */}
        <div className="mb-6 text-center lg:hidden lg:text-left">
          <h2 className="text-h2 font-semibold text-text-strong">
            {t("support_title")}
          </h2>
          <p className="mt-4 whitespace-pre-line text-body text-text-secondary">
            {t("support_description")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:grid-rows-[400px_400px]">
          {/* Підписка — col 1 row 1 on every breakpoint */}
          <Link
            href={`/${locale}/contact`}
            className={`${tileBase} bg-accent-1 hover:bg-[#fbdc4f] min-h-45 lg:min-h-0`}
          >
            <h3 className={titleCls}>{t("subscription")}</h3>
            <p className={descCls}>{t("subscription_desc")}</p>
            <CursorDonateIcon size={48} className={iconCls} />
          </Link>

          {/* Title tile — desktop only (mobile/tablet show the title above the grid). */}
          <div className="hidden rounded-2xl bg-grey-40 p-8 lg:col-span-3 lg:flex lg:flex-col lg:justify-center">
            <h2 className="text-h2 font-semibold text-text-strong">
              {t("support_title")}
            </h2>
            <p className="mt-4 max-w-2xl whitespace-pre-line text-body text-text-secondary">
              {t("support_description")}
            </p>
          </div>

          {/* Донат — base/md: row 1 col 2.  lg: col 1 row 2. */}
          <Link
            href={`/${locale}/campaigns`}
            className={`${tileBase} bg-accent-2 hover:bg-[#9AC9FF] min-h-45 lg:min-h-0`}
          >
            <h3 className={titleCls}>{t("donate")}</h3>
            <p className={descCls}>{t("donate_desc")}</p>
            <DonateIcon size={48} className={iconCls} />
          </Link>

          {/* Магазин — base: full-width row.  md: col 1 row-span 2.  lg: cols 2-3 row 2. */}
          <Link
            href={`/${locale}/shop`}
            className={`${tileBase} bg-accent-3 hover:bg-[#9AF3A2] col-span-2 min-h-45 md:col-span-1 md:row-span-2 lg:col-span-2 lg:row-span-1 lg:min-h-0`}
          >
            <h3 className={titleCls}>{t("shop")}</h3>
            <p className={descCls}>{t("shop_desc")}</p>
            <BasketDonateIcon size={64} className={iconCls} />
          </Link>

          {/* Right column row 2 on lg — stacks Діями + Аукціон vertically inside one grid cell */}
          <div className="contents lg:flex lg:flex-col lg:gap-4">
            {/* Діями */}
            <Link
              href={`/${locale}/contact`}
              className={`${tileBase} bg-accent-4 hover:bg-[#EE9FE4] min-h-45 lg:min-h-0 lg:flex-1`}
            >
              <h3 className={titleCls}>{t("volunteer")}</h3>
              <p className={descCls}>{t("volunteer_desc")}</p>
              <Support2Icon size={48} className={iconCls} />
            </Link>

            {/* Аукціон та лотерея */}
            <Link
              href={`/${locale}/events`}
              className={`${tileBase} bg-accent-5 hover:bg-[#C2C5FF] min-h-45 lg:min-h-0 lg:flex-1`}
            >
              <h3 className={titleCls}>{t("auction")}</h3>
              <p className={descCls}>{t("auction_desc")}</p>
              <LotteryIcon size={48} className={iconCls} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
