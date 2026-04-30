"use client";

import { useEffect, useState } from "react";
import ApplePayWordmark from "@/components/icons/payments/ApplePayWordmark";
import GooglePayWordmark from "@/components/icons/payments/GooglePayWordmark";
import PayPalWordmark from "@/components/icons/payments/PayPalWordmark";

type Frequency = "once" | "monthly";

export type DonationFormLabels = {
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
};

type Props = {
  defaultFrequency?: Frequency;
  defaultAmount?: number;
  labels: DonationFormLabels;
};

const PRESETS = [25, 50, 75, 100, 150];
const MIN_AMOUNT = 0;
const MAX_AMOUNT = 100000;

export function DonationFormCard({
  defaultFrequency = "once",
  defaultAmount = 10,
  labels,
}: Props) {
  const [frequency, setFrequency] = useState<Frequency>(defaultFrequency);
  const [amount, setAmount] = useState<number>(defaultAmount);

  useEffect(() => {
    function reset() {
      setAmount(0);
    }
    window.addEventListener("donate:reset-amount", reset);
    return () => window.removeEventListener("donate:reset-amount", reset);
  }, []);

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
    setAmount((current) => clampAmount(current + value));
  }

  function handleFastPay(method: "paypal" | "apple" | "google") {
    // TODO: wire up the selected fast-pay method (PayPal / Apple Pay / Google
    // Pay) once the donations checkout backend is in place.
    void method;
  }

  return (
    <div className="rounded-[30px] bg-secondary-10 p-5 pb-8 sm:p-6 sm:pb-8 lg:p-8">
      {/* ── Frequency toggle ────────────────────────────────── */}
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

      {/* ── Preset pills ─────────────────────────────────────
          Mobile: 3-col grid (wraps to 3 + 2). Tablet+: 5-col grid. */}
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
            +${value} {labels.amountCurrency}
          </button>
        ))}
      </div>

      {/* ── Monthly helper copy ──────────────────────────────
          Only shown when the recurring tab is active. */}
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

      {/* ── "Швидка оплата" divider with side lines ─────────── */}
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
    </div>
  );
}
