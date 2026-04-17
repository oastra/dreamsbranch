import Link from 'next/link';
import { MaskedImage } from '@/components/shared/MaskedImage';

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
  const percentage = goalAmount > 0 ? Math.round((currentAmount / goalAmount) * 100) : 0;
  const progressWidth = Math.min(percentage, 100);

  return (
    <div className="card flex flex-col">
      {/* Image */}
      <div className="relative aspect-video bg-secondary-10">
        {coverImage ? (
          <MaskedImage
            src={coverImage}
            alt={title}
            className="h-full w-full"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-[20px]">
            <div className="h-14 w-14 rounded-full bg-secondary-40 opacity-60" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-body line-clamp-2 font-medium text-text-strong">{title}</h3>

        {/* Labels row */}
        <div className="flex items-center justify-between text-caption uppercase tracking-wide text-text-secondary">
          <span>{raisedLabel}</span>
          <span className="font-medium">{percentage}%</span>
          <span>{goalLabel}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-grey-40">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        {/* Amounts */}
        <div className="flex items-center justify-between">
          <span className="inline-block rounded bg-primary px-2 py-1 text-body-sm font-medium text-text-strong">
            ${currentAmount.toLocaleString()}
          </span>
          <span className="text-body-sm text-text-secondary">
            ${goalAmount.toLocaleString()}
          </span>
        </div>

        {/* Donate button — only for active campaigns */}
        {!isArchived && (
          <Link
            href={`/${locale}/campaigns/${slug}`}
            className="mt-auto inline-flex w-full items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-body font-medium text-text-strong transition-colors hover:bg-grey-40"
          >
            {donateBtnLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
