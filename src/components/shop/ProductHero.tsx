import { Breadcrumb, type Crumb } from "@/components/shared/Breadcrumb";
import { ProductGallery } from "./ProductGallery";
import { ProductBuyPanel } from "./ProductBuyPanel";

type BreadcrumbCrumb = Crumb;

type BuyPanelLabels = React.ComponentProps<typeof ProductBuyPanel>["labels"];

type Props = {
  slug: string;
  title: string;
  price: string;
  priceAmount: number;
  currency: string;
  coverImage: string | null;
  cartHref: string;
  stock?: number | null;
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
  slug,
  title,
  price,
  priceAmount,
  currency,
  coverImage,
  cartHref,
  stock,
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
        <Breadcrumb
          crumbs={breadcrumb.crumbs}
          current={breadcrumb.current}
          ariaLabel={breadcrumb.ariaLabel}
          className="mb-6 lg:mb-8"
        />

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
            slug={slug}
            title={title}
            price={price}
            priceAmount={priceAmount}
            currency={currency}
            image={coverImage}
            cartHref={cartHref}
            stock={stock}
            description={description}
            labels={buyLabels}
          />
        </div>
      </div>
    </section>
  );
}
