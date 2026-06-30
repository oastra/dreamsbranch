import Link from "next/link";
import {
  MaskedImageCarousel,
  type CarouselSlide,
} from "@/components/shared/MaskedImageCarousel";
import { PageHeroHeading } from "@/components/shared/PageHeroHeading";
import { Button } from "@/components/ui/button";

interface CateringHeroProps {
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  slides: CarouselSlide[];
}

export function CateringHero({
  title,
  subtitle,
  description,
  ctaLabel,
  ctaHref,
  slides,
}: CateringHeroProps) {
  return (
    <section className="py-8 lg:py-20">
      <div className="container-page grid gap-8 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-10">
        {/* Title block */}
        <div className="text-center lg:text-left">
          <PageHeroHeading title={title} titleClassName="mb-title-gap" />
        </div>

        {/* Carousel — right column on desktop, between text and CTA on
            mobile/tablet (matches the home-hero reflow pattern). */}
        <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 order-2 lg:order-0">
          <MaskedImageCarousel slides={slides} />
        </div>

        {/* Subtitle + description + CTA */}
        <div className="text-center lg:self-start lg:text-left lg:col-start-1 lg:row-start-2 order-1 lg:order-0">
          <p className="text-h2 mb-4 font-medium text-text-strong">
            {subtitle}
          </p>
          <p className="text-body mb-6 text-text-primary lg:mb-8">
            {description}
          </p>
          <div className="flex justify-center lg:justify-start">
            <Button
              render={<Link href={ctaHref} />}
              size="xl"
              shape="pill"
              className="w-70 max-w-full"
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
