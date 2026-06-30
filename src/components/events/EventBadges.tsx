type Props = {
  isArchived: boolean;
  tags: string[];
  labels: {
    active: string;
    archived: string;
    looking_for_partners: string;
    looking_for_volunteers: string;
  };
  className?: string;
};

export function EventBadges({ isArchived, tags, labels, className = "" }: Props) {
  if (isArchived) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
        <span className="inline-flex items-center rounded-full bg-grey-40 px-4 py-1.5 text-body-sm font-medium text-text-secondary">
          {labels.archived}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      <span className="inline-flex items-center rounded-full bg-success px-4 py-1.5 text-body-sm font-medium text-white">
        {labels.active}
      </span>
      {tags.includes("looking_for_partners") && (
        <span className="inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-body-sm font-medium text-white">
          {labels.looking_for_partners}
        </span>
      )}
      {tags.includes("looking_for_volunteers") && (
        <span className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-body-sm font-medium text-text-strong">
          {labels.looking_for_volunteers}
        </span>
      )}
    </div>
  );
}
