"use client";

import { useState } from "react";
import Link from "next/link";
import { Truck, Check } from "lucide-react";
import { QuantityStepper } from "./QuantityStepper";
import { useCart } from "./cart-provider";
import { Button } from "@/components/ui/button";
import ApplePayMark from "@/components/icons/payments/ApplePayMark";
import GooglePayMark from "@/components/icons/payments/GooglePayMark";
import MastercardMark from "@/components/icons/payments/MastercardMark";
import VisaMark from "@/components/icons/payments/VisaMark";
import PayPalWordmark from "@/components/icons/payments/PayPalWordmark";

type Labels = {
  quantityLabel: string;
  quantityDecrease: string;
  quantityIncrease: string;
  addToCart: string;
  addedToCart: string;
  viewCart: string;
  payWithPaypal: string;
  orSeparator: string;
  paymentMethodsLabel: string;
  deliveryTitle: string;
  deliveryDescription: string;
};

type Props = {
  /** Canonical product slug — the cart/checkout re-prices by this. */
  slug: string;
  title: string;
  /** Formatted price string for display. */
  price: string;
  /** Unit price in major units, for the cart total. */
  priceAmount: number;
  currency: string;
  image: string | null;
  description: string | null;
  /** Locale-aware href to the cart page. */
  cartHref: string;
  labels: Labels;
};

export function ProductBuyPanel({
  slug,
  title,
  price,
  priceAmount,
  currency,
  image,
  description,
  cartHref,
  labels,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAddToCart() {
    addItem({ slug, title, price: priceAmount, currency, image }, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  function handlePayPal() {
    // TODO: integrate @paypal/react-paypal-js when checkout is wired up.
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-display font-semibold text-text-strong">{title}</h1>

      <p className="mt-4 text-h2 font-semibold text-text-strong sm:mt-5">
        {price}
      </p>

      {description && (
        <p className="mt-4 whitespace-pre-line text-body text-text-primary sm:mt-5">
          {description}
        </p>
      )}

      {/* ── Quantity + cart ───────────────────────────────────── */}
      <div className="mt-6 sm:mt-8">
        <p
          id="quantity-label"
          className="mb-3 text-body-sm font-semibold text-text-strong"
        >
          {labels.quantityLabel}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            decreaseAriaLabel={labels.quantityDecrease}
            increaseAriaLabel={labels.quantityIncrease}
            inputAriaLabel={labels.quantityLabel}
          />

          <Button
            type="button"
            onClick={handleAddToCart}
            variant="outline"
            size="xl"
            shape="pill"
            className="flex-1"
          >
            {added ? (
              <>
                <Check className="h-5 w-5" aria-hidden />
                {labels.addedToCart}
              </>
            ) : (
              labels.addToCart
            )}
          </Button>
        </div>

        {added && (
          <Link
            href={cartHref}
            className="mt-3 inline-block text-body-sm font-medium text-secondary underline underline-offset-4"
          >
            {labels.viewCart}
          </Link>
        )}
      </div>

      {/* ── PayPal + payment marks ───────────────────────────── */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <button
          type="button"
          onClick={handlePayPal}
          aria-label={labels.payWithPaypal}
          className="inline-flex h-[54px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#FFC439] px-8 text-body font-medium text-[#142C8E] transition-opacity hover:opacity-90 sm:w-auto sm:flex-1"
        >
          <span>Pay with</span>
          <PayPalWordmark width={60} height={16} className="shrink-0" />
        </button>

        <span
          aria-hidden
          className="self-center text-body text-text-secondary sm:self-auto"
        >
          {labels.orSeparator}
        </span>

        <ul
          aria-label={labels.paymentMethodsLabel}
          className="flex items-center justify-center gap-2 rounded-full bg-grey-40/60 px-3 py-1.5 sm:bg-transparent sm:px-0 sm:py-0"
        >
          <li>
            <ApplePayMark />
          </li>
          <li>
            <GooglePayMark />
          </li>
          <li>
            <MastercardMark />
          </li>
          <li>
            <VisaMark />
          </li>
        </ul>
      </div>

      {/* ── Delivery ────────────────────────────────────────── */}
      <hr className="my-6 border-border sm:my-8" />

      <div>
        <h2 className="flex items-center gap-2 text-h3 font-semibold text-text-strong">
          <Truck size={22} strokeWidth={1.75} className="text-text-strong" aria-hidden />
          <span>{labels.deliveryTitle}</span>
        </h2>
        <p className="mt-3 whitespace-pre-line text-body text-text-primary">
          {labels.deliveryDescription}
        </p>
      </div>
    </div>
  );
}
