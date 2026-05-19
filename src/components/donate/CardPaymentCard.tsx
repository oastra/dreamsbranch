"use client";

import { useState } from "react";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeCardNumberElementOptions } from "@stripe/stripe-js";
import MastercardMark from "@/components/icons/payments/MastercardMark";
import VisaMark from "@/components/icons/payments/VisaMark";
import { Button } from "@/components/ui/button";
import { useDonation } from "@/components/donate/DonationContext";

export type CardPaymentLabels = {
  sectionTitle: string;
  formTitle: string;
  nameLabel: string;
  namePlaceholder: string;
  expiryLabel: string;
  expiryPlaceholder: string;
  numberLabel: string;
  numberPlaceholder: string;
  cvvLabel: string;
  cvvPlaceholder: string;
  submit: string;
  cancel: string;
};

type Props = {
  labels: CardPaymentLabels;
  onCancel?: () => void;
  onSuccess?: () => void;
};

const ELEMENT_BASE_STYLE: StripeCardNumberElementOptions["style"] = {
  base: {
    fontSize: "16px",
    color: "#0E1525",
    fontFamily: "inherit",
    "::placeholder": { color: "#90969F" },
  },
  invalid: { color: "#B42318" },
};

export function CardPaymentCard({ labels, onCancel, onSuccess }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const donation = useDonation();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState<"visa" | "mastercard" | "unknown">(
    "unknown",
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    if (!stripe || !elements) return;
    if (!donation.campaignSlug) {
      setErrorMsg("Missing campaign reference");
      return;
    }
    if (donation.amount <= 0) {
      setErrorMsg("Choose an amount");
      return;
    }

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) return;

    if (donation.frequency === "monthly" && !donation.email) {
      setErrorMsg("Email is required for monthly donations");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Ask our backend for a client_secret. Once = PaymentIntent;
      //    monthly = a Subscription whose first invoice's PaymentIntent we
      //    confirm here. Both flows end with stripe.confirmCardPayment.
      const endpoint =
        donation.frequency === "monthly"
          ? "/api/stripe/subscription"
          : "/api/stripe/payment-intent";

      const payload =
        donation.frequency === "monthly"
          ? {
              campaignSlug: donation.campaignSlug,
              amount: donation.amount,
              email: donation.email,
              displayName: donation.isAnonymous ? "" : donation.displayName,
              isAnonymous: donation.isAnonymous,
            }
          : {
              campaignSlug: donation.campaignSlug,
              amount: donation.amount,
              displayName: donation.isAnonymous ? "" : donation.displayName,
              isAnonymous: donation.isAnonymous,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as
        | { clientSecret: string }
        | { error: string };
      if (!res.ok || !("clientSecret" in data)) {
        throw new Error(
          "error" in data ? data.error : "Could not start payment",
        );
      }

      // 2. Confirm card payment client-side. Card data never touches our server.
      const confirm = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: name || donation.displayName || undefined,
            email: donation.email || undefined,
          },
        },
      });

      if (confirm.error) {
        throw new Error(confirm.error.message ?? "Payment failed");
      }

      // Success! Webhook (payment_intent.succeeded / invoice.paid) writes the
      // donation row.
      onSuccess?.();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setName("");
    setErrorMsg(null);
    elements?.getElement(CardNumberElement)?.clear();
    elements?.getElement(CardExpiryElement)?.clear();
    elements?.getElement(CardCvcElement)?.clear();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("donate:reset-amount"));
    }
    onCancel?.();
  }

  return (
    <div className="rounded-[30px] bg-secondary-10 p-5 pb-8 sm:p-6 sm:pb-8 lg:p-8">
      <h2 className="text-center text-xl font-medium text-text-strong">
        {labels.sectionTitle}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mt-5 rounded-3xl bg-white p-5 sm:mt-6 sm:p-6 lg:p-8"
      >
        <p className="text-lg font-normal text-text-strong">
          {labels.formTitle}
        </p>

        {/* ── Fields ─────────────────────────────────────────── */}
        <div className="mt-4 flex flex-col gap-4 sm:mt-5">
          <div className="contents sm:flex sm:gap-4">
            <Field
              label={labels.nameLabel}
              className="order-2 sm:order-1 sm:flex-1"
            >
              <input
                type="text"
                autoComplete="cc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={labels.namePlaceholder}
                aria-label={labels.nameLabel}
                className="h-12 w-full rounded-full border border-text-strong/15 bg-white px-4 text-body text-text-strong placeholder:text-text-secondary focus:border-secondary focus:outline-none"
              />
            </Field>

            <Field
              label={labels.expiryLabel}
              className="order-3 sm:order-2 sm:w-[112px] sm:flex-none"
            >
              <div className="flex h-12 items-center rounded-full border border-text-strong/15 bg-white px-4">
                <CardExpiryElement
                  options={{
                    style: ELEMENT_BASE_STYLE,
                    placeholder: labels.expiryPlaceholder,
                  }}
                  className="w-full"
                />
              </div>
            </Field>
          </div>

          <div className="contents sm:flex sm:gap-4">
            <Field
              label={labels.numberLabel}
              className="order-1 sm:order-1 sm:flex-1"
            >
              <div className="relative flex h-12 items-center rounded-full border border-text-strong/15 bg-white pl-14 pr-4">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  {brand === "visa" ? (
                    <VisaMark width={36} height={24} />
                  ) : (
                    <MastercardMark width={36} height={24} />
                  )}
                </span>
                <CardNumberElement
                  options={{
                    style: ELEMENT_BASE_STYLE,
                    placeholder: labels.numberPlaceholder,
                    showIcon: false,
                  }}
                  onChange={(e) => {
                    if (e.brand === "visa") setBrand("visa");
                    else if (e.brand === "mastercard") setBrand("mastercard");
                    else setBrand("unknown");
                  }}
                  className="w-full"
                />
              </div>
            </Field>

            <Field
              label={labels.cvvLabel}
              className="order-4 sm:order-2 sm:w-[112px] sm:flex-none"
            >
              <div className="flex h-12 items-center rounded-full border border-text-strong/15 bg-white px-4">
                <CardCvcElement
                  options={{
                    style: ELEMENT_BASE_STYLE,
                    placeholder: labels.cvvPlaceholder,
                  }}
                  className="w-full"
                />
              </div>
            </Field>
          </div>
        </div>

        {errorMsg && (
          <p className="mt-4 text-body-sm text-[#B42318]">{errorMsg}</p>
        )}

        {/* ── Actions ─────────────────────────────────────── */}
        <div className="mt-6 flex flex-col items-center gap-4 sm:mt-8 sm:flex-row sm:justify-between sm:gap-6">
          <Button
            type="submit"
            size="xl"
            shape="pill"
            className="w-full sm:w-auto sm:flex-1 lg:max-w-[280px]"
            disabled={!stripe || submitting}
          >
            {labels.submit}
          </Button>
          <button
            type="button"
            onClick={handleCancel}
            className="text-body font-normal text-secondary underline underline-offset-4 transition-opacity hover:opacity-80"
          >
            {labels.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-body font-normal text-text-strong">
        {label}
      </span>
      {children}
    </label>
  );
}
