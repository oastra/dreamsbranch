"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

type Props = {
  locale: "ua" | "en";
  items: Array<{ slug: string; quantity: number }>;
  onSuccess: () => void;
  onError: (message: string) => void;
  disabled?: boolean;
};

// Inlined by Next at build time. When unset (PayPal not configured), the
// buttons simply don't render and the cart falls back to Stripe.
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

export function PayPalCartButtons({
  locale,
  items,
  onSuccess,
  onError,
  disabled,
}: Props) {
  if (!PAYPAL_CLIENT_ID) return null;

  return (
    <PayPalScriptProvider
      options={{ clientId: PAYPAL_CLIENT_ID, currency: "AUD", intent: "capture" }}
    >
      <PayPalButtons
        style={{ shape: "pill", height: 48, label: "pay" }}
        disabled={disabled}
        createOrder={async () => {
          const res = await fetch("/api/paypal/shop/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locale, items }),
          });
          const data = await res.json();
          if (!res.ok || !data.id) {
            throw new Error(data.error || "Could not start PayPal checkout");
          }
          return data.id as string;
        }}
        onApprove={async (data) => {
          const res = await fetch("/api/paypal/shop/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderID }),
          });
          const out = await res.json();
          if (!res.ok || !out.ok) {
            throw new Error(out.error || "PayPal payment failed");
          }
          onSuccess();
        }}
        onError={(err) =>
          onError(err instanceof Error ? err.message : "PayPal error")
        }
      />
    </PayPalScriptProvider>
  );
}
