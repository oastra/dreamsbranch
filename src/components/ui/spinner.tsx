import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

const sizeMap = {
  xs: "size-3.5",
  sm: "size-4",
  default: "size-5",
  lg: "size-6",
} as const;

type SpinnerProps = {
  /** Diameter preset. Defaults to `default` (20px), matching xl button text. */
  size?: keyof typeof sizeMap;
  /**
   * Accessible label for a standalone spinner (e.g. a full-section loader).
   * When the spinner sits inside a button that already has visible text
   * (e.g. "Processing…"), leave this off and pass `aria-hidden` instead —
   * the text carries the meaning and a second label just adds noise.
   */
  label?: string;
  className?: string;
} & React.HTMLAttributes<SVGElement>;

/**
 * Brand loading spinner. Inherits `currentColor`, so it takes on the colour
 * of whatever it's placed in — white inside a filled <Button>, blue inside an
 * outline one — without any per-callsite colour prop. Use inside buttons
 * beside a "Processing…" label, or standalone (with `label`) for section-level
 * loading states.
 */
function Spinner({
  size = "default",
  label,
  className,
  ...props
}: SpinnerProps) {
  return (
    <Loader2Icon
      className={cn("animate-spin", sizeMap[size], className)}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    />
  );
}

export { Spinner };
