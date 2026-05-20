"use client";

import { useEffect } from "react";
import ApplePayWordmark from "@/components/icons/payments/ApplePayWordmark";
import GooglePayWordmark from "@/components/icons/payments/GooglePayWordmark";
import PayPalWordmark from "@/components/icons/payments/PayPalWordmark";
import { useDonation } from "@/components/donate/DonationContext";

export type DonationFormLabels = {
  formHeading: string;
  frequencyOnce: string;
  frequencyMonthly: string;
  amountLabel: string;
  amountCurrency: string;
  presetAriaTemplate: string;
  monthlyLabel: string;
  monthlyCancelNote: string;
  fastPayTitle: string;
  fastPayPaypalAria: string;
  fastPayAppleAria: string;
  fastPayGoogleAria: string;
  displayNameLabel: string;
  displayNamePlaceholder: string;
  displayNameHint?: string;
  emailLabel: string;
  emailPlaceholder: string;
  anonymousLabel?: string;
};

type Variant = "page" | "campaign";

type Props = {
  labels: DonationFormLabels;
  // "page" = standalone /donate (frequency toggle, no anonymous checkbox).
  // "campaign" = modal flow (no frequency toggle, shows anonymous checkbox).
  variant?: Variant;
};

const PRESETS = [25, 50, 75, 100, 150];
const MIN_AMOUNT = 0;
const MAX_AMOUNT = 100000;

