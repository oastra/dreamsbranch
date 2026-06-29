"use client";

import { useEffect } from "react";
import { useCart } from "./cart-provider";

/** Empties the cart once the order has succeeded (mounted on the success page). */
export function ClearCartOnMount() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
