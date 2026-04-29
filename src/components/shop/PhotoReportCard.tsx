import Image from "next/image";
import type { ShopPhotoReportImage } from "@/types/database";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";

export type PhotoReportCardData = {
  slug: string;
  title: string;
  images: ShopPhotoReportImage[];
};

type Props = {
  report: PhotoReportCardData;
};

function pickByKind(images: ShopPhotoReportImage[], kind: ShopPhotoReportImage["kind"]) {
  return images
    .filter((i) => i.kind === kind)
    .sort((a, b) => a.position - b.position);
}

function ImageTile({
  src,
  alt,
  className = "",
  sizes,
  priority,
  innerPadding = "p-8 sm:p-10 lg:p-12",
}: {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  innerPadding?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-[#EAEBED] ${className}`}>
      {src ? (
        <div className={`relative h-full w-full ${innerPadding}`}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-contain"
          />
        </div>
      ) : (
        <ImagePlaceholder size="sm" />
      )}
    </div>
  );
}

export function PhotoReportCard({ report }: Props) {
  const products = pickByKind(report.images, "product");
  const proofs = pickByKind(report.images, "proof");
  const chats = pickByKind(report.images, "chat");

  const productMain = products[0];
  const productExtras = products.slice(1, 3);
  const proofTop = proofs[0];
  const proofBottom = proofs[1];
  const chat = chats[0];

  return (
    <article aria-label={report.title}>
      {/* Mobile: only main product photo */}
      <div className="lg:hidden">
        <ImageTile
          src={productMain?.url}
          alt={productMain?.caption_ua ?? productMain?.caption_en ?? report.title}
          className="aspect-[4/3]"
          sizes="100vw"
          priority
        />
      </div>

      {/* Desktop: full 3-column collage */}
      <div className="hidden gap-5 lg:grid lg:grid-cols-3">
        {/* Left column — product photos */}
        <div className="flex flex-col gap-5">
          <ImageTile
            src={productMain?.url}
            alt={productMain?.caption_ua ?? productMain?.caption_en ?? report.title}
            className="aspect-square"
            sizes="33vw"
            priority
            innerPadding="p-5 sm:p-6"
          />
          <div className="grid grid-cols-2 gap-5">
            {productExtras.map((img, i) => (
              <ImageTile
                key={img.url + i}
                src={img.url}
                alt={img.caption_ua ?? img.caption_en ?? report.title}
                className="aspect-square"
                sizes="16vw"
                innerPadding="p-4"
              />
            ))}
            {productExtras.length < 2 &&
              Array.from({ length: 2 - productExtras.length }).map((_, i) => (
                <ImageTile key={`empty-product-${i}`} alt="" className="aspect-square" />
              ))}
          </div>
        </div>

        {/* Middle column — proof screenshots */}
        <div className="flex flex-col gap-5">
          <ImageTile
            src={proofTop?.url}
            alt={proofTop?.caption_ua ?? proofTop?.caption_en ?? report.title}
            className="aspect-[4/3]"
            sizes="33vw"
            innerPadding="p-3"
          />
          <ImageTile
            src={proofBottom?.url}
            alt={proofBottom?.caption_ua ?? proofBottom?.caption_en ?? report.title}
            className="aspect-[4/3] flex-1"
            sizes="33vw"
            innerPadding="p-3"
          />
        </div>

        {/* Right column — chat screenshot (less padding, fills frame more) */}
        <ImageTile
          src={chat?.url}
          alt={chat?.caption_ua ?? chat?.caption_en ?? report.title}
          className="aspect-auto"
          sizes="33vw"
          innerPadding="p-4 sm:p-5"
        />
      </div>
    </article>
  );
}
