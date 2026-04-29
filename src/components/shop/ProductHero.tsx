import Link from "next/link";
import { ProductGallery } from "./ProductGallery";
import { ProductBuyPanel } from "./ProductBuyPanel";

type BreadcrumbCrumb = {
  label: string;
  href: string;
};

type BuyPanelLabels = React.ComponentProps<typeof ProductBuyPanel>["labels"];

type Props = {
  title: string;
  price: string;
  description: string | null;
  galleryImages: string[];
  breadcrumb: {
    ariaLabel: string;
    crumbs: BreadcrumbCrumb[];
    current: string;
  };
  galleryLabels: {
    mainAltTemplate: string;
    thumbAltTemplate: string;
    thumbAriaTemplate: string;
  };
  buyLabels: BuyPanelLabels;
};

export function ProductHero({
  title,
  price,
  description,
  galleryImages,
  breadcrumb,
  galleryLabels,
  buyLabels,
}: Props) {
  return (
    <section className="pt-6 pb-10 sm:pt-8 lg:pt-10 lg:pb-14">
      <div className="container-page">
        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <nav
          aria-label={breadcrumb.ariaLabel}
          className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-text-secondary lg:mb-8"
        >
          {breadcrumb.crumbs.map((crumb) => (
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
          <span className="text-text-strong">{breadcrumb.current}</span>
        </nav>

        {/* ── Hero grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery
            images={galleryImages}
            productName={title}
            mainAltTemplate={galleryLabels.mainAltTemplate}
            thumbAltTemplate={galleryLabels.thumbAltTemplate}
            thumbAriaTemplate={galleryLabels.thumbAriaTemplate}
          />

          <ProductBuyPanel
            title={title}
            price={price}
            description={description}
            labels={buyLabels}
          />
        </div>
      </div>
    </section>
  );
}
