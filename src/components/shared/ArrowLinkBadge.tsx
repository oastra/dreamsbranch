import Link from "next/link";
import ArrowRightUp from "@/components/icons/ArrowRightUp";

type Props = {
  href?: string;
  ariaLabel?: string;
  size?: number;
  className?: string;
};

export function ArrowLinkBadge({ href, ariaLabel, size = 40, className = "" }: Props) {
  const baseClasses = `inline-flex items-center justify-center rounded-full bg-white text-text-strong shadow-sm transition-colors duration-300 ease-out group-hover/card:bg-[#F5F5F5] group-active/card:bg-[#E5E5E5] hover:bg-[#F5F5F5] active:bg-[#E5E5E5] ${className}`;

  const arrow = (
    <ArrowRightUp
      size={Math.round(size * 0.45)}
      className="transition-transform duration-300 ease-out group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-active/card:-translate-y-1 group-active/card:translate-x-1 group-hover/arrow:-translate-y-0.5 group-hover/arrow:translate-x-0.5 group-active/arrow:-translate-y-1 group-active/arrow:translate-x-1"
    />
  );

  const style = { width: size, height: size };

  if (href) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className={`group/arrow ${baseClasses}`}
        style={style}
      >
        {arrow}
      </Link>
    );
  }

  return (
    <span aria-hidden className={baseClasses} style={style}>
      {arrow}
    </span>
  );
}
