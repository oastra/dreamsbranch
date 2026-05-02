export type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  items: FaqItem[];
  /** "padded" → "01", "02"; "plain" → "1", "2". Defaults to "padded". */
  numberStyle?: "padded" | "plain";
  /**
   * Card layout — `two-col` is 1 col on `< lg`, 2 cols on `lg+` (used on
   * donate/about/campaign-detail). `single` is always 1 col.
   */
  layout?: "two-col" | "single";
  className?: string;
};

/**
 * Project-wide FAQ accordion. Renders a list of `<details>` cards using the
 * shell shared by the donate, about, and campaign-detail pages: rounded
 * border that swaps to `secondary-10` on open, numbered blue badge on the
 * left, `text-h3` question, and a chevron that rotates 180° on open.
 */
export function FaqAccordion({
  items,
  numberStyle = "padded",
  layout = "two-col",
  className = "",
}: Props) {
  if (items.length === 0) return null;

  const gridClass =
    layout === "two-col"
      ? "grid grid-cols-1 gap-4 lg:grid-cols-2"
      : "flex flex-col gap-4";

  return (
    <div className={`${gridClass} ${className}`.trim()}>
      {items.map((item, i) => {
        const num =
          numberStyle === "padded"
            ? String(i + 1).padStart(2, "0")
            : String(i + 1);
        return (
          <details
            key={i}
            className="group h-fit rounded-2xl border border-border bg-white px-6 py-5 open:border-secondary-10 open:bg-secondary-10"
          >
            <summary className="flex min-h-16.5 cursor-pointer list-none items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-small font-medium text-white">
                  {num}
                </span>
                <span className="text-body font-medium text-text-strong">
                  {item.question}
                </span>
              </div>
              <svg
                className="h-5 w-5 shrink-0 text-text-secondary transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <p className="mt-4 pl-12 text-body text-text-secondary">
              {item.answer}
            </p>
          </details>
        );
      })}
    </div>
  );
}
