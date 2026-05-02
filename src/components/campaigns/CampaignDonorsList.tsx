"use client";

import { useState } from "react";
import type { Donation } from "@/types/database";

export type DonorPreview = Pick<
  Donation,
  "id" | "donor_name" | "amount" | "is_anonymous" | "created_at"
>;

type Props = {
  donors: DonorPreview[];
  locale: string;
  title: string;
  seeMoreLabel: string;
  anonymousLabel: string;
  /**
   * How many entries to show before "see more" expands the list inline to
   * reveal the rest. Defaults to 5.
   */
  visibleCount?: number;
  /**
   * Layout of the donor cards.
   *  • `sidebar` – single column, no outer wrapper (callers nest it inside
   *    a parent card). Each entry is separated by a thin top border.
   *  • `grid`    – 1 col on mobile, 2 cols on tablet+. Each entry sits in
   *    its own light-blue chip. Used below the main content on `< lg`.
   */
  variant?: "sidebar" | "grid";
};

const AVATAR_BGS = [
  "bg-accent-3",
  "bg-secondary-10",
  "bg-accent-1",
  "bg-[#FCE0E8]",
  "bg-[#FCE0E8]",
];

function timeAgo(dateStr: string, locale: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.max(1, Math.floor(diff / 60000));
  if (mins < 60) {
    return locale === "ua" ? `${mins} хв тому` : `${mins} minute ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return locale === "ua" ? `${hours} год тому` : `${hours} hours ago`;
  }
  const days = Math.floor(hours / 24);
  return locale === "ua" ? `${days} дн тому` : `${days} days ago`;
}

export function CampaignDonorsList({
  donors,
  locale,
  title,
  seeMoreLabel,
  anonymousLabel,
  visibleCount = 5,
  variant = "sidebar",
}: Props) {
  const isGrid = variant === "grid";
  const [showAll, setShowAll] = useState(false);

  const visibleDonors = showAll ? donors : donors.slice(0, visibleCount);
  const hasMore = donors.length > visibleCount;

  return (
    <div>
      <h3
        className={`text-h3 font-semibold text-text-strong ${
          isGrid ? "mb-6 text-center" : "mb-4 text-left"
        }`}
      >
        {title}
      </h3>

      <ul
        className={
          isGrid ? "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4" : ""
        }
      >
        {visibleDonors.map((donor, i) => {
          const avatarBg = AVATAR_BGS[i % AVATAR_BGS.length];
          const initial = donor.is_anonymous
            ? "?"
            : (donor.donor_name?.trim()?.[0]?.toUpperCase() ?? "A");
          const name = donor.is_anonymous ? anonymousLabel : donor.donor_name;

          return (
            <li
              key={donor.id}
              className={
                isGrid
                  ? "flex items-start gap-3 rounded-xl bg-secondary-10 p-4"
                  : `flex items-start gap-3 py-3 ${i > 0 ? "border-t border-grey-40" : ""}`
              }
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-body-sm font-medium text-text-strong ${avatarBg}`}
              >
                {initial}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-body-sm font-semibold text-text-strong">
                  {name}
                </p>
                <p className="text-body-sm text-text-strong">
                  ${Number(donor.amount).toFixed(2)}
                </p>
                <p className="text-caption text-text-secondary">
                  {timeAgo(donor.created_at, locale)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {hasMore && !showAll && (
        <div className={isGrid ? "mt-6 flex justify-center" : "mt-5"}>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className={`inline-flex h-11 items-center justify-center rounded-full border border-secondary px-8 text-body-sm font-medium text-secondary transition-colors hover:bg-secondary hover:text-white ${
              isGrid ? "" : "w-full"
            }`}
          >
            {seeMoreLabel}
          </button>
        </div>
      )}
    </div>
  );
}
