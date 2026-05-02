import Link from "next/link";

export type Crumb = {
  /** Visible label, e.g. "Home", "Збори". */
  label: string;
  /** Destination, e.g. `/${locale}` or `/${locale}/campaigns`. */
  href: string;
};

type Props = {
  /** Linked crumbs preceding the current page (Home, Section, …). */
  crumbs: Crumb[];
  /** The current page's label — rendered as plain text, no link. */
  current: string;
  /** Defaults to "Breadcrumb". Pass a localised string for accessibility. */
  ariaLabel?: string;
  /**
   * Wrap the nav in a full-width `<section className="border-b ...">`. Pages
   * with a custom hero (e.g. campaigns/[slug]) use the un-wrapped variant and
   * place the breadcrumb inside their own section.
   */
  withSectionWrapper?: boolean;
  className?: string;
};

/**
 * Project-wide breadcrumb. Visual: small grey text, arrow separators, current
 * page in `text-text-strong`. Used across the news, events, campaign-detail,
 * shop-category, and shop-product pages.
 */
export function Breadcrumb({
  crumbs,
  current,
  ariaLabel = "Breadcrumb",
  withSectionWrapper = false,
  className = "",
}: Props) {
  const nav = (
    <nav
      aria-label={ariaLabel}
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-text-secondary ${className}`.trim()}
    >
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-2">
          <Link
            href={crumb.href}
            className="transition-colors hover:text-secondary"
          >
            {crumb.label}
          </Link>
          <span aria-hidden className="text-text-secondary/60">
            &rarr;
          </span>
        </span>
      ))}
      <span className="text-text-strong line-clamp-1">{current}</span>
    </nav>
  );

  if (!withSectionWrapper) return nav;

  return (
    <section className="border-b border-border bg-white py-3">
      <div className="container-page">{nav}</div>
    </section>
  );
}
