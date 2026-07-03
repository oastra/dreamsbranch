"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "./cart-provider";
import { QuantityStepper } from "./QuantityStepper";
import { PayPalCartButtons } from "./PayPalCartButtons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Labels = {
  empty: string;
  continueShopping: string;
  remove: string;
  total: string;
  checkout: string;
  processing: string;
  orSeparator: string;
  quantityLabel: string;
  quantityDecrease: string;
  quantityIncrease: string;
  error: string;
};

type Props = {
  locale: "ua" | "en";
  shopHref: string;
  labels: Labels;
};

export function CartView({ locale, shopHref, labels }: Props) {
  const { items, totalAmount, setQuantity, removeItem, hydrated } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paypalEnabled = !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const currency = items[0]?.currency ?? "AUD";
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "ua" ? "uk-UA" : "en-AU", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/shop-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || labels.error);
      // Hand off to Stripe's hosted Checkout page.
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : labels.error);
      setLoading(false);
    }
  }

  // Cart lives in localStorage — render a stable placeholder until it's read
  // so SSR and the first client paint agree.
  if (!hydrated) return <div className="min-h-60" />;

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-h3 text-text-primary">{labels.empty}</p>
        <Button
          render={<Link href={shopHref} />}
          size="xl"
          shape="pill"
          className="mt-6"
        >
          {labels.continueShopping}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="flex flex-col gap-4">
        {items.map((it) => (
          <li
            key={it.slug}
            className="flex gap-4 rounded-2xl border border-border p-4"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary-10">
              {it.image && (
                <Image
                  src={it.image}
                  alt={it.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <p className="line-clamp-2 text-body font-medium text-text-strong">
                {it.title}
              </p>
              <p className="mt-1 text-body-sm text-text-primary">
                {fmt(it.price)}
              </p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                <QuantityStepper
                  value={it.quantity}
                  onChange={(q) => setQuantity(it.slug, q)}
                  decreaseAriaLabel={labels.quantityDecrease}
                  increaseAriaLabel={labels.quantityIncrease}
                  inputAriaLabel={labels.quantityLabel}
                />
                <button
                  type="button"
                  onClick={() => removeItem(it.slug)}
                  className="text-body-sm text-text-secondary underline underline-offset-4 transition-colors hover:text-secondary"
                >
                  {labels.remove}
                </button>
              </div>
            </div>

            <p className="shrink-0 text-body font-semibold text-text-strong">
              {fmt(it.price * it.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-2xl bg-secondary-10 p-6">
        <div className="flex items-center justify-between text-h3 font-semibold text-text-strong">
          <span>{labels.total}</span>
          <span>{fmt(totalAmount)}</span>
        </div>
        {error && <p className="mt-4 text-body-sm text-red-600">{error}</p>}
        <Button
          type="button"
          onClick={handleCheckout}
          size="xl"
          shape="pill"
          disabled={loading}
          className="mt-6 w-full"
        >
          {loading ? (
            <>
              <Spinner aria-hidden />
              {labels.processing}
            </>
          ) : (
            labels.checkout
          )}
        </Button>

        {/* PayPal — only shown when NEXT_PUBLIC_PAYPAL_CLIENT_ID is set. */}
        {paypalEnabled && (
          <div className="mt-5">
            <div className="mb-4 flex items-center gap-3 text-body-sm text-text-secondary">
              <span className="h-px flex-1 bg-border" />
              {labels.orSeparator}
              <span className="h-px flex-1 bg-border" />
            </div>
            <PayPalCartButtons
              locale={locale}
              items={items.map((i) => ({ slug: i.slug, quantity: i.quantity }))}
              disabled={loading}
              onSuccess={() => {
                window.location.href = `${shopHref}/success`;
              }}
              onError={(msg) => setError(msg)}
            />
          </div>
        )}
      </aside>
    </div>
  );
}
