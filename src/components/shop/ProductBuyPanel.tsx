"use client";

import { useState } from "react";
import Link from "next/link";
import { Truck, Check } from "lucide-react";
import { QuantityStepper } from "./QuantityStepper";
import { useCart } from "./cart-provider";
import { PayPalCartButtons } from "./PayPalCartButtons";
import { Button } from "@/components/ui/button";
import ApplePayMark from "@/components/icons/payments/ApplePayMark";
import GooglePayMark from "@/components/icons/payments/GooglePayMark";
import MastercardMark from "@/components/icons/payments/MastercardMark";
import VisaMark from "@/components/icons/payments/VisaMark";

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
  processing: string;
  checkoutError: string;
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
  /** null = untracked (unlimited); a number = units left (0 = sold out). */
  stock?: number | null;
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
  stock,
  cartHref,
  labels,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  // cartHref is `/<locale>/shop/cart` — derive locale + the success href.
  const locale = cartHref.startsWith("/ua") ? "ua" : "en";
  const successHref = cartHref.replace(/\/cart$/, "/success");
  const paypalEnabled = !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // Stock: null = unlimited. 0 = sold out. Cap the quantity to what's left.
  const tracked = stock != null;
  const outOfStock = stock === 0;
  const maxQty = tracked ? Math.max(stock as number, 1) : 99;

  function handleAddToCart() {
    addItem({ slug, title, price: priceAmount, currency, image }, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  // "Buy now" with card / Apple Pay / Google Pay — Stripe hosted Checkout
  // for just this product at the chosen quantity.
  async function handleBuyNowCard() {
    setBuying(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/shop-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, items: [{ slug, quantity }] }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || labels.checkoutError);
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.checkoutError);
      setBuying(false);
    }
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-display font-semibold text-text-strong">{title}</h1>

      <p className="mt-4 text-h2 font-semibold text-text-strong sm:mt-5">
        {price}
      </p>

      {tracked && (
        <p
          className={`mt-2 text-body-sm font-medium ${
            outOfStock ? "text-red-600" : "text-secondary"
          }`}
        >
          {outOfStock
            ? locale === "ua"
              ? "Немає в наявності"
              : "Out of stock"
            : locale === "ua"
              ? `Залишилось: ${stock}`
              : `${stock} left`}
        </p>
      )}

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
            onChange={(q) => setQuantity(Math.min(Math.max(q, 1), maxQty))}
            decreaseAriaLabel={labels.quantityDecrease}
            increaseAriaLabel={labels.quantityIncrease}
            inputAriaLabel={labels.quantityLabel}
          />

          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
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

      {/* ── Express checkout — buy this item now ─────────────── */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Card / Apple Pay / Google Pay via Stripe hosted Checkout. The
            marks are the clickable surface (Stripe shows them on its page). */}
        <button
          type="button"
          onClick={handleBuyNowCard}
          disabled={buying || outOfStock}
          aria-label={labels.paymentMethodsLabel}
          className="inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-6 transition-colors hover:border-text-strong disabled:opacity-60"
        >
          {buying ? (
            <span className="text-body text-text-secondary">
              {labels.processing}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ApplePayMark />
              <GooglePayMark />
              <MastercardMark />
              <VisaMark />
            </span>
          )}
        </button>

        {/* PayPal Smart Buttons — only when configured. */}
        {paypalEnabled && (
          <>
            <div className="flex items-center gap-3 text-body-sm text-text-secondary">
              <span className="h-px flex-1 bg-border" />
              {labels.orSeparator}
              <span className="h-px flex-1 bg-border" />
            </div>
            <PayPalCartButtons
              locale={locale}
              items={[{ slug, quantity }]}
              disabled={buying || outOfStock}
              onSuccess={() => {
                window.location.href = successHref;
              }}
              onError={(msg) => setError(msg)}
            />
          </>
        )}

        {error && <p className="text-body-sm text-red-600">{error}</p>}
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
