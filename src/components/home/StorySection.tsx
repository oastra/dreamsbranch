import Image from "next/image";

interface Props {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  emblemSrc?: string;
  emblemAlt?: string;
}

export function StorySection({
  title,
  description,
  emblemSrc = "/images/UWAA_Logo_75years_Cowra.svg",
  emblemAlt = "UWAA — 75 years",
}: Props) {
  return (
    <section className="section">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#2D9EE0] via-[#197FCE] to-[#0057B8] px-6 py-10 sm:px-10 sm:py-12 lg:px-16 lg:py-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-12">
            {/* Mobile/tablet: emblem first, sits centered above the text. */}
            <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
              <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-40 lg:h-48 lg:w-48">
                <Image
                  src={emblemSrc}
                  alt={emblemAlt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 160px, 192px"
                />
              </div>
            </div>

            <div className="order-2 flex flex-col items-center gap-5 text-center text-white lg:order-1 lg:items-start lg:text-left">
              <h2 className="text-[36px] font-medium leading-[110%] lg:text-[40px]">
                {title}
              </h2>
              <p className="max-w-xl whitespace-pre-line text-body text-white/85">
                {description}
              </p>
              {/* <Link
                href={ctaHref}
                className="group inline-flex items-center gap-2 text-body font-medium text-white underline-offset-4 transition-opacity hover:underline hover:opacity-90"
              >
                {ctaLabel}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
