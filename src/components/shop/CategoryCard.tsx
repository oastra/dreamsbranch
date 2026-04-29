import Link from "next/link";
import { ArrowLinkBadge } from "@/components/shared/ArrowLinkBadge";

type Props = {
  title: string;
  href: string;
  bgClass: string;
  hoverBgClass: string;
  activeBgClass: string;
  icon: React.ReactNode;
};

export function CategoryCard({
  title,
  href,
  bgClass,
  hoverBgClass,
  activeBgClass,
  icon,
}: Props) {
  return (
    <Link
      href={href}
      aria-label={title}
      className={`group/card relative flex aspect-[5/6] flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl px-6 py-8 text-center transition-colors duration-300 ease-out ${bgClass} ${hoverBgClass} ${activeBgClass}`}
    >
      <ArrowLinkBadge className="absolute right-4 top-4" />
      <h3 className="text-h3 font-semibold text-text-strong">{title}</h3>
      <div className="text-text-strong">{icon}</div>
    </Link>
  );
}
