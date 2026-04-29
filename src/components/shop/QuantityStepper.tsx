"use client";

import { Minus, Plus } from "lucide-react";
import { useId } from "react";

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  decreaseAriaLabel: string;
  increaseAriaLabel: string;
  inputAriaLabel: string;
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  decreaseAriaLabel,
  increaseAriaLabel,
  inputAriaLabel,
}: Props) {
  const id = useId();

  function clamp(n: number) {
    if (Number.isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  return (
    <div className="inline-flex h-[54px] w-full items-center justify-between rounded-full border border-secondary bg-white px-2 sm:w-[180px]">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label={decreaseAriaLabel}
        aria-controls={id}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-secondary-10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Minus size={18} strokeWidth={2} aria-hidden />
      </button>

      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => {
          const next = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
          onChange(clamp(next));
        }}
        aria-label={inputAriaLabel}
        className="w-10 bg-transparent text-center text-body font-semibold text-text-strong outline-none"
      />

      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label={increaseAriaLabel}
        aria-controls={id}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-secondary-10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Plus size={18} strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
