"use client";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function NavItem({
  href,
  label,
  isActive,
  onClick,
  className,
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-secondary text-gray-100 font-regular transition-colors nowrap",
        isActive
          ? "bg-primary text-text-primary-80"
          : "text-text-primary hover:text-secondary",
        className,
      )}
    >
      {label}
    </Link>
  );
}
