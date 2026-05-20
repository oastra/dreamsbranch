import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { cn } from "@/lib/utils";

export interface CateringServiceBullet {
  label: string;
  text: string;
}

export interface CateringService {
  id: string;
  title: string;
  description: string;
  bullets: CateringServiceBullet[];
  ctaLabel: string;
  ctaHref: string;
  imageSrc: string;
  imageAlt: string;
}

interface Props {
  title: string;
  services: CateringService[];
}

export function CateringServices({ title, services }: Props) {
  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading className="mb-10 lg:mb-14">{title}</SectionHeading>

        <div className="flex flex-col gap-12 lg:gap-16">
          {services.map((service, i) => {
            const imageRightOnDesktop = i % 2 === 1;
            // Middle card (index 1) gets a full-width blue strip: bg
            // bleeds viewport edge-to-edge, content stays centered in
            // a normal page container so the image + text still align
            // horizontally with the bare cards above and below it.
            const filled = i === 1;
            const grid = (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-12 lg:items-stretch lg:py-10">
                {/* Image — desktop: only the outer two corners are
                    rounded; the side that meets the text content stays
                    flush. Mobile keeps all four rounded since image is
                    a full-width tile above the text. */}
                <div
                  className={cn(
                    "relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-grey-40 lg:aspect-auto lg:min-h-[420px] lg:self-stretch",
                    imageRightOnDesktop
                      ? "order-2 lg:order-2 lg:rounded-tl-none lg:rounded-bl-none"
                      : "order-2 lg:order-1 lg:rounded-tr-none lg:rounded-br-none",
                  )}
                >
                  <Image
                    src={service.imageSrc}
                    alt={service.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>

                {/* Text */}
                <div
                  className={cn(
                    "flex flex-col",
                    imageRightOnDesktop ? "order-1 lg:order-1" : "order-1 lg:order-2",
                  )}
                >
                  <h3 className="text-center text-h2 font-semibold text-text-strong lg:text-left">
                    {service.title}
                  </h3>
                  <div className="mt-4 h-px w-full bg-border lg:mt-5" aria-hidden />
                  <p className="mt-4 text-body text-text-primary lg:mt-5">
                    {service.description}
                  </p>
                  <ul className="mt-4 ml-5 list-disc space-y-2 text-body text-text-primary marker:text-text-strong lg:mt-5">
                    {service.bullets.map((b, idx) => (
                      <li key={idx}>
                        <strong className="font-semibold text-text-strong">
                          {b.label}:
                        </strong>{" "}
                        {b.text}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex justify-center lg:mt-8 lg:justify-start">
                    <Button
                      render={<Link href={service.ctaHref} />}
                      size="xl"
                      shape="pill"
                      className="min-w-[220px]"
                    >
                      {service.ctaLabel}
                    </Button>
                  </div>
                </div>
              </div>
            );

            if (filled) {
              return (
                <div
                  key={service.id}
                  className="bg-secondary-10 [margin-inline:calc(50%-50vw)] py-6 sm:py-8 lg:py-0"
                >
                  <div className="container-page">{grid}</div>
                </div>
              );
            }
            return <article key={service.id}>{grid}</article>;
          })}
        </div>
      </div>
    </section>
  );
}