export function DonationFormCard({ labels, variant = "page" }: Props) {
  const {
    amount,
    setAmount,
    frequency,
    setFrequency,
    displayName,
    setDisplayName,
    cardholderName,
    isAnonymous,
    setIsAnonymous,
    email,
    setEmail,
  } = useDonation();

  // /donate prefill from `?amount=` (campaign cards now open a modal, but a
  // shared link with the param still works).
  useEffect(() => {
    if (variant !== "page") return;
    const raw = new URLSearchParams(window.location.search).get("amount");
    if (!raw) return;
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed)) return;
    setAmount(Math.max(MIN_AMOUNT, Math.min(MAX_AMOUNT, parsed)));
  }, [variant, setAmount]);

  useEffect(() => {
    function reset() {
      setAmount(0);
    }
    window.addEventListener("donate:reset-amount", reset);
    return () => window.removeEventListener("donate:reset-amount", reset);
  }, [setAmount]);

  function clampAmount(value: number) {
    if (Number.isNaN(value)) return MIN_AMOUNT;
    return Math.max(MIN_AMOUNT, Math.min(MAX_AMOUNT, value));
  }

  function handleAmountInput(raw: string) {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    setAmount(clampAmount(Number.isNaN(parsed) ? 0 : parsed));
  }

  function addPreset(value: number) {
    setAmount(clampAmount(amount + value));
  }

  function handleFastPay(method: "paypal" | "apple" | "google") {
    // TODO: wire up fast-pay (PayPal + Stripe PaymentRequestButton for
    // Apple/Google Pay) in Phase 3.
    void method;
  }

  return (
    <div className="rounded-[30px] bg-secondary-10 p-5 pb-8 sm:p-6 sm:pb-8 lg:p-8">
      {/* ── Heading ─────────────────────────────────────────── */}
      <div className="mb-5 flex items-center justify-center gap-2 sm:mb-6">
        <span aria-hidden="true" className="text-[24px] leading-none">
          🤝
        </span>
        <h2 className="text-[24px] font-medium leading-[120%] text-text-strong">
          {labels.formHeading}
        </h2>
      </div>

      {/* ── Frequency toggle (page variant only) ────────────── */}
      {variant === "page" && (
        <div
          role="tablist"
          aria-label={labels.amountLabel}
          className="flex gap-1 rounded-full bg-white/60 p-1.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={frequency === "once"}
            onClick={() => setFrequency("once")}
            className={`flex-1 rounded-full py-2.5 text-body font-semibold transition-colors ${
              frequency === "once"
                ? "bg-primary text-text-strong"
                : "text-text-strong hover:bg-white"
            }`}
          >
            {labels.frequencyOnce}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={frequency === "monthly"}
            onClick={() => setFrequency("monthly")}
            className={`flex-1 rounded-full py-2.5 text-body font-semibold transition-colors ${
              frequency === "monthly"
                ? "bg-primary text-text-strong"
                : "text-text-strong hover:bg-white"
            }`}
          >
            {labels.frequencyMonthly}
          </button>
        </div>
      )}

      {/* ── Amount input ────────────────────────────────────── */}
      <div className="mt-6 flex items-end justify-between gap-3 border-b border-white pb-3 sm:mt-8">
        <input
          type="text"
          inputMode="decimal"
          value={amount.toFixed(2)}
          onChange={(e) => handleAmountInput(e.target.value)}
          aria-label={labels.amountLabel}
          className="min-w-0 flex-1 bg-transparent text-title-tablet font-medium text-text-strong outline-none"
        />
        <span className="shrink-0 text-title-tablet font-medium text-text-strong">
          {labels.amountCurrency}
        </span>
      </div>

      {/* ── Preset pills ───────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
        {PRESETS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => addPreset(value)}
            aria-label={labels.presetAriaTemplate.replace(
              "{value}",
              String(value),
            )}
            className="whitespace-nowrap rounded-full bg-white px-3 py-2 text-body font-normal text-text-strong shadow-sm transition-colors hover:bg-grey-40 sm:px-4"
          >
            +${value}
          </button>
        ))}
      </div>

      {/* ── Monthly helper copy ───────────────────────────── */}
      {frequency === "monthly" && (
        <div className="mt-5 text-center sm:mt-6">
          <p className="text-body-sm text-text-primary">
            {labels.monthlyLabel}
          </p>
          <p className="mt-1 text-body-sm text-text-secondary">
            {labels.monthlyCancelNote}
          </p>
        </div>
      )}

      {/* ── "Швидка оплата" divider ────────────────────────── */}
      <div className="my-6 flex items-center gap-4 sm:my-8">
        <hr className="flex-1 border-white" />
        <span className="text-body font-semibold text-text-strong">
          {labels.fastPayTitle}
        </span>
        <hr className="flex-1 border-white" />
      </div>

      {/* ── Fast pay buttons ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <button
          type="button"
          onClick={() => handleFastPay("paypal")}
          aria-label={labels.fastPayPaypalAria}
          className="inline-flex h-[54px] items-center justify-center rounded-full border border-text-strong/20 bg-white text-text-strong transition-colors hover:border-text-strong"
        >
          <PayPalWordmark width={70} height={19} />
        </button>
        <button
          type="button"
          onClick={() => handleFastPay("apple")}
          aria-label={labels.fastPayAppleAria}
          className="inline-flex h-[54px] items-center justify-center rounded-full border border-text-strong/20 bg-white text-text-strong transition-colors hover:border-text-strong"
        >
          <ApplePayWordmark width={50} height={32} />
        </button>
        <button
          type="button"
          onClick={() => handleFastPay("google")}
          aria-label={labels.fastPayGoogleAria}
          className="inline-flex h-[54px] items-center justify-center rounded-full border border-text-strong/20 bg-white text-text-strong transition-colors hover:border-text-strong"
        >
          <GooglePayWordmark width={50} height={32} />
        </button>
      </div>

      {/* ── Public display name + anonymous checkbox ──────────
           When variant=campaign and the donor leaves this blank, the
           placeholder live-mirrors the cardholder name (greyed) so they
           can see what we'll show by default and override if they want. */}
      <div className="mt-6 sm:mt-8">
        <label className="block">
          <span className="mb-1.5 block text-body font-normal text-text-strong">
            {labels.displayNameLabel}
          </span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={
              variant === "campaign" && cardholderName.trim()
                ? cardholderName
                : labels.displayNamePlaceholder
            }
            aria-label={labels.displayNameLabel}
            disabled={isAnonymous}
            className="h-12 w-full rounded-full border border-text-strong/15 bg-white px-4 text-body text-text-strong placeholder:text-text-secondary focus:border-secondary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
        {labels.displayNameHint && (
          <p className="mt-1.5 px-1 text-body-sm text-text-secondary">
            {labels.displayNameHint}
          </p>
        )}
      </div>

      {/* ── Anonymous checkbox (campaign variant only) ──────── */}
      {variant === "campaign" && labels.anonymousLabel && (
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-body text-text-primary">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-text-strong/30 text-secondary focus:ring-secondary"
          />
          {labels.anonymousLabel}
        </label>
      )}

      {/* ── Email (only needed for monthly subscriptions) ──── */}
      {variant === "page" && frequency === "monthly" && (
        <label className="mt-3 block">
          <span className="mb-1.5 block text-body font-normal text-text-strong">
            {labels.emailLabel}
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={labels.emailPlaceholder}
            aria-label={labels.emailLabel}
            autoComplete="email"
            required
            className="h-12 w-full rounded-full border border-text-strong/15 bg-white px-4 text-body text-text-strong placeholder:text-text-secondary focus:border-secondary focus:outline-none"
          />
        </label>
      )}
    </div>
  );
}
