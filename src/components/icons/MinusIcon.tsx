import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { size?: number };

export default function MinusIcon({ size = 24, ...props }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <rect x="4" y="11" width="16" height="2" fill="currentColor" />
    </svg>
  );
}
