"use client";

import { useState } from "react";
import { CampaignCard, type CampaignCardProps } from "./CampaignCard";

const INITIAL_COUNT = 3;
const PAGE_SIZE = 3;

type ArchivedCampaign = Omit<
  CampaignCardProps,
  "isArchived" | "raisedLabel" | "goalLabel" | "donateBtnLabel" | "locale"
> & { id: string };

type Props = {
  campaigns: ArchivedCampaign[];
  cardProps: {
    locale: string;
    raisedLabel: string;
    goalLabel: string;
    donateBtnLabel: string;
  };
  moreLabel: string;
};

export function ArchivedCampaignsList({ campaigns, cardProps, moreLabel }: Props) {
  const [visible, setVisible] = useState(INITIAL_COUNT);

  const shown = campaigns.slice(0, visible);
  const hasMore = visible < campaigns.length;

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <CampaignCard
            key={c.id}
            slug={c.slug}
            title={c.title}
            coverImage={c.coverImage}
            goalAmount={c.goalAmount}
            currentAmount={c.currentAmount}
            isArchived
            {...cardProps}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="btn-primary"
          >
            {moreLabel}
          </button>
        </div>
      )}
    </>
  );
}
