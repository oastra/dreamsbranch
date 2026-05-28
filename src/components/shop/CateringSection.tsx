import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";

type Props = {
  id?: string;
  title: string;
  description: string;
  whatWeOfferLabel: string;
  items: string[];
  ctaLabel: string;
  ctaHref: string;
  imageSrc: string;
  imageAlt: string;
};

export function CateringSection({
  id,
  title,
  description,
  whatWeOfferLabel,
  items,
  ctaLabel,
  ctaHref,
  imageSrc,
  imageAlt,
}: Props) {
  return (
    <section
      id={id}
      className="section bg-secondary-10"
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className="container-page">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-12">
          {/* Image — top on mobile/tablet, left on desktop */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Content — below image on mobile/tablet, right on desktop */}
          <div className="flex flex-col gap-6 lg:gap-8">
            <SectionHeading align="center">
              <span id={id ? `${id}-title` : undefined}>{title}</span>
            </SectionHeading>

            <p className="text-body text-text-primary lg:text-[18px] lg:leading-[150%]">
              {description}
            </p>

            <div>
              <h3 className="text-h3 mb-4 font-semibold text-text-strong">
                {whatWeOfferLabel}
              </h3>
              <ul className="space-y-3 text-body text-text-primary lg:text-[18px]">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-2 flex justify-center lg:mt-auto lg:justify-center lg:pt-4">
              <Button
                render={<Link href={ctaHref} />}
                size="xl"
                shape="pill"
                className="min-w-[240px]"
              >
                {ctaLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
