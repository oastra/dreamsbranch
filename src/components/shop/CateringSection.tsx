import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
      className="section"
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className="container-page">
        <div className="rounded-3xl bg-secondary-10 p-6 sm:p-8 lg:p-12">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center lg:gap-12">
            {/* Image — top on mobile/tablet, left on desktop */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-square">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Content — below image on mobile/tablet, right on desktop */}
            <div className="flex flex-col gap-5 lg:gap-6">
              <h2
                id={id ? `${id}-title` : undefined}
                className="text-h2 text-center font-semibold text-text-strong"
              >
                {title}
              </h2>

              <p className="text-body text-text-primary">{description}</p>

              <div>
                <h3 className="text-body mb-3 font-semibold text-text-strong lg:text-h3">
                  {whatWeOfferLabel}
                </h3>
                <ul className="space-y-2 text-body text-text-primary">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-2 flex justify-center lg:justify-start">
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
      </div>
    </section>
  );
}
