type Tone = "primary" | "secondary";

interface Props {
  text: string;
  tone?: Tone;
  /** Seconds per loop. Lower = faster. */
  durationSec?: number;
  /** How many times the text is repeated inside one half of the strip. */
  repeats?: number;
  className?: string;
}

const TONE_STYLES: Record<Tone, string> = {
  primary: "bg-primary-40 text-text-strong",
  secondary: "bg-secondary-10 text-text-strong",
};

export function MarqueeBanner({
  text,
  tone = "primary",
  durationSec = 80,
  repeats = 6,
  className = "",
}: Props) {
  const items = Array.from({ length: repeats });

  return (
    <div
      className={`${TONE_STYLES[tone]} overflow-hidden py-4 sm:py-5 ${className}`}
      role="marquee"
      aria-label={text}
    >
      <div
        className="flex w-max animate-marquee"
        style={{ ["--marquee-duration" as string]: `${durationSec}s` }}
      >
        {/* Two identical halves: translateX(-50%) brings the second
            half flush into the first half's starting position, so the
            loop reads as a single continuous strip. */}
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0" aria-hidden={half === 1}>
            {items.map((_, i) => (
              <div
                key={i}
                className="flex shrink-0 items-center whitespace-nowrap text-body"
              >
                <span className="px-8">{text}</span>
                <span className="text-text-strong/60">•</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
