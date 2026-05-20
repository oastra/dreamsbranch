"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Frequency = "once" | "monthly";

type DonationState = {
  amount: number;
  setAmount: (n: number) => void;
  frequency: Frequency;
  setFrequency: (f: Frequency) => void;
  displayName: string;
  setDisplayName: (s: string) => void;
  cardholderName: string;
  setCardholderName: (s: string) => void;
  isAnonymous: boolean;
  setIsAnonymous: (b: boolean) => void;
  email: string;
  setEmail: (s: string) => void;
  campaignSlug: string | null;
};

const DonationCtx = createContext<DonationState | null>(null);

export function DonationProvider({
  children,
  initialAmount = 10,
  initialFrequency = "once",
  campaignSlug = null,
}: {
  children: ReactNode;
  initialAmount?: number;
  initialFrequency?: Frequency;
  campaignSlug?: string | null;
}) {
  const [amount, setAmount] = useState(initialAmount);
  const [frequency, setFrequency] = useState<Frequency>(initialFrequency);
  const [displayName, setDisplayName] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [email, setEmail] = useState("");

  const value = useMemo<DonationState>(
    () => ({
      amount,
      setAmount,
      frequency,
      setFrequency,
      displayName,
      setDisplayName,
      cardholderName,
      setCardholderName,
      isAnonymous,
      setIsAnonymous,
      email,
      setEmail,
      campaignSlug,
    }),
    [
      amount,
      frequency,
      displayName,
      cardholderName,
      isAnonymous,
      email,
      campaignSlug,
    ],
  );

  return <DonationCtx.Provider value={value}>{children}</DonationCtx.Provider>;
}

export function useDonation(): DonationState {
  const ctx = useContext(DonationCtx);
  if (!ctx) {
    throw new Error("useDonation must be used inside <DonationProvider>");
  }
  return ctx;
}
