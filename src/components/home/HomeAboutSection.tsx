import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MaskedImage } from "@/components/shared/MaskedImage";

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
          {/* Image — uses the shared MaskedImage so the yellow + light-blue
              Figma corner triangles render automatically. */}
          <div className="order-3 lg:order-0 lg:col-start-1 lg:row-start-1 lg:row-span-5 lg:self-stretch">
            <MaskedImage
              src={imageSrc}
              alt={imageAlt}
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="aspect-[4/3] lg:h-full lg:aspect-auto lg:min-h-[480px]"
            />
          </div>

          <h2 className="order-1 text-title-tablet font-medium leading-tight text-text-strong text-center lg:order-0 lg:col-start-2 lg:row-start-1 lg:text-left">
            {title}
          </h2>

          <p className="order-2 max-w-xl text-body text-text-primary text-center lg:order-0 lg:col-start-2 lg:row-start-2 lg:text-left">
            {lead}
          </p>

          {/* Body p1 — sits between lead and image on mobile (order-2 ensures it's right after the lead).
              On desktop both paragraphs sit in the right column under the lead. */}
          <p className="order-2 text-body text-text-primary lg:order-0 lg:col-start-2 lg:row-start-3">
            {bodyP1}
          </p>

          <p className="order-4 text-body text-text-primary lg:order-0 lg:col-start-2 lg:row-start-4">
            {bodyP2}
          </p>

          <div className="order-5 flex justify-center lg:order-0 lg:col-start-2 lg:row-start-5 lg:justify-start">
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
