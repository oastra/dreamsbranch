import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageSrc?: string;
  imageAlt: string;
  className?: string;
};

const DEFAULT_IMAGE = "/images/events/hands-with-heart.webp";

export function VolunteerCTA({
  title,
  description,
  ctaLabel,
  ctaHref,
  imageSrc = DEFAULT_IMAGE,
  imageAlt,
  className = "",
}: Props) {
  return (
    // `<section>` is the landmark with only vertical spacing — horizontal
    // padding comes from `container-page`, same as ShareSection and the
    // rest of the page, so both cards line up to the same column width.
    <section className={`py-10 sm:py-10 lg:py-15 lg:h-[302px] ${className}`}>
      <div className="container-page">
        <article className="rounded-3xl bg-[#FFEF99] p-5 sm:p-8  lg:p-10">
          {/*
            Mobile/tablet flow:  title → image → description → button
            Desktop flow:        image (left, fixed 386x182) | right column: title (top), description + button (bottom)
          */}
          <div className="flex flex-col gap-5 lg:h-full lg:flex-row lg:items-center lg:gap-10">
            {/* Image */}
            <div className="order-2 lg:order-0 lg:shrink-0">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-secondary-10 lg:aspect-auto lg:h-[182px] lg:w-[386px]">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 386px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right column on lg; uses `contents` on smaller widths so title
                and description-block remain in the outer flex column. */}
            <div className="contents lg:flex lg:flex-1 lg:flex-col lg:gap-5">
              <h2 className="order-1 text-center text-title-tablet text-text-strong lg:order-0 lg:text-left">
                {title}
              </h2>
              <div className="order-3 flex flex-col items-center gap-5 lg:order-0 lg:items-start lg:gap-5">
                <p className="text-center text-body text-text-primary lg:text-left">
                  {description}
                </p>
                <Button
                  render={<Link href={ctaHref} />}
                  variant="default-on-yellow"
                  size="xl"
                  shape="pill"
                  className="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[220px]"
                >
                  {ctaLabel}
                </Button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
