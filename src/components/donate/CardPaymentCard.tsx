"use client";

import { useState } from "react";
import MastercardMark from "@/components/icons/payments/MastercardMark";
import VisaMark from "@/components/icons/payments/VisaMark";

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
};

// ── Helpers ──────────────────────────────────────────────────
function detectBrand(cardNumber: string): "visa" | "mastercard" | "unknown" {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.startsWith("4")) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  return "unknown";
}

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string): string {
  // Accept "0624", "06/24", "06 / 2024" — normalise to "MM / YYYY".
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

// ── Component ────────────────────────────────────────────────
export function CardPaymentCard({ labels }: Props) {
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [number, setNumber] = useState("");
  const [cvv, setCvv] = useState("");

  const brand = detectBrand(number);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: integrate the card-payment provider (Stripe Elements / similar)
    // once the donations checkout backend is in place.
  }

  function handleCancel() {
    setName("");
    setExpiry("");
    setNumber("");
    setCvv("");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("donate:reset-amount"));
    }
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

        {/* ── Fields ───────────────────────────────────────────
            Mobile: number → name → expiry → cvv (via `order` on flat flex).
            Tablet+: each wrapper becomes a flex row: (name + expiry) / (number + cvv). */}
        <div className="mt-4 flex flex-col gap-4 sm:mt-5">
          {/* Row 1 on tablet+: Name + Expiry. `contents` lets children participate
              in the outer flex on mobile so `order` works across rows. */}
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
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder={labels.expiryPlaceholder}
                aria-label={labels.expiryLabel}
                className="h-12 w-full rounded-full border border-text-strong/15 bg-white px-4 text-body text-text-strong placeholder:text-text-secondary focus:border-secondary focus:outline-none"
              />
            </Field>
          </div>

          {/* Row 2 on tablet+: Number + CVV */}
          <div className="contents sm:flex sm:gap-4">
            <Field
              label={labels.numberLabel}
              className="order-1 sm:order-1 sm:flex-1"
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  {brand === "visa" ? (
                    <VisaMark width={36} height={24} />
                  ) : (
                    <MastercardMark width={36} height={24} />
                  )}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={number}
                  onChange={(e) => setNumber(formatCardNumber(e.target.value))}
                  placeholder={labels.numberPlaceholder}
                  aria-label={labels.numberLabel}
                  className="h-12 w-full rounded-full border border-text-strong/15 bg-white pl-14 pr-4 text-body text-text-strong placeholder:text-text-secondary focus:border-secondary focus:outline-none"
                />
              </div>
            </Field>

            <Field
              label={labels.cvvLabel}
              className="order-4 sm:order-2 sm:w-[112px] sm:flex-none"
            >
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder={labels.cvvPlaceholder}
                aria-label={labels.cvvLabel}
                className="h-12 w-full rounded-full border border-text-strong/15 bg-white px-4 text-body text-text-strong placeholder:text-text-secondary focus:border-secondary focus:outline-none"
              />
            </Field>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────── */}
        <div className="mt-6 flex flex-col items-center gap-4 sm:mt-8 sm:flex-row sm:justify-between sm:gap-6">
          <button
            type="submit"
            className="inline-flex h-[54px] w-full items-center justify-center rounded-full bg-secondary px-8 text-body font-medium text-white transition-opacity hover:opacity-90 sm:w-auto sm:flex-1 lg:max-w-[280px]"
          >
            {labels.submit}
          </button>
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

// ── Field wrapper ────────────────────────────────────────────
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
