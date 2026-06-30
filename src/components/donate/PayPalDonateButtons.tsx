"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useDonation } from "./DonationContext";

const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

/**
 * PayPal donation buttons. Reads amount / frequency / donor info from the
 * donation context. One-time uses Orders (capture → donation row); monthly
 * uses Subscriptions (the webhook records each recurring payment). On success
 * it navigates to `?success=true`, which flips the page to the thank-you view.
 */
export function PayPalDonateButtons({
  onError,
}: {
  onError: (message: string) => void;
}) {
  const d = useDonation();
  if (!CLIENT_ID) return null;

  const monthly = d.frequency === "monthly";
  const publicName = d.isAnonymous
    ? ""
    : d.displayName.trim() || d.cardholderName.trim();

  function succeed() {
    if (typeof window === "undefined") return;
    window.location.assign(`${window.location.pathname}?success=true`);
  }

  if (monthly) {
    return (
      <PayPalScriptProvider
        key="subscription"
        options={{
          clientId: CLIENT_ID,
          currency: "AUD",
          intent: "subscription",
          vault: true,
        }}
      >
        <PayPalButtons
          style={{ shape: "pill", height: 48, label: "subscribe" }}
          disabled={d.amount <= 0 || !d.email}
          createSubscription={async () => {
            const res = await fetch("/api/paypal/donation/create-subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                campaignSlug: d.campaignSlug,
                amount: d.amount,
                email: d.email,
                displayName: publicName,
                isAnonymous: d.isAnonymous,
              }),
            });
            const data = await res.json();
            if (!res.ok || !data.id) {
              throw new Error(data.error || "Could not start subscription");
            }
            return data.id as string;
          }}
          onApprove={async () => {
            succeed();
          }}
          onError={(err) =>
            onError(err instanceof Error ? err.message : "PayPal error")
          }
        />
      </PayPalScriptProvider>
    );
  }

  return (
    <PayPalScriptProvider
      key="once"
      options={{ clientId: CLIENT_ID, currency: "AUD", intent: "capture" }}
    >
      <PayPalButtons
        style={{ shape: "pill", height: 48, label: "pay" }}
        disabled={d.amount <= 0}
        createOrder={async () => {
          const res = await fetch("/api/paypal/donation/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              campaignSlug: d.campaignSlug,
              amount: d.amount,
              displayName: publicName,
              isAnonymous: d.isAnonymous,
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.id) {
            throw new Error(data.error || "Could not start PayPal checkout");
          }
          return data.id as string;
        }}
        onApprove={async (data) => {
          const res = await fetch("/api/paypal/donation/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderID,
              displayName: publicName,
              isAnonymous: d.isAnonymous,
            }),
          });
          const out = await res.json();
          if (!res.ok || !out.ok) {
            throw new Error(out.error || "PayPal payment failed");
          }
          succeed();
        }}
        onError={(err) =>
          onError(err instanceof Error ? err.message : "PayPal error")
        }
      />
    </PayPalScriptProvider>
  );
}
