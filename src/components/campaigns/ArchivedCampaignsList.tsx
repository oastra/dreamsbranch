"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CampaignCard, type CampaignCardProps } from "./CampaignCard";
import { Button } from "@/components/ui/button";

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
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const visibleParam = Number(sp.get("archived"));
  const visible =
    Number.isFinite(visibleParam) && visibleParam > 0 ? visibleParam : INITIAL_COUNT;

  const shown = campaigns.slice(0, visible);
  const hasMore = visible < campaigns.length;

  function showMore() {
    const next = new URLSearchParams(sp.toString());
    next.set("archived", String(visible + PAGE_SIZE));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <>
      {/* Figma: horizontal scroll with a card peek on mobile + tablet,
          3-up grid on desktop. */}
      <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:gap-6 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {shown.map((c) => (
          <div
            key={c.id}
            className="w-[85%] shrink-0 snap-start sm:w-[62%] lg:w-auto"
          >
            <CampaignCard
              slug={c.slug}
              title={c.title}
              coverImage={c.coverImage}
              goalAmount={c.goalAmount}
              currentAmount={c.currentAmount}
              isArchived
              {...cardProps}
            />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <Button
            type="button"
            onClick={showMore}
            size="xl"
            shape="pill"
            className="w-70 max-w-full"
          >
            {moreLabel}
          </Button>
        </div>
      )}
    </>
  );
}
