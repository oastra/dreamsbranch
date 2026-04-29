type Tone = "primary" | "secondary";

interface Props {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}

const TONE_STYLES: Record<Tone, string> = {
  primary: "bg-primary-40 text-text-strong",
  secondary: "bg-secondary-10 text-text-strong",
};

export function InfoBanner({ children, tone = "primary", className = "" }: Props) {
  return (
    <div
      className={`${TONE_STYLES[tone]} rounded-2xl px-6 py-4 text-center text-body sm:rounded-none sm:px-8 sm:py-5 ${className}`}
    >
      {children}
    </div>
  );
}
