import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";

interface Props {
  title: string;
  lead: string;
  bodyP1: string;
  bodyP2: string;
  ctaLabel: string;
  ctaHref: string;
  imageSrc?: string;
  imageAlt: string;
}

export function HomeAboutSection({
  title,
  lead,
  bodyP1,
  bodyP2,
  ctaLabel,
  ctaHref,
  imageSrc = "/images/about/about-us.webp",
  imageAlt,
}: Props) {
  return (
    <section className="section">
      <div className="container-page">
        {/* On mobile content stacks: title → lead → body p1 → image → body p2 → cta.
            On desktop the image takes the full left column and all text+cta sits on the right. */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[5fr_6fr] lg:gap-12">
          {/* Image with brand corner accents */}
          <div className="relative order-3 lg:order-none lg:col-start-1 lg:row-start-1 lg:row-span-5 lg:self-stretch">
            {/* Yellow corner — top-left, in front of the image */}
            <div
              aria-hidden
              className="absolute left-0 top-0 z-10 h-16 w-16 bg-primary sm:h-20 sm:w-20 lg:h-24 lg:w-24"
              style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
            />
            {/* Blue corner — bottom-right, in front of the image */}
            <div
              aria-hidden
              className="absolute bottom-0 right-0 z-10 h-16 w-16 bg-secondary sm:h-20 sm:w-20 lg:h-24 lg:w-24"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
            />
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary-10 lg:h-full lg:aspect-auto lg:min-h-[480px]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>

          <h2 className="order-1 text-h2 font-semibold leading-tight text-text-strong text-center lg:order-none lg:col-start-2 lg:row-start-1 lg:text-left lg:text-[40px]">
            {title}
          </h2>

          <p className="order-2 max-w-xl text-body text-text-primary text-center lg:order-none lg:col-start-2 lg:row-start-2 lg:text-left">
            {lead}
          </p>

          {/* Body p1 — sits between lead and image on mobile (order-2 ensures it's right after the lead).
              On desktop both paragraphs sit in the right column under the lead. */}
          <p className="order-2 text-body text-text-primary lg:order-none lg:col-start-2 lg:row-start-3">
            {bodyP1}
          </p>

          <p className="order-4 text-body text-text-primary lg:order-none lg:col-start-2 lg:row-start-4">
            {bodyP2}
          </p>

          <div className="order-5 flex justify-center lg:order-none lg:col-start-2 lg:row-start-5 lg:justify-start">
            <Link
              href={ctaHref}
              className={buttonVariants({ size: "xl", shape: "pill" })}
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
