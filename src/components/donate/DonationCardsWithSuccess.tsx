"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";

const SUCCESS_DURATION_MS = 20_000;

type Props = {
  formCard: ReactNode;
  paymentCard: ReactNode;
  successImage: string;
  successImageAlt: string;
  thankYouLabel: string;
};

/**
 * Wraps the two donation cards. Reads `?success=true` from the URL — when
 * present, replaces both cards with a thank-you view (photo + thank-you card)
 * for SUCCESS_DURATION_MS, then auto-reverts to the regular Donate Pay form.
 */
export function DonationCardsWithSuccess({
  formCard,
  paymentCard,
  successImage,
  successImageAlt,
  thankYouLabel,
}: Props) {
  // Lazy initializer reads the URL synchronously on the first client render —
  // avoids the cascading-render lint warning from calling setState in an effect.
  const [showSuccess, setShowSuccess] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("success") === "true";
  });

  useEffect(() => {
    if (!showSuccess) return;

    const timer = setTimeout(() => {
      setShowSuccess(false);
      // Strip the param so a refresh doesn't replay the success state.
      const params = new URLSearchParams(window.location.search);
      params.delete("success");
      const qs = params.toString();
      const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState(null, "", next);
    }, SUCCESS_DURATION_MS);

    return () => clearTimeout(timer);
  }, [showSuccess]);

  if (showSuccess) {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-secondary-10 lg:aspect-auto lg:min-h-[360px]">
          <Image
            src={successImage}
            alt={successImageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-[280px] items-center justify-center rounded-3xl bg-secondary-10 p-8 text-center lg:min-h-[360px] lg:p-12"
        >
          <p className="text-h2 font-semibold text-text-strong lg:text-[40px] lg:leading-[110%]">
            {thankYouLabel}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
      {formCard}
      {paymentCard}
    </div>
  );
}
