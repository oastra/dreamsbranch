import type { ReactNode } from "react";
import {
  MaskedImageCarousel,
  type CarouselSlide,
} from "@/components/shared/MaskedImageCarousel";
import { PageHeroHeading } from "@/components/shared/PageHeroHeading";

type Props = {
  title: string;
  slides: CarouselSlide[];
  /** Bottom-left content: description text + optional extras (CTA, cards, etc.). */
  children: ReactNode;
  carouselSizes?: string;
};

export function PageHeroWithCarousel({
  title,
  slides,
  children,
  carouselSizes = "(max-width: 1024px) 100vw, 50vw",
}: Props) {
  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="container-page">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-stretch lg:gap-12 xl:gap-16">
          <PageHeroHeading
            title={title}
            className="text-center lg:col-start-1 lg:row-start-1 lg:self-end lg:text-left"
            titleClassName="mb-title-gap"
          />

          <div className="aspect-[716/500] lg:aspect-auto lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-full">
            <MaskedImageCarousel
              slides={slides}
              aspectRatio={null}
              sizes={carouselSizes}
              className="h-full"
            />
          </div>

          <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
