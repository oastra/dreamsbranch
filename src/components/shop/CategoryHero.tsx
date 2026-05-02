import Image from "next/image";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

export type CategoryHeroCollage = {
  left: string | null;
  topMiddle: string | null;
  bottomMiddle: string | null;
  right: string | null;
};

type Props = {
  locale: string;
  title: string;
  productCount: number;
  collage: CategoryHeroCollage;
  breadcrumbHomeLabel: string;
  breadcrumbShopLabel: string;
  productsCountLabel: string; // already-formatted string with rendered count
  imageAlt: string;
};

export function CategoryHero({
  locale,
  title,
  productCount,
  collage,
  breadcrumbHomeLabel,
  breadcrumbShopLabel,
  productsCountLabel,
  imageAlt,
}: Props) {
  return (
    <section className="pt-6 pb-8 sm:pt-8 lg:pt-10 lg:pb-12">
      <div className="container-page">
        {/* Breadcrumb */}
        <Breadcrumb
          crumbs={[
            { label: breadcrumbHomeLabel, href: `/${locale}` },
            { label: breadcrumbShopLabel, href: `/${locale}/shop` },
          ]}
          current={title}
          className="mb-6 lg:mb-8"
        />

        {/*
          Mobile (default):  1 column  — vyshyvanka • title • threads
          Tablet (md):       2 columns — [threads / title / vyshyvanka] · plush-toy
          Desktop (lg):      3 columns — sunflower · [threads / title / vyshyvanka] · plush-toy
        */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-6">
          {/* Left tall — desktop only */}
          <HeroFrame
            src={collage.left}
            alt={imageAlt}
            className="hidden lg:block lg:h-full"
            sizes="(min-width: 1024px) 33vw, 0px"
            priority
          />

          {/* Middle stack: title between threads + vyshyvanka.
              Mobile reverses order: vyshyvanka • title • threads. */}
          <div className="flex flex-col gap-4 md:gap-5 lg:gap-6">
            <HeroFrame
              src={collage.topMiddle}
              alt={imageAlt}
              className="order-3 aspect-[16/9] md:order-1 md:aspect-[16/9] lg:aspect-[16/8]"
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            />
            <h1 className="order-2 text-title-tablet text-text-strong text-center px-2 py-2 md:py-3 lg:py-4">
              {title}
            </h1>
            <HeroFrame
              src={collage.bottomMiddle}
              alt={imageAlt}
              className="order-1 aspect-[16/9] md:order-3 md:aspect-[16/9] lg:aspect-[16/8]"
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            />
          </div>

          {/* Right tall — tablet + desktop */}
          <HeroFrame
            src={collage.right}
            alt={imageAlt}
            className="hidden md:block md:h-full"
            sizes="(min-width: 1024px) 33vw, 50vw"
            priority
          />
        </div>

        {productCount > 0 && (
          <p className="mt-6 text-center text-body-sm text-text-secondary lg:mt-8">
            {productsCountLabel}
          </p>
        )}
      </div>
    </section>
  );
}

function HeroFrame({
  src,
  alt,
  className = "",
  sizes = "(max-width: 1024px) 100vw, 33vw",
  priority = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-grey-40 ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-[repeating-conic-gradient(#e9e9ea_0%_25%,#f5f5f6_0%_50%)] bg-[length:32px_32px]"
        />
      )}
    </div>
  );
}
