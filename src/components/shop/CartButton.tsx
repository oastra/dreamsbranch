"use client";

import { ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useCart } from "@/components/shop/cart-provider";

type Props = {
  ariaLabel: string;
  /** Classes for the circular button wrapper. */
  className?: string;
  /** Classes for the bag icon. */
  iconClassName?: string;
};

/**
 * Header cart entry point — links to the cart page and shows a live item
 * count badge once the cart has hydrated from localStorage.
 */
export function CartButton({ ariaLabel, className, iconClassName }: Props) {
  const { itemCount, hydrated } = useCart();

  return (
    <Link
      href="/shop/cart"
      aria-label={ariaLabel}
      className={`relative ${className ?? ""}`}
    >
      <ShoppingBag className={iconClassName} />
      {hydrated && itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[11px] font-bold leading-none text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
