import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function XIcon({ size = 24, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" {...props}>
      <path
        d="M10 10l28 28M38 10L10 38"
        stroke="currentColor"
        strokeWidth="4"
      />
    </svg>
  );
}
