import Image from "next/image";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { Button } from "@/components/ui/button";

export interface CampaignCardProps {
  slug: string;
  locale: string;
  title: string;
  coverImage: string | null;
  goalAmount: number;
  currentAmount: number;
  isArchived?: boolean;
  raisedLabel: string;
  goalLabel: string;
  donateBtnLabel: string;
}

export function CampaignCard({
  slug,
  locale,
  title,
  coverImage,
  goalAmount,
  currentAmount,
  isArchived = false,
  raisedLabel,
  goalLabel,
  donateBtnLabel,
}: CampaignCardProps) {
  const percentage =
    goalAmount > 0 ? Math.round((currentAmount / goalAmount) * 100) : 0;
  const progressWidth = Math.min(percentage, 100);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white transition-shadow hover:shadow-card-hover">
      {/* Cover image */}
      <div className="relative aspect-[16/10] bg-secondary-10">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder size="sm" />
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-body font-semibold text-text-strong line-clamp-2">
          {title}
        </h3>

        {/* Labels row */}
        <div className="grid grid-cols-3 items-center text-caption uppercase tracking-wide text-text-secondary">
          <span>{raisedLabel}</span>
          <span className="text-center">{percentage}%</span>
          <span className="text-right">{goalLabel}</span>
        </div>

        {/* Combined progress pill — yellow fill on the left, gray on the right,
            with raised + goal amounts overlaid */}
        <div className="relative flex h-9 w-full items-center overflow-hidden rounded-full bg-grey-40">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressWidth}%` }}
          />
          <span className="relative z-10 pl-4 text-body-sm font-semibold text-text-strong">
            ${currentAmount.toLocaleString()}
          </span>
          <span className="relative z-10 ml-auto pr-4 text-body-sm font-semibold text-text-strong">
            ${goalAmount.toLocaleString()}
          </span>
        </div>

        {/* Outlined blue donate button — only for active campaigns */}
        {!isArchived && (
          <Button
            render={<Link href={`/${locale}/campaigns/${slug}`} />}
            variant="outline"
            shape="pill"
            className="mt-auto h-11 w-full px-6"
          >
            {donateBtnLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
