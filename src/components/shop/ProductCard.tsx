import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";

export type ProductCardProduct = {
  slug: string;
  title: string;
  price: string;
  coverImage: string | null;
};

type Props = {
  locale: string;
  product: ProductCardProduct;
  addLabel: string;
};

export function ProductCard({ locale, product, addLabel }: Props) {
  return (
    <article className="group/product flex h-[300px] w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-card-hover sm:h-[320px] lg:h-[360px] lg:w-[302px]">
      <Link
        href={`/${locale}/shop/product/${product.slug}`}
        className="relative block flex-1 bg-grey-40"
        aria-label={product.title}
      >
        {product.coverImage ? (
          <Image
            src={product.coverImage}
            alt={product.title}
            fill
            sizes="(max-width: 1024px) 280px, 302px"
            className="object-cover transition-transform duration-300 group-hover/product:scale-105"
          />
        ) : (
          <ImagePlaceholder size="sm" />
        )}
      </Link>

      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <Link
          href={`/${locale}/shop/product/${product.slug}`}
          className="min-w-0 flex-1"
        >
          <h3 className="truncate text-body font-semibold text-text-strong">
            {product.title}
          </h3>
          <p className="truncate text-body-sm text-text-secondary">
            {product.price}
          </p>
        </Link>

        <button
          type="button"
          aria-label={`${addLabel}: ${product.title}`}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-strong transition-colors hover:bg-secondary-10 active:bg-secondary-40"
        >
          <ShoppingBag size={22} strokeWidth={1.5} />
        </button>
      </div>
    </article>
  );
}
