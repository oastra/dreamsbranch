"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { XIcon } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CardPaymentCard,
  type CardPaymentLabels,
} from "@/components/donate/CardPaymentCard";
import {
  DonationFormCard,
  type DonationFormLabels,
} from "@/components/donate/DonationFormCard";
import { DonationProvider } from "@/components/donate/DonationContext";

type Props = {
  presets: number[];
  customLabel: string;
  ctaLabel: string;
  closeLabel: string;
  campaignSlug: string;
  thankYouLabel: string;
  thankYouImage: string;
  thankYouImageAlt: string;
  formLabels: DonationFormLabels;
  cardLabels: CardPaymentLabels;
};

const SUCCESS_AUTO_CLOSE_MS = 6000;

const stripePromise = getStripe();

export function CampaignSupportGrid({
  presets,
  customLabel,
  ctaLabel,
  closeLabel,
  campaignSlug,
  thankYouLabel,
  thankYouImage,
  thankYouImageAlt,
  formLabels,
  cardLabels,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [succeeded, setSucceeded] = useState(false);

  function openWith(amount?: number) {
    setSelectedAmount(amount ?? 10);
    setSucceeded(false);
    setOpen(true);
  }

  // Auto-close the thank-you state after a few seconds so donors can move on.
  useEffect(() => {
    if (!succeeded) return;
    const t = setTimeout(() => {
      setOpen(false);
      setSucceeded(false);
    }, SUCCESS_AUTO_CLOSE_MS);
    return () => clearTimeout(t);
  }, [succeeded]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {presets.map((amount) => (
          <AmountCard
            key={amount}
            label={`$${amount}`}
            ctaLabel={ctaLabel}
            onClick={() => openWith(amount)}
          />
        ))}
        <AmountCard
          label={customLabel}
          ctaLabel={ctaLabel}
          onClick={() => openWith(undefined)}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[calc(100%-2rem)] gap-0 rounded-2xl bg-white p-0 sm:max-w-3xl lg:max-w-[1200px]"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">
            {formLabels.formHeading}
          </DialogTitle>

          {/* Close link, top-right */}
          <div className="flex items-center justify-end px-4 pt-4 sm:px-6 sm:pt-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 text-body text-text-strong transition-opacity hover:opacity-80"
            >
              {closeLabel}
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {succeeded ? (
            <div className="grid grid-cols-1 gap-4 p-4 pt-4 sm:p-6 lg:grid-cols-2 lg:gap-6 lg:p-8 lg:pt-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-secondary-10 lg:aspect-auto lg:min-h-[360px]">
                <Image
                  src={thankYouImage}
                  alt={thankYouImageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
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
          ) : (
            <Elements stripe={stripePromise}>
              <DonationProvider
                initialAmount={selectedAmount}
                campaignSlug={campaignSlug}
              >
                <div className="grid grid-cols-1 gap-4 p-4 pt-4 sm:p-6 lg:grid-cols-2 lg:gap-6 lg:p-8 lg:pt-4">
                  <DonationFormCard variant="campaign" labels={formLabels} />
                  <CardPaymentCard
                    labels={cardLabels}
                    onCancel={() => setOpen(false)}
                    onSuccess={() => setSucceeded(true)}
                  />
                </div>
              </DonationProvider>
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function AmountCard({
  label,
  ctaLabel,
  onClick,
}: {
  label: string;
  ctaLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-[20px] border border-[#A8B6CC]/40 bg-white px-6 py-6 sm:py-8">
      <span className="text-h2 font-medium text-text-strong">{label}</span>
      <Button
        type="button"
        shape="pill"
        className="h-11 w-full px-6"
        onClick={onClick}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}
