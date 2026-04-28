type Tone = "light" | "dark";

interface Props {
  /** Main page title rendered as <h1>. */
  title: string;
  /** Eyebrow text above the title. Defaults to "Dreams branch of UWAA". */
  eyebrow?: string;
  /**
   * Color treatment.
   * - "light" (default): dark eyebrow + blue title — for white/cream backgrounds.
   * - "dark": muted-white eyebrow + white title — for blue/dark backgrounds.
   */
  tone?: Tone;
  /** Extra classes for the wrapper (e.g. responsive alignment). */
  className?: string;
  /** Extra classes appended to the <h1> (e.g. mb-* spacing). */
  titleClassName?: string;
  /** Extra classes appended to the eyebrow <p>. */
  eyebrowClassName?: string;
}

export function PageHeroHeading({
  title,
  eyebrow = "Dreams branch of UWAA",
  tone = "light",
  className = "",
  titleClassName = "",
  eyebrowClassName = "",
}: Props) {
  const eyebrowColor =
    tone === "dark" ? "text-white/70" : "text-text-strong";
  const titleColor = tone === "dark" ? "text-white" : "text-secondary";

  return (
    <div className={className}>
      <p
        className={`text-body-sm mb-2 font-semibold ${eyebrowColor} ${eyebrowClassName}`}
      >
        {eyebrow}
      </p>
      <h1 className={`text-display ${titleColor} ${titleClassName}`}>
        {title}
      </h1>
    </div>
  );
}
